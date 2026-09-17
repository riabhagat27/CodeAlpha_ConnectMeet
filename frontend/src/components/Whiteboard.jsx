import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Pen, Eraser, Trash2, X, Circle } from 'lucide-react';

const COLORS = ['#f8fafc', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const Whiteboard = ({ meetingCode, socket, onClose }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser'
  const [color, setColor] = useState('#f8fafc');
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  // Draw line onto canvas context
  const drawLine = useCallback((prevPos, currentPos, drawColor, drawSize, isEraser = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = drawSize;

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = drawColor;
    }

    ctx.beginPath();
    ctx.moveTo(prevPos.x, prevPos.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();
    ctx.restore();
  }, []);

  // Handle Socket.io whiteboard events
  useEffect(() => {
    if (!socket) return;

    const handleRemoteDraw = (data) => {
      const { prevPos, currentPos, color: remoteColor, size, isEraser } = data;
      drawLine(prevPos, currentPos, remoteColor, size, isEraser);
    };

    const handleRemoteClear = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    };

    socket.on('whiteboard-draw', handleRemoteDraw);
    socket.on('whiteboard-clear', handleRemoteClear);

    return () => {
      socket.off('whiteboard-draw', handleRemoteDraw);
      socket.off('whiteboard-clear', handleRemoteClear);
    };
  }, [socket, drawLine]);

  // Handle Canvas Resizing
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      // Save canvas content before resize
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(tempCanvas, 0, 0);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Helper to get normalized coordinates relative to canvas
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getCoordinates(e);
    lastPosRef.current = pos;
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const currentPos = getCoordinates(e);
    const prevPos = lastPosRef.current;
    const isEraser = tool === 'eraser';

    drawLine(prevPos, currentPos, color, brushSize, isEraser);

    // Broadcast to meeting room via Socket.io
    if (socket) {
      socket.emit('whiteboard-draw', {
        meetingCode,
        drawData: {
          prevPos,
          currentPos,
          color,
          size: brushSize,
          isEraser
        }
      });
    }

    lastPosRef.current = currentPos;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    if (socket) {
      socket.emit('whiteboard-clear', { meetingCode });
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 border-l border-slate-800 shadow-2xl relative">
      {/* Top Controls Toolbar */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          {/* Tool selectors */}
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${
              tool === 'pen'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Pen className="w-4 h-4" />
            <span>Brush</span>
          </button>

          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${
              tool === 'eraser'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Eraser className="w-4 h-4" />
            <span>Eraser</span>
          </button>

          <div className="w-px h-5 bg-slate-800 mx-1" />

          {/* Color Palette */}
          {tool === 'pen' && (
            <div className="flex items-center gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          )}
        </div>

        {/* Brush Size & Clear & Close */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>Size:</span>
            <input
              type="range"
              min="2"
              max="30"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-20 accent-indigo-500 cursor-pointer"
            />
            <span className="w-4 text-slate-200 font-bold">{brushSize}</span>
          </div>

          <button
            onClick={handleClear}
            className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-rose-800/60 transition-colors"
            title="Clear Canvas for Everyone"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Clear Board</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div ref={containerRef} className="flex-1 w-full h-full relative bg-slate-950 overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="whiteboard-canvas absolute top-0 left-0 w-full h-full"
        />
      </div>
    </div>
  );
};

export default Whiteboard;
