import React from 'react';

interface VuMeterProps {
  low: number;  // 0 to 255
  mid: number;  // 0 to 255
  high: number; // 0 to 255
  prs: number;
  rpm: number;
  bal: number;
  layoutMode?: 'current' | 'vintage-industrial';
}

const NeedleMeter: React.FC<{ 
  value: number; 
  label: string; 
  color: string; 
  layoutMode: 'current' | 'vintage-industrial' 
}> = ({ value, label, color, layoutMode }) => {
  // Convert 0-255 to dynamic needle angle (-50deg to +50deg)
  const jitter = (Math.random() - 0.5) * 2.5 * (value > 15 ? 1 : 0);
  const angle = -50 + (value / 255) * 100 + jitter;

  const isDark = layoutMode === 'vintage-industrial';

  return (
    <div className={`flex flex-col items-center rounded-2xl p-2 border shadow-inner w-full transition-all duration-300 ${
      isDark 
        ? 'bg-zinc-950/90 border-zinc-800 text-[#FFD700]' 
        : 'bg-zinc-50/90 border-zinc-200/60 text-[#4A45C7]'
    }`}>
      <span className={`text-[10px] font-black tracking-widest mb-1 uppercase font-orbitron ${
        isDark ? 'text-yellow-400' : 'text-[#4A45C7]'
      }`}>{label}</span>
      <div className="relative w-full aspect-[5/3] max-w-[120px] flex items-center justify-center">
        <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
          {/* Background Arc */}
          <path 
            d="M 15 48 A 38 38 0 0 1 85 48" 
            fill="none" 
            stroke={isDark ? '#27272a' : '#e4e4e7'} 
            strokeWidth="5" 
            strokeLinecap="round"
          />
          {/* Color filled scale backdrop */}
          <path 
            d="M 15 48 A 38 38 0 0 1 85 48" 
            fill="none" 
            stroke={color} 
            strokeWidth="3.5" 
            strokeLinecap="round"
            className="opacity-20"
          />
          {/* Analog subdivisions ticks */}
          <path 
            d="M 15 48 A 38 38 0 0 1 85 48" 
            fill="none" 
            stroke={isDark ? '#71717a' : '#71717a'} 
            strokeWidth="1.5" 
            strokeDasharray="1.5, 3"
          />
          {/* Danger zone / Red Zone of modern radio scale */}
          <path 
            d="M 68 20 A 38 38 0 0 1 85 48" 
            fill="none" 
            stroke="#ef4444" 
            strokeWidth="4" 
            strokeLinecap="round" 
          />

          {/* dB Scale indicators */}
          <text x="11" y="53" className="text-[5.5px] fill-zinc-500 font-extrabold font-mono">-20</text>
          <text x="32" y="24" className="text-[5.5px] fill-zinc-500 font-extrabold font-mono">-5</text>
          <text x="50" y="14" className={`text-[5.5px] font-extrabold font-mono ${isDark ? 'fill-zinc-300' : 'fill-zinc-700'}`}>0</text>
          <text x="68" y="20" className="text-[5.5px] fill-red-400 font-extrabold font-mono">+3</text>
          <text x="84" y="53" className="text-[5.5px] fill-red-500 font-extrabold font-mono">+6</text>

          {/* Needle Pointer with fine CSS transition */}
          <g transform={`rotate(${angle}, 50, 48)`}>
            {/* Needle Drop Shadow */}
            <line 
              x1="51.5" 
              y1="48" 
              x2="52.5" 
              y2="10.5" 
              stroke="rgba(0,0,0,0.3)" 
              strokeWidth="1.5" 
              strokeLinecap="round"
            />
            {/* Reactive red/orange Needle */}
            <line 
              x1="50" 
              y1="48" 
              x2="50" 
              y2="10" 
              stroke="#fbbf24" 
              strokeWidth="2" 
              strokeLinecap="round"
              className="transition-transform duration-75"
            />
          </g>

          {/* Center Pivot cap of the needle */}
          <circle cx="50" cy="48" r="6.5" fill={isDark ? '#18181b' : '#2d2d30'} stroke="#52525b" strokeWidth="1" />
          <circle cx="50" cy="48" r="2" fill="#fff" />
          <line x1="49" y1="48" x2="51" y2="48" stroke="#18181b" strokeWidth="1" />
        </svg>
      </div>
      <div className={`mt-1 font-mono text-[8.5px] font-black ${isDark ? 'text-zinc-400' : 'text-zinc-550'}`}>
        {Math.max(-20, Math.floor((value / 255) * 26 - 20))} dB
      </div>
    </div>
  );
};

