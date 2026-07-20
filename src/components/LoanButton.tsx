import type { CSSProperties } from 'react';
import { DESPAIR_MAX } from '../game/constants';
import { formatLoanApr } from '../game/formulas';

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
  const despairRatio = Math.min(1, Math.max(0, despair / DESPAIR_MAX));
  const despairCritical = despairRatio >= 0.9;

  return (
    <div
      className="loan-button-wrap mt-2"
      style={{ '--loan-despair-ratio': despairRatio } as CSSProperties}
    >
      <button
        type="button"
        onClick={onTakeLoan}
        className={`loan-button font-pixel w-full rounded border ${despairCritical ? 'loan-button-critical' : ''}`}
      >
        {label}
      </button>
      <p className={`loan-button-caption mt-1 text-[10px] lg:text-xs ${despairCritical ? 'loan-button-critical-caption' : ''}`}>
        APR: {apr} · Loans taken: {loansTaken}
      </p>
    </div>
  );
}
