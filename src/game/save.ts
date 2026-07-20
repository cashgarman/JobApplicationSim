import type { GameState } from './types';
import { createInitialState } from './tick';

const SAVE_KEY = 'job-application-sim-save';

function migrateState(raw: Record<string, unknown>): GameState
{
  const initial = createInitialState();
  const merged = { ...initial, ...raw } as GameState & { humanConnection?: number };

  if (merged.seekerDespair === undefined)
  {
    merged.seekerDespair = 0;
  }
  if (merged.employerDespair === undefined)
  {
    merged.employerDespair = 0;
  }

  if (merged.phase !== 'start' && merged.phase !== 'playing' && merged.phase !== 'gameOver')
  {
    merged.phase = 'start';
  }

  merged.seeker = {
    ...initial.seeker,
    ...merged.seeker,
    debt: merged.seeker?.debt ?? 0,
    loansTaken: merged.seeker?.loansTaken ?? 0,
  };
  merged.employer = {
    ...initial.employer,
    ...merged.employer,
    debt: merged.employer?.debt ?? 0,
    loansTaken: merged.employer?.loansTaken ?? 0,
  };

  delete merged.humanConnection;

  return merged;
}

export function saveGame(state: GameState): void
{
  try
  {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }
  catch
  {
    // ignore storage errors
  }
}

export function loadGame(): GameState | null
{
  try
  {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw)
    {
      return null;
    }
    return migrateState(JSON.parse(raw) as Record<string, unknown>);
  }
  catch
  {
    return null;
  }
}

export function clearSave(): void
{
  try
  {
    localStorage.removeItem(SAVE_KEY);
  }
  catch
  {
    // ignore
  }
}

export function getInitialState(): GameState
{
  clearSave();
  return createInitialState();
}
