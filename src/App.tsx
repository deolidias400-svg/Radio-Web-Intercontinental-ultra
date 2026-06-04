import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Play, 
  Square, 
  VolumeX, 
  Volume2, 
  Zap, 
  SlidersHorizontal, 
  Flame, 
  Clock, 
  Calendar, 
  Newspaper, 
  Activity, 
  Heart, 
  Mail, 
  Star, 
  Youtube, 
  Gamepad2, 
  Cpu, 
  Disc, 
  Info,
  ExternalLink,
  ChevronRight,
  Moon,
  Minimize2,
  Maximize2,
  Search,
  Globe,
  TrendingUp
} from 'lucide-react';
import { THEME_PRESETS, EQ_MODES, QUICK_LINKS, RADIO_URL } from './data';
import { EqualizerMode, TelemetryData } from './types';
import { VuMeter } from './components/VuMeter';
import { VolumeKnob } from './components/VolumeKnob';
import { CompanionRobot } from './components/CompanionRobot';
import { createRainBuffer, createVintageStaticBuffer, createStudioHumBuffer } from './lib/noise';

// Mapper to grab standard Lucide icons dynamically for bottom shortcuts
const IconMapper: Record<string, React.ComponentType<any>> = {
  Mail,
  Star,
  Youtube,
  Gamepad2,
  Cpu,
  Disc
};

