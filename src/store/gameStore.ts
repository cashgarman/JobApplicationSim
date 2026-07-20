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
import { getUpgradeCost, checkGameOver, clampDespair, getLoanPrincipal, getScaledEmployerDespairDelta } from '../game/formulas';
import { createFeedEvent, createInitialState, processApplication, tickGame } from '../game/tick';
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
}

function persist(state: GameState): void
{
  saveGame(state);
}

function addFeedEvents(existing: FeedEvent[], newEvents: FeedEvent[]): FeedEvent[]
{
  return [...newEvents, ...existing].slice(0, MAX_FEED_EVENTS);
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: getInitialState(),
  feedEvents: [],
  pendingRolePosts: [],

  startGame: () =>
  {
    set((store) =>
    {
      const shouldResetDespair =
        store.state.phase === 'start' || store.state.phase === 'gameOver';
      const state = {
        ...store.state,
        phase: 'playing' as const,
        ...(shouldResetDespair
          ? { seekerDespair: 0, employerDespair: 0, gameOverCause: undefined }
          : {}),
      };
      persist(state);
      return { state };
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

    const { state, result } = processApplication(store.state);
    useAnimationStore.getState().spawnFromOutcome(result);
    const feedEvents = addFeedEvents(
      store.feedEvents,
      [
        createFeedEvent(
          result.message,
          result.outcome === 'rejection'
            ? 'rejection'
            : result.outcome === 'aiInterview'
              ? 'aiInterview'
              : 'humanInterview',
        ),
      ],
    );
    persist(state);
    set({ state, feedEvents });
  },

  clickPostRole: () =>
  {
    const store = get();
    if (store.state.phase !== 'playing')
    {
      return;
    }

    const openRoles = store.state.employer.openRoles + 1;
    const applicantCount = Math.floor(200 + Math.random() * 600);
    const state = checkGameOver({
      ...store.state,
      employer: {
        ...store.state.employer,
        openRoles,
        revenue: store.state.employer.revenue + 5,
      },
      employerDespair: clampDespair(
        store.state.employerDespair + getScaledEmployerDespairDelta(store.state, 1.5),
      ),
    });
    const feedEvents = addFeedEvents(store.feedEvents, [
      createFeedEvent(
        `Employer: Posted role #${openRoles}. AI screening ${applicantCount} applicants.`,
        'employer',
      ),
    ]);
    const pendingRolePosts = [
      ...store.pendingRolePosts,
      scheduleRolePost(openRoles, applicantCount),
    ];
    useAnimationStore.setState({ employerDismayPulse: Date.now() });
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

    const { state, events } = tickGame(store.state);
    const roleResolution = processPendingRolePosts(store.pendingRolePosts, state);
    const resolvedRoleEvents = roleResolution.events.map((event) =>
      createFeedEvent(event.message, event.type),
    );
    const allNewEvents = [...events, ...resolvedRoleEvents];
    if (allNewEvents.length > 0)
    {
      const sampled = allNewEvents.find(
        (e) =>
          e.type === 'rejection'
          || e.type === 'aiInterview'
          || e.type === 'humanInterview',
      );
      if (sampled)
      {
        useAnimationStore.getState().spawnFromOutcome({
          outcome:
            sampled.type === 'rejection'
              ? 'rejection'
              : sampled.type === 'aiInterview'
                ? 'aiInterview'
                : 'humanInterview',
          message: sampled.message,
          positionFilled: false,
          seekerDespairGain: 0,
          employerDespairGain: 0,
        });
      }
    }
    const feedEvents = allNewEvents.length > 0
      ? addFeedEvents(store.feedEvents, allNewEvents)
      : store.feedEvents;
    persist(roleResolution.state);
    set({
      state: roleResolution.state,
      feedEvents,
      pendingRolePosts: roleResolution.remaining,
    });
  },

  resetGame: () =>
  {
    const state = createInitialState();
    persist(state);
    useAnimationStore.getState().clearAll();
    set({ state, feedEvents: [], pendingRolePosts: [] });
  },
}));
