import type { GlitchTextOptions } from '../components/GlitchText';
import screenGlitchJson from './screenGlitch.json';

export interface ScreenGlitchConfig
{
  intensity: number;
  tickIntervalMs: number;
  corruptBudgetMultiplier: number;
  minCorruptBudget: number;
}

export const screenGlitchConfig = screenGlitchJson.screen as ScreenGlitchConfig;

export function getScreenGlitchOptions(): GlitchTextOptions
{
  return {
    tickIntervalMs: screenGlitchConfig.tickIntervalMs,
    corruptBudgetMultiplier: screenGlitchConfig.corruptBudgetMultiplier,
    minCorruptBudget: screenGlitchConfig.minCorruptBudget,
  };
}
