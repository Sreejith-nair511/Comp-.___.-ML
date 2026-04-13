import requests
import time
import os

def test_pipeline():
    base_url = "http://localhost:8000"
    video_path = "c:\\2026proj\\Crowd-Risk-Analysis-main\\Crowd-Risk-Analysis-main\\Crowd-Risk-Analysis-main\\test_videos\\WhatsApp Video 2026-04-11 at 8.16.26 PM.mp4"
    
    if not os.path.exists(video_path):
        print(f"Error: Video file not found at {video_path}")
        return False
        
    print(f"Uploading video: {video_path}")
    with open(video_path, 'rb') as f:
        files = {'file': (os.path.basename(video_path), f, 'video/mp4')}
        response = requests.post(f"{base_url}/upload-video/", files=files)
        
    if response.status_code != 200:
        print(f"Upload failed: {response.text}")
        return False
        
    data = response.json()
    video_id = data['video_id']
    print(f"Upload successful. Video ID: {video_id}")
    
    print("Starting analysis (first few frames)...")
    # Only analyze first 5 frames to save time in verification
    analyze_url = f"{base_url}/analyze-video/{video_id}?start_frame=0&end_frame=5"
    response = requests.get(analyze_url)
    
    if response.status_code != 200:
        print(f"Analysis failed: {response.text}")
        return False
        
    print("Checking analysis results...")
    results = response.json()
    if 'frames_analyzed' in results and len(results['frames_analyzed']) > 0:
        print(f"SUCCESS: Analyzed {len(results['frames_analyzed'])} frames.")
        print(f"Average risk: {results['average_risk']}")
        return True
    else:
        print("FAILURE: No frames analyzed or results empty.")
        return False

if __name__ == "__main__":
    test_pipeline()
