"use client";
import { useEffect, useRef, useState } from "react";
import useSocket from "../hooks/useSocket";

export default function SharedWhiteboard({ roomId }: { roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useSocket(roomId);
  const [drawing, setDrawing] = useState(false);
  const prev = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");

    socketRef.current?.on("receive-line", ({ from, to }: { from: { x: number; y: number }; to: { x: number; y: number } }) => {
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [socketRef]);

  const getMouse = (e: any) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: any) => {
    setDrawing(true);
    prev.current = getMouse(e);
  };

  const handleMouseMove = (e: any) => {
    if (!drawing) return;
    const current = getMouse(e);
    const ctx = canvasRef.current!.getContext("2d");

    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(prev.current.x, prev.current.y);
    ctx.lineTo(current.x, current.y);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();

    socketRef.current.emit("draw-line", {
      roomId,
      line: { from: prev.current, to: current },
    });

    prev.current = current;
  };

  const handleMouseUp = () => setDrawing(false);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="border"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
} 