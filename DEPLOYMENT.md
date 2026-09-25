# 🚀 Reclaim.AI — Production Deployment Guide

This guide covers deployment instructions for **Reclaim.AI**, including the FastAPI backend, Next.js frontend, and MongoDB database.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have the following environment variables and services ready:

| Component | Required Environment Variables | Description |
|-----------|--------------------------------|-------------|
| **Database** | `MONGODB_URL`<br>`DB_NAME` | MongoDB connection string (e.g. MongoDB Atlas cluster URI) |
| **Backend API** | `CORS_ORIGINS`<br>`RAZORPAY_KEY_ID`<br>`RAZORPAY_KEY_SECRET`<br>`RAZORPAY_TEST_MODE`<br>`ANTHROPIC_API_KEY` (or `OPENAI_API_KEY`) | Backend settings and API credentials (AI keys are optional; system features deterministic fallback) |
| **Frontend UI** | `NEXT_PUBLIC_API_URL` | Public URL pointing to your deployed backend (e.g. `https://api.yourdomain.com/api`) |

---

## ⚡ Option 1: Managed Cloud Deployment (Recommended)

### 1. Database: MongoDB Atlas (Free / Production Tier)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and whitelist network access (`0.0.0.0/0` or your backend server IP).
3. Copy the connection string: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

---

### 2. Backend: Render / Railway / Fly.io / AWS App Runner

#### Deploying on Render:
1. Create a new **Web Service** connected to your GitHub repository.
2. Set **Root Directory**: `backend`
3. Set **Runtime**: `Python 3`
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   - `MONGODB_URL`: `mongodb+srv://...`
   - `DB_NAME`: `revenue_recovery`
   - `CORS_ORIGINS`: `https://your-frontend.vercel.app`
   - `RAZORPAY_TEST_MODE`: `true` (or `false` for live)
   - `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`: *(Optional)*

#### Deploying on Railway:
1. Click **New Project** -> **Deploy from GitHub repo**.
2. Set Root Directory to `/backend`.
3. Add environment variables and Railway will automatically build via the included `Dockerfile`.

---

### 3. Frontend: Vercel (Recommended for Next.js)
1. Go to [Vercel](https://vercel.com) and import your Git repository.
2. Set **Root Directory**: `frontend`
3. Framework Preset: **Next.js**
4. Set Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com/api`
   - `NEXT_PUBLIC_APP_NAME`: `Reclaim.AI — Autonomous Revenue Recovery`
5. Click **Deploy**.

---

## 🐳 Option 2: Docker & Docker Compose (Single-Server / VPS)

You can deploy the entire stack (MongoDB + Backend + Frontend) on any VPS (AWS EC2, DigitalOcean Droplet, Hetzner, GCP Compute Engine) using Docker Compose.

### Steps:
1. Clone the repository on your server:
   ```bash
   git clone https://github.com/daliaachowdhury/Reclaim.Ai-AI-Revenue-Recovery-.git
   cd Reclaim.Ai-AI-Revenue-Recovery-
   ```

2. Start all services in detached mode:
   ```bash
   docker compose up -d --build
   ```

3. Verify services are running:
   ```bash
   docker compose ps
   ```

4. Service Ports:
   - **Frontend Dashboard**: `http://<your-server-ip>:3000`
   - **Backend API & Swagger Docs**: `http://<your-server-ip>:8000/docs`
   - **Health Check**: `http://<your-server-ip>:8000/health`

---

## 🔍 Health & Verification Checks

After deployment, test that all endpoints and communication channels are operational:

1. **Backend Health Check**:
   ```bash
   curl -i https://your-backend-url/health
   # Expected response: {"status":"ok","service":"reclaim-ai-revenue-recovery",...}
   ```

2. **Frontend Connectivity**:
   Open `https://your-frontend-url` in a browser. Click **"Run Batch Recovery"** or inspect the dashboard to confirm live connection to the backend.

3. **CORS Validation**:
   Ensure `CORS_ORIGINS` in your backend environment configuration includes your exact frontend domain URL.
