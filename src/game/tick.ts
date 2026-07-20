import type { FeedEvent, GameState, OutcomeResult } from './types';
import {
  EMPLOYER_MESSAGES,
  INITIAL_REVENUE,
  INITIAL_SAVINGS,
  NEUTRAL_MESSAGES,
  pickRandom,
} from './constants';
import {
  applyDespairTick,
  checkGameOver,
  clampDespair,
  getAiSpendPerSec,
  getApplicationsPerSec,
  getRevenuePerSec,
  getSavingsDrainPerSec,
  rollApplicationOutcome,
} from './formulas';

let eventCounter = 0;

export function createEventId(): string
{
  eventCounter += 1;
  return `event-${Date.now()}-${eventCounter}`;
}

export function createFeedEvent(
  message: string,
  type: FeedEvent['type'],
): FeedEvent
{
  return {
    id: createEventId(),
    message,
    timestamp: Date.now(),
    type,
  };
}

export function createInitialState(): GameState
{
  return {
    phase: 'start',
    perspective: 'seeker',
    seeker: {
      savings: INITIAL_SAVINGS,
      applications: 0,
      rejections: 0,
      aiInterviews: 0,
      humanInterviews: 0,
      upgradeLevels: {},
      generatorLevels: {},
    },
    employer: {
      aiRecruitmentSpend: 0,
      positionsFilled: 0,
      revenue: INITIAL_REVENUE,
      openRoles: 0,
      upgradeLevels: {},
      generatorLevels: {},
    },
    seekerDespair: 0,
    employerDespair: 0,
    totalPlaySeconds: 0,
  };
}

function applyOutcome(state: GameState, result: OutcomeResult): GameState
{
  const seeker = { ...state.seeker };
  const employer = { ...state.employer };
  let seekerDespair = clampDespair(state.seekerDespair + result.seekerDespairGain);
  let employerDespair = clampDespair(state.employerDespair + result.employerDespairGain);

  seeker.applications += 1;

  switch (result.outcome)
  {
    case 'rejection':
      seeker.rejections += 1;
      break;
    case 'aiInterview':
      seeker.aiInterviews += 1;
      break;
    case 'humanInterview':
      seeker.humanInterviews += 1;
      break;
  }

  if (result.positionFilled)
  {
    employer.positionsFilled += 1;
  }

  return checkGameOver({
    ...state,
    seeker,
    employer,
    seekerDespair,
    employerDespair,
  });
}

export function processApplication(state: GameState): {
  state: GameState;
  result: OutcomeResult;
}
{
  const result = rollApplicationOutcome(state);
  const newState = applyOutcome(state, result);
  return { state: newState, result };
}

export function processApplications(state: GameState, count: number): {
  state: GameState;
  events: FeedEvent[];
}
{
  let current = state;
  const events: FeedEvent[] = [];
  const applications = Math.floor(count);
  const fractional = count - applications;

  for (let i = 0; i < applications; i++)
  {
    const { state: next, result } = processApplication(current);
    current = next;
    if (i === applications - 1 || Math.random() < 0.15)
    {
      events.push(
        createFeedEvent(
          result.message,
          result.outcome === 'rejection'
            ? 'rejection'
            : result.outcome === 'aiInterview'
              ? 'aiInterview'
              : 'humanInterview',
        ),
      );
    }
  }

  if (fractional > 0 && Math.random() < fractional)
  {
    const { state: next, result } = processApplication(current);
    current = next;
    events.push(
      createFeedEvent(
        result.message,
        result.outcome === 'rejection'
          ? 'rejection'
          : result.outcome === 'aiInterview'
            ? 'aiInterview'
            : 'humanInterview',
      ),
    );
  }

  return { state: current, events };
}

export function tickGame(state: GameState): {
  state: GameState;
  events: FeedEvent[];
}
{
  if (state.phase !== 'playing')
  {
    return { state, events: [] };
  }

  const events: FeedEvent[] = [];
  let current = {
    ...state,
    totalPlaySeconds: state.totalPlaySeconds + 1,
  };

  const savingsDrain = getSavingsDrainPerSec(current);
  current = {
    ...current,
    seeker: {
      ...current.seeker,
      savings: Math.max(0, current.seeker.savings - savingsDrain),
    },
  };

  const revenueGain = getRevenuePerSec(current);
  const aiSpend = getAiSpendPerSec(current);
  current = {
    ...current,
    employer: {
      ...current.employer,
      revenue: current.employer.revenue + revenueGain,
      aiRecruitmentSpend: current.employer.aiRecruitmentSpend + aiSpend,
    },
  };

  const appsPerSec = getApplicationsPerSec(current);
  if (appsPerSec > 0)
  {
    const { state: afterApps, events: appEvents } = processApplications(current, appsPerSec);
    current = afterApps;
    events.push(...appEvents);
  }

  if (Math.random() < 0.08)
  {
    events.push(createFeedEvent(pickRandom(EMPLOYER_MESSAGES), 'employer'));
  }
  else if (Math.random() < 0.03)
  {
    events.push(createFeedEvent(pickRandom(NEUTRAL_MESSAGES), 'neutral'));
  }

  current = checkGameOver(applyDespairTick(current));

  return { state: current, events };
}
