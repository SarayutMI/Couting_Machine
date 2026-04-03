export interface User {
  id: string;
  email: string;
  username: string;
  role: "ADMIN" | "VIEWER";
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Camera {
  id: string;
  name: string;
  ip: string;
  port: number;
  username: string;
  password: string;
  protocol: "ONVIF" | "RTSP" | "WEBCAM";
  streamUrl?: string;
  snapshotUrl?: string;
  status: "ONLINE" | "OFFLINE" | "ERROR";
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CountRecord {
  id: string;
  cameraId: string;
  count: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CountUpdate {
  cameraId: string;
  count: number;
  timestamp: Date;
}

export interface DashboardStats {
  totalCameras: number;
  onlineCameras: number;
  totalCountToday: number;
  totalCountThisHour: number;
}
