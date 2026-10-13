/**
 * lang.d.ts — type declarations for lang.jsx
 */
import type { ReactNode } from 'react';

export type Lang = 'en' | 'ta';

export interface LangContextValue {
  lang: Lang;
  toggle: () => void;
  t: (key: string) => string;
}

export function useLang(): LangContextValue;
export function LangProvider(props: { children: ReactNode }): ReactNode;
