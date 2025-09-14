# BreedSense AI (SIH 2025 By Gradient Gang)

BreedSense AI — in-browser cattle/buffalo breed recognition (Vite + React + TypeScript).

## Overview
Frontend captures or uploads images, sends them to a FastAPI backend for breed recognition, and displays a normalized breed profile (Overview, Gender Traits, Production (peak milk), History, Conservation). Identifications are persisted to localStorage.

## Tech stack
- Frontend: Vite, React, TypeScript, Tailwind CSS, Radix UI
- Backend: FastAPI (expected endpoints below)
- Local persistence: localStorage (key: `vxai_identifications_v1`)

## Required backend endpoints
- GET /                → root ping
- POST /recognize_breed → multipart/form-data (file)
  - Response: `{ predicted_class: string, confidence_score: number }` (200) or 400 with `{ detail: "No Buffalo Detected..." }`
- GET /buffalo_breeds/ → returns list of breed names
- GET /buffalo_breeds/{breed_name} → returns detailed breed JSON (the frontend normalizer tolerates many shapes, including nested `male`/`female` fields)

## Environment
Create a `.env` in the project root (my-app) or set env before running:
- VITE_API_BASE — base URL for your FastAPI server (default fallback: `http://localhost:8000`)

Example (.env):
````bash
// filepath: c:\Users\nagam\Downloads\sih\new\my-app\.env
VITE_API_BASE=http://localhost:8000
