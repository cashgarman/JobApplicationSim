import { useGameStore } from '../store/gameStore';

export function StartScreen()
{
  const startGame = useGameStore((s) => s.startGame);

  return (
    <div className="flex h-screen flex-col items-center justify-center overflow-hidden bg-corp-bg px-4 text-center">
      <h1 className="font-pixel mb-4 text-lg leading-relaxed text-corp-text sm:text-xl">
        Job Application Simulator
      </h1>
      <p className="mb-8 max-w-lg text-sm text-corp-muted italic">
        Two sides of the same broken market. Job seekers drown in rejections.
        Employers drown in spend. Recruitment agencies bill everyone.
      </p>
      <button
        type="button"
        onClick={startGame}
        className="btn-green font-pixel rounded px-6 py-4 text-xs uppercase"
      >
        Good Luck...
      </button>
    </div>
  );
}
