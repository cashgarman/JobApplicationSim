import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useAnimationStore } from '../store/animationStore';
import { AILayerColumn } from './AILayerColumn';
import { EmployerColumn } from './EmployerColumn';
import { DespairBars } from './DespairBars';
import { DespairFlavorTicker } from './DespairFlavorTicker';
import { PipelineOverlay } from './PipelineOverlay';
import { SeekerColumn } from './SeekerColumn';

export function Layout()
{
  const tick = useGameStore((s) => s.tick);
  const processApplicationQueue = useGameStore((s) => s.processApplicationQueue);
  const processRolePostQueue = useGameStore((s) => s.processRolePostQueue);
  const resetGame = useGameStore((s) => s.resetGame);
  const pruneExpired = useAnimationStore((s) => s.pruneExpired);

  useEffect(() =>
  {
    const gameInterval = setInterval(() =>
    {
      tick();
    }, 1000);

    const applicationInterval = setInterval(() =>
    {
      processApplicationQueue();
      processRolePostQueue();
    }, 100);

    const animInterval = setInterval(() =>
    {
      pruneExpired();
    }, 500);

    return () =>
    {
      clearInterval(gameInterval);
      clearInterval(applicationInterval);
      clearInterval(animInterval);
    };
  }, [tick, processApplicationQueue, processRolePostQueue, pruneExpired]);

  const handleReset = () =>
  {
    resetGame();
  };

  return (
    <div className="app-shell flex h-screen flex-col overflow-hidden bg-corp-bg">
      <header className="shrink-0 border-b border-corp-border bg-corp-panel px-4 py-2">
        <div className="mx-auto flex items-stretch gap-3">
          <div className="flex min-w-0 max-w-[38%] shrink-0 flex-col justify-center sm:max-w-none">
            <h1 className="font-pixel truncate text-xs text-corp-text sm:text-sm">
              Job Application Simulator
            </h1>
            <p className="truncate text-xs text-corp-muted italic sm:text-sm">
              Everyone loses. The middlemen get paid.
            </p>
          </div>
          <DespairFlavorTicker />
          <button
            type="button"
            onClick={handleReset}
            className="btn-red font-pixel shrink-0 self-center rounded px-3 py-1.5 text-xs uppercase"
            title="Reset save"
          >
            Give Up
          </button>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-[100vw] flex-1 flex-col overflow-hidden px-3 py-2">
        <div className="shrink-0">
          <DespairBars />
        </div>

        <div className="relative mt-2 min-h-0 flex-1">
          <div className="grid h-full min-h-0 grid-cols-3 gap-2 lg:gap-3 [&>*]:min-h-0 [&>*]:overflow-hidden">
            <SeekerColumn />
            <AILayerColumn />
            <EmployerColumn />
          </div>
          <PipelineOverlay />
        </div>
      </main>
    </div>
  );
}
