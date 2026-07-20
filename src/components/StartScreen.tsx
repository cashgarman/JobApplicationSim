import { useGameStore } from '../store/gameStore';
import { BinaryRainBackground } from './BinaryRainBackground';
import { ScreenGlitchText } from './ScreenGlitchText';

const SUBTITLE_LINES = [
  'Two sides of the same broken system.',
  'Job seekers drown in rejections.',
  'Companies drown in spend.',
  'Recruitment agencies bill everyone.',
];

export function StartScreen()
{
  const startGame = useGameStore((s) => s.startGame);

  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-corp-bg px-4 text-center">
      <BinaryRainBackground fullScreen />
      <div className="relative z-10 flex flex-col items-center rounded border border-corp-border/40 bg-black/70 px-8 py-10 sm:px-12 sm:py-12">
        <ScreenGlitchText
          as="h1"
          text="Job Application Simulator"
          className="font-pixel mb-4 text-lg leading-relaxed text-corp-text sm:text-xl"
        />
        <div className="mb-8 max-w-lg space-y-1 text-sm text-corp-muted italic">
          {SUBTITLE_LINES.map((line) => (
            <ScreenGlitchText
              key={line}
              as="p"
              text={line}
              className="block"
            />
          ))}
        </div>
        <button
          type="button"
          onClick={startGame}
          className="btn-green font-pixel rounded px-6 py-4 text-xs uppercase"
        >
          <ScreenGlitchText text="Good Luck..." />
        </button>
      </div>
    </div>
  );
}
