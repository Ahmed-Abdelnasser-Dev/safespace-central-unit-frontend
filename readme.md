# Safe Space Frontend

This frontend repository must not contain any real credentials, tokens, or personal account data.

## Local Development

Create a local `.env` file in the frontend root and define only non-secret defaults:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_NODE_VIDEO_WS_URL=ws://localhost:5000
VITE_ENABLE_DEV_PROXY=false
VITE_DEV_PROXY_TARGET=http://localhost:5000
```

Current runtime code reads `VITE_API_URL`, `VITE_SOCKET_URL`, and `VITE_NODE_VIDEO_WS_URL`.
Legacy `VITE_WS_URL` is still supported as a fallback for node video feeds during transition.

Set `VITE_ENABLE_DEV_PROXY=true` if you want Vite to proxy `/api`, `/socket.io`, and `/uploads` to `VITE_DEV_PROXY_TARGET`.

## Security Notes

- Do not commit usernames, emails, passwords, API keys, or refresh tokens.
- Keep production secrets in deployment environment variables only.
- Use role-based access controls and backend authorization checks for all protected actions.