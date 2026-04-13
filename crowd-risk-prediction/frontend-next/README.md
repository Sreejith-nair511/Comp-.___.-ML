# CrowdGuard AI - Real-Time Video Analysis Platform

## 🎯 Overview

A production-grade, real-time video crowd analysis platform powered by AI. Upload crowd footage and get instant risk predictions with live streaming analytics.

## ✨ Features

### Real-Time Analysis
- **Live WebSocket Streaming**: Frame-by-frame analysis results
- **CIRI Model Integration**: Advanced crowd instability risk index
- **Multi-Metric Tracking**: Risk score, density, velocity, clustering
- **Instant Alerts**: Automatic high-risk detection

### Video Processing
- **Drag & Drop Upload**: Easy video upload with progress tracking
- **Format Support**: MP4, AVI, MOV
- **Playback Controls**: Speed control (0.5x, 1x, 2x, 4x)
- **Frame Navigation**: Skip forward/backward

### Analytics Dashboard
- **Real-Time Charts**: Risk timeline, CIRI scores, velocity variance
- **Risk Gauge**: Live percentage with color-coded levels
- **Alert Panel**: Automatic high-risk event logging
- **Progress Tracking**: Frame-by-frame analysis progress

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Backend API running on port 8000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Backend Setup

```bash
# From crowd-risk-prediction directory
pip install -r requirements.txt
uvicorn api.main:app --reload
```

## 📊 How It Works

1. **Upload Video**: Drag & drop or browse for crowd footage
2. **Auto Analysis**: Backend processes frames using CIRI pipeline
3. **Live Streaming**: WebSocket streams real-time metrics
4. **Visual Dashboard**: Charts update instantly with analysis data
5. **Alert System**: Automatic notifications for high-risk scenarios

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: App Router with TypeScript
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Real-time data visualization
- **Framer Motion**: Smooth animations
- **WebSocket**: Live data streaming
- **React Dropzone**: File upload

### Backend
- **FastAPI**: High-performance Python API
- **OpenCV**: Video processing
- **PyTorch**: CIRI model inference
- **WebSocket**: Real-time streaming

## 📁 Project Structure

```
frontend-next/
├── app/
│   └── page.tsx                 # Main dashboard
├── components/
│   ├── VideoUpload.tsx          # Drag & drop upload
│   ├── VideoPlayer.tsx          # Video playback controls
│   ├── RealTimeCharts.tsx       # Analytics charts
│   └── AlertPanel.tsx           # Risk alerts
├── hooks/
│   └── useRealtimeAnalysis.ts   # WebSocket hook
└── app/
    └── globals.css              # Global styles
```

## 🔌 API Endpoints

### Video Upload
```
POST /upload-video/
Upload video file for analysis
```

### Real-Time Analysis
```
WebSocket /api/v1/analyze-stream/{video_id}
Stream frame-by-frame analysis results
```

### Video Metadata
```
GET /api/v1/video/{video_id}/metadata
Get video file information
```

### Session History
```
GET /api/v1/sessions
Get list of past analysis sessions
```

## 📈 Risk Score Calculation

The composite risk score is calculated as:
- **40% Density Contribution**: Crowd density levels
- **30% Velocity Variance**: Motion instability
- **30% Clustering Score**: Spatial distribution

Risk Levels:
- 🟢 **LOW** (0-30%): Normal monitoring
- 🟡 **MODERATE** (30-60%): Increased vigilance
- 🟠 **HIGH** (60-80%): Prepare response
- 🔴 **CRITICAL** (80-100%): Immediate action

## 🎨 UI Features

- **Dark Theme**: Premium gradient backgrounds
- **Glassmorphism**: Frosted glass card effects
- **Responsive**: Works on all screen sizes
- **Animated**: Smooth transitions with Framer Motion
- **Live Indicators**: Pulsing status badges
- **Custom Scrollbar**: Gradient-styled scrollbars

## 🔧 Configuration

### Frame Skip Rate
Control processing speed by adjusting frame skip:
```typescript
// In useRealtimeAnalysis.ts
const wsUrl = `ws://localhost:8000/api/v1/analyze-stream/${videoId}?frame_skip=2`;
```

Lower = More accurate, slower
Higher = Faster, less granular

### WebSocket URL
Update backend URL if running on different host:
```typescript
// Change from ws://localhost:8000 to your backend URL
```

## 🐛 Troubleshooting

### WebSocket Connection Failed
- Ensure backend is running on port 8000
- Check CORS settings in backend
- Verify video was uploaded successfully

### Video Not Playing
- Check video format (MP4, AVI, MOV supported)
- Ensure uploads directory exists in backend
- Verify file permissions

### Charts Not Updating
- Check WebSocket connection status
- Verify backend is processing frames
- Look for errors in browser console

## 📝 License

MIT License - feel free to use for personal and commercial projects

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📧 Support

For issues and questions, open a GitHub issue.

---

**Built with ❤️ for crowd safety**
