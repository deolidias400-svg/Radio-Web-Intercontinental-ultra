import { ThemePreset, EqualizerMode } from './types';

export const RADIO_URL = "https://stream.zeno.fm/wzcgaal0dnltv";

export const CORES_TEMAS: string[] = [
  "#ffd700", // 01 Gold
  "#ff3e3e", // 02 Crimson
  "#00e5ff", // 03 Cyber Cyan
  "#39ff14", // 04 Neon Green
  "#ff00ff", // 05 Laser Magenta
  "#ff7700", // 06 Solar Orange
  "#9d4edd", // 07 Orbit Purple
  "#ffb703", // 08 Flame Yellow
  "#06d6a0", // 09 Clean Teal
  "#118ab2", // 10 Sea Blue
  "#ef476f", // 11 Rose Glow
  "#ff9f1c", // 12 Amber
  "#4361ee", // 13 Cobalt
  "#7209b7", // 14 Royal Purple
  "#f72585", // 15 Hot Pink
  "#4cc9f0", // 16 Sky Blue
  "#00f5d4", // 17 Aurora
  "#70e000", // 18 Acid Lime
  "#ff477e", // 19 Electric Red
  "#ccff00", // 20 Yellow Green
  "#ff0054", // 21 Ruby Spark
  "#9b5de5", // 22 Lavender
  "#f15bb5", // 23 Pink Bubblegum
  "#00bbf9", // 24 Cyan Sparkle
  "#a2d2ff", // 25 Soft Pastel Blue
  "#fee440"  // 26 Vivid Gold
];

export const THEME_PRESETS: ThemePreset[] = CORES_TEMAS.map((color, index) => ({
  id: index + 1,
  label: (index + 1) < 10 ? `0${index + 1}` : `${index + 1}`,
  color
}));

export const EQ_MODES: { mode: EqualizerMode; label: string; icon: string; desc: string }[] = [
  { mode: 'STOCK', label: 'STOCK', icon: 'sliders', desc: 'Sinal Neutro' },
  { mode: 'ECO', label: 'ECO', icon: 'leaf', desc: 'Equalização Balanceada' },
  { mode: 'SPORT', label: 'SPORT', icon: 'gauge', desc: 'Graves e Agudos Médios' },
  { mode: 'CITY', label: 'CITY', icon: 'building', desc: 'Foco em Médios Urbanos' },
  { mode: 'TURBO', label: 'TURBO', icon: 'fire', desc: 'Graves Pesados & Nitidez' },
  { mode: 'VOICE', label: 'VOICE', icon: 'microphone', desc: 'Foco na Voz e Clariade' },
  { mode: 'NIGHT', label: 'NIGHT', icon: 'moon', desc: 'Atenua Frequências Extremas' }
];

export const QUICK_LINKS = [
  {
    title: "CONTATO",
    url: "https://intercontinental-web-radio.webnode.page/contato/",
    icon: "Mail",
    borderColor: "border-blue-900/40 hover:border-blue-500",
    textColor: "text-blue-400",
    bgColor: "bg-blue-950/20 hover:bg-blue-900"
  },
  {
    title: "TENDÊNCIAS",
    url: "https://deolidias2000.blogspot.com/2025/02/as-tendencias-musicais-que-estao.html",
    icon: "Star",
    borderColor: "border-orange-900/40 hover:border-orange-500",
    textColor: "text-orange-400",
    bgColor: "bg-orange-950/20 hover:bg-orange-900"
  },
  {
    title: "YOUTUBE",
    url: "https://www.youtube.com/@RadioWebintercontinental",
    icon: "Youtube",
    borderColor: "border-red-900/40 hover:border-red-500",
    textColor: "text-red-400",
    bgColor: "bg-red-950/20 hover:bg-red-600"
  },
  {
    title: "DYNAC X-PLAY",
    url: "https://sites.google.com/view/dynac-x-play-intercontinental/in%C3%ADcio",
    icon: "Gamepad2",
    borderColor: "border-purple-900/40 hover:border-purple-500",
    textColor: "text-purple-400",
    bgColor: "bg-purple-950/20 hover:bg-purple-900"
  },
  {
    title: "VOX I.A",
    url: "https://sites.google.com/view/vox-i-a/in%C3%ADcio",
    icon: "Cpu",
    borderColor: "border-green-900/40 hover:border-green-500",
    textColor: "text-green-400",
    bgColor: "bg-green-950/20 hover:bg-green-600"
  },
  {
    title: "PANDORA/EUTERPE",
    url: "https://sites.google.com/view/pandora-e-euterpe/in%C3%ADcio",
    icon: "Disc",
    borderColor: "border-pink-900/40 hover:border-pink-500",
    textColor: "text-pink-400",
    bgColor: "bg-pink-950/20 hover:bg-pink-600"
  }
];
