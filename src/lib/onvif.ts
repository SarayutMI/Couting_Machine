// ONVIF camera integration helpers

export interface OnvifCamera {
  urn: string;
  name: string;
  xaddrs: string[];
  scopes: string[];
}

export interface CameraInfo {
  ip: string;
  port: number;
  username: string;
  password: string;
}

export interface StreamInfo {
  rtspUrl: string;
  snapshotUrl?: string;
}

export async function discoverCameras(timeoutMs = 5000): Promise<OnvifCamera[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([]), Math.min(timeoutMs, 1000));
  });
}

export async function getCameraStreamUrl(info: CameraInfo): Promise<StreamInfo | null> {
  try {
    const rtspUrl = `rtsp://${info.username}:${info.password}@${info.ip}:${info.port}/stream`;
    const snapshotUrl = `http://${info.ip}:${info.port}/snapshot`;
    return { rtspUrl, snapshotUrl };
  } catch {
    return null;
  }
}

export async function testCameraConnection(info: CameraInfo): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`http://${info.ip}:${info.port}/`, {
      signal: controller.signal,
    }).catch(() => null);
    
    clearTimeout(timeoutId);
    return response !== null;
  } catch {
    return false;
  }
}
