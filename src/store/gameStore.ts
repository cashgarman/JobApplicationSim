import { create } from 'zustand';
import type { FeedEvent, GameState, Perspective } from '../game/types';
import {
  EMPLOYER_LOAN_AMOUNT,
  EMPLOYER_LOAN_MESSAGES,
  SEEKER_LOAN_AMOUNT,
  SEEKER_LOAN_MESSAGES,
  pickRandom,
} from '../game/constants';
import { getGeneratorById, getUpgradeById } from '../game/upgrades';
import { getUpgradeCost, checkGameOver, clampDespair, getLoanPrincipal, getEmployerClickDespairDelta } from '../game/formulas';
import { createFeedEvent, createInitialState, outcomeToFeedType, resolveApplicationOutcome, submitApplication, tickGame } from '../game/tick';
import { processPendingApplications, scheduleApplication, type PendingApplication } from '../game/applicationProcess';
import { processPendingRolePosts, scheduleRolePost } from '../game/rolePost';
import type { PendingRolePost } from '../game/rolePost';
import { getInitialState, saveGame } from '../game/save';
import { useAnimationStore } from './animationStore';

const MAX_FEED_EVENTS = 50;

interface GameStore
{
  state: GameState;
  feedEvents: FeedEvent[];
  pendingRolePosts: PendingRolePost[];
  pendingApplications: PendingApplication[];
  sessionId: number;
  startGame: () => void;
  togglePerspective: () => void;
  clickApply: () => void;
  clickPostRole: () => void;
  buyUpgrade: (upgradeId: string) => void;
  buyGenerator: (generatorId: string) => void;
  takeSeekerLoan: () => void;
  takeEmployerLoan: () => void;
  tick: () => void;
  resetGame: () => void;
  restartGame: () => void;
}

function persist(state: GameState): void
{
  saveGame(state);
}

function addFeedEvents(existing: FeedEvent[], newEvents: FeedEvent[]): FeedEvent[]
{
  return [...newEvents, ...existing].slice(0, MAX_FEED_EVENTS);
}

function clearPlaythroughLogs(): void
{
  useAnimationStore.getState().clearAll();
}

