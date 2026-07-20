import type { GameState, OutcomeResult, SeekerState, EmployerState } from './types';
import {
  AI_INTERVIEW_FAIL_MESSAGES,
  AI_INTERVIEW_FAIL_RATE,
  AI_INTERVIEW_MESSAGES,
  BASE_ATS,
  BASE_LOAN_INTEREST_PER_SEC,
  BASE_REVENUE_DRAIN_PER_SEC,
  BASE_SAVINGS_DRAIN_PER_SEC,
  APPLICATION_COST,
  DEBT_DESPAIR_PER_SEC,
  DEBT_DESPAIR_REFERENCE,
  DESPAIR_MAX,
  EMPLOYER_DESPAIR_PER_SEC,
  LOAN_INTEREST_ESCALATION,
  LOAN_DESPAIR_BASE_RELIEF,
  LOAN_DESPAIR_DECAY,
  HUMAN_INTERVIEW_FAIL_MESSAGES,
  HUMAN_INTERVIEW_FILL_RATE,
  HUMAN_INTERVIEW_MESSAGES,
  INITIAL_SAVINGS,
  REJECTION_MESSAGES,
  SEEKER_DESPAIR_PER_SEC,
  pickRandom,
} from './constants';
import { SEEKER_UPGRADES, EMPLOYER_UPGRADES } from './upgrades';

export function clamp(value: number, min: number, max: number): number
{
  return Math.min(max, Math.max(min, value));
}

export function getSeekerUpgradeLevel(seeker: SeekerState, upgradeId: string): number
{
  return seeker.upgradeLevels[upgradeId] ?? 0;
}

export function getEmployerUpgradeLevel(employer: EmployerState, upgradeId: string): number
{
  return employer.upgradeLevels[upgradeId] ?? 0;
}

export function getSeekerAtsContribution(seeker: SeekerState): number
{
  let bonus = 0;
  for (const upgrade of SEEKER_UPGRADES)
  {
    const level = getSeekerUpgradeLevel(seeker, upgrade.id);
    bonus += level * (upgrade.effects.atsBonus ?? 0);
  }
  return bonus;
}

export function getEmployerAtsContribution(employer: EmployerState): number
{
  let bonus = 0;
  for (const upgrade of EMPLOYER_UPGRADES)
  {
    const level = getEmployerUpgradeLevel(employer, upgrade.id);
    bonus += level * (upgrade.effects.atsBonus ?? 0);
  }
  return bonus;
}

export function calculateAtsStrength(state: GameState): number
{
  const seekerBonus = getSeekerAtsContribution(state.seeker);
  const employerBonus = getEmployerAtsContribution(state.employer);
  const spendBonus = state.employer.aiRecruitmentSpend * 0.0001;
  return BASE_ATS + seekerBonus + employerBonus + spendBonus;
}

export function clampDespair(value: number): number
{
  return clamp(value, 0, DESPAIR_MAX);
}

export function getLoanInterestRate(loansTaken: number): number
{
  return BASE_LOAN_INTEREST_PER_SEC * (1 + LOAN_INTEREST_ESCALATION * loansTaken);
}

export function getInterestCharge(debt: number, loansTaken: number): number
{
  if (debt <= 0)
  {
    return 0;
  }
  return debt * getLoanInterestRate(loansTaken);
}

export function formatLoanApr(loansTaken: number): string
{
  const annualized = getLoanInterestRate(loansTaken) * 365 * 24 * 3600 * 100;
  return `${Math.floor(annualized)}%`;
}

export function getLoanDespairRelief(loansTakenBefore: number): number
{
  const loanNumber = loansTakenBefore + 1;
  return LOAN_DESPAIR_BASE_RELIEF * Math.pow(LOAN_DESPAIR_DECAY, loanNumber - 1);
}

export function getDebtDespairBonus(debt: number): number
{
  if (debt <= 0)
  {
    return 0;
  }
  return DEBT_DESPAIR_PER_SEC * (debt / DEBT_DESPAIR_REFERENCE);
}

export function getPassiveDespairGain(state: GameState): { seeker: number; employer: number }
{
  return {
    seeker:
      SEEKER_DESPAIR_PER_SEC
      + state.seeker.applications * 0.00008
      + state.seeker.rejections * 0.00003
      + getDebtDespairBonus(state.seeker.debt),
    employer:
      EMPLOYER_DESPAIR_PER_SEC
      + state.employer.openRoles * 0.006
      + state.employer.aiRecruitmentSpend * 0.000025
      + getDebtDespairBonus(state.employer.debt),
  };
}

