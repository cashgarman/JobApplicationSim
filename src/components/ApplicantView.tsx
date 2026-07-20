import { SEEKER_LOAN_LOW_FUNDS } from '../game/constants';
import { useGameStore } from '../store/gameStore';
import { DirePanel } from './DirePanel';
import { LoanButton } from './LoanButton';

export function ApplicantView()
{
  const state = useGameStore((s) => s.state);
  const clickApply = useGameStore((s) => s.clickApply);
  const takeSeekerLoan = useGameStore((s) => s.takeSeekerLoan);

  const { seeker } = state;
  const broke = seeker.savings <= 0;
  const desperate = seeker.savings < SEEKER_LOAN_LOW_FUNDS;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 text-center">
        <button
          type="button"
          onClick={clickApply}
          className="btn-green font-pixel w-full rounded px-2 py-4 text-[11px] leading-tight uppercase sm:text-[12px] lg:py-5 lg:text-[13px]"
        >
          Apply Into the Void
        </button>
        {broke && (
          <p className="mt-1.5 text-xs text-corp-red">
            Savings depleted. The grind does not pause for bankruptcy.
          </p>
        )}
        <LoanButton
          side="seeker"
          loansTaken={seeker.loansTaken}
          desperate={desperate}
          onTakeLoan={takeSeekerLoan}
        />
      </div>

      <DirePanel side="seeker" />
    </div>
  );
}
