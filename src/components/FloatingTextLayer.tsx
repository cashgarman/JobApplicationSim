import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { useAnimationStore } from '../store/animationStore';
import type { FloatTextColumn, FloatTextTone } from '../game/types';

const TONE_CLASSES: Record<FloatTextTone, string> = {
  bad: 'text-corp-red',
  hope: 'text-corp-amber',
  good: 'text-corp-green',
};

const COLUMN_TONE_CLASSES: Record<FloatTextColumn, Record<FloatTextTone, string>> = {
  seeker: TONE_CLASSES,
  employer: TONE_CLASSES,
  ai: {
    bad: 'float-text-ai text-corp-amber',
    hope: 'float-text-ai text-yellow-300',
    good: 'float-text-ai text-lime-300',
  },
};

function getToneClass(column: FloatTextColumn, tone: FloatTextTone): string
{
  return COLUMN_TONE_CLASSES[column][tone];
}

interface FloatingTextLayerProps
{
  column: FloatTextColumn;
}

function getFloatTextStyle(text: {
  offsetX: number;
  startBottom: number;
  duration: number;
  delay: number;
  driftX: number;
  riseY: number;
  scale: number;
}): CSSProperties
{
  return {
    left: `calc(50% + ${text.offsetX}px)`,
    bottom: `${text.startBottom}%`,
    '--dur': `${text.duration}s`,
    '--delay': `${text.delay}s`,
    '--drift': `${text.driftX}px`,
    '--rise': `${text.riseY}px`,
    '--scale': `${text.scale}`,
  } as CSSProperties;
}

export function FloatingTextLayer({ column }: FloatingTextLayerProps)
{
  const allFloatTexts = useAnimationStore((s) => s.floatTexts);
  const floatTexts = useMemo(
    () => allFloatTexts.filter((item) => item.column === column),
    [allFloatTexts, column],
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      {floatTexts.map((text) => (
        <span
          key={text.id}
          className={`float-text absolute text-xs font-bold uppercase tracking-wide ${getToneClass(column, text.tone)}`}
          style={getFloatTextStyle(text)}
        >
          {text.text}
        </span>
      ))}
    </div>
  );
}
