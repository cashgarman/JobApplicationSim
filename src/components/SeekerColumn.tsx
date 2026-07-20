import { DirePanel } from './DirePanel';
import { DespairActionButton } from './DespairActionButton';
import { LoanButton } from './LoanButton';
import { SeekerStats } from './SeekerStats';
import { getLoanOverlapProgress } from '../game/actionLabels';
import { useDismalFlash } from '../hooks/useDismalFlash';
import { useGameStore } from '../store/gameStore';

export function SeekerColumn()
{
  const dismayFlash = useDismalFlash('seeker');
  const state = useGameStore((s) => s.state);
  const clickApply = useGameStore((s) => s.clickApply);
  const takeSeekerLoan = useGameStore((s) => s.takeSeekerLoan);
  const { seeker } = state;
  const broke = seeker.savings <= 0;
  const buried = getLoanOverlapProgress(state.seekerDespair) >= 0.95;

  return (
    <div
      className={`column-panel seeker-dismal relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded border border-corp-border bg-corp-panel p-2 lg:p-3 ${
        dismayFlash ? 'seeker-dismay-flash' : ''
      }`}
    >
      <div className="pointer-events-none absolute inset-0 rounded bg-green-500/30" />
      <div className="seeker-dismal-vignette pointer-events-none absolute inset-0" />
      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <div className="side-column-header shrink-0 text-center">
          <i className="fa-solid fa-user-tie seeker-droop mb-1 text-2xl text-corp-text lg:text-3xl" />
          <h2 className="font-pixel text-xs text-corp-green lg:text-sm">Job Seakers</h2>
          <p className="seeker-sigh text-sm text-corp-red lg:text-base">qualified, rejected, billed</p>
        </div>
        <div className="side-column-stats mt-2 shrink-0">
          <SeekerStats />
        </div>
        <div className="side-column-actions mt-2 shrink-0 text-center">
          <DespairActionButton
            side="seeker"
            despair={state.seekerDespair}
            buried={buried}
            onClick={clickApply}
          />
          {broke && (
            <p className="mt-1.5 text-xs text-corp-red">
              Savings depleted. The grind does not pause for bankruptcy.
            </p>
          )}
          <LoanButton
            side="seeker"
            loansTaken={seeker.loansTaken}
            despair={state.seekerDespair}
            onTakeLoan={takeSeekerLoan}
          />
        </div>
        <div className="mt-2 flex min-h-0 flex-1 flex-col">
          <DirePanel side="seeker" />
        </div>
      </div>
    </div>
  );
}
