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
      className={`column-panel employer-dismal relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded border border-corp-border bg-corp-panel p-2 lg:p-3 ${
        dismayFlash ? 'employer-dismay-flash' : ''
      }`}
    >
      <div className="pointer-events-none absolute inset-0 rounded bg-blue-500/30" />
      <div className="employer-dismal-vignette pointer-events-none absolute inset-0" />
      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <div className="side-column-header shrink-0 text-center">
          <i className="fa-solid fa-building employer-lean mb-1 text-2xl text-corp-text lg:text-3xl" />
          <h2 className="font-pixel text-xs text-corp-green lg:text-sm">Companies</h2>
          <p className="employer-bleed-text text-sm text-corp-red lg:text-base">spending, waiting, failing</p>
        </div>
        <div className="side-column-stats mt-2 shrink-0">
          <EmployerStats />
        </div>
        <div className="side-column-actions mt-2 shrink-0 text-center">
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
        <div className="mt-2 flex min-h-0 flex-1 flex-col">
          <DirePanel side="employer" />
        </div>
      </div>
    </div>
  );
}
