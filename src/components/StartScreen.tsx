import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { BinaryRainBackground } from './BinaryRainBackground';
import { ScreenGlitchText } from './ScreenGlitchText';

const SUBTITLE_LINES = [
  'Two sides of the same broken system.',
  'Job seekers drown in rejections.',
  'Companies drown in costs.',
  'AI Recruitment charges everyone.',
];

const GOOD_LUCK_HOVER_GLITCH = {
  corruptText: 'Sucker.',
  chaosMultiplier: 2.4,
  waveSpawnChance: 0.72,
  maxActiveWaves: 5,
  sporadicBurstChance: 0.35,
  waveStutterChance: 0.08,
} as const;

export function StartScreen()
{
  const startGame = useGameStore((s) => s.startGame);
  const [goodLuckHovered, setGoodLuckHovered] = useState(false);

  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-corp-bg px-4 text-center">
      <BinaryRainBackground fullScreen />
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center rounded border border-corp-border/40 bg-black/70 px-8 py-10 sm:px-12 sm:py-12">
        <ScreenGlitchText
          as="h1"
          text="Job Application Simulator"
          className="font-pixel mb-4 text-2xl leading-relaxed text-corp-green sm:text-3xl lg:text-4xl"
        />
        <div className="mb-8 w-full max-w-2xl space-y-1 text-base text-corp-muted italic">
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
          onMouseEnter={() => setGoodLuckHovered(true)}
          onMouseLeave={() => setGoodLuckHovered(false)}
          onFocus={() => setGoodLuckHovered(true)}
          onBlur={() => setGoodLuckHovered(false)}
          className="btn-green font-pixel rounded px-5 py-2 text-xl uppercase sm:text-2xl"
        >
          <ScreenGlitchText
            text="Good Luck..."
            hovered={goodLuckHovered}
            hoverOptions={GOOD_LUCK_HOVER_GLITCH}
            hoverSpeedMultiplier={3.2}
          />
        </button>
      </div>
    </div>
  );
}
