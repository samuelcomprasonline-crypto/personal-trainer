import { createContext, useContext } from 'react';

export const fonts = {
  title: 'Fraunces_600SemiBold', // ou sans serif de impacto
  body: 'Inter_400Regular',
  bodyBold: 'Inter_600SemiBold',
};

// Paleta Slate Titanium & Emerald Cirúrgico — Minimalista, Nobre e Executivo
export const gymTheme = {
  bg: '#080C10',            // Preto ônix profundo
  bgElevated: '#0D131C',
  surface: '#111722',        // Cartões principais em Dark Slate
  surfaceCard: '#151D2A',    // Cartões secundários
  surfaceElevated: '#1B2535',// Hover / elementos destacados
  border: '#1E293B',         // Bordas finas e sutis
  borderLight: '#2A374A',
  text: '#F8FAFC',           // Branco puro / Slate 50
  muted: '#94A3B8',          // Cinza metálico Slate 400
  accent: '#10B981',         // Verde Esmeralda Nobre Cirúrgico (Apple Health / Linear / High-End)
  accentHover: '#059669',
  accentText: '#FFFFFF',     // Alto contraste e legibilidade
  accentGlow: 'rgba(16, 185, 129, 0.22)',
  accentSubtle: 'rgba(16, 185, 129, 0.10)',
  muscleColor: '#10B981',    // Destaque anatômico esmeralda
  fatColor: '#F43F5E',       // Rose / Coral cirúrgico
  waterColor: '#0EA5E9',     // Ciano água
  cardRadius: 18,            // Elegante e equilibrado
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
  textMuted: '#64748B',
  black: '#080C10',
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 22,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
};

export const typography = {
  micro: 11,
  small: 12,
  body: 14,
  h3: 16,
  h2: 19,
  h1: 23,
};

const Override = createContext<Palette | null>(null);
export const PaletteOverride = Override.Provider;

export function useTheme(): Palette {
  const override = useContext(Override);
  return override ?? gymTheme;
}

