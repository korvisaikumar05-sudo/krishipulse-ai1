# Project memory

## Product intent & audience

- Agriculture-focused platform (KrishiPulse) with ML models, Gemini integration, and a React frontend.
- Full-stack production app with separate frontend (Vite + React) and Python backend (FastAPI).

## Brand personality & voice

- Not yet inferred from UI work.

## Visual design & UX direction

- Vite + React + Tailwind CSS + Lucide React icons (per `.bolt/prompt`).
- `@/` path alias maps to `src/`.
- Frontend communicates with backend via `VITE_API_URL` env var (empty-string fallback = same-origin).

## Decisions, constraints & rationale

- **Deployment architecture**: Vercel (frontend root) + Render (backend/ directory).
  - Render start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
  - `vercel.json` handles SPA routing.
- **Env vars**: `VITE_API_URL` (Vercel), `CORS_ORIGINS` + `GEMINI_API_KEY` (Render).
- **CORS defaults**: `http://localhost:5173,http://127.0.0.1:5173` only; no guessed production domains.
- **No hardcoded localhost** in production-facing code.
- **Grok integration deferred** — deployment must be completed and tested first.
- Do not modify ML models, API routes, Gemini integration, or frontend UI unless explicitly requested.

## Open questions & assumptions

- Actual Vercel production domain unknown — must be set as `CORS_ORIGINS` on Render after first deploy.
- `VITE_API_URL` production value must be set on Vercel pointing to the Render backend URL.
- Brand identity, color palette, and component patterns not yet established.