function clearedLogState()
{
  clearPlaythroughLogs();
  return {
    feedEvents: [] as FeedEvent[],
    pendingRolePosts: [] as PendingRolePost[],
    pendingApplications: [] as PendingApplication[],
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: getInitialState(),
  feedEvents: [],
  pendingRolePosts: [],
  pendingApplications: [],
  sessionId: 0,

  startGame: () =>
  {
    set((store) =>
    {
      const isNewPlaythrough =
        store.state.phase === 'start' || store.state.phase === 'gameOver';
      const state = {
        ...store.state,
        phase: 'playing' as const,
        ...(isNewPlaythrough
          ? { seekerDespair: 0, employerDespair: 0, gameOverCause: undefined }
          : {}),
      };
      persist(state);

      if (!isNewPlaythrough)
      {
        return { state };
      }

      return {
        state,
        ...clearedLogState(),
        sessionId: store.sessionId + 1,
      };
    });
  },

  togglePerspective: () =>
  {
    set((store) =>
    {
      const perspective: Perspective =
        store.state.perspective === 'seeker' ? 'employer' : 'seeker';
      const state = { ...store.state, perspective };
      persist(state);
      return { state };
    });
  },

  clickApply: () =>
  {
    const store = get();
    if (store.state.phase !== 'playing')
    {
      return;
    }

    const state = submitApplication(store.state);
    const pendingApplications = [
      ...store.pendingApplications,
      scheduleApplication('click'),
    ];
    useAnimationStore.getState().spawnApplicationSent();
    persist(state);
    set({ state, pendingApplications });
  },

  clickPostRole: () =>
  {
    const store = get();
    if (store.state.phase !== 'playing')
    {
      return;
    }

    const openRoles = store.state.employer.openRoles + 1;
    const rolesPosted = store.state.employer.rolesPosted + 1;
    const applicantCount = Math.floor(200 + Math.random() * 600);
    const state = checkGameOver({
      ...store.state,
      employer: {
        ...store.state.employer,
        openRoles,
        rolesPosted,
        revenue: store.state.employer.revenue + 5,
      },
      employerDespair: clampDespair(
        store.state.employerDespair + getEmployerClickDespairDelta(store.state),
      ),
    });
    const feedEvents = addFeedEvents(store.feedEvents, [
      createFeedEvent(
        `Companies: Posted role #${openRoles}. AI screening ${applicantCount} applicants.`,
        'employer',
      ),
    ]);
    const pendingRolePosts = [
      ...store.pendingRolePosts,
      scheduleRolePost(openRoles, applicantCount),
    ];
    useAnimationStore.getState().spawnRolePosted();
    persist(state);
    set({ state, feedEvents, pendingRolePosts });
  },

  buyUpgrade: (upgradeId: string) =>
  {
    const store = get();
    const upgrade = getUpgradeById(upgradeId);
    if (!upgrade || store.state.phase !== 'playing')
    {
      return;
    }

    const side = upgrade.side;
    const levels =
      side === 'seeker'
        ? store.state.seeker.upgradeLevels
        : store.state.employer.upgradeLevels;
    const currentLevel = levels[upgradeId] ?? 0;

    if (currentLevel >= upgrade.maxLevel)
    {
      return;
    }

    const cost = getUpgradeCost(upgrade.baseCost, upgrade.costMultiplier, currentLevel);

    if (upgrade.costType === 'savings' && store.state.seeker.savings < cost)
    {
      return;
    }
    if (upgrade.costType === 'revenue' && store.state.employer.revenue < cost)
    {
      return;
    }

    let state = { ...store.state };

    if (side === 'seeker')
    {
      state = {
        ...state,
        seeker: {
          ...state.seeker,
          savings: state.seeker.savings - cost,
          upgradeLevels: {
            ...state.seeker.upgradeLevels,
            [upgradeId]: currentLevel + 1,
          },
        },
      };
    }
    else
    {
      state = {
        ...state,
        employer: {
          ...state.employer,
          revenue: state.employer.revenue - cost,
          aiRecruitmentSpend: state.employer.aiRecruitmentSpend + cost * 0.5,
          openRoles: state.employer.openRoles + (upgrade.effects.openRoles ?? 0),
          upgradeLevels: {
            ...state.employer.upgradeLevels,
            [upgradeId]: currentLevel + 1,
          },
        },
      };
    }

    const feedEvents = addFeedEvents(store.feedEvents, [
      createFeedEvent(`Purchased: ${upgrade.name}`, 'neutral'),
    ]);
    persist(state);
    set({ state, feedEvents });
  },

  buyGenerator: (generatorId: string) =>
  {
    const store = get();
    const generator = getGeneratorById(generatorId);
    if (!generator || store.state.phase !== 'playing')
    {
      return;
    }

    const side = generator.side;
    const levels =
      side === 'seeker'
        ? store.state.seeker.generatorLevels
        : store.state.employer.generatorLevels;
    const currentLevel = levels[generatorId] ?? 0;

    if (currentLevel >= generator.maxLevel)
    {
      return;
    }

    const cost = getUpgradeCost(generator.baseCost, generator.costMultiplier, currentLevel);

    if (generator.costType === 'savings' && store.state.seeker.savings < cost)
    {
      return;
    }
    if (generator.costType === 'revenue' && store.state.employer.revenue < cost)
    {
      return;
    }

    let state = { ...store.state };

    if (side === 'seeker')
    {
      state = {
        ...state,
        seeker: {
          ...state.seeker,
          savings: state.seeker.savings - cost,
          generatorLevels: {
            ...state.seeker.generatorLevels,
            [generatorId]: currentLevel + 1,
          },
        },
      };
    }
    else
    {
      state = {
        ...state,
        employer: {
          ...state.employer,
          revenue: state.employer.revenue - cost,
          aiRecruitmentSpend: state.employer.aiRecruitmentSpend + cost * 0.3,
          generatorLevels: {
            ...state.employer.generatorLevels,
            [generatorId]: currentLevel + 1,
          },
        },
      };
    }

    const feedEvents = addFeedEvents(store.feedEvents, [
      createFeedEvent(`Hired: ${generator.name}`, side === 'employer' ? 'employer' : 'neutral'),
    ]);
    persist(state);
    set({ state, feedEvents });
  },

  takeSeekerLoan: () =>
  {
    const store = get();
    if (store.state.phase !== 'playing')
    {
      return;
    }

    const loanAmount = getLoanPrincipal(SEEKER_LOAN_AMOUNT, store.state.seeker.loansTaken);
    const state = checkGameOver({
      ...store.state,
      seeker: {
        ...store.state.seeker,
        savings: store.state.seeker.savings + loanAmount,
        debt: store.state.seeker.debt + loanAmount,
        loansTaken: store.state.seeker.loansTaken + 1,
      },
      seekerDespair: 0,
    });
    const feedEvents = addFeedEvents(store.feedEvents, [
      createFeedEvent(pickRandom(SEEKER_LOAN_MESSAGES), 'seeker'),
    ]);
    persist(state);
    set({ state, feedEvents });
  },

  takeEmployerLoan: () =>
  {
    const store = get();
    if (store.state.phase !== 'playing')
    {
      return;
    }

    const loanAmount = getLoanPrincipal(EMPLOYER_LOAN_AMOUNT, store.state.employer.loansTaken);
    const state = checkGameOver({
      ...store.state,
      employer: {
        ...store.state.employer,
        revenue: store.state.employer.revenue + loanAmount,
        debt: store.state.employer.debt + loanAmount,
        loansTaken: store.state.employer.loansTaken + 1,
      },
      employerDespair: 0,
    });
    const feedEvents = addFeedEvents(store.feedEvents, [
      createFeedEvent(pickRandom(EMPLOYER_LOAN_MESSAGES), 'employer'),
    ]);
    persist(state);
    set({ state, feedEvents });
  },

  tick: () =>
  {
    const store = get();
    if (store.state.phase !== 'playing')
    {
      return;
    }

    const { state: tickedState, events, pendingApplications: scheduledApplications } = tickGame(store.state);
    let state = tickedState;
    const allPendingApplications = [...store.pendingApplications, ...scheduledApplications];
    const applicationResolution = processPendingApplications(allPendingApplications);
    const resolvedApplicationEvents: FeedEvent[] = [];

    for (const pending of applicationResolution.resolved)
    {
      const resolution = resolveApplicationOutcome(state);
      state = resolution.state;
      resolvedApplicationEvents.push(
        createFeedEvent(resolution.result.message, outcomeToFeedType(resolution.result.outcome)),
      );
      useAnimationStore.getState().spawnFromOutcome(resolution.result, {
        includeApplicationIcon: pending.source === 'auto',
      });
    }

    const roleResolution = processPendingRolePosts(store.pendingRolePosts, state);
    const resolvedRoleEvents = roleResolution.events.map((event) =>
      createFeedEvent(event.message, event.type),
    );
    for (const event of roleResolution.events)
    {
      if (event.type === 'rejection' || event.type === 'aiInterview')
      {
        useAnimationStore.getState().appendEmployerDireFlavor();
      }
    }
    const allNewEvents = [...events, ...resolvedApplicationEvents, ...resolvedRoleEvents];
    const feedEvents = allNewEvents.length > 0
      ? addFeedEvents(store.feedEvents, allNewEvents)
      : store.feedEvents;
    persist(roleResolution.state);
    set({
      state: roleResolution.state,
      feedEvents,
      pendingRolePosts: roleResolution.remaining,
      pendingApplications: applicationResolution.remaining,
    });
  },

  resetGame: () =>
  {
    const state = createInitialState();
    persist(state);
    set((store) => ({
      state,
      ...clearedLogState(),
      sessionId: store.sessionId + 1,
    }));
  },

  restartGame: () =>
  {
    const state = createInitialState();
    persist(state);
    set((store) => ({
      state,
      ...clearedLogState(),
      sessionId: store.sessionId + 1,
    }));

    requestAnimationFrame(() =>
    {
      requestAnimationFrame(() =>
      {
        const playingState = {
          ...createInitialState(),
          phase: 'playing' as const,
        };
        persist(playingState);
        set({ state: playingState });
      });
    });
  },
}));
