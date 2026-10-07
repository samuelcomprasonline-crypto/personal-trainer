import { createContext, useContext } from 'react';

export const fonts = {
  title: 'Fraunces_600SemiBold', // ou sans serif de impacto
  body: 'Inter_400Regular',
  bodyBold: 'Inter_600SemiBold',
};

// Paleta Cyber Lime & Obsidian idêntica às referências visuais
export const gymTheme = {
  bg: '#0A0E13',            // Preto profundo de fundo
  bgElevated: '#0F141B',
  surface: '#141A23',        // Fundo dos cartões principais
  surfaceCard: '#17202C',    // Cartões secundários
  surfaceElevated: '#1D2736',// Hover / elementos destacados
  border: '#232D3F',         // Bordas sutis dos cards
  borderLight: '#2C3A50',
  text: '#FFFFFF',           // Branco puro
  muted: '#8E9AA8',          // Cinza metálico secundário
  accent: '#C6F432',         // VERDE NEON CYBER LIME (Idêntico às fotos)
  accentHover: '#B2E025',
  accentText: '#0A0E13',     // Texto preto sobre o botão verde neon
  accentGlow: 'rgba(198, 244, 50, 0.25)',
  accentSubtle: 'rgba(198, 244, 50, 0.12)',
  muscleColor: '#C6F432',    // Destaque muscular no mesmo verde neon
  fatColor: '#FF4757',       // Coral para queima de gordura
  waterColor: '#00D2D3',     // Ciano para água e hidratação
  cardRadius: 22,
  fonts,
};

export type Palette = typeof gymTheme;
export const studioPalette: Palette = gymTheme;

export const colors = {
  primary: gymTheme.accent,
  primaryGlow: gymTheme.accentGlow,
  background: gymTheme.bg,
  surface: gymTheme.surface,
  surfaceElevated: gymTheme.surfaceElevated,
  surfaceHighlight: gymTheme.surfaceCard,
  border: gymTheme.border,
  text: gymTheme.text,
  textSecondary: gymTheme.muted,
  textMuted: '#6B7A8D',
  black: '#0A0E13',
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  micro: 11,
  small: 13,
  body: 15,
  h3: 18,
  h2: 22,
  h1: 28,
};

const Override = createContext<Palette | null>(null);
export const PaletteOverride = Override.Provider;

export function useTheme(): Palette {
  const override = useContext(Override);
  return override ?? gymTheme;
}

