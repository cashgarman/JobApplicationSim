import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { economyConfig } from '../config/economy';

interface BinaryRainBackgroundProps
{
  fullScreen?: boolean;
  /** Overrides `economy.binaryRainSpeed` when set. 1 = original speed, lower = slower. */
  speed?: number;
  /** Overrides `economy.binaryRainCharColor` when set. */
  charColor?: string;
  /** Overrides `economy.binaryRainGlowPeakColor` when set. */
  glowPeakColor?: string;
}

const PANEL_COLUMN_COUNT = 32;
const FULL_SCREEN_COLUMN_COUNT = 56;
const MIN_CHARS_PER_COLUMN = 42;
const CHAR_COLUMN_BUFFER = 4;
const BASE_CYCLE_INTERVAL_MS = 110;

function getCharHeightPx(container: HTMLElement): number
{
  const styles = getComputedStyle(container);
  const fontSize = Number.parseFloat(styles.fontSize) || 13;
  const lineHeight = Number.parseFloat(styles.lineHeight);

  if (Number.isFinite(lineHeight))
  {
    return lineHeight;
  }

  return fontSize * 1.05;
}

function getCharsPerColumn(containerHeight: number, charHeight: number): number
{
  return Math.max(
    MIN_CHARS_PER_COLUMN,
    Math.ceil(containerHeight / charHeight) + CHAR_COLUMN_BUFFER,
  );
}

interface RainColumn
{
  id: number;
  chars: string[];
  glowVersions: number[];
  duration: number;
  delay: number;
  opacity: number;
}

function buildColumn(seed: number, length: number): string[]
{
  return Array.from({ length }, (_, index) =>
    ((seed * 17 + index * 31) % 10) > 4 ? '1' : '0',
  );
}

function createGlowVersions(length: number): number[]
{
  return Array.from({ length }, () => 0);
}

function cycleColumn(chars: string[], glowVersions: number[]): Pick<RainColumn, 'chars' | 'glowVersions'>
{
  const next = [...chars];
  const nextGlow = [...glowVersions];
  const flips = 2 + Math.floor(Math.random() * 4);

  for (let flip = 0; flip < flips; flip++)
  {
    const index = Math.floor(Math.random() * next.length);
    next[index] = next[index] === '0' ? '1' : '0';
    nextGlow[index] += 1;
  }

  if (Math.random() < 0.35)
  {
    const headIndex = Math.floor(Math.random() * Math.min(6, next.length));
    next[headIndex] = Math.random() > 0.5 ? '1' : '0';
    nextGlow[headIndex] += 1;
  }

  return { chars: next, glowVersions: nextGlow };
}

function getFallDuration(columnIndex: number, speed: number): number
{
  const baseDuration = 3.5 + (columnIndex % 6) + (columnIndex % 3) * 0.35;
  return baseDuration / speed;
}

function renderCharColumn(
  chars: string[],
  glowVersions: number[],
  copyId: string,
)
{
  return (
    <div className="binary-rain-char-column">
      {chars.map((char, index) => (
        <span
          key={`${copyId}-${index}-${glowVersions[index]}`}
          className={`binary-rain-char${glowVersions[index] === 0 ? ' binary-rain-char--idle' : ''}`}
        >
          {char}
        </span>
      ))}
    </div>
  );
}

export function BinaryRainBackground({ fullScreen = false, speed, charColor, glowPeakColor }: BinaryRainBackgroundProps)
{
  const columnCount = fullScreen ? FULL_SCREEN_COLUMN_COUNT : PANEL_COLUMN_COUNT;
  const rainSpeed = speed ?? economyConfig.binaryRainSpeed;
  const glowDurationSec = economyConfig.binaryRainGlowDurationSec;
  const rainCharColor = charColor ?? economyConfig.binaryRainCharColor;
  const rainGlowPeakColor = glowPeakColor ?? economyConfig.binaryRainGlowPeakColor;
  const cycleIntervalMs = BASE_CYCLE_INTERVAL_MS / rainSpeed;
  const gridRef = useRef<HTMLDivElement>(null);
  const [charsPerColumn, setCharsPerColumn] = useState(MIN_CHARS_PER_COLUMN);

  useEffect(() =>
  {
    const grid = gridRef.current;
    if (!grid)
    {
      return;
    }

    const measure = () =>
    {
      const sampleColumn = grid.querySelector<HTMLElement>('.binary-rain-column');
      const columnHeight = sampleColumn?.clientHeight ?? grid.clientHeight;
      const charHeight = sampleColumn
        ? getCharHeightPx(sampleColumn)
        : getCharHeightPx(grid);

      setCharsPerColumn(getCharsPerColumn(columnHeight, charHeight));
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(grid);

    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    mediaQuery.addEventListener('change', measure);

    return () =>
    {
      resizeObserver.disconnect();
      mediaQuery.removeEventListener('change', measure);
    };
  }, [columnCount]);

  const initialColumns = useMemo(
    () =>
      Array.from({ length: columnCount }, (_, index) => ({
        id: index,
        chars: buildColumn(index + 1, charsPerColumn),
        glowVersions: createGlowVersions(charsPerColumn),
        duration: getFallDuration(index, rainSpeed),
        delay: -(index * 0.5) / rainSpeed % 7,
        opacity: 0.55 + (index % 5) * 0.09,
      })),
    [columnCount, rainSpeed, charsPerColumn],
  );

  const [columns, setColumns] = useState<RainColumn[]>(initialColumns);

  useEffect(() =>
  {
    setColumns(initialColumns);
  }, [initialColumns]);

  useEffect(() =>
  {
    const interval = setInterval(() =>
    {
      setColumns((current) =>
        current.map((column) =>
        {
          const cycled = cycleColumn(column.chars, column.glowVersions);
          return {
            ...column,
            ...cycled,
          };
        }),
      );
    }, cycleIntervalMs);

    return () => clearInterval(interval);
  }, [cycleIntervalMs]);

  return (
    <div
      className={`binary-rain pointer-events-none absolute inset-0 overflow-hidden ${fullScreen ? 'binary-rain--fullscreen' : ''}`}
      style={{
        '--binary-rain-glow-duration': `${glowDurationSec}s`,
        '--binary-rain-char-color': rainCharColor,
        '--binary-rain-glow-peak-color': rainGlowPeakColor,
      } as CSSProperties}
      aria-hidden
    >
      <div className="binary-rain-vignette absolute inset-0" />
      <div
        ref={gridRef}
        className="binary-rain-grid absolute inset-0"
        style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
      >
        {columns.map((column) =>
        {
          return (
            <div
              key={column.id}
              className="binary-rain-column"
              style={{ opacity: column.opacity }}
            >
              <div
                className="binary-rain-stream"
                style={{
                  animationDuration: `${column.duration}s`,
                  animationDelay: `${column.delay}s`,
                }}
              >
                {renderCharColumn(column.chars, column.glowVersions, `${column.id}-a`)}
                {renderCharColumn(column.chars, column.glowVersions, `${column.id}-b`)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