export const VuMeter: React.FC<VuMeterProps> = ({ low, mid, high, prs, rpm, bal, layoutMode = 'current' }) => {
  const NUM_SEGMENTS = 14;
  const isDark = layoutMode === 'vintage-industrial';

  const renderSegments = (val: number, type: 'cyan' | 'pink' | 'green') => {
    const activeCount = Math.floor((val / 255) * NUM_SEGMENTS);
    const segments = [];

    const activeClasses = {
      cyan: 'bg-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.73)]',
      pink: 'bg-[#FF0080] shadow-[0_0_8px_rgba(255,0,128,0.73)]',
      green: 'bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.73)]'
    };

    for (let i = NUM_SEGMENTS - 1; i >= 0; i--) {
      const isActive = i < activeCount;
      segments.push(
        <div
          key={i}
          className={`flex-1 rounded-[1.5px] transition-all duration-75 ${
            isActive ? activeClasses[type] : (isDark ? 'bg-zinc-900' : 'bg-[#e4e4e7]')
          }`}
        />
      );
    }
    return segments;
  };

  return (
    <div className={`p-5 rounded-[2.5rem] border flex flex-col justify-between items-center h-full sm:min-h-[400px] w-full transition-all duration-300 ${
      isDark 
        ? 'bg-zinc-950/98 border-zinc-800 text-zinc-100 shadow-[inset_0_0_30px_rgba(0,0,0,0.95)]' 
        : 'bg-white border-zinc-200/85 text-zinc-900 shadow-2xl'
    }`}>
      <div className="text-center w-full flex flex-col gap-4">
        <p className={`text-[11px] font-black tracking-widest uppercase border-b pb-2 ${
          isDark ? 'text-yellow-400 border-zinc-800/80' : 'text-[#4A45C7] border-zinc-100'
        }`}>
          ★ ANALOG VUs & TRANSVERSALS
        </p>

        {/* Vintage Needle Meters Row */}
        <div className="grid grid-cols-3 gap-2 w-full">
          <NeedleMeter value={low} label="LOW PNT" color="#00e5ff" layoutMode={layoutMode} />
          <NeedleMeter value={mid} label="MID PNT" color="#FF0080" layoutMode={layoutMode} />
          <NeedleMeter value={high} label="HIGH PNT" color="#39ff14" layoutMode={layoutMode} />
        </div>
        
        {/* Horizontal Label Separator */}
        <div className={`text-[9px] font-extrabold tracking-widest uppercase ${
          isDark ? 'text-zinc-500' : 'text-zinc-400'
        }`}>
          BARS CONTROL
        </div>

        {/* The 3 vertical bars (transversals) */}
        <div className="flex justify-center gap-6 w-full px-1">
          <div className="flex flex-col items-center">
            <span className="text-[10px] block text-cyan-400 font-black mb-1.5 tracking-tighter uppercase font-orbitron">LOW BAR</span>
            <div className={`flex flex-col gap-[2.5px] h-[130px] w-7 p-[4px] border rounded-lg shadow-inner transition-colors duration-300 ${
              isDark ? 'bg-black border-zinc-800' : 'bg-zinc-100 border-zinc-200/65'
            }`}>
              {renderSegments(low, 'cyan')}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] block text-[#FF0080] font-black mb-1.5 tracking-tighter uppercase font-orbitron">MID BAR</span>
            <div className={`flex flex-col gap-[2.5px] h-[130px] w-7 p-[4px] border rounded-lg shadow-inner transition-colors duration-300 ${
              isDark ? 'bg-black border-zinc-800' : 'bg-zinc-100 border-zinc-200/65'
            }`}>
              {renderSegments(mid, 'pink')}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] block text-emerald-400 font-black mb-1.5 tracking-tighter uppercase font-orbitron">HI BAR</span>
            <div className={`flex flex-col gap-[2.5px] h-[130px] w-7 p-[4px] border rounded-lg shadow-inner transition-colors duration-300 ${
              isDark ? 'bg-black border-zinc-800' : 'bg-zinc-100 border-zinc-200/65'
            }`}>
              {renderSegments(high, 'green')}
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry data readings below VU */}
      <div className={`w-full mt-4 pt-3 border-t grid grid-cols-3 gap-1.5 text-center font-mono ${
        isDark ? 'border-zinc-800/80' : 'border-zinc-150'
      }`}>
        <div className={`p-1.5 rounded-xl border shadow-xs transition-colors duration-300 ${
          isDark ? 'bg-black border-zinc-800' : 'bg-zinc-50 border-zinc-200/60'
        }`}>
          <p className="text-[8px] text-zinc-400 font-black uppercase tracking-wider">PRS</p>
          <p className="text-xs text-yellow-500 font-black font-orbitron">{prs}</p>
        </div>
        <div className={`p-1.5 rounded-xl border shadow-xs transition-colors duration-300 ${
          isDark ? 'bg-black border-zinc-800' : 'bg-zinc-50 border-zinc-200/60'
        }`}>
          <p className="text-[8px] text-zinc-400 font-black uppercase tracking-wider">RPM</p>
          <p className="text-xs text-cyan-500 font-black font-orbitron">{rpm}</p>
        </div>
        <div className={`p-1.5 rounded-xl border shadow-xs transition-colors duration-300 ${
          isDark ? 'bg-black border-zinc-800' : 'bg-zinc-50 border-zinc-200/60'
        }`}>
          <p className="text-[8px] text-zinc-400 font-black uppercase tracking-wider">BAL</p>
          <p className="text-xs text-[#FF0080] font-black font-orbitron">{bal}</p>
        </div>
      </div>
    </div>
  );
};
