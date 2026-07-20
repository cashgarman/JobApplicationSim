import { useEffect, useState, type CSSProperties } from 'react';

const CORRUPT_GLYPHS = '█▓@#$%&*?01';

interface GlitchTextProps
{
  text: string;
  intensity: number;
}

interface CorruptChar
{
  glyph: string;
  until: number;
}

export function GlitchText({ text, intensity }: GlitchTextProps)
{
  const [corruptMap, setCorruptMap] = useState<Map<number, CorruptChar>>(new Map());

  useEffect(() =>
  {
    if (intensity <= 0)
    {
      setCorruptMap(new Map());
      return;
    }

    const tick = () =>
    {
      const now = Date.now();
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

        const corruptBudget = Math.max(1, Math.ceil(intensity * text.length * 0.12));

        for (let attempt = 0; attempt < corruptBudget; attempt++)
        {
          const index = Math.floor(Math.random() * text.length);
          const char = text[index];

          if (!char || char === ' ' || next.has(index))
          {
            continue;
          }

          next.set(index, {
            glyph: CORRUPT_GLYPHS[Math.floor(Math.random() * CORRUPT_GLYPHS.length)],
            until: now + 70 + Math.random() * 180 * (1.1 - intensity * 0.45),
          });
        }

        return next;
      });
    };

    tick();
    const intervalMs = Math.max(45, 160 - intensity * 110);
    const interval = setInterval(tick, intervalMs);

    return () => clearInterval(interval);
  }, [intensity, text]);

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
        const isSpace = char === ' ';

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
            {isSpace ? '\u00A0' : display}
          </span>
        );
      })}
    </>
  );
}
