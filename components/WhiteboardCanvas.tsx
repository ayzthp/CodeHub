"use client";

import { useMyPresence, useOthers, useUpdateMyPresence, useStorage, useMutation } from "@liveblocks/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Palette, 
  Eraser, 
  Trash2, 
  Download, 
  Circle,
  Square
} from "lucide-react";

interface Stroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  thickness: number;
  userId: string;
  timestamp: number;
}

export default function WhiteboardCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [brushThickness, setBrushThickness] = useState(2);
  const [drawingMode, setDrawingMode] = useState<'draw' | 'erase'>('draw');
  const [shapeMode, setShapeMode] = useState<'free' | 'circle' | 'square'>('free');
  
  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers();
  
  // Liveblocks storage for strokes
  const strokes = useStorage((root: any) => root.strokes || []);
  const addStroke = useMutation(({ storage }, stroke: any) => {
    const strokes = storage.get("strokes") || [];
    strokes.push(stroke);
    storage.set("strokes", strokes);
  }, []);
  
  const clearStrokes = useMutation(({ storage }) => {
    storage.set("strokes", []);
  }, []);

  // Colors palette
  const colors = [
    "#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", 
    "#FF00FF", "#00FFFF", "#FFA500", "#800080", "#008000"
  ];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set default styles
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = brushThickness;
  }, []);

  // Redraw all strokes when strokes change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw all strokes
    if (Array.isArray(strokes)) {
      strokes.forEach((stroke: any) => {
        if (stroke.points && stroke.points.length < 2) return;

        ctx.beginPath();
        ctx.strokeStyle = stroke.color || '#000';
        ctx.lineWidth = stroke.thickness || 2;
        
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        stroke.points.forEach((point: any) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      });
    }
  }, [strokes]);

  const getCanvasCoordinates = (e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDraw = useCallback((e: React.MouseEvent) => {
    const coords = getCanvasCoordinates(e);
    const strokeId = `stroke_${Date.now()}_${Math.random()}`;
    
    const newStroke: Stroke = {
      id: strokeId,
      points: [coords],
      color: drawingMode === 'erase' ? '#FFFFFF' : selectedColor,
      thickness: brushThickness,
      userId: 'user-' + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };

    setCurrentStroke(newStroke);
    setIsDrawing(true);
    
    // Update presence to show drawing indicator
    updateMyPresence({ 
      isDrawing: true,
      currentStroke: strokeId,
      color: selectedColor
    });
  }, [selectedColor, brushThickness, drawingMode, updateMyPresence]);

  const draw = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !currentStroke) return;
    
    const coords = getCanvasCoordinates(e);
    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, coords]
    };
    
    setCurrentStroke(updatedStroke);
    
    // Draw locally for immediate feedback
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.strokeStyle = updatedStroke.color;
    ctx.lineWidth = updatedStroke.thickness;
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  }, [isDrawing, currentStroke]);

  const endDraw = useCallback(() => {
    if (!currentStroke || currentStroke.points.length < 2) {
      setIsDrawing(false);
      setCurrentStroke(null);
      updateMyPresence({ isDrawing: false, currentStroke: null });
      return;
    }

    // Add stroke to Liveblocks storage
    addStroke(currentStroke);
    
    setIsDrawing(false);
    setCurrentStroke(null);
    
    // Update presence
    updateMyPresence({ 
      isDrawing: false, 
      currentStroke: null,
      lastStroke: currentStroke.id
    });
  }, [currentStroke, addStroke, updateMyPresence]);

  const clearCanvas = useCallback(() => {
    clearStrokes();
  }, [clearStrokes]);

  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  const drawShape = useCallback((e: React.MouseEvent) => {
    if (shapeMode === 'free') return;
    
    const coords = getCanvasCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = brushThickness;
    
    const size = 50;
    
    if (shapeMode === 'circle') {
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, size, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (shapeMode === 'square') {
      ctx.strokeRect(coords.x - size/2, coords.y - size/2, size, size);
    }
  }, [shapeMode, selectedColor, brushThickness]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Drawing Tools</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                👥 {others.length + 1} Online
              </span>
              {others.map(({ presence }: any) => (
                <div key={presence.connectionId} className="flex items-center space-x-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: presence.color || '#000' }}
                  />
                  <span className="text-xs text-gray-500">
                    {presence.isDrawing ? 'Drawing...' : 'Idle'}
                  </span>
                </div>
              ))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 flex-wrap">
            {/* Color Palette */}
            <div className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span className="text-sm font-medium">Colors:</span>
              <div className="flex space-x-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded border-2 ${
                      selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Brush Thickness */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Thickness:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={brushThickness}
                onChange={(e) => setBrushThickness(parseInt(e.target.value))}
                className="w-24"
              />
              <span className="text-xs text-gray-500 w-8">{brushThickness}px</span>
            </div>

            {/* Drawing Modes */}
            <div className="flex items-center space-x-2">
              <Button
                variant={drawingMode === 'draw' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDrawingMode('draw')}
              >
                Draw
              </Button>
              <Button
                variant={drawingMode === 'erase' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDrawingMode('erase')}
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </div>

            {/* Shape Modes */}
            <div className="flex items-center space-x-2">
              <Button
                variant={shapeMode === 'free' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShapeMode('free')}
              >
                Free
              </Button>
              <Button
                variant={shapeMode === 'circle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShapeMode('circle')}
              >
                <Circle className="h-4 w-4" />
              </Button>
              <Button
                variant={shapeMode === 'square' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShapeMode('square')}
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearCanvas}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadCanvas}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card>
        <CardContent className="p-4">
          <div className="border rounded-lg shadow-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              onMouseDown={shapeMode === 'free' ? startDraw : drawShape}
              onMouseMove={shapeMode === 'free' ? draw : undefined}
              onMouseUp={shapeMode === 'free' ? endDraw : undefined}
              onMouseLeave={shapeMode === 'free' ? endDraw : undefined}
              className="bg-white cursor-crosshair"
              style={{ 
                width: '100%', 
                height: '600px',
                touchAction: 'none'
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 