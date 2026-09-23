"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Move, Check, RefreshCw, Sun, Sliders } from "lucide-react";

interface PhotoCropModalProps {
  imageSrc: string;
  onClose: () => void;
  onSave: (croppedDataUrl: string) => void;
}

export default function PhotoCropModal({ imageSrc, onClose, onSave }: PhotoCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Image transformation states
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  // Load image object when imageSrc changes
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      setImageObj(img);
      setScale(1);
      setOffsetX(0);
      setOffsetY(0);
      setRotation(0);
      setBrightness(100);
      setContrast(100);
    };
  }, [imageSrc]);

  // Redraw canvas whenever controls change
  useEffect(() => {
    if (!imageObj || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasSize = 400; // Output resolution 400x400
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Save context
    ctx.save();

    // Apply CSS filters for brightness & contrast
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    // Translate to center for rotation & scaling
    ctx.translate(canvasSize / 2, canvasSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Draw image centered with offset
    const imgAspect = imageObj.width / imageObj.height;
    let drawWidth = canvasSize;
    let drawHeight = canvasSize;

    if (imgAspect > 1) {
      drawHeight = canvasSize / imgAspect;
    } else {
      drawWidth = canvasSize * imgAspect;
    }

    ctx.drawImage(
      imageObj,
      -drawWidth / 2 + offsetX,
      -drawHeight / 2 + offsetY,
      drawWidth,
      drawHeight
    );

    ctx.restore();
  }, [imageObj, scale, offsetX, offsetY, rotation, brightness, contrast]);

  const handleSaveCrop = () => {
    if (!canvasRef.current) return;
    // Create an optimized 350x350 output canvas for ultra-fast storage (~35KB string)
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 350;
    tempCanvas.height = 350;
    const tempCtx = tempCanvas.getContext("2d");
    if (tempCtx) {
      tempCtx.drawImage(canvasRef.current, 0, 0, 350, 350);
      const dataUrl = tempCanvas.toDataURL("image/jpeg", 0.78);
      onSave(dataUrl);
    } else {
      const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.78);
      onSave(dataUrl);
    }
    onClose();
  };

  const handleReset = () => {
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xl font-bold font-heading text-white">Adjust & Crop Profile Photo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Content */}
        <div className="overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          {/* Canvas Live Preview */}
          <div className="flex justify-center">
            <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-xl shadow-emerald-500/10 bg-black flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-cover"
              />
              {/* Data Science Overlay Frame Lines */}
              <div className="absolute inset-0 border border-emerald-400/20 pointer-events-none rounded-2xl" />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] font-mono text-emerald-400">
                400 x 400px Live Preview
              </div>
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="space-y-4 text-xs font-mono bg-white/[0.02] border border-white/8 p-4 rounded-2xl">
            {/* Zoom / Scale */}
            <div>
              <div className="flex justify-between text-neutral-300 mb-1">
                <span className="flex items-center gap-1.5"><ZoomIn className="w-3.5 h-3.5 text-emerald-400" /> Zoom / Scale:</span>
                <span className="text-emerald-400 font-bold">{Math.round(scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* Position Shift (X & Y) */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-neutral-300 mb-1">
                  <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5 text-cyan-400" /> Horizontal Shift:</span>
                  <span className="text-cyan-400">{offsetX}px</span>
                </div>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  step="2"
                  value={offsetX}
                  onChange={(e) => setOffsetX(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-300 mb-1">
                  <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5 text-cyan-400" /> Vertical Shift:</span>
                  <span className="text-cyan-400">{offsetY}px</span>
                </div>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  step="2"
                  value={offsetY}
                  onChange={(e) => setOffsetY(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Rotation & Brightness */}
            <div className="grid sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-neutral-300 mb-1">
                  <span className="flex items-center gap-1.5"><RotateCw className="w-3.5 h-3.5 text-indigo-400" /> Rotation:</span>
                  <span className="text-indigo-400">{rotation}°</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="w-full py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white flex items-center justify-center gap-2"
                >
                  <RotateCw className="w-3.5 h-3.5 text-indigo-400" /> Rotate 90°
                </button>
              </div>

              <div>
                <div className="flex justify-between text-neutral-300 mb-1">
                  <span className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-amber-400" /> Brightness:</span>
                  <span className="text-amber-400">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="5"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-xl bg-white/5 text-neutral-300 hover:text-white font-mono text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Studio
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white font-mono text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCrop}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold font-mono text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Check className="w-4 h-4" /> Save Cropped Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
