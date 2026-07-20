import type { CSSProperties } from 'react';
import { getActionLabel } from '../game/actionLabels';
import type { Perspective } from '../game/types';
import { useDespairGlitchIntensity } from '../hooks/useDespairGlitchIntensity';
import { GlitchText } from './GlitchText';

interface DespairActionButtonProps
{
  side: Perspective;
  despair: number;
  buried?: boolean;
  onClick: () => void;
}

export function DespairActionButton({
  side,
  despair,
  buried = false,
  onClick,
}: DespairActionButtonProps)
{
  const label = getActionLabel(side, despair);
  const glitchIntensity = useDespairGlitchIntensity(despair);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={buried}
      aria-disabled={buried}
      className={`btn-green side-column-primary-btn font-pixel rounded ${
        buried ? 'side-column-primary-btn--buried' : ''
      }`}
    >
      <span
        className={glitchIntensity > 0 ? 'despair-glitch-text inline-flex justify-center' : 'inline-flex justify-center'}
        style={
          glitchIntensity > 0
            ? { '--glitch-intensity': glitchIntensity } as CSSProperties
            : undefined
        }
      >
        <GlitchText text={label} intensity={glitchIntensity} />
      </span>
    </button>
  );
}
