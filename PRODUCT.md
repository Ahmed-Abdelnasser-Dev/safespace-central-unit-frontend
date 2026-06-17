# Product

## Register

product

## Users

Four operator roles, each with a distinct workflow and route access (see
`docs/roles-and-responsibilities.md`):

- **admin** — full system access: user management, audit logs, all features.
- **emergency_dispatcher** — coordinates real-world response: receives SOS cases and
  assigned incidents, dispatches emergency units, tracks them to resolution.
- **road_observer** — reviews AI-detected incidents as they're assigned, confirms or
  rejects the system's analysis.
- **node_maintenance_crew** — manages physical detection infrastructure (highway nodes,
  cameras, lane polygons).

All operate in a 24/7 operations-room context: live data, time pressure, frequent
context-switching between a wall of feeds and this screen. Sessions are task-driven, not
exploratory — the user arrives knowing what they need to do.

## Product Purpose

Safe Space is an AI-powered highway accident detection and emergency-response system
(graduation project, Suez Canal University, Faculty of Engineering — Computer
Engineering Dept., supervised by Dr. Samar Awad). This dashboard is **the only human
interface to the system's operational core**: Raspberry Pi detection nodes and CCTV feed
a Central Unit decision pipeline, which surfaces incidents and SOS cases here for
operators to monitor, verify, and act on in real time.

Success = an operator can go from "an incident appeared" to "the right response is
underway" with minimal friction, under live time pressure, without ambiguity about
system state.

## Brand Personality

**Calm, precise, authoritative.** A control-room tool: steady under pressure, exact
information, no noise. The urgency lives in the data (severity badges, live status), not
in the chrome. Confidence comes from clarity, not decoration.

## Anti-references

Not a generic SaaS dashboard. Avoid: gradient hero-metric blocks, marketing-style
identical card grids, playful illustration, consumer-app gloss, decorative motion. This
is a mission-critical ops tool — every visual choice should earn its place by helping a
stressed operator act faster or with more confidence, not by looking impressive.

## Design Principles

1. **The tool disappears into the task.** Earned familiarity over novelty — operators
   should never pause to figure out an unfamiliar affordance mid-incident.
2. **State over decoration.** Color, motion, and emphasis are reserved for conveying real
   system/data state (severity, unit status, live updates) — never applied for visual
   interest alone.
3. **One glance, no ambiguity.** Critical information (severity, status, location, time)
   must be legible and unambiguous at a glance, under real operational stress.
4. **Consistency over surprise.** Same component vocabulary screen to screen; a button or
   status badge means the same thing everywhere in the app.
5. **Calm urgency.** Convey real urgency through accurate signal (a pulsing unread badge,
   a red severity tag) rather than aggressive saturation or noisy animation.

## Accessibility & Inclusion

Standard WCAG AA (contrast, keyboard navigation, focus states). No additional documented
requirement beyond AA at this time — matches the current app (no RTL support, English
only, no reduced-motion handling yet implemented). New work should still ship
`prefers-reduced-motion` alternatives per Impeccable's baseline motion guidance, even
though it isn't yet a hard product requirement elsewhere in the app.