export default function App() {
  // Navigation indicators & dates
  const [currentTime, setCurrentTime] = useState<string>('00:00:00');
  const [currentDate, setCurrentDate] = useState<string>('--/--/----');

  // Engine audio states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isNitro, setIsNitro] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(80);
  const [eqMode, setEqMode] = useState<EqualizerMode>('STOCK');
  const [themeId, setThemeId] = useState<number>(1); // default gold
  const [playerLayout, setPlayerLayout] = useState<'current' | 'vintage-industrial'>('current');
  const [isMiniPlayer, setIsMiniPlayer] = useState<boolean>(false);

  // Ambient Immersive Background Noise States
  const [noiseType, setNoiseType] = useState<'none' | 'rain' | 'static' | 'studio'>('none');
  const [noiseVolume, setNoiseVolume] = useState<number>(30);

  // Google Daily Search Trends states
  const [isTrendsEnabled, setIsTrendsEnabled] = useState<boolean>(true);
  const [trendGeo, setTrendGeo] = useState<string>('BR');
  const [trendsList, setTrendsList] = useState<{ query: string; traffic: string }[]>([]);
  const [isLoadingTrends, setIsLoadingTrends] = useState<boolean>(false);

  // Live frequencies (throttled to UI)
  const [lowFreq, setLowFreq] = useState<number>(0);
  const [midFreq, setMidFreq] = useState<number>(0);
  const [highFreq, setHighFreq] = useState<number>(0);

  // Telemetry details oscillating
  const [telemetry, setTelemetry] = useState<TelemetryData>({ prs: 27, rpm: 20, bal: 67 });

  // Companion Robot states
  const [robotPosition, setRobotPosition] = useState<'RIGHT' | 'MOVING_LEFT' | 'LEFT' | 'MOVING_RIGHT'>('RIGHT');
  const [robotCountdown, setRobotCountdown] = useState<number>(240); // 4-minute timer

  // RSS News headlines state
  const [headlines, setHeadlines] = useState<string[]>([
    'INTERCONTINENTAL NOTÍCIAS: Sintonize conosco para as tendências mais quentes de música e áudio digital com o novo processamento avançado de frequências.',
    'MÚSICA: Lançado o inovador analisador de espectro de áudio multicolorido de alta precisão com os novos VUs analógicos de agulha física vibrante.',
    'DYNAC X-PLAY: Nova plataforma intercontinental de jogos expande a integração de stream de rádio para mais de 12 novos ecossistemas virtuais.',
    'ROBÓTICA: O companheiro autônomo de patrulha do console de som já está operacional e monitorando a fidelidade harmônica da transmissão.',
    'TECNOLOGIA DE ÁUDIO: Matriz Pandora e Euterpe completa sincronização via satélite para garantir transmissão estereofônica estocástica ultra-pura.',
    'BLOG TENDÊNCIAS: Artigo exclusivo analisa como os clássicos medidores de ponteiro analógicos estão dominando os novos estúdios profissionais.',
    'VOX I.A: Módulo de inteligência de áudio em tempo real entra em atividade para prevenção automática de saturação sonora e calibração de ambiente.'
  ]);

  // Refs for audio graphs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const nitroGainRef = useRef<GainNode | null>(null);
  const lowFilterRef = useRef<BiquadFilterNode | null>(null);
  const midFilterRef = useRef<BiquadFilterNode | null>(null);
  const highFilterRef = useRef<BiquadFilterNode | null>(null);

  // Background noise refs
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const currentNoiseTypeRef = useRef<'none' | 'rain' | 'static' | 'studio'>('none');

  // Canvas visualizer refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Active theme properties
  const activeColor = THEME_PRESETS[themeId - 1]?.color || '#ffd700';

  // Tick clock and dates
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR'));
      setCurrentDate(now.toLocaleDateString('pt-BR'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Brazil/Global Google News dynamically via RSS conversion utility
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const rssUrl = "https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419";
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        const data = await response.json();
        if (data && data.status === 'ok' && data.items && data.items.length > 0) {
          const titles = data.items.slice(0, 15).map((item: any) => item.title);
          setHeadlines(titles);
        }
      } catch (err) {
        console.warn('Erro ao carregar notícias do Google RSS', err);
      }
    };
    fetchNews();
    const newsTimer = setInterval(fetchNews, 300000); // 5 min
    return () => clearInterval(newsTimer);
  }, []);

  // Fetch real Google Daily Search Trends from our fullstack Express server
  useEffect(() => {
    const fetchTrends = async () => {
      setIsLoadingTrends(true);
      try {
        const response = await fetch(`/api/google-trends?geo=${trendGeo}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.items && data.items.length > 0) {
            setTrendsList(data.items);
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar tendências de pesquisa do Google:', err);
      } finally {
        setIsLoadingTrends(false);
      }
    };

    fetchTrends();
    const interval = setInterval(fetchTrends, 180000); // 3 minutes refresh
    return () => clearInterval(interval);
  }, [trendGeo]);

  // Handle Robot companion patroller timer
  useEffect(() => {
    const robotTimer = setInterval(() => {
      if (robotPosition === 'RIGHT' || robotPosition === 'LEFT') {
        setRobotCountdown((prev) => {
          if (prev <= 1) {
            triggerPatrol();
            return 240;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(robotTimer);
  }, [robotPosition]);

  // Lazy instantiate Audio on mount
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(RADIO_URL);
      audioRef.current.crossOrigin = "anonymous";
    }

    // Sync volume & mute state instantly on adjustment
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Adjust theme property injection
  useEffect(() => {
    document.documentElement.style.setProperty('--theme-gold', activeColor);
    document.documentElement.style.setProperty('--theme-glow', `${activeColor}73`);
  }, [activeColor]);

  // Synchronize background noise node states
  useEffect(() => {
    const syncBackgroundNoise = () => {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;

      // Ensure gain node is set up
      if (!noiseGainRef.current) {
        const gainNode = ctx.createGain();
        // Route noise to analyser so it modulates wave and UI visuals
        if (analyserRef.current) {
          gainNode.connect(analyserRef.current);
        } else {
          gainNode.connect(ctx.destination);
        }
        noiseGainRef.current = gainNode;
      }

      // Smoothly update noise gain
      const targetGainVal = (isMuted || noiseType === 'none' || !isPlaying) ? 0 : (noiseVolume / 100);
      noiseGainRef.current.gain.setTargetAtTime(targetGainVal, ctx.currentTime, 0.05);

      // Manage procedural buffer sources
      const hasTypeChanged = currentNoiseTypeRef.current !== noiseType;
      const shouldStop = noiseType === 'none' || !isPlaying;

      if (shouldStop || hasTypeChanged) {
        if (noiseSourceRef.current) {
          try {
            noiseSourceRef.current.stop();
          } catch (e) {}
          noiseSourceRef.current.disconnect();
          noiseSourceRef.current = null;
        }
        currentNoiseTypeRef.current = 'none';
      }

      if (!shouldStop && (hasTypeChanged || !noiseSourceRef.current)) {
        let buffer: AudioBuffer;
        if (noiseType === 'rain') {
          buffer = createRainBuffer(ctx);
        } else if (noiseType === 'static') {
          buffer = createVintageStaticBuffer(ctx);
        } else {
          buffer = createStudioHumBuffer(ctx);
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(noiseGainRef.current);
        source.start(0);
        noiseSourceRef.current = source;
        currentNoiseTypeRef.current = noiseType;
      }
    };

    syncBackgroundNoise();
  }, [noiseType, noiseVolume, isPlaying, isMuted]);

  // Trigger Patrol Walker across the deck
  const triggerPatrol = () => {
    if (robotPosition === 'RIGHT') {
      setRobotPosition('MOVING_LEFT');
      setTimeout(() => {
        setRobotPosition('LEFT');
        setRobotCountdown(240);
      }, 8000); // 8 seconds transit
    } else if (robotPosition === 'LEFT') {
      setRobotPosition('MOVING_RIGHT');
      setTimeout(() => {
        setRobotPosition('RIGHT');
        setRobotCountdown(240);
      }, 8000); // 8 seconds transit
    }
  };

  // Initialize web audio pipeline on click START
  const handleStartPlay = async () => {
    if (!audioRef.current) return;

    try {
      // 1. Kickstart audio context
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // Create Analyser
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyserRef.current = analyser;

        // Biquad Filters for Equalizers
        const lf = ctx.createBiquadFilter(); 
        lf.type = 'lowshelf'; 
        lf.frequency.value = 260;
        lowFilterRef.current = lf;

        const mf = ctx.createBiquadFilter(); 
        mf.type = 'peaking'; 
        mf.frequency.value = 1200;
        midFilterRef.current = mf;

        const hf = ctx.createBiquadFilter(); 
        hf.type = 'highshelf'; 
        hf.frequency.value = 4500;
        highFilterRef.current = hf;

        // Nitro Booster Gain
        const ng = ctx.createGain();
        ng.gain.value = isNitro ? 2.3 : 1.0;
        nitroGainRef.current = ng;

        // Connect everything: Source -> NitroGain -> LF -> MF -> HF -> Analyser -> Output
        const source = ctx.createMediaElementSource(audioRef.current);
        sourceRef.current = source;

        source.connect(ng);
        ng.connect(lf);
        lf.connect(mf);
        mf.connect(hf);
        hf.connect(analyser);
        analyser.connect(ctx.destination);
      }

      // Resume context if suspended by browser security
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }

      // 2. Play Audio Stream
      await audioRef.current.play();
      setIsPlaying(true);

      // Start the canvas rendering and frequency analyzer cycle
      startAnimationLoop();

    } catch (err) {
      console.warn("Falha ao iniciar stream do áudio:", err);
    }
  };

  const handlePausePlay = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    // Suppress dynamic spikes
    setLowFreq(0);
    setMidFreq(0);
    setHighFreq(0);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleToggleNitro = () => {
    const nextNitro = !isNitro;
    setIsNitro(nextNitro);
    
    if (audioCtxRef.current && nitroGainRef.current) {
      // Safe, pop-free slider adjustment
      const targetGain = nextNitro ? 2.3 : 1.0;
      nitroGainRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.08);
    }
  };

  // Adjust filters according to selected equalizer preset mode
  const handleApplyPreset = (mode: EqualizerMode) => {
    setEqMode(mode);
    if (!audioCtxRef.current || !lowFilterRef.current || !midFilterRef.current || !highFilterRef.current) return;

    // Reset default values
    lowFilterRef.current.gain.value = 0;
    midFilterRef.current.gain.value = 0;
    highFilterRef.current.gain.value = 0;

    switch (mode) {
      case 'TURBO':
        lowFilterRef.current.gain.value = 13;
        highFilterRef.current.gain.value = 8;
        break;
      case 'SPORT':
        lowFilterRef.current.gain.value = 6;
        highFilterRef.current.gain.value = 6;
        break;
      case 'VOICE':
        lowFilterRef.current.gain.value = -4;
        midFilterRef.current.gain.value = 10;
        break;
      case 'CITY':
        midFilterRef.current.gain.value = 5;
        lowFilterRef.current.gain.value = -2;
        break;
      case 'ECO':
        lowFilterRef.current.gain.value = 2;
        midFilterRef.current.gain.value = -1;
        highFilterRef.current.gain.value = 2;
        break;
      case 'NIGHT':
        lowFilterRef.current.gain.value = -5;
        highFilterRef.current.gain.value = -7;
        break;
      case 'STOCK':
      default:
        // Already zeroed
        break;
    }
  };

  // Canvas visualizer rendering loop
  const startAnimationLoop = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }

    let lastUpdateTime = 0;

    const paintLoop = (timestamp: number) => {
      const canvas = canvasRef.current;
      const analyser = analyserRef.current;
      
      if (!canvas || !analyser) {
        animationFrameIdRef.current = requestAnimationFrame(paintLoop);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Handle responsive high DPI display alignment
      const rect = canvasContainerRef.current?.getBoundingClientRect();
      const parentWidth = rect?.width || 380;
      const parentHeight = rect?.height || 256;
      if (canvas.width !== parentWidth || canvas.height !== parentHeight) {
        canvas.width = parentWidth;
        canvas.height = parentHeight;
      }

      // Read audio frequencies
      const numFreqs = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(numFreqs);
      analyser.getByteFrequencyData(dataArray);

      // 1. Draw live audio graphics to Canvas (Runs at full native screen sync, ultra-smooth!)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxRadius = Math.min(cx, cy) - 40;

      // Outer radial design shield
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius - 10, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(2, 3, 6, 0.72)";
      ctx.fill();

      // Dynamic frequency lines
      dataArray.forEach((val, idx) => {
        const targetAngle = (idx / numFreqs) * Math.PI * 2;
        // Nitro amplification boosts length
        const boostMultiplier = isNitro ? 0.98 : 0.68;
        const sizeHeight = (val / 255) * 90 * boostMultiplier;

        // Multicolor spectra cycle - shifts dynamically over time creating a wonderful neon loop
        const baseHue = (idx / numFreqs) * 360;
        const animatedHue = (baseHue + (timestamp / 12)) % 360;

        if (isNitro) {
          // Explosive neon shifting for Nitro overboost!
          ctx.strokeStyle = `hsla(${animatedHue}, 100%, 50%, 0.98)`;
          ctx.lineWidth = 4.2;
        } else {
          // Balanced luxury multicolor palette spectrum for standard mode
          ctx.strokeStyle = `hsla(${animatedHue}, 95%, 65%, 0.92)`;
          ctx.lineWidth = 2.8;
        }

        ctx.lineCap = 'round';

        const startX = cx + Math.cos(targetAngle) * (maxRadius - 3);
        const startY = cy + Math.sin(targetAngle) * (maxRadius - 3);
        const endX = cx + Math.cos(targetAngle) * (maxRadius + sizeHeight);
        const endY = cy + Math.sin(targetAngle) * (maxRadius + sizeHeight);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      });

      // Interactive pulsating center orb
      const totalFreq = dataArray.reduce((acc, v) => acc + v, 0);
      const avgPower = totalFreq / numFreqs;
      const pulseScalar = (avgPower / 255) * 25;
      const orbRadius = Math.max(12, pulseScalar);

      // Glow backing
      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius + 8, 0, Math.PI * 2);
      ctx.fillStyle = isNitro ? 'rgba(239, 68, 68, 0.22)' : `${activeColor}2b`;
      ctx.fill();

      // Core sphere
      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius, 0, Math.PI * 2);
      ctx.fillStyle = isNitro ? '#ef4444' : activeColor;
      ctx.shadowBlur = 18;
      ctx.shadowColor = isNitro ? '#ef4444' : activeColor;
      ctx.fill();
      ctx.shadowBlur = 0; // reset shadow parameter immediately

      // 2. Throttle state updates for non-canvas parameters (to prevent React rendering lag)
      if (timestamp - lastUpdateTime > 50) {
        // Compute discrete low/mid/high averages
        const lowAverage = dataArray.slice(2, 9).reduce((a, b) => a + b, 0) / 7;
        const midAverage = dataArray.slice(10, 25).reduce((a, b) => a + b, 0) / 15;
        const highAverage = dataArray.slice(25, 50).reduce((a, b) => a + b, 0) / 25;

        setLowFreq(lowAverage);
        setMidFreq(midAverage);
        setHighFreq(highAverage);

        // Compute simulated machine telemetry
        const energyPercent = (lowAverage + midAverage + highAverage) / 3 / 255;
        setTelemetry({
          prs: Math.floor(22 + energyPercent * 62 + Math.random() * 4),
          rpm: Math.floor(15 + energyPercent * 80 + Math.random() * 6),
          bal: Math.floor(52 + energyPercent * 34 + Math.random() * 3)
        });

        lastUpdateTime = timestamp;
      }

      animationFrameIdRef.current = requestAnimationFrame(paintLoop);
    };

    animationFrameIdRef.current = requestAnimationFrame(paintLoop);
  };

  useEffect(() => {
    // If playing status changes, sync the animation loop trigger
    if (isPlaying) {
      startAnimationLoop();
    } else {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    }
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isPlaying, isNitro, activeColor]);

  // Handle companion's dynamic "dancing" trigger
  // He dances when we are actively streaming music and volume is over 25%
  const isCompanionDancing = isPlaying && !isMuted && volume > 20 && (lowFreq + midFreq + highFreq) > 30;

  // Google Daily Search Trends mapped for the scrolling news ticker in the footer
  const activeTickerItems = (isTrendsEnabled && trendsList.length > 0)
    ? trendsList.map(item => ({
        text: `TENDÊNCIA GOOGLE: "${item.query}" (${item.traffic} buscas recentemente)`,
        type: "GOOGLE IN-REALTIME",
        colorClass: "bg-red-600 text-white animate-pulse"
      }))
    : headlines.map(title => ({
        text: title,
        type: "FATO NEWS",
        colorClass: "bg-[#FFD700] text-zinc-950 font-extrabold"
      }));

  return (
    <div 
      style={{
        background: playerLayout === 'vintage-industrial'
          ? 'radial-gradient(circle at center, #0c0d12 0%, #020204 100%)'
          : 'linear-gradient(135deg, #FCF8EA 10%, #E6D9A0 100%)'
      }}
      className={`min-h-screen font-plus-jakarta flex flex-col justify-between pt-[85px] pb-[85px] select-none relative overflow-x-hidden transition-all duration-500 ${
        playerLayout === 'vintage-industrial' ? 'text-white' : 'text-zinc-900'
      }`}
    >
      
      {/* Dynamic Top Ecosystem Header Ticker */}
      <header className="fixed top-0 left-0 right-0 h-[56px] bg-zinc-950/95 border-b-4 border-[#FFD700] flex items-center justify-between z-50 shadow-2xl">
        {/* Logo Tag */}
        <div 
          className="px-6 h-full flex items-center gap-3 font-black text-xs sm:text-sm uppercase tracking-wider text-zinc-950 bg-[#FFD700] shadow-xl transition-all duration-300 font-plus-jakarta flex-shrink-0"
          style={{ 
            textShadow: '0 1px 1.5px rgba(255,255,255,0.5)'
          }}
        >
          <Radio className="w-5 h-5 animate-pulse text-zinc-950" />
          INTERCONTINENTAL WEB RÁDIO
        </div>

        {/* Scrolling Action Links (Seamless Loop) */}
        <div className="flex-1 overflow-hidden relative h-full flex items-center pr-4">
          <div 
            style={{ animation: 'tickerScroll 36s linear infinite' }}
            className="flex whitespace-nowrap gap-12 text-xs font-bold text-[#FFD700] hover:[animation-play-state:paused] cursor-grab"
          >
            {[...QUICK_LINKS, ...QUICK_LINKS].map((link, idx) => {
              const IconComponent = IconMapper[link.icon] || Info;
              return (
                <a 
                  key={`${link.title}-${idx}`}
                  href={link.url} 
                  target="_blank" 
                  referrerPolicy="no-referrer"
                  className="hover:text-white transition flex items-center bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(255,215,0,0.35)]"
                >
                  <IconComponent className="w-3.5 h-3.5 mr-2 text-yellow-400" />
                  {link.title} 
                </a>
              );
            })}
          </div>
        </div>

        {/* Header layout preference shortcut */}
        <button 
          onClick={() => setPlayerLayout(prev => prev === 'current' ? 'vintage-industrial' : 'current')}
          className={`mr-2 px-4 py-1.5 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 shadow-md active:scale-95 border cursor-pointer border-[#FFD700] z-10 flex-shrink-0 ${
            playerLayout === 'vintage-industrial'
              ? 'bg-[#FFD700] hover:bg-yellow-400 text-zinc-950 shadow-[0_0_15px_rgba(255,215,0,0.4)]'
              : 'bg-zinc-900 hover:bg-zinc-800 text-[#FFD700]'
          }`}
        >
          <SlidersHorizontal className="w-3 h-3 md:w-3.5 md:h-3.5" />
          {playerLayout === 'current' ? 'VISUAL 3D' : 'VISUAL GOLD'}
        </button>

        {/* Mini-Player Toggle button */}
        <button 
          onClick={() => setIsMiniPlayer(prev => !prev)}
          className={`mr-4 px-4 py-1.5 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 shadow-md active:scale-95 border cursor-pointer border-[#FFD700] z-10 flex-shrink-0 ${
            isMiniPlayer
              ? 'bg-gradient-to-r from-pink-500 to-[#FF0080] hover:from-pink-600 hover:to-pink-700 text-white border-transparent shadow-[0_0_15px_rgba(255,0,128,0.4)]'
              : playerLayout === 'vintage-industrial'
                ? 'bg-zinc-900 hover:bg-zinc-800 text-[#FFD700] border-zinc-800'
                : 'bg-zinc-900 hover:bg-zinc-800 text-[#FFD700]'
          }`}
        >
          {isMiniPlayer ? <Maximize2 className="w-3 h-3 md:w-3.5 md:h-3.5" /> : <Minimize2 className="w-3 h-3 md:w-3.5 md:h-3.5" />}
          {isMiniPlayer ? 'PLAYER CHEIO' : 'MINI-PLAYER'}
        </button>
      </header>

      {/* Main console layout */}
      <main className="w-full max-w-7xl mx-auto px-4 my-auto select-none py-6">
        
        {isMiniPlayer ? (
          /* MINI-PLAYER CORE PANEL */
          <div 
            className="rounded-[3rem] p-2 max-w-[420px] mx-auto transition-all duration-500 shadow-[0_25px_60px_rgba(0,0,0,0.4)] animate-fade-in"
            style={{
              background: playerLayout === 'vintage-industrial'
                ? 'radial-gradient(circle at center, #161a24 0%, #07090e 100%)'
                : 'linear-gradient(135deg, #B59549 0%, #7D642A 50%, #B59549 100%)',
              border: playerLayout === 'vintage-industrial' ? '3px solid #6b531c' : '3px solid rgba(191,161,95,0.6)',
              boxShadow: playerLayout === 'vintage-industrial'
                ? '0 0 75px rgba(0, 0, 0, 0.9), 0 0 25px rgba(218, 165, 32, 0.2)'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 25px rgba(181,149,73,0.2)'
            }}
          >
            <div className={`p-5 rounded-[2.5rem] relative flex flex-col gap-4 overflow-hidden border transition-all duration-500 ${
              playerLayout === 'vintage-industrial'
                ? 'bg-[#04060a] border-zinc-900 shadow-[inset_0_0_40px_rgba(0,0,0,0.95)]'
                : 'bg-zinc-950/98 border-zinc-850'
            }`}>
              
              {/* Header Title Block inside the mini player */}
              <div className="flex justify-between items-center select-none border-b border-white/5 pb-2.5">
                <div>
                  <h2 
                    style={{ textShadow: `0 0 12px ${playerLayout === 'vintage-industrial' ? 'rgba(255, 191, 0, 0.4)' : 'rgba(255, 215, 0, 0.4)'}` }}
                    className={`text-xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r font-plus-jakarta ${
                      playerLayout === 'vintage-industrial'
                        ? 'from-[#FFD700] via-[#c5a059] to-[#FFD700]'
                        : 'from-[#FFD700] via-white to-[#FFD700]'
                    }`}
                  >
                    INTERCONTINENTAL
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <p className="text-[8px] tracking-[0.2em] text-zinc-400 font-bold uppercase font-mono">MINI-PLAYER DIGITAL</p>
                  </div>
                </div>

                {/* Switch back to full player view button */}
                <button
                  type="button"
                  onClick={() => setIsMiniPlayer(false)}
                  title="Expandir para player completo"
                  className={`p-2 rounded-full transition-all duration-300 border cursor-pointer active:scale-90 hover:scale-105 flex items-center justify-center ${
                    playerLayout === 'vintage-industrial'
                      ? 'bg-zinc-900 border-zinc-800 text-yellow-400 hover:text-[#FFD700] hover:bg-zinc-800'
                      : 'bg-[#FF0080]/15 border-[#FF0080]/30 text-[#FF0080] hover:bg-[#FF0080]/25'
                  }`}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Compact Audio Visualizer Canvas Block */}
              <div 
                ref={canvasContainerRef}
                className={`relative rounded-[1.5rem] border-2 overflow-hidden h-44 flex items-center justify-center shadow-lg transition-colors duration-500 ${
                  playerLayout === 'vintage-industrial'
                    ? 'bg-[#010204]/98 border-zinc-800'
                    : 'bg-zinc-950/95 border-white/10'
                }`}
              >
                <p className="absolute top-2.5 left-3 text-[8px] font-black tracking-widest uppercase flex items-center gap-1.5 font-mono text-zinc-500">
                  <Activity className="w-3 h-3 text-pink-500 animate-pulse" />
                  VISUALIZADOR MINI-SCOPE
                </p>
                
                {/* Visualizer working canvas */}
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-full absolute inset-0 cursor-pointer block" 
                  onClick={() => (isPlaying ? handlePausePlay() : handleStartPlay())} 
                />

                {/* Playback idle message overlay */}
                {!isPlaying && (
                  <div className="absolute flex flex-col items-center justify-center gap-1 text-center pointer-events-none p-3 bg-black/90 rounded-xl border border-zinc-905 animate-pulse">
                    <p className="text-[10px] font-black text-white tracking-widest uppercase">CONEXÃO INATIVA</p>
                    <p className="text-[7.5px] text-zinc-400 font-mono">CLIQUE EM 'START' OU NO PAINEL</p>
                  </div>
                )}
              </div>

              {/* Dynamic noise state badge */}
              {noiseType !== 'none' && (
                <div className={`py-1.5 px-3 rounded-lg flex items-center justify-between text-[8.5px] font-mono border ${
                  playerLayout === 'vintage-industrial'
                    ? 'bg-zinc-950/60 border-zinc-900 text-yellow-400'
                    : 'bg-white/5 border-white/10 text-[#FF0080]'
                }`}>
                  <span className="flex items-center gap-1 uppercase font-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    RUÍDO: {noiseType === 'rain' ? 'CHUVA' : noiseType === 'static' ? 'CHIADO VINIL' : 'ZUMBIDO ESTÚDIO'}
                  </span>
                  <span className="font-extrabold font-mono font-black">VOL: {noiseVolume}%</span>
                </div>
              )}

              {/* Control Deck for the Mini-Player */}
              <div className="flex flex-col gap-3.5 pt-1">
                <div className="grid grid-cols-3 gap-1.5">
                  <button 
                    type="button"
                    onClick={isPlaying ? handlePausePlay : handleStartPlay}
                    className={`flex items-center justify-center gap-1.5 py-3 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer select-none active:scale-95 shadow-md ${
                      isPlaying 
                        ? 'bg-pink-500 hover:bg-pink-400 text-white font-extrabold border border-pink-400'
                        : 'bg-yellow-400 hover:bg-yellow-350 text-[#07090f] font-extrabold border border-yellow-300 shadow-[0_3px_10px_rgba(254,240,138,0.35)]'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Square className="w-3 h-3 fill-current" /> STOP
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" /> START
                      </>
                    )}
                  </button>

                  <button 
                    type="button"
                    onClick={handleToggleMute}
                    className={`flex items-center justify-center gap-1.5 py-3 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer select-none border active:scale-95 shadow-md ${
                      isMuted 
                        ? 'bg-yellow-400 text-[#07090f] border-yellow-300 font-extrabold shadow-[0_0_10px_rgba(255,191,0,0.35)]' 
                        : 'bg-white/10 hover:bg-white/20 text-[#00e5ff] border-white/15'
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />} MUTE
                  </button>

                  <button 
                    type="button"
                    onClick={handleToggleNitro}
                    className={`flex items-center justify-center gap-1.5 py-3 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer select-none border active:scale-95 shadow-md ${
                      isNitro 
                        ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white font-extrabold border-red-400 active-boost shadow-[0_0_12px_#FF0080]' 
                        : 'bg-white/10 hover:bg-white/20 text-orange-400 border-white/15'
                    }`}
                    style={{
                      animation: isNitro ? 'firePulse 0.4s infinite alternate' : 'none'
                    }}
                  >
                    <Flame className="w-3.5 h-3.5" /> BOOST
                  </button>
                </div>

                {/* Dynamic mini-player volume slider */}
                <div className={`p-3 rounded-2xl border ${
                  playerLayout === 'vintage-industrial'
                    ? 'bg-zinc-950/70 border-zinc-900'
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex justify-between items-center text-[9px] font-mono font-extrabold text-zinc-400 mb-1.5 select-none">
                    <span>VOLUME PRINCIPAL</span>
                    <span className={`font-black ${playerLayout === 'vintage-industrial' ? 'text-yellow-400' : 'text-[#FF50A0]'}`}>
                      {isMuted ? '00' : volume}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-420 font-mono text-[8px] select-none font-bold">MIN</span>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-full h-1 rounded-full appearance-none cursor-pointer outline-none transition-all bg-zinc-800"
                      style={{
                        background: playerLayout === 'vintage-industrial'
                          ? `linear-gradient(to right, #eab308 0%, #eab308 ${volume}%, #3f3f46 ${volume}%, #3f3f46 100%)`
                          : `linear-gradient(to right, #4A45C7 0%, #FF0080 ${volume}%, #42424a ${volume}%, #42424a 100%)`
                      }}
                    />
                    <span className="text-zinc-420 font-mono text-[8px] select-none font-bold">MAX</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        ) : (
          /* Responsive Outer Premium Vibrant Palette Frame */
          <div 
            className="rounded-[3.5rem] p-3 transition-all duration-500 shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
          style={{
            background: playerLayout === 'vintage-industrial'
              ? 'linear-gradient(135deg, #161a24 0%, #07090e 50%, #161a24 100%)'
              : 'linear-gradient(135deg, #B59549 0%, #7D642A 50%, #B59549 100%)',
            border: playerLayout === 'vintage-industrial' ? '4px solid #6b531c' : '4px solid rgba(191,161,95,0.6)',
            boxShadow: playerLayout === 'vintage-industrial'
              ? '0 0 100px rgba(0, 0, 0, 0.95), 0 0 40px rgba(218, 165, 32, 0.25)'
              : '0 35px 70px -15px rgba(0, 0, 0, 0.4), 0 0 40px rgba(181,149,73,0.25)'
          }}
        >
          {/* Deck panel */}
          <div className={`p-6 sm:p-8 rounded-[3rem] relative flex flex-col gap-6 overflow-hidden border transition-all duration-500 ${
            playerLayout === 'vintage-industrial'
              ? 'bg-[#04060a] border-zinc-900 shadow-[inset_0_0_55px_rgba(0,0,0,0.95)]'
              : 'bg-zinc-950/98 border-zinc-850'
          }`}>
            
            {/* Main responsive grid columns */}
            <div className="grid grid-cols-12 gap-6 items-stretch relative z-10">
              
              {/* Left Column - VU Audio indicators (Widened to md:col-span-4 lg:col-span-3 for screen-filling VUs) */}
              <section className="col-span-12 md:col-span-4 lg:col-span-3">
                <VuMeter 
                  low={lowFreq}
                  mid={midFreq}
                  high={highFreq}
                  prs={telemetry.prs}
                  rpm={telemetry.rpm}
                  bal={telemetry.bal}
                  layoutMode={playerLayout}
                />
              </section>

              {/* Center Column - Digital Player Core, Canvas Scope, Equalizers */}
              <section className="col-span-12 md:col-span-8 lg:col-span-6 flex flex-col justify-between gap-4">
                
                {/* Header title block with digital LCD hud readings status */}
                <div className="grid grid-cols-12 gap-4 items-center">
                  
                  {/* Left Logo and title */}
                  <div className="col-span-12 sm:col-span-7">
                    <h1 
                      style={{ textShadow: `0 0 15px ${playerLayout === 'vintage-industrial' ? 'rgba(255, 191, 0, 0.45)' : 'rgba(255, 215, 0, 0.45)'}` }}
                      className={`text-3xl sm:text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r font-plus-jakarta ${
                        playerLayout === 'vintage-industrial'
                          ? 'from-[#FFD700] via-[#c5a059] to-[#FFD700]'
                          : 'from-[#FFD700] via-white to-[#FFD700]'
                      }`}
                    >
                      INTERCONTINENTAL
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <p className="text-[11px] tracking-[0.25em] text-zinc-400 font-extrabold uppercase">ESTÚDIO DE TRANSMISSÃO DIGITAL</p>
                    </div>
                  </div>

                  {/* Right Glowing LCD Display status block */}
                  <div className={`col-span-12 sm:col-span-5 rounded-[2rem] p-4 border shadow-inner relative overflow-hidden flex flex-col justify-center transition-colors duration-500 ${
                    playerLayout === 'vintage-industrial'
                      ? 'bg-black border-zinc-900 text-yellow-500 shadow-[inset_0_0_15px_#000]'
                      : 'bg-zinc-900/95 border-zinc-800 text-yellow-500'
                  }`}>
                    <div className={`flex justify-between items-baseline border-b pb-1.5 mb-1.5 shadow-sm ${
                      playerLayout === 'vintage-industrial' ? 'border-zinc-900' : 'border-zinc-800'
                    }`}>
                      <span className="text-2xl font-black tracking-tight flex items-center gap-2 text-[#FFD700] font-orbitron">
                        <Clock className="w-4.5 h-4.5 text-[#FFD700] animate-pulse" />
                        {currentTime}
                      </span>
                      <span className="text-[10px] font-black text-zinc-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        {currentDate}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider font-mono">
                      <span className="flex items-center gap-1.5 text-emerald-450">
                        <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                        {isPlaying ? (isNitro ? 'NITRO BOOSTED' : 'CONECTADO') : 'PRONTO'}
                      </span>
                      <span className="text-[#FFD700] font-black">{eqMode} EQ</span>
                    </div>
                  </div>

                </div>

                {/* Oscilloscope Canvas container */}
                <div 
                  ref={canvasContainerRef}
                  className={`relative rounded-[2.5rem] border-4 overflow-hidden h-64 flex items-center justify-center shadow-2xl transition-colors duration-500 ${
                    playerLayout === 'vintage-industrial'
                      ? 'bg-[#010204]/98 border-zinc-800'
                      : 'bg-zinc-950/95 border-white/20'
                  }`}
                >
                  <p className="absolute top-4 left-5 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 font-mono text-zinc-500">
                    <Activity className="w-4 h-4 text-pink-500" />
                    ANALISADOR MULTICOLORIDO ATIVO
                  </p>
                  
                  {/* The actual fluid visualizer drawing board */}
                  <canvas ref={canvasRef} className="w-full h-full absolute inset-0 cursor-pointer block" onClick={() => (isPlaying ? handlePausePlay() : handleStartPlay())} />

                  {/* Gentle helper overlay on inactivity */}
                  {!isPlaying && (
                    <div className="absolute flex flex-col items-center justify-center gap-2 text-center pointer-events-none p-5 bg-black/85 rounded-[2rem] border-2 border-zinc-800 animate-pulse">
                      <p className="text-sm font-black text-white tracking-widest">AUDIO CONSOLE INATIVO</p>
                      <p className="text-[10px] text-zinc-400 font-mono">CLIQUE EM 'START' OU NO PAINEL PARA INICIAR O SINAL DE ÁUDIO</p>
                    </div>
                  )}
                </div>

                {/* Core control action sliders - Playback engine */}
                <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-2 rounded-[2.5rem] border shadow-xl transition-colors duration-500 ${
                  playerLayout === 'vintage-industrial'
                    ? 'bg-zinc-950/80 border-zinc-900'
                    : 'bg-white/10 border-white/15'
                }`}>
                  <button 
                    onClick={handleStartPlay}
                    className={`control-btn flex items-center justify-center gap-2.5 py-3.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer select-none active:scale-95 shadow-md ${
                      isPlaying 
                        ? 'bg-white/5 text-white/30 border-white/5 cursor-not-allowed border' 
                        : 'bg-yellow-400 hover:bg-yellow-350 text-[#07090f] hover:scale-103 font-extrabold border-2 border-yellow-300 shadow-[0_4px_15px_rgba(254,240,138,0.45)]'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" /> START
                  </button>

                  <button 
                    onClick={handlePausePlay}
                    className={`control-btn flex items-center justify-center gap-2.5 py-3.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer select-none active:scale-95 shadow-md ${
                      !isPlaying 
                        ? 'bg-white/5 text-white/30 border-white/5 cursor-not-allowed border' 
                        : 'bg-pink-500 hover:bg-pink-400 text-white hover:scale-103 font-extrabold border-2 border-pink-400'
                    }`}
                  >
                    <Square className="w-4 h-4 fill-current" /> STOP
                  </button>

                  <button 
                    onClick={handleToggleMute}
                    className={`control-btn flex items-center justify-center gap-2.5 py-3.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer select-none border active:scale-95 shadow-md ${
                      isMuted 
                        ? 'bg-yellow-400 text-[#07090f] border-yellow-300 font-black shadow-[0_0_15px_rgba(255,215,0,0.5)]' 
                        : 'bg-white/10 hover:bg-white/20 text-[#00e5ff] border-white/15'
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />} MUTE
                  </button>

                  <button 
                    onClick={handleToggleNitro}
                    className={`control-btn flex items-center justify-center gap-2.5 py-3.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer select-none border active:scale-95 shadow-md ${
                      isNitro 
                        ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white font-extrabold border-red-400 active-boost shadow-[0_0_20px_#FF0080]' 
                        : 'bg-white/10 hover:bg-white/20 text-orange-400 border-white/15'
                    }`}
                    style={{
                      animation: isNitro ? 'firePulse 0.4s infinite alternate' : 'none'
                    }}
                  >
                    <Flame className="w-4 h-4" /> NITRO
                  </button>
                </div>

                {/* Equalizers preset buttons grid */}
                <div className={`p-2 rounded-[2.5rem] border shadow-xl transition-colors duration-500 ${
                  playerLayout === 'vintage-industrial'
                    ? 'bg-zinc-950/80 border-zinc-900'
                    : 'bg-white/10 border-white/15'
                }`}>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {EQ_MODES.map((item) => {
                      const isActive = eqMode === item.mode;
                      return (
                        <button
                          key={item.mode}
                          onClick={() => handleApplyPreset(item.mode)}
                          className={`py-2 rounded-full flex flex-col items-center justify-center gap-1.5 text-[9px] font-black border uppercase transition-all duration-250 cursor-pointer select-none active:scale-95 ${
                            isActive
                              ? playerLayout === 'vintage-industrial'
                                ? 'bg-yellow-400 text-zinc-950 font-extrabold border-white scale-102 font-plus-jakarta'
                                : 'bg-white text-[#4A45C7] font-extrabold shadow-md transform scale-102 font-plus-jakarta border-white'
                              : 'bg-white/5 hover:bg-white/10 text-white/75 border-transparent'
                          }`}
                          style={{
                            boxShadow: isActive ? (playerLayout === 'vintage-industrial' ? '0 0 15px #ffd700cc' : `0 0 15px rgba(255, 255, 255, 0.4)`) : '',
                          }}
                        >
                          {item.mode === 'STOCK' && <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-300" />}
                          {item.mode === 'ECO' && <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />}
                          {item.mode === 'SPORT' && <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />}
                          {item.mode === 'CITY' && <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />}
                          {item.mode === 'TURBO' && <Zap className="w-3.5 h-3.5 text-red-400 animate-bounce" />}
                          {item.mode === 'VOICE' && <SlidersHorizontal className="w-3.5 h-3.5 text-pink-400" />}
                          {item.mode === 'NIGHT' && <Moon className="w-3.5 h-3.5 text-indigo-300" />}
                          <span className="font-extrabold">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </section>

              {/* Right Column - Volume, Themes selection and listener preferences */}
              <section className="col-span-12 md:col-span-12 lg:col-span-3 flex flex-col gap-4">
                
                {/* Dial Volume, themes setup and listener preferences card unified */}
                <div className="grid grid-cols-12 gap-4 md:grid-cols-2 lg:flex lg:flex-col lg:gap-4">
                  
                  {/* Interactive knob */}
                  <div className="col-span-12 sm:col-span-6 md:col-span-1 lg:col-span-12">
                    <VolumeKnob 
                      volume={volume} 
                      onChange={setVolume} 
                      muted={isMuted} 
                      layoutMode={playerLayout}
                    />
                  </div>

                  {/* Ambient Immersive Background Noise Panel */}
                  <div className={`col-span-12 sm:col-span-6 md:col-span-1 lg:col-span-12 p-5 rounded-[2.5rem] border flex flex-col shadow-2xl transition-all duration-300 ${
                    playerLayout === 'vintage-industrial'
                      ? 'bg-zinc-950/98 border-zinc-800 text-zinc-100 shadow-[inset_0_0_30px_rgba(0,0,0,0.95)]'
                      : 'bg-white border-zinc-200 text-zinc-900'
                  }`}>
                    <p className={`text-[11px] font-black tracking-widest text-center uppercase mb-3 ${
                      playerLayout === 'vintage-industrial' ? 'text-yellow-400' : 'text-[#4A45C7]'
                    }`}>
                      ★ RUÍDO DE FUNDO
                    </p>
                    
                    {/* Compact Noise Selector Grid */}
                    <div className="grid grid-cols-4 gap-1 mb-4 select-none">
                      {([
                        { id: 'none', label: 'OFF', title: 'Nenhum som de fundo' },
                        { id: 'rain', label: 'CHUVA', title: 'Sons de chuva procedural' },
                        { id: 'static', label: 'VINIL', title: 'Estática / Chiado analógico' },
                        { id: 'studio', label: 'HUM', title: 'Zumbido elétrico de estúdio' }
                      ] as const).map((opt) => {
                        const isSel = noiseType === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setNoiseType(opt.id);
                              // Auto-start audio context if they try to turn on ambient noises
                              if (opt.id !== 'none' && !isPlaying) {
                                handleStartPlay();
                              }
                            }}
                            title={opt.title}
                            className={`py-2 px-1 rounded-xl text-[9.5px] font-mono font-black transition-all duration-200 cursor-pointer text-center select-none active:scale-90 border uppercase ${
                              isSel
                                ? playerLayout === 'vintage-industrial'
                                  ? 'bg-yellow-400 text-zinc-950 border-white font-extrabold scale-102 shadow-[0_0_10px_#ffd700]'
                                  : 'bg-[#FF0080] text-white border-transparent font-extrabold scale-102 shadow-md'
                                : playerLayout === 'vintage-industrial'
                                  ? 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-100'
                                  : 'bg-zinc-50 border-zinc-250 hover:border-zinc-350 text-zinc-500 hover:text-zinc-900'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Independent Volume Controls for the selected Noise */}
                    <div className="flex flex-col gap-1.5 px-0.5">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-zinc-400 select-none">
                        <span>VOLUME SUB-CANAL</span>
                        <span className={`font-black ${playerLayout === 'vintage-industrial' ? 'text-yellow-400' : 'text-[#FF0080]'}`}>
                          {noiseType === 'none' ? '00' : noiseVolume}%
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 font-mono text-[9px] select-none">MIN</span>
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          value={noiseVolume}
                          disabled={noiseType === 'none'}
                          onChange={(e) => setNoiseVolume(Number(e.target.value))}
                          className={`w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none transition-all ${
                            noiseType === 'none' 
                              ? 'bg-zinc-250 dark:bg-zinc-900 cursor-not-allowed opacity-30' 
                              : 'bg-zinc-250 dark:bg-zinc-800'
                          }`}
                          style={{
                            background: noiseType !== 'none'
                              ? playerLayout === 'vintage-industrial'
                                ? `linear-gradient(to right, #eab308 0%, #eab308 ${noiseVolume}%, #27272a ${noiseVolume}%, #27272a 100%)`
                                : `linear-gradient(to right, #4A45C7 0%, #FF0080 ${noiseVolume}%, #e4e4e7 ${noiseVolume}%, #e4e4e7 100%)`
                              : ''
                          }}
                        />
                        <span className="text-zinc-400 font-mono text-[9px] select-none">MAX</span>
                      </div>
                    </div>
                  </div>

                  {/* Google Search Trends Settings Panel */}
                  <div className={`col-span-12 sm:col-span-6 md:col-span-1 lg:col-span-12 p-5 rounded-[2.5rem] border flex flex-col shadow-2xl transition-all duration-300 ${
                    playerLayout === 'vintage-industrial'
                      ? 'bg-zinc-950/98 border-zinc-800 text-zinc-100 shadow-[inset_0_0_30px_rgba(0,0,0,0.95)]'
                      : 'bg-white border-zinc-200 text-zinc-900'
                  }`}>
                    <div className="flex items-center justify-between mb-3.5">
                      <p className={`text-[11px] font-black tracking-widest uppercase flex items-center gap-1.5 ${
                        playerLayout === 'vintage-industrial' ? 'text-yellow-400' : 'text-[#4A45C7]'
                      }`}>
                        <TrendingUp className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                        ★ TENDÊNCIAS GOOGLE
                      </p>
                      
                      {/* Active green status dot */}
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                        <span className="text-[8px] font-bold text-emerald-500 tracking-wider uppercase font-mono">LIVE API</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-zinc-400 mb-3.5 leading-relaxed select-text">
                      Mostrando em tempo real no feed inferior o que as pessoas mais estão pesquisando no Google no país selecionado.
                    </p>

                    <div className="flex flex-col gap-3">
                      {/* Toggle Button */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                        <span className="text-[10px] font-bold font-mono text-zinc-300 select-none">ATIVAR PAINEL</span>
                        <button
                          type="button"
                          onClick={() => setIsTrendsEnabled(!isTrendsEnabled)}
                          className={`relative w-11 h-6 rounded-full transition-colors duration-300 pointer-events-auto cursor-pointer ${
                            isTrendsEnabled ? 'bg-emerald-500' : 'bg-zinc-750'
                          }`}
                        >
                          <span 
                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 transform ${
                              isTrendsEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Region Selector */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9.5px] font-black tracking-wider text-zinc-400 select-none flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                          GEOLOCALIZAÇÃO DO FEED
                        </span>
                        
                        <div className="grid grid-cols-3 gap-1 select-none">
                          {([
                            { code: 'BR', name: 'BRASIL' },
                            { code: 'US', name: 'EUA' },
                            { code: 'GB', name: 'UK' }
                          ] as const).map((region) => {
                            const isRegionSel = trendGeo === region.code;
                            return (
                              <button
                                key={region.code}
                                onClick={() => setTrendGeo(region.code)}
                                disabled={!isTrendsEnabled}
                                className={`py-1.5 px-1 rounded-xl text-[9.5px] font-mono font-black transition-all duration-200 cursor-pointer text-center select-none active:scale-95 border uppercase ${
                                  !isTrendsEnabled 
                                    ? 'opacity-30 cursor-not-allowed border-zinc-800 text-zinc-500'
                                    : isRegionSel
                                      ? playerLayout === 'vintage-industrial'
                                        ? 'bg-yellow-400 text-zinc-950 border-white font-black scale-102 shadow-[0_0_8px_#ffd700]'
                                        : 'bg-[#FF0080] text-white border-transparent font-black scale-102 shadow-md'
                                      : playerLayout === 'vintage-industrial'
                                        ? 'bg-zinc-900/50 border-zinc-805 text-zinc-400 hover:text-zinc-100'
                                        : 'bg-zinc-50 border-zinc-250 hover:border-zinc-350 text-zinc-500 hover:text-zinc-900'
                                }`}
                              >
                                {region.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Status/Counter feedback */}
                      {isTrendsEnabled && (
                        <div className="mt-1 flex items-center justify-between text-[9px] font-mono font-bold text-zinc-400 bg-zinc-950/40 p-2 rounded-lg border border-white/5">
                          <span className="flex items-center gap-1 select-none">
                            <Search className="w-3 h-3 text-red-500" />
                            {isLoadingTrends ? 'CONECTANDO...' : 'CARREGADO'}
                          </span>
                          <span className="text-[#FF0080] animate-pulse">
                            {isLoadingTrends ? '...' : `${trendsList.length} TENDÊNCIAS`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Themes selection box */}
                  <div className={`col-span-12 sm:col-span-6 md:col-span-1 lg:col-span-12 p-5 rounded-[2.5rem] border flex flex-col shadow-2xl transition-all duration-300 ${
                    playerLayout === 'vintage-industrial'
                      ? 'bg-zinc-950/98 border-zinc-800 text-zinc-100 shadow-[inset_0_0_30px_rgba(0,0,0,0.95)]'
                      : 'bg-white border-zinc-200 text-zinc-900'
                  }`}>
                    <p className={`text-[11px] font-black tracking-widest text-center uppercase mb-4.5 ${
                      playerLayout === 'vintage-industrial' ? 'text-yellow-400' : 'text-[#4A45C7]'
                    }`}>
                      ★ SELETOR DE TEMAS
                    </p>
                    
                    {/* Compact thematic Grid swatches of 26 styles */}
                    <div className="grid grid-cols-6 md:grid-cols-5 gap-1.5 max-h-[142px] overflow-y-auto pr-1">
                      {THEME_PRESETS.map((theme) => {
                        const isSelected = themeId === theme.id;
                        return (
                          <button
                            key={theme.id}
                            onClick={() => setThemeId(theme.id)}
                            className={`py-1.5 rounded-xl text-[10px] font-mono font-black transition-all duration-200 cursor-pointer text-center select-none active:scale-90 border ${
                              isSelected
                                ? 'text-zinc-950 font-extrabold scale-102 border-white'
                                : playerLayout === 'vintage-industrial'
                                  ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100'
                                  : 'bg-zinc-50 border-zinc-250 hover:border-zinc-350 text-zinc-500 hover:text-zinc-900'
                            }`}
                            style={{
                              backgroundColor: isSelected ? theme.color : '',
                              borderColor: isSelected ? '#ffffff' : '',
                              boxShadow: isSelected ? `0 0 12px ${theme.color}aa` : '',
                            }}
                          >
                            {theme.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Listener Preference switch panel */}
                  <div className={`col-span-12 md:col-span-2 lg:col-span-12 p-5 rounded-[2.5rem] border flex flex-col justify-center shadow-2xl transition-all duration-300 ${
                    playerLayout === 'vintage-industrial'
                      ? 'bg-zinc-950/98 border-zinc-800 text-zinc-100 shadow-[inset_0_0_30px_rgba(0,0,0,0.95)]'
                      : 'bg-white border-zinc-200 text-zinc-900'
                  }`}>
                    <p className={`text-[11px] font-black tracking-widest text-center uppercase mb-3 ${
                      playerLayout === 'vintage-industrial' ? 'text-yellow-400' : 'text-[#4A45C7]'
                    }`}>
                      ★ PREFERÊNCIA DO OUVINTE
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        onClick={() => setPlayerLayout('current')}
                        className={`py-3 px-1 rounded-2xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 border cursor-pointer active:scale-95 text-center ${
                          playerLayout === 'current'
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 border-white shadow-lg'
                            : playerLayout === 'vintage-industrial'
                              ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-650 hover:text-zinc-900'
                        }`}
                      >
                        ⚡ Gold Clássico
                      </button>
                      <button
                        onClick={() => setPlayerLayout('vintage-industrial')}
                        className={`py-3 px-1 rounded-2xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 border cursor-pointer active:scale-95 text-center ${
                          playerLayout === 'vintage-industrial'
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 border-white shadow-lg'
                            : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        ⚙ Industrial 3D
                      </button>
                    </div>
                  </div>

                </div>

              </section>

            </div>

            {/* Bottom Row Area - Dynamic Patrol Companion on wide rail */}
            <section className="mt-2 border-t border-white/10 pt-5 relative z-10 w-full">
              <CompanionRobot 
                isDancing={isCompanionDancing}
                themeColor={activeColor}
                position={robotPosition}
                onForcePatrol={triggerPatrol}
                countdown={robotCountdown}
                layoutMode={playerLayout}
              />
            </section>

            {/* Footer Bottom area featuring Station Shortcuts */}
            <footer className="mt-4 pt-4 border-t border-white/10 relative z-10">
              <p className="text-center text-[10px] text-white/50 font-black tracking-widest mb-3 uppercase">
                STATION ECOSYSTEM QUICK SHORTCUTS
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-[10px] font-black">
                {QUICK_LINKS.map((link) => {
                  const IconComponent = IconMapper[link.icon] || Info;
                  return (
                    <a
                      key={link.title}
                      href={link.url}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className={`p-3 rounded-2xl border text-xs flex items-center justify-center gap-2 transition-all duration-250 shadow-md transform hover:-translate-y-0.5 hover:text-white ${link.borderColor} ${link.textColor} ${link.bgColor} hover:shadow-lg`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {link.title}
                      <ExternalLink className="w-3 h-3 opacity-40" />
                    </a>
                  );
                })}
              </div>
            </footer>

          </div>
        </div>
        )}

      </main>

      {/* Dynamic News Banner Footer Ticker (Seamless loop) */}
      <footer className="fixed bottom-0 left-0 right-0 h-[48px] bg-zinc-950 border-t-4 border-[#FFD700] flex items-center z-50 overflow-hidden shadow-2xl">
        <div className="bg-red-600 text-white font-black px-5 h-full flex items-center text-xs tracking-wider z-10 shadow-lg border-r border-red-700 flex-shrink-0 font-plus-jakarta">
          <Newspaper className="w-5 h-5 mr-2 animate-pulse flex-shrink-0 text-white" />
          INTERCONTINENTAL NOTÍCIAS
        </div>

        <div className="flex-1 overflow-hidden relative h-full flex items-center">
          <div 
            style={{ animation: 'tickerScroll 40s linear infinite' }}
            className="flex whitespace-nowrap gap-12 text-xs font-bold hover:[animation-play-state:paused]"
          >
            {[...activeTickerItems, ...activeTickerItems].map((item, i) => (
              <span key={i} className="inline-flex items-center mx-4 text-white font-black select-text">
                <b className={`${item.colorClass} text-[9.5px] px-3 py-1 rounded-full mr-2.5 tracking-wider uppercase`}>
                  {item.type}
                </b>
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
