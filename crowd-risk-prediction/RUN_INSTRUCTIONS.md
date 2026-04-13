# 🚀 How to Run CrowdGuard AI Locally

## Prerequisites

- **Python 3.9+** with pip
- **Node.js 18+** with npm
- A crowd video file (MP4 recommended, 5-15 seconds, 720p)

---

## Step 1: Install Python Dependencies (one-time)

```bash
cd crowd-risk-prediction
pip install -r requirements.txt
```

## Step 2: Start the Backend (Terminal 1)

```bash
cd crowd-risk-prediction
python -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Wait for:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ Backend API is now live at **http://localhost:8000**

## Step 3: Install Frontend Dependencies (one-time)

```bash
cd crowd-risk-prediction/frontend-next
npm install
```

## Step 4: Start the Frontend (Terminal 2)

```bash
cd crowd-risk-prediction/frontend-next
npm run dev
```

Wait for:
```
▲ Next.js 16.2.3 (Turbopack)
- Local: http://localhost:3000
✓ Ready in ~1s
```

✅ Frontend is now live at **http://localhost:3000**

---

## Step 5: Use the App

1. Open **http://localhost:3000** in your browser
2. Drag & drop a crowd video (MP4, 5-15 seconds recommended)
3. Wait for upload to complete
4. Real-time analysis starts automatically
5. Watch the sidebar for **Processed X / 64** progress
6. View risk scores, CIRI metrics, and timeline charts in real-time

---

## ⚡ Performance Notes

| Setting | Value |
|---------|-------|
| Max frames analyzed | **64** (configurable via `DEMO_LIMIT` in `api/main.py`) |
| Frame skipping | Dynamic — adjusts automatically based on video length |
| Target latency | < 10 seconds for short clips |

The system samples **64 frames uniformly** across the entire video duration, so even long videos are fully covered.

---

## 🛑 How to Stop

- **Backend**: Press `Ctrl+C` in Terminal 1
- **Frontend**: Press `Ctrl+C` in Terminal 2

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` |
| Port 8000 in use | Kill the process: `netstat -ano \| findstr :8000` then `taskkill /PID <PID> /F` |
| Port 3000 in use | Kill the process or use `npm run dev -- -p 3001` |
| Video won't load | Use MP4 format, keep under 100MB |
| WebSocket error | Make sure backend is running on port 8000 first |
