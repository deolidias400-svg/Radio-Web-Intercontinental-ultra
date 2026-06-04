export interface ThemePreset {
  id: number;
  label: string;
  color: string;
}

export type EqualizerMode = 'STOCK' | 'ECO' | 'SPORT' | 'CITY' | 'TURBO' | 'VOICE' | 'NIGHT';

export interface TelemetryData {
  prs: number;
  rpm: number;
  bal: number;
}
