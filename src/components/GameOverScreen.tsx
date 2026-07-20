import type { GameOverCause } from '../game/types';
import { useGameStore } from '../store/gameStore';
import { ScreenGlitchText } from './ScreenGlitchText';

function getGameOverCopy(cause: GameOverCause | undefined): { title: string; body: string }
{
  switch (cause)
  {
    case 'seeker':
      return {
        title: 'Seeker Burnout',
        body:
          'You have been comprehensively rejected. Your savings are gone, your hope is gone, and therapy is not covered under your plan.',
      };
    case 'employer':
      return {
        title: 'Companies Collapse',
        body:
          'Every role remains open. The AI vendors thank you for your patronage. AI Recruitment has never been more profitable.',
      };
    case 'both':
      return {
        title: 'Mutual Destruction',
        body:
          'The job seeker broke first. The companies broke second. AI Recruitment billed both sides the entire time.',
      };
    default:
      return {
        title: 'Game Over',
        body: 'The system worked exactly as designed. Nobody wins except the middlemen.',
      };
  }
}

export function GameOverScreen()
{
  const cause = useGameStore((s) => s.state.gameOverCause);
  const restartGame = useGameStore((s) => s.restartGame);
  const { title, body } = getGameOverCopy(cause);

  return (
    <div className="flex h-screen flex-col items-center justify-center overflow-hidden bg-corp-bg px-4 text-center">
      <ScreenGlitchText
        as="p"
        text="Game Over"
        className="font-pixel mb-3 text-xl uppercase tracking-wider text-corp-red"
      />
      <ScreenGlitchText
        as="h1"
        text={title}
        className="font-pixel mb-4 text-lg leading-relaxed text-corp-text sm:text-xl"
      />
      <ScreenGlitchText
        as="p"
        text={body}
        className="mb-8 max-w-lg text-sm text-corp-muted italic"
      />
      <button
        type="button"
        onClick={restartGame}
        className="btn-green font-pixel rounded px-6 py-4 text-sm uppercase"
      >
        <ScreenGlitchText text="Try Again? But Why bother..." />
      </button>
    </div>
  );
}
