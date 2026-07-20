import { useMemo } from 'react';
import { useAnimationStore } from '../store/animationStore';
import type { FloatTextColumn } from '../game/types';

const TONE_CLASSES = {
  bad: 'text-corp-red',
  hope: 'text-corp-amber',
  good: 'text-corp-green',
};

interface FloatingTextLayerProps
{
  column: FloatTextColumn;
}

export function FloatingTextLayer({ column }: FloatingTextLayerProps)
{
  const allFloatTexts = useAnimationStore((s) => s.floatTexts);
  const floatTexts = useMemo(
    () => allFloatTexts.filter((text) => text.column === column),
    [allFloatTexts, column],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {floatTexts.map((text, index) => (
        <span
          key={text.id}
          className={`float-text absolute left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-wide ${TONE_CLASSES[text.tone]}`}
          style={{
            bottom: `${20 + (index % 4) * 12}%`,
            animationDelay: `${index * 0.05}s`,
          }}
        >
          {text.text}
        </span>
      ))}
    </div>
  );
}
