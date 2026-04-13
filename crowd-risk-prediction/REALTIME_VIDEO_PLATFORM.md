# 🎬 CrowdGuard AI - Real-Time Video Analysis Platform

## ✅ COMPLETE IMPLEMENTATION

Your CrowdGuard AI has been successfully transformed into a full-stack, real-time video analysis platform!

---

## 🚀 Quick Start

### Step 1: Start Backend (Terminal 1)

```bash
cd crowd-risk-prediction

# Install dependencies (if not already done)
pip install -r requirements.txt

# Start the FastAPI server
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: **http://localhost:8000**

### Step 2: Start Frontend (Terminal 2)

```bash
cd crowd-risk-prediction/frontend-next

# Install dependencies (if not already done)
npm install

# Start the Next.js development server
npm run dev
```

Frontend will be available at: **http://localhost:3000**

---

## 🎯 How to Use

1. **Open** http://localhost:3000 in your browser
2. **Upload** a crowd video (MP4, AVI, MOV)
   - Drag & drop or click to browse
3. **Watch** the magic happen:
   - Video uploads with progress bar
   - Real-time analysis begins automatically
   - WebSocket streams live metrics
   - Charts update instantly
   - Alerts trigger on high risk

---

## 📊 What's Implemented

### ✅ Backend (FastAPI)

**Real-Time Streaming:**
- WebSocket endpoint: `/api/v1/analyze-stream/{video_id}`
- Frame-by-frame CIRI analysis
- Risk score calculation (40% density + 30% velocity + 30% clustering)
- Configurable frame skipping for performance

**Video Processing:**
- Upload endpoint: `/upload-video/`
- Video metadata: `/api/v1/video/{video_id}/metadata`
- Static file serving for uploaded videos
- Session history: `/api/v1/sessions`

**CIRI Pipeline:**
- CSRNet density estimation
- Optical flow processing
- Instability feature extraction
- Real-time risk scoring

### ✅ Frontend (Next.js 14)

**Video Upload:**
- Drag & drop with react-dropzone
- Upload progress bar
- File validation (MP4, AVI, MOV)
- Success/error states

**Video Player:**
- Full playback controls
- Speed control (0.5x, 1x, 2x, 4x)
- Frame navigation
- Progress bar with time display
- Analysis overlay indicator

**Real-Time Analytics:**
- Live risk gauge with color coding
- Risk timeline chart (area chart)
- CIRI score chart (line chart)
- Velocity variance chart (bar chart)
- Clustering score chart (line chart)
- Frame progress tracking

**Alert System:**
- Automatic high-risk detection
- Alert logging with timestamps
- Color-coded severity levels
- Animated alert cards

**UI/UX:**
- Premium dark gradient theme
- Glassmorphic card designs
- Smooth Framer Motion animations
- Custom gradient scrollbar
- Responsive layout
- Live status indicators

---

## 🔧 Technical Details

### Risk Score Formula

```python
risk_score = (
    0.4 * density_contribution +      # Crowd density levels
    0.3 * velocity_variance +          # Motion instability  
    0.3 * clustering_score             # Spatial distribution
)
```

### Risk Levels

| Level | Range | Color | Action |
|-------|-------|-------|--------|
| LOW | 0-30% | 🟢 Green | Normal monitoring |
| MODERATE | 30-60% | 🟡 Blue | Increased vigilance |
| HIGH | 60-80% | 🟠 Orange | Prepare response |
| CRITICAL | 80-100% | 🔴 Red | Immediate action |

### WebSocket Message Format

```typescript
// Frame analysis message
{
  "type": "frame_analysis",
  "frame": 42,
  "risk_score": 0.75,
  "ciri_score": 0.68,
  "density_mean": 0.72,
  "velocity_variance": 0.45,
  "clustering_score": 0.61,
  "avg_risk": 0.71,
  "max_risk": 0.82,
  "progress": 45.5,
  "timestamp": "2026-04-11T20:30:00"
}
```

---

## 📁 Project Structure

```
crowd-risk-prediction/
├── api/
│   └── main.py                    # FastAPI backend with WebSocket
├── src/
│   ├── features/
│   │   ├── ciri_calculator.py     # CIRI computation
│   │   ├── optical_flow.py        # Motion analysis
│   │   └── instability_features.py # Feature extraction
│   ├── models/
│   │   ├── ciri_model.py          # CIRI predictor
│   │   └── csrnet.py              # Density estimator
│   └── utils/
│       └── visualization.py       # Heatmap generation
├── uploads/                        # Uploaded video files
└── frontend-next/
    ├── app/
    │   ├── page.tsx               # Main dashboard
    │   └── globals.css            # Global styles
    ├── components/
    │   ├── VideoUpload.tsx        # Drag & drop upload
    │   ├── VideoPlayer.tsx        # Video controls
    │   ├── RealTimeCharts.tsx     # Analytics charts
    │   └── AlertPanel.tsx         # Risk alerts
    └── hooks/
        └── useRealtimeAnalysis.ts # WebSocket hook
