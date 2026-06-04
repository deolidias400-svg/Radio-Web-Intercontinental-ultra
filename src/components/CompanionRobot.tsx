import React from 'react';
import { Cpu, Footprints } from 'lucide-react';

interface CompanionRobotProps {
  isDancing: boolean;
  themeColor: string;
  position: 'RIGHT' | 'MOVING_LEFT' | 'LEFT' | 'MOVING_RIGHT';
  onForcePatrol: () => void;
  countdown: number;
  layoutMode?: 'current' | 'vintage-industrial';
}

export const CompanionRobot: React.FC<CompanionRobotProps> = ({
  isDancing,
  themeColor,
  position,
  onForcePatrol,
  countdown,
  layoutMode = 'current',
}) => {
  // Format MM:SS for next walk
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeStr = position.startsWith('MOVING')
    ? 'EM MOVIMENTO'
    : `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const isDark = layoutMode === 'vintage-industrial';

  const getPositionStyles = () => {
    switch (position) {
      case 'LEFT':
        return {
          right: 'calc(100% - 190px)',
          bottom: '140px',
        };
      case 'MOVING_LEFT':
        return {
          right: 'calc(100% - 190px)',
          bottom: '140px',
        };
      case 'MOVING_RIGHT':
        return {
          right: '25px',
          bottom: '120px',
        };
      case 'RIGHT':
      default:
        return {
          right: '25px',
          bottom: '120px',
        };
    }
  };

  const getStatusLabel = () => {
    switch (position) {
      case 'LEFT':
        return 'Monitorando VUs e Telemetria';
      case 'RIGHT':
        return 'Sistemas Prontos na Direita';
      case 'MOVING_LEFT':
        return 'Viajando até o VU Meter...';
      case 'MOVING_RIGHT':
        return 'Voltando para a base orbital...';
    }
  };

  const getRouteLabel = () => {
    switch (position) {
      case 'LEFT':
        return 'ESTACIONADO (ESQ)';
      case 'RIGHT':
        return 'ESTACIONADO (DIR)';
      case 'MOVING_LEFT':
        return 'PATRULHANDO p/ ESQUERDA';
      case 'MOVING_RIGHT':
        return 'RETORNANDO p/ DIREITA';
    }
  };
  return (
    <div className="flex flex-col lg:flex-row gap-5 items-stretch w-full">
      {/* Visual representation of the robot on rail */}
      <div className={`relative p-5 rounded-[2.5rem] border flex-1 min-h-[340px] overflow-hidden flex items-end justify-center transition-all duration-300 ${
        isDark 
          ? 'bg-zinc-950/98 border-zinc-800 text-zinc-100 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)]'
          : 'bg-white border-zinc-200/80 text-zinc-900 shadow-2xl'
      }`}>
        <div className="absolute top-4 left-5">
          <span className={`text-[11px] font-black tracking-widest uppercase block font-orbitron ${
            isDark ? 'text-yellow-400' : 'text-[#4A45C7]'
          }`}>★ TRILHO DE PATRULHA</span>
          <span className="text-[10px] text-zinc-400 font-mono">I-CON Companion Mk-III</span>
        </div>

        {/* Rail background indicator */}
        <div className={`absolute bottom-[145px] left-10 right-10 h-1.5 rounded ${
          isDark ? 'bg-zinc-900 border-b border-zinc-800/50' : 'bg-gradient-to-r from-violet-200 via-zinc-200 to-rose-200'
        }`} />

        {/* Interactive rail pointer indicator */}
        <div 
          className="absolute h-0.5 transition-all duration-[8000ms] ease-in-out"
          style={{
            left: position === 'LEFT' || position === 'MOVING_LEFT' ? '50px' : 'calc(100% - 150px)',
            width: '100px',
            bottom: '145px',
            background: themeColor,
            boxShadow: `0 0 12px ${themeColor}`
          }}
        />

        {/* Floating, moving Robot Box */}
        <div
          id="robotPatrolBox"
          onClick={onForcePatrol}
          className="absolute w-[140px] flex flex-col items-center transition-all duration-[8000ms] cubic-bezier(0.4, 0, 0.2, 1) cursor-pointer select-none active:scale-95 animate-pulse"
          style={getPositionStyles()}
        >
          {/* Glowing orbital floating body wrapper */}
          <div 
            className={`flex flex-col items-center relative ${
              isDancing ? 'dance-active' : ''
            }`}
            style={{
              animation: isDancing ? 'none' : 'floatRobot 3s ease-in-out infinite',
            }}
          >
            {/* Head Antennas */}
            <div className="absolute top-[-18px] left-[22px] w-1 h-[22px] bg-zinc-700 origin-bottom transform -rotate-[20deg]">
              <div className="absolute top-[-8px] left-[-5px] w-3.5 h-3.5 bg-fuchsia-600 rounded-full animate-pulse shadow-[0_0_15px_#ff00ff]" />
            </div>
            <div className="absolute top-[-18px] right-[22px] w-1 h-[22px] bg-zinc-700 origin-bottom transform rotate-[20deg]">
              <div className="absolute top-[-8px] left-[-5px] w-3.5 h-3.5 bg-fuchsia-600 rounded-full animate-pulse shadow-[0_0_15px_#ff00ff]" />
            </div>

            {/* Head */}
            <div 
              className="w-[90px] h-[76px] rounded-[40px] border-[3px] border-zinc-950 flex items-center justify-center shadow-2xl relative"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${themeColor} 0%, #302409 100%)`,
                animation: isDancing ? 'shakeHead 0.18s infinite alternate' : 'none',
              }}
            >
              {/* Face screen */}
              <div className="w-[72px] h-[54px] bg-zinc-950 rounded-[20px] border-2 border-zinc-800 flex items-center justify-around px-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent pointer-events-none" />
                {/* Glowing Blue Eyes */}
                <div 
                  className={`w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_14px_#00e5ff] relative flex items-center justify-center transition-all ${
                    isDancing ? 'scale-y-[0.3]' : 'scale-y-100'
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white opacity-90" />
                </div>
                <div 
                  className={`w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_14px_#00e5ff] relative flex items-center justify-center transition-all ${
                    isDancing ? 'scale-y-[0.3]' : 'scale-y-100'
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white opacity-90" />
                </div>
              </div>
            </div>

            {/* Torso */}
            <div 
              className="w-[66px] h-[66px] rounded-[20px] border-[3px] border-black -mt-[3px] relative flex items-center justify-center shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${themeColor} 0%, #2b1f06 100%)`,
                animation: isDancing ? 'bounceTorso 0.18s infinite alternate' : 'none',
              }}
            >
              {/* Decorative side arms */}
              <div 
                className="absolute top-2.5 left-[-16px] w-3.5 h-[42px] bg-zinc-900 border-2 rounded-[6px] origin-top transform rotate-[15deg] transition-transform duration-300"
                style={{
                  borderColor: themeColor,
                  animation: isDancing ? 'waveArmL 0.2s infinite alternate' : 'none',
                }}
              />
              <div 
                className="absolute top-2.5 right-[-16px] w-3.5 h-[42px] bg-zinc-900 border-2 rounded-[6px] origin-top transform rotate-[-15deg] transition-transform duration-300"
                style={{
                  borderColor: themeColor,
                  animation: isDancing ? 'waveArmR 0.18s infinite alternate' : 'none',
                }}
              />
              
              {/* Badge */}
              <div className="w-7.5 h-7.5 rounded-full bg-zinc-950 border-2 border-cyan-400 text-cyan-400 font-black text-[10px] flex items-center justify-center shadow-inner tracking-tighter animate-pulse">
                IC
              </div>
            </div>

            {/* Small legs */}
            <div className="mt-0.5 flex gap-1.5">
              <div 
                className="w-3.5 h-[30px] bg-zinc-950 border-2 rounded-[4px]"
                style={{ borderColor: themeColor }}
              />
              <div 
                className="w-3.5 h-[30px] bg-zinc-950 border-2 rounded-[4px]"
                style={{ borderColor: themeColor }}
              />
            </div>
          </div>

          {/* Holographic glowing base */}
          <div className="w-[125px] h-5 bg-radial from-cyan-400/70 to-zinc-950/90 border border-cyan-400 rounded-[50%] shadow-[0_0_25px_#00e5ff] mt-1 relative flex items-center justify-center">
            <div className="absolute inset-x-4 top-0.5 h-0.5 bg-white opacity-40 blur-xs" />
          </div>
        </div>
      </div>

      {/* Control companion center block */}
      <div className={`p-5 rounded-[2.5rem] border flex flex-col justify-between w-full lg:w-[260px] transition-all duration-300 ${
        isDark 
          ? 'bg-zinc-950/98 border-zinc-800 text-zinc-100 shadow-[inset_0_0_30px_rgba(0,0,0,0.95)]'
          : 'bg-white border-zinc-200/80 text-zinc-900 shadow-2xl'
      }`}>
        <div className={`text-center w-full py-3 rounded-2xl border shadow-inner transition-colors duration-300 ${
          isDark ? 'bg-black border-zinc-850' : 'bg-zinc-50 border-zinc-150'
        }`}>
          <p className="text-[10px] font-black tracking-widest text-[#FF0080] uppercase flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FF0080] animate-ping inline-block" />
            I-CON COMPANHEIRA
          </p>
          <p id="roboLabel" className={`text-[10px] font-extrabold uppercase mt-1 px-2 leading-tight ${
            isDark ? 'text-yellow-400' : 'text-[#4A45C7]'
          }`}>
            Status: {getStatusLabel()}
          </p>
        </div>

        <div className={`p-3 rounded-2xl border font-mono text-[10px] space-y-2.5 my-3.5 transition-colors duration-300 ${
          isDark ? 'bg-black border-zinc-850 text-zinc-400' : 'bg-zinc-50 border-zinc-150 text-zinc-650'
        }`}>
          <div className={`flex items-center justify-between border-b pb-1.5 ${
            isDark ? 'border-zinc-850' : 'border-zinc-150'
          }`}>
            <span className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-zinc-400"><Cpu className="w-3.5 h-3.5 text-amber-500" /> ROTA</span>
            <span id="roboRoute" className={`font-black ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>{getRouteLabel()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-zinc-400"><Footprints className="w-3.5 h-3.5 text-sky-500" /> PRÓX. PATRULHA</span>
            <span id="roboTimer" className={`text-xs font-black ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>{timeStr}</span>
          </div>
        </div>

        <button 
          onClick={onForcePatrol} 
          className={`w-full py-3 text-[10px] font-black rounded-2xl border uppercase tracking-widest transition duration-200 cursor-pointer shadow-md select-none active:scale-95 text-center flex items-center justify-center font-orbitron ${
            isDark 
              ? 'bg-zinc-900 border-zinc-800 text-yellow-400 hover:bg-yellow-500 hover:text-black hover:border-yellow-400'
              : 'bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-[#FF0080] hover:text-white hover:border-[#FF0080]'
          }`}
        >
          Forçar Patrulha Manual
        </button>
      </div>
    </div>
  );
};
