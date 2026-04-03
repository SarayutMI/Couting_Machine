import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export function initSocket(server: HTTPServer): SocketIOServer {
  if (!io) {
    io = new SocketIOServer(server, {
      path: "/api/socketio",
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("join-camera", (cameraId: string) => {
        socket.join(`camera:${cameraId}`);
      });

      socket.on("leave-camera", (cameraId: string) => {
        socket.leave(`camera:${cameraId}`);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }
  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function emitCount(cameraId: string, count: number, timestamp: Date) {
  if (io) {
    io.to(`camera:${cameraId}`).emit("count-update", {
      cameraId,
      count,
      timestamp,
    });
    io.emit("global-count-update", { cameraId, count, timestamp });
  }
}
