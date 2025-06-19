import { Server } from "socket.io";

export default function handler(req: any, res: any) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socketio",
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      socket.on("join-room", (roomId) => {
        socket.join(roomId);
      });

      socket.on("draw-line", ({ roomId, line }) => {
        socket.to(roomId).emit("receive-line", line);
      });
    });
  }
  res.end();
} 