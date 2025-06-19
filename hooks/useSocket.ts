import { useEffect, useRef } from "react";
import io from "socket.io-client";

export default function useSocket(roomId: string) {
  const socketRef = useRef<any>(null);

  useEffect(() => {
    socketRef.current = io('', {
      path: "/api/socketio",
    });
    socketRef.current.emit("join-room", roomId);
    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]);

  return socketRef;
} 