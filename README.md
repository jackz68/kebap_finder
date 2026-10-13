# Kebab Map: FastAPI + React

This version keeps the existing React 19, Vite, and Tailwind frontend and replaces the Node API with FastAPI. FastAPI uses DDGS for web search, then asks Groq to summarize the results with source links. Web search requires internet access.

## Requirements

- Python 3.10+
- Node.js 20.19+ or 22.12+
- A Groq API key for nearby restaurant recommendations

## Setup

From this folder, create and activate a virtual environment, then install the Python dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Add your `GROQ_API_KEY` to `.env`. Then install the frontend dependencies:

```powershell
cd frontend
npm install
```

## Development

With the virtual environment active, run:

```powershell
npm run dev
```

Vite serves the React app with hot reload and proxies `/api` requests to FastAPI on port `3001`.

## Production

Build the frontend and start FastAPI from the project root:

```powershell
cd frontend
npm run build
cd ..
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

FastAPI serves the compiled React app and its assets, as well as the `/api/nearby-kebab` endpoint.