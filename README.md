# UTME Prep & CBT Practice Platform (2026 Engine)

A modern, high-performance UTME preparation and Computer-Based Test (CBT) practice platform built for speed, accuracy, and mobile-first study.

## Tech Stack
- **Frontend**: React + Vite (Vanilla CSS Tokens, Responsive Layout)
- **Backend**: Python FastAPI
- **Database**: PostgreSQL (SQLAlchemy ORM + Pydantic v2 schemas)
- **PWA**: Web App Manifest & Service Worker shell ready for installation

## Design Tokens & Brand System
- **Deep Indigo**: `#29235C`
- **Midnight**: `#171536`
- **Electric Lime**: `#C7F36B`
- **Warm Amber**: `#FFB84D`
- **Soft Ivory**: `#F7F7F2`
- **Typography**: Sora (Headings/UI) & DM Sans (Questions/Body text). *Poppins is prohibited*.

## Project Structure
```
possible/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/  # Auth, Subjects, Questions, CBT routes
│   │   ├── core/              # Security & Config settings
│   │   ├── db/                # Session & Base declarative
│   │   ├── models/            # SQLAlchemy schemas for Users, Subjects, Questions, Exam Sessions
│   │   ├── schemas/           # Pydantic input/output schemas
│   │   └── main.py            # FastAPI entrypoint
│   └── requirements.txt
├── frontend/
│   ├── public/                # PWA manifest.json, sw.js, favicon.svg
│   ├── src/
│   │   ├── components/common/ # Button, Card, Badge, Header, BottomNav
│   │   ├── context/           # AuthContext
│   │   ├── index.css          # Design Tokens & Responsive Grid Reset
│   │   ├── App.jsx            # Core Mobile Layout Shell
│   │   └── main.jsx
│   ├── index.html             # Sora & DM Sans Google Font setup
│   └── package.json
```

## Running Frontend
```bash
cd frontend
npm install
npm run dev
```

## Running Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
