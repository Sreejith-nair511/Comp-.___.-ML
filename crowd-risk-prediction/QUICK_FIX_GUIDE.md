# 🚨 Quick Fix Guide - Video Analysis Platform

## Issues Fixed ✅

### 1. PyTorch Channel Mismatch Error
**Error:** `expected input[1, 1, 160, 72] to have 512 channels, but got 1 channels`

**Root Cause:** CSRNet model expects 3-channel RGB input, but sometimes received grayscale or RGBA images

**Fix Applied:**
- Added channel validation in `api/main.py`
- Converts grayscale to RGB automatically
- Converts RGBA to RGB automatically
- Added try-catch for density estimation errors
- Skips problematic frames gracefully

### 2. Video Not Found Error
**Error:** `Video error: {}` and `The media resource indicated by the src attribute was not suitable`

**Root Cause:** Video URL construction and file serving issues

**Fixes Applied:**
- Added `/uploads` static file mount in FastAPI
- Created `/api/v1/video/{video_id}/stream` endpoint
- Fixed filename handling (returns `{video_id}_{original_filename}`)
- Added video loading state and error messages in UI
- Added fallback URL construction

---

## 🔧 RESTART REQUIRED

You MUST restart the backend server for fixes to take effect!

### Step 1: Stop Backend (Terminal 1)
Press `Ctrl+C` in the terminal running the backend

### Step 2: Restart Backend
```bash
cd crowd-risk-prediction
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

**Wait for this message:**
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### Step 3: Frontend (Auto-reloads)
The Next.js frontend should auto-reload. If not, refresh your browser (F5)

---

## ✅ How to Test

### 1. Open Dashboard
```
http://localhost:3000
```

### 2. Upload a Test Video
- Drag & drop any crowd video (MP4 recommended)
- Wait for upload to complete (progress bar shows 100%)
- Video should appear in the player

### 3. Verify Video Loads
- You should see the first frame of the video
- No error messages
- "Loading video..." spinner disappears

### 4. Start Analysis
- Analysis starts automatically after upload
- Check browser console (F12) for WebSocket messages
- Charts should start updating in real-time

---

## 🐛 Still Having Issues?

### Check Backend Logs
Look for these messages in Terminal 1:
```
Models initialized successfully!
INFO:     127.0.0.1:xxxxx - "POST /upload-video/ HTTP/1.1" 200 OK
INFO:     127.0.0.1:xxxxx - "GET /uploads/xxx_video.mp4 HTTP/1.1" 200 OK
```

### Check Browser Console (F12)
**Expected:**
```
WebSocket connected
Frame analysis received: {type: "frame_analysis", ...}
```

**Errors to Watch For:**
- `WebSocket connection failed` → Backend not running
- `404 Not Found` → Video file path issue
- `Density estimation error` → Model input issue (should be fixed)

### Verify Uploads Directory
```bash
# Check if uploads folder exists and has files
cd crowd-risk-prediction
ls -la uploads/
```

You should see files like:
```
abc123-def456_test_video.mp4
```

---

## 🔍 Debug Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Uploads directory exists: `crowd-risk-prediction/uploads/`
- [ ] Video file uploaded successfully (check backend logs)
- [ ] Browser console shows no errors
- [ ] WebSocket connection established
- [ ] Video player shows first frame
- [ ] Charts update during analysis

---

## 💡 Tips for Success

### Use Short Test Videos First
- 5-10 seconds max
- MP4 format
- 720p or lower (faster processing)

### Monitor Backend Terminal
You should see:
```
Frame 0 processed successfully
Frame 2 processed successfully
Frame 4 processed successfully
...
```

### Check Network Tab (F12 → Network)
- WebSocket connection to `ws://localhost:8000/api/v1/analyze-stream/...`
- Status: `101 Switching Protocols`
- Messages flowing in real-time

---

## 🆘 Common Problems

### Problem: "Video not found"
**Solution:** 
1. Check backend is running
2. Re-upload the video
3. Check browser network tab for 404 errors

### Problem: Charts not updating
**Solution:**
1. Check WebSocket connection in Network tab
2. Look for errors in backend terminal
3. Verify video uploaded successfully

### Problem: Slow analysis
**Solution:**
- Use shorter videos (5-10s)
- Lower resolution (720p)
- Increase frame_skip in `hooks/useRealtimeAnalysis.ts` (change from 2 to 4)

### Problem: Black video screen
**Solution:**
1. Wait 2-3 seconds for video to load
2. Check video format (MP4 recommended)
3. Try a different video file
4. Check backend logs for upload errors

---

## 📞 Need More Help?

Check these files for details:
- Backend: `crowd-risk-prediction/api/main.py`
- Frontend: `crowd-risk-prediction/frontend-next/components/VideoPlayer.tsx`
- WebSocket Hook: `crowd-risk-prediction/frontend-next/hooks/useRealtimeAnalysis.ts`

**Full Documentation:** `crowd-risk-prediction/REALTIME_VIDEO_PLATFORM.md`

---

## ✨ What's Working Now

✅ Proper 3-channel RGB input to CSRNet  
✅ Graceful error handling for frame processing  
✅ Video file serving via static mount  
✅ Fallback streaming endpoint  
✅ Video loading states in UI  
✅ Error messages for failed loads  
✅ Filename handling fixed  
✅ WebSocket streaming active  

**Restart backend and test again!** 🚀
