import type { GlitchTextOptions } from '../components/GlitchText';
import screenGlitchJson from './screenGlitch.json';

/**
 * Screen glitch settings (`screen` in `screenGlitch.json`).
 * See `screenGlitch.md` in this folder for a full description of each field.
 */
export interface ScreenGlitchConfig
{
  /** Master strength `0`–`1`. At `0`, glitch is off. Also feeds CSS `--glitch-intensity`. */
  intensity: number;
  /** Simulation update interval in ms. Lower = snappier waves and bursts. */
  tickIntervalMs: number;
  /** Scales wave cap, spawn chance, stutter, and burst rates via internal `chaos`. */
  chaosMultiplier: number;
  /** Per-tick chance to spawn a new sweep wave (`× chaos`, max 95%). */
  waveSpawnChance: number;
  /** Max concurrent sweep waves per text line (`× chaos`, min effective 1). */
  maxActiveWaves: number;
  /** Minimum characters corrupted side-by-side in one wave front. */
  waveWidthMin: number;
  /** Maximum characters corrupted side-by-side in one wave front. */
  waveWidthMax: number;
  /** Minimum wave movement in characters per tick. */
  waveSpeedMin: number;
  /** Maximum wave movement in characters per tick. */
  waveSpeedMax: number;
  /** Shortest time a wave object can exist before removal. */
  waveLifetimeMinMs: number;
  /** Longest time a wave object can exist before removal. */
  waveLifetimeMaxMs: number;
  /** Per-tick chance a wave skips advancing (`× chaos`). Higher = choppier sweeps. */
  waveStutterChance: number;
  /** Per-tick chance of a random non-wave corruption burst (`× chaos`). */
  sporadicBurstChance: number;
  /** Minimum consecutive characters in a sporadic burst. */
  sporadicBurstSizeMin: number;
  /** Maximum consecutive characters in a sporadic burst. */
  sporadicBurstSizeMax: number;
  /** Shortest time a corrupted character stays glitched. */
  corruptDurationMinMs: number;
  /** Longest time a corrupted character stays glitched. */
  corruptDurationMaxMs: number;
}

export const screenGlitchConfig = screenGlitchJson.screen as ScreenGlitchConfig;

export function getScreenGlitchOptions(): GlitchTextOptions
{
  return {
    tickIntervalMs: screenGlitchConfig.tickIntervalMs,
    chaosMultiplier: screenGlitchConfig.chaosMultiplier,
    waveSpawnChance: screenGlitchConfig.waveSpawnChance,
    maxActiveWaves: screenGlitchConfig.maxActiveWaves,
    waveWidthMin: screenGlitchConfig.waveWidthMin,
    waveWidthMax: screenGlitchConfig.waveWidthMax,
    waveSpeedMin: screenGlitchConfig.waveSpeedMin,
    waveSpeedMax: screenGlitchConfig.waveSpeedMax,
    waveLifetimeMinMs: screenGlitchConfig.waveLifetimeMinMs,
    waveLifetimeMaxMs: screenGlitchConfig.waveLifetimeMaxMs,
    waveStutterChance: screenGlitchConfig.waveStutterChance,
    sporadicBurstChance: screenGlitchConfig.sporadicBurstChance,
    sporadicBurstSizeMin: screenGlitchConfig.sporadicBurstSizeMin,
    sporadicBurstSizeMax: screenGlitchConfig.sporadicBurstSizeMax,
    corruptDurationMinMs: screenGlitchConfig.corruptDurationMinMs,
    corruptDurationMaxMs: screenGlitchConfig.corruptDurationMaxMs,
  };
}
