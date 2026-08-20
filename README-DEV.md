# Development

VAME App is a Python (Flask) backend that serves a React (Vite) frontend. For
end-user install instructions see [README.md](README.md); this guide covers
running from source.

## Setup (once)

The backend needs PyTorch, which is easiest to get through conda. Each
`environment-<os>.yml` installs Python + PyTorch and then `pip install -e .`
(editable, so Python edits are live after a restart).

```bash
conda env create -f environment-mac-arm.yml   # or: mac-x86 / linux / win
conda activate vame-app
npm install
```

## Run (two terminals)

Run the Vite frontend and the Flask backend separately, both with hot reload.

**Terminal 1 — Frontend** (HMR — open this URL in your browser)

```bash
npm run dev            # http://localhost:5173
```

**Terminal 2 — Backend** (auto-restarts on .py changes)

```bash
VAME_PORT=8641 VAME_DATA_ROOT=~/test_data flask --app vame_app:create_app run --port 8641
```

The frontend (5173) talks to the backend (8641) over CORS. Override the backend URL
with `VITE_API_BASE` if needed. In production the frontend is served by Flask
itself, so requests are same-origin.

`VAME_DATA_ROOT` sets the root folder the in-app file browser may traverse
(defaults to your home directory). With the production CLI you'd instead pass
`vame-app --data-root /path/to/your/data`, which also remembers it in
`~/vame-app/settings.json`.

## Useful scripts

- `npm run dev` — Vite dev server (hot reload)
- `npm run build` — build the frontend into `src/services/vameApi/vame_app/web`
- `npm run typecheck` — TypeScript checks
- `npm run lint` / `npm run format`

## Building a distributable wheel

```bash
npm run build              # frontend -> vame_app/web
python -m build --wheel    # wheel bundles the built frontend
```
