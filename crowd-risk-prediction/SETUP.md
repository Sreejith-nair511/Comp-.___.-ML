# Crowd Risk Analysis - Quick Setup Guide

## Prerequisites

- Python 3.8+
- Node.js 16+
- Docker and Docker Compose (optional)
- GPU with CUDA support (recommended)

## Quick Start (Docker)

### 1. Clone and Setup

```bash
cd crowd-risk-prediction
```

### 2. Configure Environment

Create `.env` file:

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Start Services

```bash
# Build and start all services
docker-compose up --build

# Or start with monitoring
docker-compose --profile monitoring up --build
```

### 4. Access the Application

- **Frontend Dashboard**: http://localhost
- **API Documentation**: http://localhost:8000/docs
- **Grafana Monitoring**: http://localhost:3000

## Manual Setup (Development)

### Backend Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start API server
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## First Steps

### 1. Upload a Video

```bash
curl -X POST "http://localhost:8000/upload-video/" \
  -F "file=@test_videos/demo_video.mp4"
```

### 2. Analyze the Video

```bash
# Use the video_id from the upload response
curl "http://localhost:8000/analyze-video/{video_id}"
```

### 3. Add a Camera (Optional)

```bash
curl -X POST "http://localhost:8000/cameras/add" \
  -d "camera_id=cam1" \
  -d "source=rtsp://your-camera-ip:554/stream" \
  -d "name=Camera 1" \
  -d "location=Main Entrance"
```

### 4. Configure Emergency Alerts

```bash
curl -X POST "http://localhost:8000/emergency/add-contact" \
  -d "name=Security Team" \
  -d "email=security@example.com" \
  -d "role=Security Manager"
```

## Testing the System

### Run Tests

```bash
# Backend tests
pytest tests/ -v

# Frontend tests
cd frontend
npm test
```

### Performance Benchmark

```python
from src.utils.edge_optimization import ModelOptimizer
from src.models.ciri_model import create_default_ciri_predictor

model = create_default_ciri_predictor()
optimizer = ModelOptimizer(device='cuda')

metrics = optimizer.benchmark_model(model, (1, 6, 224, 224))
print(f"FPS: {metrics['fps']:.2f}")
print(f"Latency: {metrics['avg_latency_ms']:.2f}ms")
```

## Troubleshooting

### Port Already in Use

```bash
# Change API port
uvicorn api.main:app --host 0.0.0.0 --port 8001

# Change frontend port
cd frontend
PORT=5174 npm run dev
```

### GPU Not Detected

```python
import torch
print(f"CUDA Available: {torch.cuda.is_available()}")
print(f"Device: {torch.cuda.get_device_name(0)}")
```

### Redis Connection Error

```bash
# Check Redis is running
docker-compose ps redis

# Restart Redis
docker-compose restart redis
```

## Production Deployment

### 1. Build Optimized Images

```bash
docker-compose -f docker-compose.yml build --no-cache
```

### 2. Start in Production Mode

```bash
docker-compose up -d
```

### 3. Monitor Services

```bash
# View logs
docker-compose logs -f api

# Check health
docker-compose ps

# Monitor resources
docker stats
```

### 4. Backup Data

```bash
# Backup Redis data
docker-compose exec redis redis-cli SAVE
docker cp crowd-risk-prediction_redis_data_1:/data /backup/redis

# Backup models
docker cp crowd-risk-prediction_api_1:/app/models /backup/models
```

## Next Steps

1. **Read the full documentation**: See README.md
2. **Configure cameras**: Use the dashboard or API
3. **Set up alerts**: Configure emergency contacts
4. **Monitor performance**: Use Grafana dashboard
5. **Optimize for edge**: Use quantization tools

## Support

- **Documentation**: README.md
- **API Docs**: http://localhost:8000/docs
- **Issues**: GitHub Issues
- **Email**: sreejith.nair@example.com

## License

MIT License - See LICENSE file for details
