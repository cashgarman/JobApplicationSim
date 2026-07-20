import type { CSSProperties } from 'react';
import { ApplicantView } from './ApplicantView';
import { DespairGlitchOverlay } from './DespairGlitchOverlay';
import { FloatingTextLayer } from './FloatingTextLayer';
import { SeekerStats } from './SeekerStats';
import { useDismalFlash } from '../hooks/useDismalFlash';
import { useDespairGlitchIntensity } from '../hooks/useDespairGlitchIntensity';
import { useGameStore } from '../store/gameStore';

export function SeekerColumn()
{
  const dismayFlash = useDismalFlash('seeker');
  const seekerDespair = useGameStore((s) => s.state.seekerDespair);
  const glitchIntensity = useDespairGlitchIntensity(seekerDespair);

  return (
    <div
      className={`column-panel seeker-dismal relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded border border-corp-border bg-corp-panel/50 p-2 lg:p-3 ${
        dismayFlash ? 'seeker-dismay-flash' : ''
      }`}
    >
      <div className="seeker-dismal-vignette pointer-events-none absolute inset-0" />
      <DespairGlitchOverlay side="seeker" intensity={glitchIntensity} />
      <FloatingTextLayer column="seeker" />
      <div
        className={`relative z-10 flex h-full min-h-0 flex-col ${glitchIntensity > 0 ? 'despair-glitch-content' : ''}`}
        style={glitchIntensity > 0 ? { '--glitch-intensity': glitchIntensity } as CSSProperties : undefined}
      >
        <div className="shrink-0 text-center">
          <i className="fa-solid fa-user-tie seeker-droop mb-1 text-2xl text-corp-text lg:text-3xl" />
          <h2 className="font-pixel text-[10px] text-corp-green lg:text-xs">Job Seeker</h2>
          <p className="seeker-sigh text-[10px] text-corp-red lg:text-xs">qualified, rejected, billed</p>
        </div>
        <div className="mt-2 shrink-0">
          <SeekerStats />
        </div>
        <div className="mt-2 min-h-0 flex-1">
          <ApplicantView />
        </div>
      </div>
    </div>
  );
}
