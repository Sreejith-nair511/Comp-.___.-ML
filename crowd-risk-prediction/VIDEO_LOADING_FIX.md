# 🎯 Video Loading Issue - Complete Fix

## Root Cause Found! ✅

The issue was that the frontend was using the **original filename** instead of the **backend-generated filename**.

### The Problem:
1. **Backend saves file as:** `{video_id}_{original_name}.mp4`
   - Example: `abc123-def456_crowd_video.mp4`
   
2. **Frontend was trying to access:** `crowd_video.mp4` ❌

3. **Should be accessing:** `abc123-def456_crowd_video.mp4` ✅

---

## What Was Fixed

### 1. VideoUpload.tsx ✅
**Changed:** Use `response.data.filename` from backend instead of `file.name`

```typescript
// BEFORE (WRONG)
onUploadComplete(response.data.video_id, {
  filename: file.name,  // ❌ Just the original name
  ...
});

// AFTER (CORRECT)
onUploadComplete(response.data.video_id, {
  filename: response.data.filename,  // ✅ Full filename with video_id prefix
  original_filename: response.data.original_filename,
  ...
});
```

### 2. Added Comprehensive Debug Logging ✅
- Logs videoId, filename, and full URL in VideoPlayer
- Logs upload metadata in main page
- Shows detailed error messages with URL

### 3. Enhanced Error Display ✅
- Shows the exact URL being used
- Displays video loading states
- Shows error details in console

---

## 🚀 How to Test (Step by Step)

### Option 1: Use the Test Page (Recommended)

1. **Open test page in browser:**
   ```
   file:///c:/2026proj/Crowd-Risk-Analysis-main/Crowd-Risk-Analysis-main/Crowd-Risk-Analysis-main/crowd-risk-prediction/test-video-upload.html
   ```

2. **Check Backend Status:**
   - Click "Check Backend Status"
   - Should show ✅ Backend is running!

3. **Upload Video:**
   - Select a video file
   - Click "Upload"
   - Note the filename returned

4. **Test Video URL:**
   - URL is auto-filled after upload
   - Click "Test URL"
   - Video should play in the player below

### Option 2: Use the Main Dashboard

1. **Make sure BOTH servers are running:**

   **Terminal 1 - Backend:**
   ```bash
   cd crowd-risk-prediction
   uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd crowd-risk-prediction/frontend-next
   npm run dev
   ```

2. **Open Dashboard:**
   ```
   http://localhost:3000
   ```

3. **Open Browser Console (F12):**
   - Go to Console tab
   - You'll see detailed logs

4. **Upload a Video:**
   - Drag & drop or click to upload
   - Watch the console logs

5. **Check Console Output:**
   You should see:
   ```
   Upload complete - ID: abc123-def456...
   Upload complete - Meta: {filename: "abc123-def456_video.mp4", ...}
   Set uploadedFilename to: abc123-def456_video.mp4
   
   VideoPlayer - videoId: abc123-def456...
   VideoPlayer - filename: abc123-def456_video.mp4
   VideoPlayer - videoUrl: http://localhost:8000/uploads/abc123-def456_video.mp4
   ```

6. **Verify Video Loads:**
   - Video player shows first frame
   - No error message
   - Can play/pause video

---

## 🔍 Debugging Checklist

If video still doesn't load, check these:

### ✅ Backend Checks

1. **Backend is running:**
   ```bash
   curl http://localhost:8000/
   ```
   Should return API info

2. **Uploads directory exists:**
   ```bash
   cd crowd-risk-prediction
   ls -la uploads/
   ```
   Should show uploaded video files

3. **Backend logs show upload:**
   ```
   INFO: 127.0.0.1:xxxxx - "POST /upload-video/ HTTP/1.1" 200 OK
   ```

4. **Test direct file access:**
   ```
   http://localhost:8000/uploads/YOUR_VIDEO_FILENAME.mp4
   ```
   Should download/play the video

### ✅ Frontend Checks

1. **Open Browser DevTools (F12)**

2. **Check Console tab:**
   - Look for upload logs
   - Look for video URL logs
   - Look for any errors

