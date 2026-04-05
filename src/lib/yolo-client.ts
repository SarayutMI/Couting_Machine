/**
 * YOLO Detection API client
 * Communicates with the FastAPI backend running at http://localhost:8000
 */

const API_BASE = "http://localhost:8000";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface BoundingBox {
  /** Normalized x-coordinate of left edge (0–1) */
  x1: number;
  /** Normalized y-coordinate of top edge (0–1) */
  y1: number;
  /** Normalized x-coordinate of right edge (0–1) */
  x2: number;
  /** Normalized y-coordinate of bottom edge (0–1) */
  y2: number;
}

export interface Detection {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface DetectResult {
  count: number;
  detections: Detection[];
  inference_ms: number;
}

export interface HealthResult {
  status: string;
  model_loaded: boolean;
  uptime_seconds: number;
  model_name: string;
}

// ────────────────────────────────────────────────────────────
// API functions
// ────────────────────────────────────────────────────────────

/**
 * Capture the current frame from a canvas element as a JPEG blob and send it
 * to the /detect endpoint.
 *
 * @param canvas  The canvas element to capture (should already have a frame drawn).
 * @param quality JPEG quality 0–1, defaults to 0.7.
 * @returns       Detection result with count and bounding boxes.
 */
export async function detectFrame(
  canvas: HTMLCanvasElement,
  quality = 0.7,
): Promise<DetectResult> {
  const blob = await canvasToBlob(canvas, quality);

  const form = new FormData();
  form.append("file", blob, "frame.jpg");

  const response = await fetch(`${API_BASE}/detect`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`Detection API error ${response.status}: ${text}`);
  }

  return response.json() as Promise<DetectResult>;
}

/**
 * Fetch the /health endpoint with a 2-second timeout.
 * Returns null if the server is unreachable.
 */
export async function checkApiHealth(): Promise<HealthResult | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${API_BASE}/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;
    return response.json() as Promise<HealthResult>;
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("canvas.toBlob returned null"));
        }
      },
      "image/jpeg",
      quality,
    );
  });
}