export function applyDespairTick(state: GameState): GameState
{
  const passive = getPassiveDespairGain(state);
  return {
    ...state,
    seekerDespair: clampDespair(state.seekerDespair + passive.seeker),
    employerDespair: clampDespair(state.employerDespair + passive.employer),
  };
}

export function checkGameOver(state: GameState): GameState
{
  const seekerFull = state.seekerDespair >= DESPAIR_MAX;
  const employerFull = state.employerDespair >= DESPAIR_MAX;

  if (!seekerFull && !employerFull)
  {
    return state;
  }

  return {
    ...state,
    seekerDespair: seekerFull ? DESPAIR_MAX : state.seekerDespair,
    employerDespair: employerFull ? DESPAIR_MAX : state.employerDespair,
    phase: 'gameOver',
    gameOverCause:
      seekerFull && employerFull
        ? 'both'
        : seekerFull
          ? 'seeker'
          : 'employer',
  };
}

export function getOutcomeChances(state: GameState): {
  rejection: number;
  aiInterview: number;
  humanInterview: number;
}
{
  const ats = calculateAtsStrength(state);
  let humanBonus = 0;
  let aiBonus = 0;

  for (const upgrade of SEEKER_UPGRADES)
  {
    const level = getSeekerUpgradeLevel(state.seeker, upgrade.id);
    humanBonus += level * (upgrade.effects.humanInterviewBonus ?? 0);
    aiBonus += level * (upgrade.effects.aiInterviewBonus ?? 0);
  }

  const rejectionChance = clamp(0.85 + ats * 0.012, 0.85, 0.98);
  const aiInterviewChance = clamp(0.10 + aiBonus - ats * 0.004, 0.02, 0.12);
  const humanInterviewChance = clamp(
    0.001 / (1 + ats * 0.15) + humanBonus,
    0.00001,
    0.002,
  );

  const remaining = 1 - rejectionChance;
  const aiShare = Math.min(aiInterviewChance, remaining * 0.95);
  const humanShare = Math.min(humanInterviewChance, remaining - aiShare);

  return {
    rejection: rejectionChance,
    aiInterview: aiShare,
    humanInterview: humanShare,
  };
}

export function rollApplicationOutcome(state: GameState): OutcomeResult
{
  const chances = getOutcomeChances(state);
  const roll = Math.random();

  if (roll < chances.humanInterview)
  {
    const filled = Math.random() < HUMAN_INTERVIEW_FILL_RATE;
    if (filled)
    {
      return {
        outcome: 'humanInterview',
        message: pickRandom(HUMAN_INTERVIEW_MESSAGES),
        positionFilled: true,
        seekerDespairGain: 0.35,
        employerDespairGain: -1.5,
      };
    }

    if (Math.random() < 0.7)
    {
      return {
        outcome: 'rejection',
        message: pickRandom(HUMAN_INTERVIEW_FAIL_MESSAGES),
        positionFilled: false,
        seekerDespairGain: 0.55,
        employerDespairGain: 0.1,
      };
    }

    return {
      outcome: 'humanInterview',
      message: pickRandom(HUMAN_INTERVIEW_MESSAGES),
      positionFilled: false,
      seekerDespairGain: 0.15,
      employerDespairGain: 0.1,
    };
  }

  if (roll < chances.humanInterview + chances.aiInterview)
  {
    if (Math.random() < AI_INTERVIEW_FAIL_RATE)
    {
      return {
        outcome: 'rejection',
        message: pickRandom(AI_INTERVIEW_FAIL_MESSAGES),
        positionFilled: false,
        seekerDespairGain: 0.45,
        employerDespairGain: 0.12,
      };
    }

    return {
      outcome: 'aiInterview',
      message: pickRandom(AI_INTERVIEW_MESSAGES),
      positionFilled: false,
      seekerDespairGain: 0.3,
      employerDespairGain: 0.15,
    };
  }

  return {
    outcome: 'rejection',
    message: pickRandom(REJECTION_MESSAGES),
    positionFilled: false,
    seekerDespairGain: 0.45,
    employerDespairGain: 0.1,
  };
}

