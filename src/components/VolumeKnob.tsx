import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VolumeKnobProps {
  volume: number; // 0 to 100
  onChange: (newVol: number) => void;
  muted: boolean;
  layoutMode?: 'current' | 'vintage-industrial';
}

export const VolumeKnob: React.FC<VolumeKnobProps> = ({ volume, onChange, muted, layoutMode = 'current' }) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startAngleRef = useRef(0);
  const startVolumeRef = useRef(0);

  const isDark = layoutMode === 'vintage-industrial';

  // Wheel handling to complement native interaction
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const step = e.deltaY < 0 ? 2 : -2;
    const nextVol = Math.max(0, Math.min(100, volume + step));
    onChange(nextVol);
  };

  const calculateAngle = (clientX: number, clientY: number) => {
    if (!knobRef.current) return 0;
    const rect = knobRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const angle = calculateAngle(e.clientX, e.clientY);
    startAngleRef.current = angle;
    startVolumeRef.current = volume;
    if (knobRef.current) {
      knobRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const currentAngle = calculateAngle(e.clientX, e.clientY);
    let deltaAngle = currentAngle - startAngleRef.current;
    
    // Normalize delta
    if (deltaAngle > 180) deltaAngle -= 360;
    if (deltaAngle < -180) deltaAngle += 360;

    // Convert degrees to volume delta (assume 280deg total rotational sweep)
    const volStep = (deltaAngle / 280) * 100;
    const nextVol = Math.max(0, Math.min(100, Math.round(startVolumeRef.current + volStep)));
    onChange(nextVol);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    if (knobRef.current) {
      knobRef.current.releasePointerCapture(e.pointerId);
    }
  };

  // Alignment value (sweep from -140deg to +140deg)
  const rotationAngle = (volume * 2.8) - 140;

  return (
    <div className={`p-5 rounded-[2rem] border flex flex-col items-center justify-center select-none h-full transition-all duration-300 ${
      isDark 
        ? 'bg-zinc-950/98 border-zinc-800 text-zinc-100 shadow-[inset_0_0_30px_rgba(0,0,0,0.95)]' 
        : 'bg-white border-zinc-200/80 text-zinc-900 shadow-2xl'
    }`}>
      <p className={`text-[11px] font-black uppercase tracking-widest mb-3 text-center ${
        isDark ? 'text-yellow-400' : 'text-[#4A45C7]'
      }`}>
        ★ VOL CONTROL
      </p>

      {/* Brush Metal Dial Zone */}
      <div 
        onWheel={handleWheel}
        className="relative w-36 h-36 rounded-full flex items-center justify-center cursor-ns-resize transition-all duration-300 scale-95 sm:scale-100"
        style={{
          background: isDark 
            ? 'conic-gradient(from 0deg, #090d16, #222b3c, #090d16, #333f56, #090d16)'
            : 'conic-gradient(from 0deg, #4A45C7, #6C63FF, #4A45C7, #FF0080, #4A45C7)',
          border: isDark ? '4px solid #6b531c' : '4px solid #FFD700',
          boxShadow: isDark 
            ? '0 15px 35px rgba(0,0,0,0.9), inset 0 0 20px #000'
            : 'inset 0 0 15px rgba(0,0,0,0.6), 0 12px 24px rgba(74,69,199,0.25)'
        }}
      >
        {/* Rotateable knob container */}
        <div 
          ref={knobRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-26 h-26 rounded-full flex items-center justify-center shadow-lg active:scale-98 transition-transform duration-75 relative touch-none"
          style={{
            background: isDark 
              ? 'radial-gradient(circle, #FFD700 0%, #4c3a10 100%)'
              : 'radial-gradient(circle, #FFD700 0%, #a18000 100%)',
            boxShadow: 'inset 0 0 15px rgba(255,255,255,0.4), 0 6px 15px rgba(0,0,0,0.4)',
            transform: `rotate(${rotationAngle}deg)`
          }}
        >
          {/* Top marker dot inside knob */}
          <div className="absolute top-2.5 w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#fff]" />
        </div>

        {/* HUD Overlay inside center showing Volume % */}
        <div className={`absolute flex flex-col items-center justify-center pointer-events-none px-3.5 py-2.5 rounded-2xl border shadow-xl transition-all duration-300 ${
          isDark 
            ? 'bg-zinc-950/95 border-zinc-800 text-yellow-500' 
            : 'bg-white border-zinc-200 shadow-xl text-zinc-950'
        }`}>
          <span className="text-[10px] font-mono text-zinc-400 font-bold block leading-none mb-0.5">VOL</span>
          <span className="text-sm font-mono font-black text-[#FF0080]" style={{ color: isDark ? '#ffd700' : '' }}>
            {muted ? '00' : volume}%
          </span>
          <div className="mt-1">
            {muted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-[#FF0080] animate-pulse" />
            ) : (
              <Volume2 className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-cyan-500'}`} />
            )}
          </div>
        </div>
      </div>

      <p className="text-[9px] text-zinc-400 font-bold mt-3.5 text-center leading-tight">
        {isDragging ? 'ROTACIONANDO...' : 'ARRASTAR OU SCROLL'}
      </p>
    </div>
  );
};
