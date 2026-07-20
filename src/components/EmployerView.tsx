import { EMPLOYER_LOAN_LOW_FUNDS } from '../game/constants';
import { useGameStore } from '../store/gameStore';
import { DirePanel } from './DirePanel';
import { LoanButton } from './LoanButton';

export function EmployerView()
{
  const state = useGameStore((s) => s.state);
  const clickPostRole = useGameStore((s) => s.clickPostRole);
  const takeEmployerLoan = useGameStore((s) => s.takeEmployerLoan);

  const { employer } = state;
  const desperate = employer.revenue < EMPLOYER_LOAN_LOW_FUNDS;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 text-center">
        <button
          type="button"
          onClick={clickPostRole}
          className="btn-green font-pixel w-full rounded px-2 py-4 text-[11px] leading-tight uppercase sm:text-[12px] lg:py-5 lg:text-[13px]"
        >
          Post Another Role
        </button>
        <LoanButton
          side="employer"
          loansTaken={employer.loansTaken}
          desperate={desperate}
          onTakeLoan={takeEmployerLoan}
        />
      </div>

      <DirePanel side="employer" />
    </div>
  );
}
