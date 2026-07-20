import { useMemo, type CSSProperties } from 'react';

const COLUMN_COUNT = 8;
const CHARS_PER_COLUMN = 18;
const GLYPHS = '01█▓@#$%&*?';

function buildCorruptColumn(seed: number): string
{
  let value = '';
  for (let i = 0; i < CHARS_PER_COLUMN; i++)
  {
    value += GLYPHS[(seed * 13 + i * 7) % GLYPHS.length];
    if (i < CHARS_PER_COLUMN - 1)
    {
      value += '\n';
    }
  }
  return value;
}

interface DespairGlitchOverlayProps
{
  side: 'seeker' | 'employer';
  intensity: number;
}

export function DespairGlitchOverlay({ side, intensity }: DespairGlitchOverlayProps)
{
  const columns = useMemo(
    () =>
      Array.from({ length: COLUMN_COUNT }, (_, index) => ({
        id: index,
        text: buildCorruptColumn(index + (side === 'seeker' ? 1 : 50)),
        left: `${(index / COLUMN_COUNT) * 100}%`,
        duration: 4 + (index % 4) + (index % 3) * 0.4,
        delay: -(index * 0.55) % 6,
      })),
    [side],
  );

  if (intensity <= 0)
  {
    return null;
  }

  const sideClass = side === 'seeker' ? 'despair-glitch-seeker' : 'despair-glitch-employer';

  return (
    <div
      className={`despair-glitch-overlay pointer-events-none absolute inset-0 z-[5] overflow-hidden ${sideClass}`}
      style={{ '--glitch-intensity': intensity } as CSSProperties}
      aria-hidden
    >
      <div className="despair-glitch-scanlines absolute inset-0" />
      <div className="despair-glitch-static absolute inset-0" />
      <div className="despair-glitch-chars absolute inset-0">
        {columns.map((column) => (
          <div
            key={column.id}
            className="despair-glitch-char-column"
            style={{
              left: column.left,
              animationDuration: `${column.duration}s`,
              animationDelay: `${column.delay}s`,
            }}
          >
            <div className="despair-glitch-char-stream">
              <span>{column.text}</span>
              <span>{column.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
