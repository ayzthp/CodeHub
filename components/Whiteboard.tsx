"use client";

import { useMyPresence, useOthers, useStorage, useMutation } from "@liveblocks/react";
import { LiveList } from "@liveblocks/client";
import { useEffect, useRef, useState } from "react";

interface DrawingPoint {
  [key: string]: any;
  x: number;
  y: number;
  color: string;
  strokeWidth: number;
}

interface DrawingLine {
  [key: string]: any;
  points: DrawingPoint[];
  color: string;
  strokeWidth: number;
}

interface Presence {
  drawing?: boolean;
  x?: number;
  y?: number;
  color?: string;
  strokeWidth?: number;
}

export default function Whiteboard({ isHost }: { isHost: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<DrawingLine | null>(null);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers();

  // Liveblocks storage: lines is a shared LiveList of DrawingLine
  const lines = useStorage((root) => (root.lines as unknown as LiveList<DrawingLine>) ?? null);

  // Mutation to add a new line to storage
  const addLine = useMutation(({ storage }, line: DrawingLine) => {
    const lines = storage.get("lines") as LiveList<DrawingLine> | null;
    if (lines) {
      lines.push(line);
    }
  }, []);

  // Draw all lines and cursors from storage and presence
  const drawAll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all lines from storage
    if (lines) {
      for (const line of lines.toArray()) {
        if (line.points.length === 0) continue;
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.strokeWidth;
        ctx.beginPath();
        ctx.moveTo(line.points[0].x, line.points[0].y);
        for (const pt of line.points) {
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }
    }

    // Draw all presence cursors
    others.forEach((user) => {
      const presence = user.presence as Presence;
      if (presence && typeof presence.x === 'number' && typeof presence.y === 'number') {
        ctx.fillStyle = (presence.color as string) || "#3b82f6";
        ctx.beginPath();
        ctx.arc(presence.x, presence.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  // Redraw on lines or presence change
  useEffect(() => {
    drawAll();
  }, [lines, others]);

  // Redraw on window resize
  useEffect(() => {
    window.addEventListener("resize", drawAll);
    return () => window.removeEventListener("resize", drawAll);
  }, [lines, others]);

  // Drawing events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isHost) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDrawing(true);
    setCurrentLine({
      points: [{ x, y, color: strokeColor, strokeWidth }],
      color: strokeColor,
      strokeWidth,
    });
    updateMyPresence({ drawing: true, x, y, color: strokeColor, strokeWidth });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing || !isHost || !currentLine) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newLine = {
      ...currentLine,
      points: [...currentLine.points, { x, y, color: strokeColor, strokeWidth }],
    };
    setCurrentLine(newLine);
    drawAll();
    // Draw current line in progress
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      ctx.moveTo(currentLine.points[0].x, currentLine.points[0].y);
      for (const pt of newLine.points) {
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }
    updateMyPresence({ drawing: true, x, y, color: strokeColor, strokeWidth });
  };

  const handleMouseUp = () => {
    if (!isHost || !drawing || !currentLine) return;
    setDrawing(false);
    addLine(currentLine);
    setCurrentLine(null);
    updateMyPresence({ drawing: false });
  };

  const handleMouseLeave = () => {
    if (drawing && isHost && currentLine) {
      setDrawing(false);
      addLine(currentLine);
      setCurrentLine(null);
      updateMyPresence({ drawing: false });
    }
  };

  return (
    <div className="space-y-4">
      {/* Drawing Controls */}
      {isHost && (
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Color:</label>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-10 h-8 rounded border"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Width:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600">{strokeWidth}px</span>
          </div>
        </div>
      )}
      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="bg-white rounded border shadow-xl cursor-crosshair"
          style={{ touchAction: 'none' }}
        />
        {/* Status indicator */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          {isHost ? "✏️ Drawing Enabled" : "👁️ View Only"}
        </div>
      </div>
    </div>
  );
} 