3. **Check Network tab:**
   - Upload request: `POST /upload-video/` → Should be 200
   - Video request: `GET /uploads/filename.mp4` → Should be 200
   
4. **Check the actual URL being used:**
   - Console will show: `VideoPlayer - videoUrl: http://localhost:8000/uploads/...`
   - Copy this URL
   - Open in new tab
   - Should play video

### ✅ File Checks

1. **Video was actually uploaded:**
   ```bash
   cd crowd-risk-prediction
   dir uploads\  # Windows
   ls -la uploads/  # Linux/Mac
   ```

2. **File size is reasonable:**
   - Should not be 0 bytes
   - Should match original video size

3. **Video format is supported:**
   - MP4 (H.264) - Best support ✅
   - WebM - Good support ✅
   - AVI - Limited browser support ⚠️

---

## 🐛 Common Issues & Solutions

### Issue: "Backend not running"
**Solution:**
```bash
cd crowd-risk-prediction
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

### Issue: "404 Not Found" on video
**Solutions:**
1. Re-upload the video
2. Check filename matches exactly
3. Verify file exists in `uploads/` directory
4. Check console logs for exact URL being used

### Issue: "Video format not supported"
**Solution:**
- Convert video to MP4 (H.264 codec)
- Use online converter or ffmpeg:
  ```bash
  ffmpeg -i input.avi -c:v libx264 -c:a aac output.mp4
  ```

### Issue: "CORS error"
**Solution:**
- Backend already has CORS enabled for all origins
- Make sure backend is running
- Check browser console for specific CORS error

### Issue: "Video loads but doesn't play"
**Solutions:**
1. Click play button
2. Check video codec (must be H.264 for MP4)
3. Try a different video file
4. Check browser console for decoding errors

---

## 📊 Expected Console Output

### Successful Upload & Load:
```
Upload complete - ID: 550e8400-e29b-41d4-a716-446655440000
Upload complete - Meta: {
  filename: "550e8400-e29b-41d4-a716-446655440000_crowd.mp4",
  original_filename: "crowd.mp4",
  duration: 10.5,
  fps: 30,
  total_frames: 315
}
Set uploadedFilename to: 550e8400-e29b-41d4-a716-446655440000_crowd.mp4

VideoPlayer - videoId: 550e8400-e29b-41d4-a716-446655440000
VideoPlayer - filename: 550e8400-e29b-41d4-a716-446655440000_crowd.mp4
VideoPlayer - videoUrl: http://localhost:8000/uploads/550e8400-e29b-41d4-a716-446655440000_crowd.mp4
```

### Network Tab:
```
POST http://localhost:8000/upload-video/ → 200 OK
GET http://localhost:8000/uploads/550e8400-e29b-41d4-a716-446655440000_crowd.mp4 → 200 OK
```

---

## ✨ What's Working Now

✅ Correct filename from backend  
✅ Proper URL construction  
✅ Static file serving enabled  
✅ Fallback streaming endpoint  
✅ Comprehensive debug logging  
✅ Detailed error messages  
✅ Video loading states  
✅ Test page for debugging  

---

## 🎯 Quick Test Command

Test if backend is serving uploads:

```bash
# 1. Upload a video
curl -X POST http://localhost:8000/upload-video/ -F "file=@test.mp4"

# 2. Note the filename from response

# 3. Try to access it
curl -I http://localhost:8000/uploads/YOUR_FILENAME.mp4

# Should return: HTTP/1.1 200 OK
```

---

## 📞 Still Not Working?

1. **Open the test page:** `test-video-upload.html`
2. **Check all logs** in the test page
3. **Copy the exact URL** being used
4. **Try it directly** in browser
5. **Check backend terminal** for errors
6. **Verify file exists** in uploads folder

The test page will show you exactly where the problem is!

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Console shows correct video URL
- ✅ Network tab shows 200 for video request
- ✅ Video player shows first frame
- ✅ Can play/pause/seek video
- ✅ No error messages displayed
- ✅ Upload metadata shows correct filename

**If all these are good, you're ready for real-time analysis!** 🚀
