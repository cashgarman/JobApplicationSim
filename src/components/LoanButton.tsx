import type { CSSProperties } from 'react';
import { getLoanBlockOpacity, getLoanOverlapProgress } from '../game/actionLabels';
import { DESPAIR_MAX } from '../game/constants';
import { formatLoanApr } from '../game/formulas';
import { useDespairGlitchIntensity } from '../hooks/useDespairGlitchIntensity';
import { GlitchText } from './GlitchText';

interface LoanButtonProps
{
  side: 'seeker' | 'employer';
  loansTaken: number;
  despair: number;
  onTakeLoan: () => void;
}

export function LoanButton({ side, loansTaken, despair, onTakeLoan }: LoanButtonProps)
{
  const apr = formatLoanApr(loansTaken);
  const label = side === 'seeker' ? 'Take Bank Loan' : 'Take Corporate Loan';
  const caption = `APR: ${apr} · Loans taken: ${loansTaken}`;
  const despairRatio = Math.min(1, Math.max(0, despair / DESPAIR_MAX));
  const overlapProgress = getLoanOverlapProgress(despair);
  const blockOpacity = getLoanBlockOpacity(despair);
  const despairCritical = despairRatio >= 0.9;
  const glitchIntensity = useDespairGlitchIntensity(despair);

  return (
    <div
      className="loan-button-wrap mt-2"
      style={{
        '--loan-despair-ratio': despairRatio,
        '--loan-overlap-progress': overlapProgress,
        '--loan-block-opacity': blockOpacity,
      } as CSSProperties}
    >
      <button
        type="button"
        onClick={onTakeLoan}
        className={`loan-button font-pixel w-full rounded border ${despairCritical ? 'loan-button-critical' : ''}`}
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
      <p className={`loan-button-caption mt-1 text-[10px] lg:text-xs ${despairCritical ? 'loan-button-critical-caption' : ''}`}>
        <span
          className={glitchIntensity > 0 ? 'despair-glitch-text inline-flex justify-center' : 'inline-flex justify-center'}
          style={
            glitchIntensity > 0
              ? { '--glitch-intensity': glitchIntensity * 0.85 } as CSSProperties
              : undefined
          }
        >
          <GlitchText text={caption} intensity={glitchIntensity * 0.85} />
        </span>
      </p>
    </div>
  );
}
