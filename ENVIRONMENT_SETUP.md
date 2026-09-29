# Environment & Deployment Configuration Guide

This document details all environment variables required by the **UTME Prep 2026 Engine** across local development, GitHub, and production Vercel environments.

---

## 1. Complete Environment Inventory

| Variable Name | Purpose | Consumed By | Secret / Public | Required / Optional | Local Dev Value Format | Production Location |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SECRET_KEY` | Application cryptographic signing key | Backend (`config.py`) | **Secret** | Required | `dev_utme_secret_2026` | Vercel Environment Variables |
| `JWT_SECRET_KEY` | Signing candidate JWT access tokens | Backend (`security.py`) | **Secret** | Required | `dev_jwt_secret_2026` | Vercel Environment Variables |
| `JWT_ALGORITHM` | JWT Signature algorithm (`HS256`) | Backend (`security.py`) | Public | Required | `HS256` | Vercel Environment Variables |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Candidate JWT session lifespan (10080 = 7 days) | Backend (`security.py`) | Public | Required | `10080` | Vercel Environment Variables |
| `FRONTEND_URL` | Base URL for email verification links | Backend (`email.py`) | Public | Required | `http://localhost:3000` | Vercel Environment Variables |
| `BACKEND_URL` | Base URL for FastAPI API server | Backend (`main.py`) | Public | Required | `http://127.0.0.1:8000` | Vercel Environment Variables |
| `DEBUG` | Debug mode switch (`True` or `False`) | Backend & Frontend | Public | Required | `True` | Vercel Environment Variables |
| `EMAIL_TEST_MODE` | Email strategy (`"smtp"` or `"dev_log"`) | Backend (`email.py`) | Public | Required | `dev_log` | Vercel Environment Variables |
| `SMTP_HOST` | Hostname of SMTP server | Backend (`email.py`) | **Secret** | Optional | `smtp.mailtrap.io` | Vercel Environment Variables |
| `SMTP_PORT` | Port of SMTP server (`587` TLS, `465` SSL) | Backend (`email.py`) | Public | Optional | `587` | Vercel Environment Variables |
| `SMTP_USER` | Authentication username for SMTP | Backend (`email.py`) | **Secret** | Optional | `user_xyz` | Vercel Environment Variables |
| `SMTP_PASSWORD` | Authentication password for SMTP | Backend (`email.py`) | **Secret** | Optional | `pass_xyz` | Vercel Environment Variables |
| `EMAILS_FROM_EMAIL` | Sender email address displayed in inboxes | Backend (`email.py`) | Public | Required | `noreply@utmeprep.ng` | Vercel Environment Variables |
| `EMAILS_FROM_NAME` | Sender display name | Backend (`email.py`) | Public | Required | `UTME Prep 2026 Engine` | Vercel Environment Variables |
| `DATABASE_URL` | Complete PostgreSQL Connection String | Backend (`session.py`) | **Secret** | Required | `postgresql://...` | Vercel Environment Variables |
| `VITE_API_BASE_URL` | Client-visible API URL proxy endpoint | Frontend (`vite.config.js` / client) | Public | Optional | `/api` | Vercel Environment Variables |

---

## 2. Local Development & Email Testing Strategy

When `EMAIL_TEST_MODE=dev_log` or SMTP credentials are omitted during local development:
1. Verification tokens are formatted into standard emails and recorded in `backend/dev_emails.log`.
2. Developers can inspect recent outgoing verification messages in `backend/dev_emails.log` or via the local API endpoint `GET http://127.0.0.1:8000/api/v1/auth/dev-email-stream`.
3. No verification tokens are ever exposed in public API responses or browser console logs.

---

## 3. Production Vercel Deployment Setup

When deploying to Vercel:
1. Import project as **`utme-prep-app`**.
2. Set Build Command: `cd frontend && npm install && npm run build`.
3. Set Output Directory: `frontend/dist`.
4. Configure Vercel Dashboard Environment Variables for `SECRET_KEY`, `JWT_SECRET_KEY`, `DATABASE_URL`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, and `FRONTEND_URL`.
