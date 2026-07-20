import { useEffect, useMemo, useState } from 'react';

const COLUMN_COUNT = 32;
const CHARS_PER_COLUMN = 42;

interface RainColumn
{
  id: number;
  chars: string[];
  duration: number;
  delay: number;
  opacity: number;
}

function buildColumn(seed: number): string[]
{
  return Array.from({ length: CHARS_PER_COLUMN }, (_, index) =>
    ((seed * 17 + index * 31) % 10) > 4 ? '1' : '0',
  );
}

function cycleColumn(chars: string[]): string[]
{
  const next = [...chars];
  const flips = 2 + Math.floor(Math.random() * 4);

  for (let flip = 0; flip < flips; flip++)
  {
    const index = Math.floor(Math.random() * next.length);
    next[index] = next[index] === '0' ? '1' : '0';
  }

  if (Math.random() < 0.35)
  {
    const headIndex = Math.floor(Math.random() * Math.min(6, next.length));
    next[headIndex] = Math.random() > 0.5 ? '1' : '0';
  }

  return next;
}

function charsToText(chars: string[]): string
{
  return chars.join('\n');
}

export function BinaryRainBackground()
{
  const initialColumns = useMemo(
    () =>
      Array.from({ length: COLUMN_COUNT }, (_, index) => ({
        id: index,
        chars: buildColumn(index + 1),
        duration: 3.5 + (index % 6) + (index % 3) * 0.35,
        delay: -(index * 0.5) % 7,
        opacity: 0.55 + (index % 5) * 0.09,
      })),
    [],
  );

  const [columns, setColumns] = useState<RainColumn[]>(initialColumns);

  useEffect(() =>
  {
    const interval = setInterval(() =>
    {
      setColumns((current) =>
        current.map((column) => ({
          ...column,
          chars: cycleColumn(column.chars),
        })),
      );
    }, 110);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="binary-rain pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="binary-rain-vignette absolute inset-0" />
      <div className="binary-rain-grid absolute inset-0">
        {columns.map((column) =>
        {
          const text = charsToText(column.chars);
          return (
            <div
              key={column.id}
              className="binary-rain-column"
              style={{
                opacity: column.opacity,
                animationDuration: `${column.duration}s`,
                animationDelay: `${column.delay}s`,
              }}
            >
              <div className="binary-rain-stream">
                <span>{text}</span>
                <span>{text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
