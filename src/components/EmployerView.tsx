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
          className="btn-green font-pixel w-full rounded px-3 py-4 text-xs uppercase lg:py-5 lg:text-sm"
        >
          <i className="fa-solid fa-briefcase mr-1.5" />
          Post Another Role
        </button>
        <p className="mt-1.5 text-xs text-corp-muted">
          {employer.openRoles} open — {employer.positionsFilled} filled. The math is not mathing.
        </p>
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
