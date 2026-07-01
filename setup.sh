#!/usr/bin/env bash
# ==============================================================================
# setup.sh — Bootstrap the Safe Space DMZ Frontend on a fresh Ubuntu Server VM
# ==============================================================================
# Tested on Ubuntu 26.04 LTS (server).
# Idempotent: safe to run more than once.
#
# What it does:
#   1. Installs Docker Engine + Compose plugin (official apt repo)
#   2. Adds the current user to the docker group (takes effect after re-login)
#   3. Opens port 80 (and 22) in ufw
#   4. Creates .env from .env.deploy.example if missing, prompts for backend IP
#   5. Runs docker compose up -d --build
#   6. Verifies the stack is healthy
#
# Usage:
#   chmod +x setup.sh
#   ./setup.sh
# ==============================================================================

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Colors ────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()    { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# ── 1. Install Docker ─────────────────────────────────────────────────────────
install_docker() {
    if command -v docker &>/dev/null; then
        info "Docker already installed: $(docker --version)"
        return
    fi

    info "Installing Docker Engine..."
    sudo apt-get update -qq
    sudo apt-get install -y -qq ca-certificates curl gnupg lsb-release

    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
        | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
        https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
        | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -qq
    sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io \
        docker-buildx-plugin docker-compose-plugin

    info "Docker installed: $(docker --version)"
}

# ── 2. Docker group ───────────────────────────────────────────────────────────
ensure_docker_group() {
    if groups "$USER" | grep -q '\bdocker\b'; then
        info "User '$USER' is already in the docker group."
        return
    fi
    info "Adding '$USER' to the docker group..."
    sudo usermod -aG docker "$USER"
    warn "You must log out and back in (or run 'newgrp docker') for group membership to take effect."
    warn "After re-login, re-run: docker compose up -d --build"
}

# ── 3. Firewall ───────────────────────────────────────────────────────────────
configure_firewall() {
    if ! command -v ufw &>/dev/null; then
        warn "ufw not found — skipping firewall configuration."
        return
    fi
    info "Configuring ufw..."
    sudo ufw allow 22/tcp  comment "SSH"    2>/dev/null || true
    sudo ufw allow 80/tcp  comment "HTTP"   2>/dev/null || true
    sudo ufw --force enable 2>/dev/null || true
    info "ufw status:"
    sudo ufw status numbered 2>/dev/null || true
}

# ── 4. .env file ──────────────────────────────────────────────────────────────
ensure_env_file() {
    local env_file="$REPO_DIR/.env"
    local example_file="$REPO_DIR/.env.deploy.example"

    if [[ -f "$env_file" ]]; then
        info ".env already exists — skipping creation."
        # shellcheck source=/dev/null
        source "$env_file"
        if [[ "${BACKEND_HOST:-}" == "10.0.0.X" ]]; then
            warn "BACKEND_HOST is still the placeholder value '10.0.0.X'."
            prompt_backend_ip
        fi
        return
    fi

    if [[ ! -f "$example_file" ]]; then
        error ".env.deploy.example not found in $REPO_DIR"
        exit 1
    fi

    info "Creating .env from .env.deploy.example..."
    cp "$example_file" "$env_file"
    prompt_backend_ip
}

prompt_backend_ip() {
    local env_file="$REPO_DIR/.env"
    echo ""
    echo "Enter the IP address of the BACKEND VM (protected layer)."
    echo "This is the VM running the central-unit backend (port 5000 + stream on 4001)."
    read -r -p "  Backend VM IP: " BACKEND_IP
    if [[ -z "$BACKEND_IP" ]]; then
        error "No IP entered. Edit .env manually and set BACKEND_HOST and STREAM_HOST."
        exit 1
    fi
    # Substitute placeholder in .env
    sed -i "s/BACKEND_HOST=10\.0\.0\.X/BACKEND_HOST=${BACKEND_IP}/" "$env_file"
    sed -i "s/STREAM_HOST=10\.0\.0\.X/STREAM_HOST=${BACKEND_IP}/" "$env_file"
    info "Set BACKEND_HOST and STREAM_HOST to ${BACKEND_IP} in .env"
}

# ── 5. Build & start the stack ────────────────────────────────────────────────
start_stack() {
    cd "$REPO_DIR"

    info "Building and starting the Docker stack..."

    # Determine compose command
    local COMPOSE
    if docker compose version &>/dev/null 2>&1; then
        COMPOSE="docker compose"
    elif command -v docker-compose &>/dev/null; then
        COMPOSE="docker-compose"
    else
        error "Neither 'docker compose' nor 'docker-compose' found."
        exit 1
    fi

    # If the current shell doesn't have the docker group yet (just added),
    # re-exec this step under newgrp so the group takes effect immediately.
    if ! docker info &>/dev/null 2>&1; then
        info "Docker socket not yet accessible in this session — using newgrp docker..."
        exec newgrp docker <<NEWGRP
cd "$REPO_DIR"
$COMPOSE up -d --build
NEWGRP
        return
    fi

    $COMPOSE up -d --build
    info "Stack started."
}

# ── 6. Verify ─────────────────────────────────────────────────────────────────
verify_stack() {
    info "Waiting 5 seconds for nginx to become ready..."
    sleep 5

    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ 2>/dev/null || echo "000")

    if [[ "$status" == "200" ]]; then
        info "✅  Frontend is up! HTTP 200 from http://localhost/"
        echo ""
        echo -e "${GREEN}============================================================${NC}"
        echo -e "${GREEN} Safe Space DMZ Frontend is running.${NC}"
        echo -e "${GREEN} Open http://$(hostname -I | awk '{print $1}') from your host machine.${NC}"
        echo -e "${GREEN}============================================================${NC}"
    else
        warn "HTTP response: $status — the container may still be starting."
        warn "Check logs with: docker compose logs -f frontend"
    fi
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
    echo ""
    echo "========================================"
    echo " Safe Space DMZ Setup"
    echo "========================================"
    echo ""

    install_docker
    ensure_docker_group
    configure_firewall
    ensure_env_file
    start_stack
    verify_stack
}

main "$@"
