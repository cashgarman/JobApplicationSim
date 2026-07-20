import { DirePanel } from './DirePanel';
import { DespairActionButton } from './DespairActionButton';
import { EmployerStats } from './EmployerStats';
import { LoanButton } from './LoanButton';
import { getLoanOverlapProgress } from '../game/actionLabels';
import { useDismalFlash } from '../hooks/useDismalFlash';
import { useGameStore } from '../store/gameStore';

export function EmployerColumn()
{
  const dismayFlash = useDismalFlash('employer');
  const state = useGameStore((s) => s.state);
  const clickPostRole = useGameStore((s) => s.clickPostRole);
  const takeEmployerLoan = useGameStore((s) => s.takeEmployerLoan);
  const { employer } = state;
  const buried = getLoanOverlapProgress(state.employerDespair) >= 0.95;

  return (
    <div
      className={`column-panel column-panel--employer employer-dismal relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded border border-corp-blue/30 p-2 lg:p-2.5 ${
        dismayFlash ? 'employer-dismay-flash' : ''
      }`}
    >
      <div className="employer-dismal-vignette pointer-events-none absolute inset-0" />
      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <div className="column-header side-column-header shrink-0">
          <div className="column-header__icon">
            <i className="fa-solid fa-building employer-lean text-xl text-corp-text lg:text-2xl" />
          </div>
          <div className="column-header__text">
            <h2 className="column-header__title font-pixel text-corp-green">Companies</h2>
            <p className="employer-bleed-text text-xs leading-tight text-corp-red lg:text-sm">spending, waiting, failing</p>
          </div>
        </div>
        <div className="side-column-stats mt-1.5 shrink-0">
          <EmployerStats />
        </div>
        <div className="side-column-actions mt-1.5 shrink-0 text-center">
          <DespairActionButton
            side="employer"
            despair={state.employerDespair}
            buried={buried}
            onClick={clickPostRole}
          />
          <LoanButton
            side="employer"
            loansTaken={employer.loansTaken}
            despair={state.employerDespair}
            onTakeLoan={takeEmployerLoan}
          />
        </div>
        <div className="mt-1.5 flex min-h-0 flex-1 flex-col">
          <DirePanel side="employer" />
        </div>
      </div>
    </div>
  );
}