export function getUpgradeCost(
  baseCost: number,
  costMultiplier: number,
  currentLevel: number,
): number
{
  return Math.floor(baseCost * Math.pow(costMultiplier, currentLevel));
}

export function getApplicationsPerSec(state: GameState): number
{
  let rate = 0;
  for (const gen of ['linkedinBot', 'indeedBot'] as const)
  {
    const level = state.seeker.generatorLevels[gen] ?? 0;
    if (gen === 'linkedinBot')
    {
      rate += level * 0.5;
    }
    else
    {
      rate += level * 0.3;
    }
  }

  for (const upgrade of SEEKER_UPGRADES)
  {
    const level = getSeekerUpgradeLevel(state.seeker, upgrade.id);
    rate += level * (upgrade.effects.applicationsPerSec ?? 0);
  }

  return rate;
}

export function getSavingsDrainPerSec(state: GameState): number
{
  let drain = BASE_SAVINGS_DRAIN_PER_SEC;
  for (const upgrade of SEEKER_UPGRADES)
  {
    const level = getSeekerUpgradeLevel(state.seeker, upgrade.id);
    drain += level * (upgrade.effects.savingsDrainPerSec ?? 0);
  }
  drain += state.seeker.debt * 0.00002;
  return drain;
}

export function getRevenueDrainPerSec(state: GameState): number
{
  let drain = BASE_REVENUE_DRAIN_PER_SEC;
  drain += state.employer.openRoles * 0.08;
  drain += state.employer.aiRecruitmentSpend * 0.000015;

  for (const upgrade of EMPLOYER_UPGRADES)
  {
    const level = getEmployerUpgradeLevel(state.employer, upgrade.id);
    drain += level * (upgrade.effects.revenuePenalty ?? 0);
  }

  drain += state.employer.debt * 0.00002;
  return drain;
}

export function getAiSpendPerSec(state: GameState): number
{
  let spend = 0;
  for (const gen of ['hrIntern', 'outsourcedRecruiter'] as const)
  {
    const level = state.employer.generatorLevels[gen] ?? 0;
    if (gen === 'hrIntern')
    {
      spend += level * 0.2;
    }
    else
    {
      spend += level * 0.5;
    }
  }

  for (const upgrade of EMPLOYER_UPGRADES)
  {
    const level = getEmployerUpgradeLevel(state.employer, upgrade.id);
    spend += level * (upgrade.effects.aiSpendPerSec ?? 0);
  }

  return spend;
}

export interface AgencyStats
{
  totalBilled: number;
  agencyProfit: number;
  applicationsMonetized: number;
  placementsMade: number;
  costPerHire: string;
  activeSubscriptions: number;
  humanityBlocked: number;
  profitMargin: number;
}

export function getActiveSubscriptionCount(state: GameState): number
{
  const sumLevels = (levels: Record<string, number>) =>
    Object.values(levels).reduce((total, level) => total + level, 0);

  return (
    sumLevels(state.seeker.upgradeLevels)
    + sumLevels(state.seeker.generatorLevels)
    + sumLevels(state.employer.upgradeLevels)
    + sumLevels(state.employer.generatorLevels)
  );
}

export function getAgencyStats(state: GameState): AgencyStats
{
  const { seeker, employer } = state;
  const applicationFees = seeker.applications * APPLICATION_COST;
  const seekerSpend = Math.max(0, INITIAL_SAVINGS - seeker.savings);
  const totalBilled = employer.aiRecruitmentSpend + applicationFees + seekerSpend * 0.4;
  const agencyProfit = totalBilled * 0.88;
  const placements = employer.positionsFilled;

  return {
    totalBilled,
    agencyProfit,
    applicationsMonetized: seeker.applications,
    placementsMade: placements,
    costPerHire: placements > 0 ? formatCurrency(totalBilled / placements) : '∞',
    activeSubscriptions: getActiveSubscriptionCount(state),
    humanityBlocked: seeker.rejections + seeker.aiInterviews,
    profitMargin: 88,
  };
}

export function formatCurrency(value: number): string
{
  if (value >= 1_000_000)
  {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000)
  {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${Math.floor(value).toLocaleString()}`;
}

export function formatNumber(value: number): string
{
  if (value >= 1_000_000)
  {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000)
  {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return Math.floor(value).toLocaleString();
}
