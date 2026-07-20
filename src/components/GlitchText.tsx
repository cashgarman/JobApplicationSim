import { useEffect, useRef, useState, type CSSProperties } from 'react';

const CORRUPT_GLYPHS = '@#$%&*?01';

export interface GlitchTextOptions
{
  tickIntervalMs?: number;
  /** Scales wave frequency, bursts, and stutter. 1 = default chaos. */
  chaosMultiplier?: number;
  /** When set, corrupted glyphs use this string's character at the same index. */
  corruptText?: string;
  waveSpawnChance?: number;
  maxActiveWaves?: number;
  waveWidthMin?: number;
  waveWidthMax?: number;
  waveSpeedMin?: number;
  waveSpeedMax?: number;
  waveLifetimeMinMs?: number;
  waveLifetimeMaxMs?: number;
  waveStutterChance?: number;
  sporadicBurstChance?: number;
  sporadicBurstSizeMin?: number;
  sporadicBurstSizeMax?: number;
  corruptDurationMinMs?: number;
  corruptDurationMaxMs?: number;
  /** @deprecated Use wave/sporadic settings instead. */
  corruptBudgetMultiplier?: number;
  /** @deprecated Use wave/sporadic settings instead. */
  minCorruptBudget?: number;
}

interface GlitchTextProps
{
  text: string;
  intensity: number;
  options?: GlitchTextOptions;
  hovered?: boolean;
  /** Merged into options while hovered (e.g. faster ticks, higher chaos). */
  hoverOptions?: GlitchTextOptions;
  /** Divides tick interval while hovered. Ignored if hoverOptions.tickIntervalMs is set. */
  hoverSpeedMultiplier?: number;
}

interface CorruptChar
{
  glyph: string;
  until: number;
}

interface GlitchWave
{
  position: number;
  direction: 1 | -1;
  width: number;
  speed: number;
  aliveUntil: number;
}

interface ResolvedGlitchOptions
{
  tickIntervalMs: number;
  chaosMultiplier: number;
  waveSpawnChance: number;
  maxActiveWaves: number;
  waveWidthMin: number;
  waveWidthMax: number;
  waveSpeedMin: number;
  waveSpeedMax: number;
  waveLifetimeMinMs: number;
  waveLifetimeMaxMs: number;
  waveStutterChance: number;
  sporadicBurstChance: number;
  sporadicBurstSizeMin: number;
  sporadicBurstSizeMax: number;
  corruptDurationMinMs: number;
  corruptDurationMaxMs: number;
}

const DEFAULT_OPTIONS: ResolvedGlitchOptions = {
  tickIntervalMs: 90,
  chaosMultiplier: 1,
  waveSpawnChance: 0.18,
  maxActiveWaves: 2,
  waveWidthMin: 2,
  waveWidthMax: 4,
  waveSpeedMin: 2,
  waveSpeedMax: 4,
  waveLifetimeMinMs: 450,
  waveLifetimeMaxMs: 1400,
  waveStutterChance: 0.16,
  sporadicBurstChance: 0.08,
  sporadicBurstSizeMin: 1,
  sporadicBurstSizeMax: 2,
  corruptDurationMinMs: 40,
  corruptDurationMaxMs: 110,
};

function randomBetween(min: number, max: number): number
{
  return min + Math.random() * (max - min);
}

