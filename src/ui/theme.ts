import { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { trainer } from '../data/seed';

export const fonts = {
  title: 'Fraunces_600SemiBold',
  body: 'Inter_400Regular',
  bodyBold: 'Inter_600SemiBold',
};

const light = {
  bg: '#F7F5F2',
  surface: '#FFFFFF',
  text: '#141414',
  muted: '#6B6660',
  border: '#E6E1DA',
};

const dark = {
  bg: '#0F0E0D',
  surface: '#1A1917',
  text: '#F2EFEA',
  muted: '#9A948C',
  border: '#2A2825',
};

export type Palette = typeof light & { accent: string; fonts: typeof fonts };

// Modo escuro "estúdio", usado durante o treino.
export const studioPalette: Palette = { ...dark, accent: trainer.brandColor, fonts };

const Override = createContext<Palette | null>(null);
export const PaletteOverride = Override.Provider;

export function useTheme(): Palette {
  const override = useContext(Override);
  const scheme = useColorScheme();
  return override ?? { ...(scheme === 'dark' ? dark : light), accent: trainer.brandColor, fonts };
}
