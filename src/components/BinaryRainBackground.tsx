import { useMemo } from 'react';

const COLUMN_COUNT = 28;
const CHARS_PER_COLUMN = 36;

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
        duration: 4.5 + (index % 6) + (index % 3) * 0.4,
        delay: -(index * 0.55) % 8,
        opacity: 0.45 + (index % 5) * 0.1,
      })),
    [],
  );

  return (
    <div className="binary-rain pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="binary-rain-vignette absolute inset-0" />
      <div className="binary-rain-grid absolute inset-0">
        {columns.map((column) => (
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
              <span>{column.text}</span>
              <span>{column.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