```

---

## 🐛 Fixed Issues

### ✅ React playbackRate Prop Error
**Problem:** React doesn't recognize `playbackRate` as a DOM prop  
**Solution:** Use `useEffect` to set it imperatively on the video element

### ✅ Video Source Error
**Problem:** Video src attribute not working correctly  
**Solution:** Use `<source>` tag with proper MIME types and correct file path

### ✅ File Serving
**Problem:** Uploaded videos not accessible  
**Solution:** Mount `/uploads` directory as static files in FastAPI

### ✅ WebSocket Streaming
**Problem:** Real-time data not flowing  
**Solution:** Implemented proper WebSocket lifecycle with frame-by-frame processing

---

## 🎨 UI Features

### Dark Theme
```css
background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1429 100%);
```

### Glassmorphic Cards
```css
backdrop-filter: blur(20px);
background: rgba(26, 31, 58, 0.9);
border: 1px solid rgba(102, 126, 234, 0.3);
```

### Gradient Scrollbar
```css
::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

---

## ⚡ Performance Optimizations

1. **Frame Skipping:** Process every Nth frame (default: 2)
2. **WebSocket Batching:** Stream results efficiently
3. **Lazy Video Loading:** Preload metadata only
4. **Chart Data Slicing:** Show last 30-50 frames only
5. **Efficient State Updates:** React hooks optimized

### Adjust Frame Skip

```typescript
// In hooks/useRealtimeAnalysis.ts
const wsUrl = `ws://localhost:8000/api/v1/analyze-stream/${videoId}?frame_skip=2`;
// Change to 1 for more accuracy, 4+ for faster processing
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload-video/` | Upload video file |
| WebSocket | `/api/v1/analyze-stream/{video_id}` | Real-time analysis |
| GET | `/api/v1/video/{video_id}/metadata` | Get video info |
| GET | `/api/v1/sessions` | Session history |
| GET | `/uploads/{filename}` | Access uploaded video |

---

## 🧪 Testing

### Test Video Upload
```bash
curl -X POST http://localhost:8000/upload-video/ \
  -F "file=@test_video.mp4"
```

### Test WebSocket
```javascript
const ws = new WebSocket('ws://localhost:8000/api/v1/analyze-stream/{video_id}');
ws.onmessage = (event) => {
  console.log(JSON.parse(event.data));
};
```

### Test Video Access
```
http://localhost:8000/uploads/{video_id}_{filename}
```

---

## 📝 Troubleshooting

### Video Not Playing
1. Check backend is running on port 8000
2. Verify uploads directory exists
3. Check browser console for errors
4. Ensure video format is supported (MP4 recommended)

### WebSocket Connection Failed
1. Verify backend WebSocket endpoint is accessible
2. Check CORS settings
3. Look for errors in browser console
4. Ensure video was uploaded successfully

### Charts Not Updating
1. Check WebSocket connection status in browser
2. Verify backend is processing frames
3. Look for JavaScript errors in console
4. Check network tab for WebSocket messages

---

## 🚀 Next Steps

### Optional Enhancements
- [ ] Add Redis for streaming buffer
- [ ] Implement PDF report export
- [ ] Add multi-camera support
- [ ] Integrate YOLOv8 for object detection
- [ ] Add user authentication
- [ ] Implement database for session storage
- [ ] Add heatmap overlay on video
- [ ] Export analysis data as CSV

### Deployment
```bash
# Build Next.js for production
cd frontend-next
npm run build
npm start

# Run backend with Gunicorn
gunicorn api.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

---

## 📚 Documentation

- **Backend API Docs**: http://localhost:8000/docs
- **Frontend README**: `frontend-next/README.md`
- **Backend Code**: `api/main.py` (well-commented)
- **Frontend Code**: TypeScript with inline docs

---

## 🎉 You're All Set!

Your CrowdGuard AI is now a **production-ready, real-time video analysis platform** with:

✅ Live WebSocket streaming  
✅ Real-time CIRI analysis  
✅ Beautiful dark theme UI  
✅ Interactive charts  
✅ Video playback controls  
✅ Alert system  
✅ Drag & drop upload  
✅ Frame-by-frame processing  

**Open http://localhost:3000 and start analyzing!** 🚀
