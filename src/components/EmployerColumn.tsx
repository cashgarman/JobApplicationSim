import type { CSSProperties } from 'react';
import { EmployerView } from './EmployerView';
import { DespairGlitchOverlay } from './DespairGlitchOverlay';
import { EmployerStats } from './EmployerStats';
import { FloatingTextLayer } from './FloatingTextLayer';
import { useDismalFlash } from '../hooks/useDismalFlash';
import { useDespairGlitchIntensity } from '../hooks/useDespairGlitchIntensity';
import { useGameStore } from '../store/gameStore';

export function EmployerColumn()
{
  const dismayFlash = useDismalFlash('employer');
  const employerDespair = useGameStore((s) => s.state.employerDespair);
  const glitchIntensity = useDespairGlitchIntensity(employerDespair);

  return (
    <div
      className={`column-panel employer-dismal relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded border border-corp-border bg-corp-panel p-2 lg:p-3 ${
        dismayFlash ? 'employer-dismay-flash' : ''
      }`}
    >
      <div className="pointer-events-none absolute inset-0 rounded bg-blue-500/30" />
      <div className="employer-dismal-vignette pointer-events-none absolute inset-0" />
      <DespairGlitchOverlay side="employer" intensity={glitchIntensity} />
      <div
        className={`relative z-10 flex h-full min-h-0 flex-col ${glitchIntensity > 0 ? 'despair-glitch-content' : ''}`}
        style={glitchIntensity > 0 ? { '--glitch-intensity': glitchIntensity } as CSSProperties : undefined}
      >
        <div className="shrink-0 text-center">
          <i className="fa-solid fa-building employer-lean mb-1 text-2xl text-corp-text lg:text-3xl" />
          <h2 className="font-pixel text-xs text-corp-green lg:text-sm">Hiring Manager</h2>
          <p className="employer-bleed-text text-sm text-corp-red lg:text-base">spending, waiting, failing</p>
        </div>
        <div className="mt-2 shrink-0">
          <EmployerStats />
        </div>
        <div className="mt-2 min-h-0 flex-1">
          <EmployerView />
        </div>
      </div>
      <FloatingTextLayer column="employer" />
    </div>
  );
}
