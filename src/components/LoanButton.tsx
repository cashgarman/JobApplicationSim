import { formatLoanApr } from '../game/formulas';

interface LoanButtonProps
{
  side: 'seeker' | 'employer';
  loansTaken: number;
  desperate: boolean;
  onTakeLoan: () => void;
}

export function LoanButton({ side, loansTaken, desperate, onTakeLoan }: LoanButtonProps)
{
  const apr = formatLoanApr(loansTaken);
  const label = side === 'seeker' ? 'Take Bank Loan' : 'Take Corporate Loan';

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={onTakeLoan}
        className={`font-pixel w-full rounded border px-3 py-2.5 text-[10px] uppercase lg:text-xs ${
          desperate
            ? 'animate-pulse border-corp-red bg-corp-red/20 text-corp-red hover:bg-corp-red/30'
            : 'border-corp-amber/60 bg-corp-panel text-corp-amber hover:border-corp-amber'
        }`}
      >
        <i className="fa-solid fa-landmark mr-1.5" />
        {label}
      </button>
      <p className="mt-1 text-[10px] text-corp-muted lg:text-xs">
        APR: {apr} · Loans taken: {loansTaken}
      </p>
    </div>
  );
}
