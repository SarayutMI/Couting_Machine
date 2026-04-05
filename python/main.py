"""
FastAPI + YOLOv8 Person Detection Server
Run: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

import io
import time
from typing import List, Optional

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel
from ultralytics import YOLO

# ──────────────────────────────────────────────────────────────
# Configuration — change DETECT_CLASSES to detect other objects
# COCO class IDs: 0=person, 2=car, 15=cat, 16=dog, etc.
# Full list: https://docs.ultralytics.com/datasets/detect/coco/
# ──────────────────────────────────────────────────────────────
DETECT_CLASSES: List[int] = [0]  # 0 = person
CONFIDENCE_THRESHOLD: float = 0.4
MODEL_NAME: str = "yolov8n.pt"

# COCO class names (80 classes)
COCO_CLASS_NAMES = [
    "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train",
    "truck", "boat", "traffic light", "fire hydrant", "stop sign",
    "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow",
    "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag",
    "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite",
    "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket",
    "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana",
    "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza",
    "donut", "cake", "chair", "couch", "potted plant", "bed", "dining table",
    "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone",
    "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock",
    "vase", "scissors", "teddy bear", "hair drier", "toothbrush",
]

# ──────────────────────────────────────────────────────────────
# App setup
# ──────────────────────────────────────────────────────────────
app = FastAPI(title="YOLO Detection API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once at startup
model: Optional[YOLO] = None
model_load_error: Optional[str] = None
startup_time = time.time()


@app.on_event("startup")
async def load_model() -> None:
    global model, model_load_error
    try:
        model = YOLO(MODEL_NAME)
        print(f"[YOLO] Model '{MODEL_NAME}' loaded successfully.")
    except Exception as exc:
        model_load_error = str(exc)
        print(f"[YOLO] Failed to load model: {exc}")


# ──────────────────────────────────────────────────────────────
# Response schemas
# ──────────────────────────────────────────────────────────────
class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class Detection(BaseModel):
    class_id: int
    class_name: str
    confidence: float
    bbox: BoundingBox


class DetectResponse(BaseModel):
    count: int
    detections: List[Detection]
    inference_ms: float


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    uptime_seconds: float
    model_name: str


class ConfigResponse(BaseModel):
    model_name: str
    detect_classes: List[int]
    detect_class_names: List[str]
    confidence_threshold: float


# ──────────────────────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────────────────────
@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok" if model is not None else "model_not_loaded",
        model_loaded=model is not None,
        uptime_seconds=round(time.time() - startup_time, 1),
        model_name=MODEL_NAME,
    )


@app.get("/config", response_model=ConfigResponse)
async def config() -> ConfigResponse:
    class_names = [
        COCO_CLASS_NAMES[c] for c in DETECT_CLASSES if c < len(COCO_CLASS_NAMES)
    ]
    return ConfigResponse(
        model_name=MODEL_NAME,
        detect_classes=DETECT_CLASSES,
        detect_class_names=class_names,
        confidence_threshold=CONFIDENCE_THRESHOLD,
    )


@app.post("/detect", response_model=DetectResponse)
async def detect(file: UploadFile = File(...)) -> DetectResponse:
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    # Read and decode image
    raw = await file.read()
    try:
        pil_img = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    img_np = np.array(pil_img)
    img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
    h, w = img_bgr.shape[:2]

    # Run inference
    t0 = time.perf_counter()
    results = model(img_bgr, classes=DETECT_CLASSES, conf=CONFIDENCE_THRESHOLD, verbose=False)
    inference_ms = round((time.perf_counter() - t0) * 1000, 1)

    # Parse detections
    detections: List[Detection] = []
    for result in results:
        if result.boxes is None:
            continue
        for box in result.boxes:
            cls_id = int(box.cls[0].item())
            conf = float(box.conf[0].item())
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            detections.append(
                Detection(
                    class_id=cls_id,
                    class_name=COCO_CLASS_NAMES[cls_id] if cls_id < len(COCO_CLASS_NAMES) else str(cls_id),
                    confidence=round(conf, 3),
                    bbox=BoundingBox(
                        x1=round(x1 / w, 4),
                        y1=round(y1 / h, 4),
                        x2=round(x2 / w, 4),
                        y2=round(y2 / h, 4),
                    ),
                )
            )

    return DetectResponse(
        count=len(detections),
        detections=detections,
        inference_ms=inference_ms,
    )
