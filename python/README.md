# YOLO Detection API — Python FastAPI Backend

FastAPI server that runs YOLOv8 inference and exposes a REST API for the Next.js frontend.

---

## Requirements

- Python 3.10+
- pip

---

## Setup

```bash
# 1. Create a virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate        # macOS / Linux
.venv\Scripts\activate           # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The server will download `yolov8n.pt` automatically on the first run (~6 MB).

Open **http://localhost:8000/docs** to explore the interactive API documentation.

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check — returns model status and uptime |
| GET | `/config` | Current detection configuration |
| POST | `/detect` | Upload an image, receive count + bounding boxes |

### POST /detect

**Request:** `multipart/form-data` with a `file` field containing a JPEG/PNG image.

**Response:**
```json
{
  "count": 3,
  "detections": [
    {
      "class_id": 0,
      "class_name": "person",
      "confidence": 0.872,
      "bbox": { "x1": 0.12, "y1": 0.05, "x2": 0.38, "y2": 0.94 }
    }
  ],
  "inference_ms": 24.5
}
```

Bounding box coordinates are **normalized** (0.0 – 1.0 relative to image size).

---

## Changing Detection Classes

Edit the `DETECT_CLASSES` list at the top of `main.py`:

```python
# Detect persons only (default)
DETECT_CLASSES: List[int] = [0]

# Detect cars only
DETECT_CLASSES: List[int] = [2]

# Detect persons + cars
DETECT_CLASSES: List[int] = [0, 2]

# Detect cats + dogs
DETECT_CLASSES: List[int] = [15, 16]
```

### Common COCO Class IDs

| ID | Class |
|----|-------|
| 0 | person |
| 1 | bicycle |
| 2 | car |
| 3 | motorcycle |
| 14 | bird |
| 15 | cat |
| 16 | dog |
| 39 | bottle |
| 41 | cup |
| 56 | chair |
| 67 | cell phone |

Full list: <https://docs.ultralytics.com/datasets/detect/coco/>

---

## Adjusting Confidence Threshold

```python
CONFIDENCE_THRESHOLD: float = 0.4   # default 40%
```

Lower values detect more objects (more false positives).  
Higher values are stricter (fewer false positives, may miss some detections).

---

## Using a Larger Model

```python
MODEL_NAME: str = "yolov8n.pt"   # nano  — fastest
# MODEL_NAME: str = "yolov8s.pt" # small — balanced
# MODEL_NAME: str = "yolov8m.pt" # medium
# MODEL_NAME: str = "yolov8l.pt" # large
# MODEL_NAME: str = "yolov8x.pt" # extra-large — most accurate
```
