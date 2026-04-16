# Drone Traffic Analyzer

This repository contains a starter project for a drone traffic analysis platform.

## Structure

- `backend/` - FastAPI backend with a CV pipeline, upload endpoints, and report export.
- `frontend/` - React + Vite frontend with Tailwind styling.
- `docker-compose.yml` - Local development stack.

## Quick start

1. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Run backend:
   ```bash
   uvicorn app.main:app --reload
   ```

4. Run frontend:
   ```bash
   npm run dev
   ```
