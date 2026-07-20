import { createInitialState, tickGame, processApplication } from '../src/game/tick';
import { DESPAIR_MAX } from '../src/game/constants';
import {
  SEEKER_UPGRADES,
  EMPLOYER_UPGRADES,
  SEEKER_GENERATORS,
  EMPLOYER_GENERATORS,
} from '../src/game/upgrades';
import { getUpgradeCost } from '../src/game/formulas';
import type { GameState } from '../src/game/types';

function buyAllUpgrades(state: GameState): GameState
{
  let current: GameState = { ...state, phase: 'playing' };

  for (const upgrade of SEEKER_UPGRADES)
  {
    for (let i = 0; i < upgrade.maxLevel; i++)
    {
      const level = current.seeker.upgradeLevels[upgrade.id] ?? 0;
      const cost = getUpgradeCost(upgrade.baseCost, upgrade.costMultiplier, level);
      current = {
        ...current,
        seeker: {
          ...current.seeker,
          savings: current.seeker.savings + 50000 - cost,
          upgradeLevels: {
            ...current.seeker.upgradeLevels,
            [upgrade.id]: level + 1,
          },
        },
      };
    }
  }

  for (const gen of SEEKER_GENERATORS)
  {
    for (let i = 0; i < Math.min(5, gen.maxLevel); i++)
    {
      const level = current.seeker.generatorLevels[gen.id] ?? 0;
      const cost = getUpgradeCost(gen.baseCost, gen.costMultiplier, level);
      current = {
        ...current,
        seeker: {
          ...current.seeker,
          savings: current.seeker.savings + cost - cost,
          generatorLevels: {
            ...current.seeker.generatorLevels,
            [gen.id]: level + 1,
          },
        },
      };
    }
  }

  for (const upgrade of EMPLOYER_UPGRADES)
  {
    for (let i = 0; i < upgrade.maxLevel; i++)
    {
      const level = current.employer.upgradeLevels[upgrade.id] ?? 0;
      const cost = getUpgradeCost(upgrade.baseCost, upgrade.costMultiplier, level);
      current = {
        ...current,
        employer: {
          ...current.employer,
          revenue: current.employer.revenue + 100000 - cost,
          upgradeLevels: {
            ...current.employer.upgradeLevels,
            [upgrade.id]: level + 1,
          },
        },
      };
    }
  }

  for (const gen of EMPLOYER_GENERATORS)
  {
    for (let i = 0; i < Math.min(5, gen.maxLevel); i++)
    {
      const level = current.employer.generatorLevels[gen.id] ?? 0;
      current = {
        ...current,
        employer: {
          ...current.employer,
          generatorLevels: {
            ...current.employer.generatorLevels,
            [gen.id]: level + 1,
          },
        },
      };
    }
  }

  return current;
}

let state = createInitialState();
state = { ...state, phase: 'playing' };

for (let i = 0; i < 500; i++)
{
  const { state: next } = processApplication(state);
  state = next;
}

console.log('After 500 manual applications:');
console.log({
  applications: state.seeker.applications,
  rejections: state.seeker.rejections,
  aiInterviews: state.seeker.aiInterviews,
  humanInterviews: state.seeker.humanInterviews,
});

state = buyAllUpgrades(state);

for (let sec = 0; sec < 600; sec++)
{
  const { state: next } = tickGame(state);
  state = next;
  for (let c = 0; c < 5; c++)
  {
    const { state: afterClick } = processApplication(state);
    state = afterClick;
  }
}

console.log('\nAfter 10 min max upgrades + clicking:');
console.log({
  applications: state.seeker.applications,
  rejections: state.seeker.rejections,
  aiInterviews: state.seeker.aiInterviews,
  humanInterviews: state.seeker.humanInterviews,
  savings: Math.floor(state.seeker.savings),
  aiSpend: Math.floor(state.employer.aiRecruitmentSpend),
  positionsFilled: state.employer.positionsFilled,
  seekerDespair: state.seekerDespair.toFixed(1),
  employerDespair: state.employerDespair.toFixed(1),
  phase: state.phase,
  gameOverCause: state.gameOverCause,
});

if (state.seeker.rejections < 450)
{
  console.warn('WARN: Rejections lower than expected for 500+ apps');
}
else
{
  console.log('PASS: Rejection rate in expected range');
}

if (state.phase !== 'gameOver')
{
  console.warn('WARN: Game did not reach game over within test window');
}
else
{
  console.log(`PASS: Game over triggered (${state.gameOverCause})`);
}

if (state.seekerDespair < DESPAIR_MAX * 0.5 && state.employerDespair < DESPAIR_MAX * 0.5)
{
  console.warn('WARN: Despair too low - bars may fill too slowly');
}
else
{
  console.log('PASS: Despair climbing as expected');
}