function randomInt(min: number, max: number): number
{
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pickCorruptGlyph(index: number, corruptText?: string): string
{
  if (corruptText && index >= 0 && index < corruptText.length)
  {
    return corruptText[index];
  }

  return CORRUPT_GLYPHS[Math.floor(Math.random() * CORRUPT_GLYPHS.length)];
}

function getCorruptDuration(
  now: number,
  minMs: number,
  maxMs: number,
  intensity: number,
): number
{
  return now + randomBetween(minMs, maxMs) * (1.15 - intensity * 0.35);
}

function corruptIndex(
  map: Map<number, CorruptChar>,
  index: number,
  sourceText: string,
  now: number,
  durationMinMs: number,
  durationMaxMs: number,
  intensity: number,
  corruptText?: string,
): void
{
  const char = sourceText[index];

  if (!char)
  {
    return;
  }

  const hasMappedCorrupt = Boolean(
    corruptText && index < corruptText.length && corruptText[index] !== undefined,
  );

  if (!hasMappedCorrupt && char === ' ')
  {
    return;
  }

  const existing = map.get(index);
  if (existing && existing.until > now)
  {
    return;
  }

  map.set(index, {
    glyph: pickCorruptGlyph(index, corruptText),
    until: getCorruptDuration(now, durationMinMs, durationMaxMs, intensity),
  });
}

function getWaveIndices(wave: GlitchWave, textLength: number): number[]
{
  const indices: number[] = [];

  for (let offset = 0; offset < wave.width; offset++)
  {
    const index = wave.direction > 0
      ? wave.position + offset
      : wave.position - offset;

    if (index >= 0 && index < textLength)
    {
      indices.push(index);
    }
  }

  return indices;
}

function createWave(textLength: number, now: number, options: ResolvedGlitchOptions): GlitchWave
{
  const direction: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
  const width = randomInt(options.waveWidthMin, options.waveWidthMax);
  const startPadding = width + randomInt(0, 2);

  return {
    position: direction > 0 ? -startPadding : textLength - 1 + startPadding,
    direction,
    width,
    speed: randomInt(options.waveSpeedMin, options.waveSpeedMax),
    aliveUntil: now + randomBetween(options.waveLifetimeMinMs, options.waveLifetimeMaxMs),
  };
}

function isWaveFinished(wave: GlitchWave, textLength: number): boolean
{
  if (wave.direction > 0)
  {
    return wave.position - wave.width > textLength;
  }

  return wave.position + wave.width < 0;
}

function resolveOptions(options?: GlitchTextOptions): ResolvedGlitchOptions
{
  return {
    tickIntervalMs: options?.tickIntervalMs ?? DEFAULT_OPTIONS.tickIntervalMs,
    chaosMultiplier: options?.chaosMultiplier ?? DEFAULT_OPTIONS.chaosMultiplier,
    waveSpawnChance: options?.waveSpawnChance ?? DEFAULT_OPTIONS.waveSpawnChance,
    maxActiveWaves: options?.maxActiveWaves ?? DEFAULT_OPTIONS.maxActiveWaves,
    waveWidthMin: options?.waveWidthMin ?? DEFAULT_OPTIONS.waveWidthMin,
    waveWidthMax: options?.waveWidthMax ?? DEFAULT_OPTIONS.waveWidthMax,
    waveSpeedMin: options?.waveSpeedMin ?? DEFAULT_OPTIONS.waveSpeedMin,
    waveSpeedMax: options?.waveSpeedMax ?? DEFAULT_OPTIONS.waveSpeedMax,
    waveLifetimeMinMs: options?.waveLifetimeMinMs ?? DEFAULT_OPTIONS.waveLifetimeMinMs,
    waveLifetimeMaxMs: options?.waveLifetimeMaxMs ?? DEFAULT_OPTIONS.waveLifetimeMaxMs,
    waveStutterChance: options?.waveStutterChance ?? DEFAULT_OPTIONS.waveStutterChance,
    sporadicBurstChance: options?.sporadicBurstChance ?? DEFAULT_OPTIONS.sporadicBurstChance,
    sporadicBurstSizeMin: options?.sporadicBurstSizeMin ?? DEFAULT_OPTIONS.sporadicBurstSizeMin,
    sporadicBurstSizeMax: options?.sporadicBurstSizeMax ?? DEFAULT_OPTIONS.sporadicBurstSizeMax,
    corruptDurationMinMs: options?.corruptDurationMinMs ?? DEFAULT_OPTIONS.corruptDurationMinMs,
    corruptDurationMaxMs: options?.corruptDurationMaxMs ?? DEFAULT_OPTIONS.corruptDurationMaxMs,
  };
}

function mergeGlitchOptions(
  base: GlitchTextOptions | undefined,
  hover: GlitchTextOptions | undefined,
  isHovered: boolean,
  speedMultiplier: number,
): { resolved: ResolvedGlitchOptions; corruptText?: string }
{
  const merged: GlitchTextOptions = isHovered
    ? { ...base, ...hover }
    : { ...base };

  const resolved = resolveOptions(merged);

  if (isHovered && speedMultiplier > 1 && hover?.tickIntervalMs === undefined)
  {
    resolved.tickIntervalMs = Math.max(
      24,
      Math.round(resolved.tickIntervalMs / speedMultiplier),
    );
  }

  return {
    resolved,
    corruptText: isHovered ? hover?.corruptText ?? base?.corruptText : undefined,
  };
}

export function GlitchText({
  text,
  intensity,
  options,
  hovered = false,
  hoverOptions,
  hoverSpeedMultiplier = 2.5,
}: GlitchTextProps)
{
  const [corruptMap, setCorruptMap] = useState<Map<number, CorruptChar>>(new Map());
  const wavesRef = useRef<GlitchWave[]>([]);

  useEffect(() =>
  {
    if (intensity <= 0)
    {
      wavesRef.current = [];
      setCorruptMap(new Map());
      return;
    }

    const { resolved, corruptText } = mergeGlitchOptions(
      options,
      hoverOptions,
      hovered,
      hoverSpeedMultiplier,
    );
    const tickIntervalMs = resolved.tickIntervalMs > 0
      ? resolved.tickIntervalMs
      : Math.max(45, 160 - intensity * 110);

    const tick = () =>
    {
      const now = Date.now();
      const chaos = resolved.chaosMultiplier * (0.45 + intensity * 0.9);

      setCorruptMap((previous) =>
      {
        const next = new Map<number, CorruptChar>();

        for (const [index, value] of previous)
        {
          if (value.until > now)
          {
            next.set(index, value);
          }
        }

        wavesRef.current = wavesRef.current.filter((wave) => wave.aliveUntil > now);

        const maxWaves = Math.max(1, Math.round(resolved.maxActiveWaves * chaos));
        const spawnChance = Math.min(0.95, resolved.waveSpawnChance * chaos);

        if (wavesRef.current.length < maxWaves && Math.random() < spawnChance)
        {
          wavesRef.current.push(createWave(text.length, now, resolved));
        }

        for (const wave of wavesRef.current)
        {
          if (Math.random() >= resolved.waveStutterChance * chaos)
          {
            wave.position += wave.direction * wave.speed;
          }

          for (const index of getWaveIndices(wave, text.length))
          {
            corruptIndex(
              next,
              index,
              text,
              now,
              resolved.corruptDurationMinMs,
              resolved.corruptDurationMaxMs,
              intensity,
              corruptText,
            );
          }
        }

        wavesRef.current = wavesRef.current.filter((wave) => !isWaveFinished(wave, text.length));

        if (Math.random() < resolved.sporadicBurstChance * chaos)
        {
          const burstSize = randomInt(
            resolved.sporadicBurstSizeMin,
            resolved.sporadicBurstSizeMax,
          );
          const anchor = randomInt(0, Math.max(0, text.length - 1));

          for (let offset = 0; offset < burstSize; offset++)
          {
            const index = anchor + offset;
            corruptIndex(
              next,
              index,
              text,
              now,
              resolved.corruptDurationMinMs * 0.75,
              resolved.corruptDurationMaxMs * 1.15,
              intensity,
              corruptText,
            );
          }
        }

        return next;
      });
    };

    wavesRef.current = [];
    tick();
    const interval = setInterval(tick, tickIntervalMs);

    return () =>
    {
      clearInterval(interval);
      wavesRef.current = [];
    };
  }, [hoverOptions, hovered, hoverSpeedMultiplier, intensity, options, text]);

  if (intensity <= 0)
  {
    return <>{text}</>;
  }

  return (
    <>
      {text.split('').map((char, index) =>
      {
        const corrupt = corruptMap.get(index);
        const display = corrupt ? corrupt.glyph : char;

        return (
          <span
            key={index}
            className={`despair-glitch-char${corrupt ? ' despair-glitch-char-corrupt' : ''}`}
            style={{
              '--char-index': index,
              animationDelay: `${(index % 13) * 0.045}s`,
              animationDuration: `${2.6 + (index % 9) * 0.18 - intensity * 1.8}s`,
            } as CSSProperties}
          >
            {corrupt ? display : (char === ' ' ? '\u00A0' : display)}
          </span>
        );
      })}
    </>
  );
}
