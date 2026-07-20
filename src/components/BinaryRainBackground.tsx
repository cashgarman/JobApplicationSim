import { useMemo } from 'react';

const COLUMN_COUNT = 16;
const CHARS_PER_COLUMN = 28;

function buildColumn(seed: number): string
{
  let value = '';
  for (let i = 0; i < CHARS_PER_COLUMN; i++)
  {
    const bit = ((seed * 17 + i * 31) % 10) > 4 ? '1' : '0';
    value += `${bit}\n`;
  }
  return value.trimEnd();
}

export function BinaryRainBackground()
{
  const columns = useMemo(
    () =>
      Array.from({ length: COLUMN_COUNT }, (_, index) => ({
        id: index,
        text: buildColumn(index + 1),
        left: `${(index / COLUMN_COUNT) * 100}%`,
        duration: 5 + (index % 6) + (index % 3) * 0.5,
        delay: -(index * 0.65) % 9,
        opacity: 0.35 + (index % 5) * 0.08,
      })),
    [],
  );

  return (
    <div className="binary-rain pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="binary-rain-vignette absolute inset-0" />
      {columns.map((column) => (
        <div
          key={column.id}
          className="binary-rain-column"
          style={{
            left: column.left,
            opacity: column.opacity,
            animationDuration: `${column.duration}s`,
            animationDelay: `${column.delay}s`,
          }}
        >
          <div className="binary-rain-stream">
            <span>{column.text}</span>
            <span>{column.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
