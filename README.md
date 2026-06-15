# VAME App

A web application for the Variational Animal Motion Encoding (VAME) project — an open-source machine learning tool for behavioral segmentation and analyses.

VAME App runs a Python (Flask) backend which calls the [VAME](https://github.com/EthoML/VAME) library and serves a React frontend, which you use in your browser.

## Requirements

- Python ≥ 3.12
- [ffmpeg](https://www.ffmpeg.org/) (needed for some video/image functions)
- A modern browser (Chrome, Edge, Firefox, or Safari)

## Install

```bash
pip install vame-app
```

> If PyTorch fails to install for your platform, install it first following the
> [official instructions](https://pytorch.org/get-started/locally/), then re-run
> `pip install vame-app`.

## Run

```bash
vame-app
```

This starts the local server and opens the app in your browser.

### CLI options

```
vame-app [--host HOST] [--port PORT] [--data-root DIR] [--no-browser] [--dev]
```

| Flag | Default | Purpose |
|------|---------|---------|
| `--host` | `127.0.0.1` | Interface to bind. Use `0.0.0.0` to expose on the LAN. |
| `--port` | `8641` | Port to listen on. Use `0` to auto-pick a free port. |
| `--data-root` | home directory | Root the in-app file browser may traverse. Restrict this on shared servers. |
| `--no-browser` | off | Don't auto-open the browser. |
| `--dev` | off | Use the Flask dev server instead of waitress. |

Projects are stored under `~/vame-app/projects`. `--data-root` (env
`VAME_DATA_ROOT`) only controls the *file browser* root, not project storage.

## Development

Contributing or running from source? See [README-DEV.md](README-DEV.md).
