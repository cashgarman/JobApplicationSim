import type { FeedEvent, GameState } from './types';
import { economyConfig } from '../config/economy';
import { AGENCY_ROLE_PROCESSING_MESSAGES, pickRandom } from './constants';
import { checkGameOver, getScaledEmployerDespairDelta, clampDespair } from './formulas';
export interface PendingRolePost
{
  id: string;
  roleNumber: number;
  applicantCount: number;
  source: 'click' | 'auto';
  startedAt: number;
  arrivedAt: number;
  durationMs: number;
  flavorMessage: string;
}

export interface RolePostResolution
{
  message: string;
  type: FeedEvent['type'];
  state: GameState;
}

const FILLED_MESSAGES = (roleNumber: number) => [
  `Companies: Role #${roleNumber} filled. Candidate starts Monday. AI takes credit.`,
  `Companies: Role #${roleNumber} closed. Offer accepted. ATS still shows "Under Review."`,
  `Companies: Role #${roleNumber} filled after 47 rounds. Miracles happen.`,
];

const NO_CANDIDATES_MESSAGES = (roleNumber: number, applicants: number) => [
  `Companies: Role #${roleNumber} — AI screened ${applicants} applicants. Zero qualified.`,
  `Companies: Role #${roleNumber} pipeline empty. Requirements raised again.`,
  `Companies: Role #${roleNumber} — perfect candidates exist. ATS disagrees.`,
];

const STALLED_MESSAGES = (roleNumber: number, applicants: number) => [
  `Companies: Role #${roleNumber} — ${applicants} applicants stuck in AI review limbo.`,
  `Companies: Role #${roleNumber} still open. Top candidate ghosted after round 6.`,
  `Companies: Role #${roleNumber} — leadership "will circle back next quarter."`,
];

const CANCELLED_MESSAGES = (roleNumber: number) => [
  `Companies: Role #${roleNumber} pulled. Budget reallocated to more AI tools.`,
  `Companies: Role #${roleNumber} cancelled. Headcount freeze. Listing still live.`,
  `Companies: Role #${roleNumber} removed. Internal transfer filled it weeks ago.`,
];

export function scheduleRolePost(
  roleNumber: number,
  applicantCount: number,
  source: PendingRolePost['source'] = 'click',
): PendingRolePost
{
  const minMs = economyConfig.rolePostProcessMinSec * 1000;
  const maxMs = economyConfig.rolePostProcessMaxSec * 1000;

  return {
    id: `role-${roleNumber}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    roleNumber,
    applicantCount,
    source,
    startedAt: 0,
    arrivedAt: 0,
    durationMs: minMs + Math.random() * (maxMs - minMs),
    flavorMessage: pickRandom(AGENCY_ROLE_PROCESSING_MESSAGES),
  };
}

export function resolvePostedRole(
  pending: PendingRolePost,
  state: GameState,
): RolePostResolution
{
  const roll = Math.random();
  const employer = { ...state.employer };

  if (roll < economyConfig.rolePostFillChance)
  {
    employer.positionsFilled += 1;
    employer.openRoles = Math.max(0, employer.openRoles - 1);
    employer.revenue += 25;

    return {
      message: pickRandom(FILLED_MESSAGES(pending.roleNumber)),
      type: 'humanInterview',
      state: checkGameOver({ ...state, employer }),
    };
  }

  if (roll < 0.45)
  {
    employer.openRoles = Math.max(0, employer.openRoles - 1);
    employer.aiRecruitmentSpend += Math.floor(
      economyConfig.agencyRolePostAiSpendMin
        + Math.random() * (economyConfig.agencyRolePostAiSpendMax - economyConfig.agencyRolePostAiSpendMin),
    );
    const employerDespair = clampDespair(
      state.employerDespair + getScaledEmployerDespairDelta(state, economyConfig.employerDespairPerClick),
    );

    return {
      message: pickRandom(NO_CANDIDATES_MESSAGES(pending.roleNumber, pending.applicantCount)),
      type: 'rejection',
      state: checkGameOver({ ...state, employer, employerDespair }),
    };
  }

  if (roll < 0.78)
  {
    return {
      message: pickRandom(STALLED_MESSAGES(pending.roleNumber, pending.applicantCount)),
      type: 'aiInterview',
      state: checkGameOver({ ...state, employer }),
    };
  }

  employer.openRoles = Math.max(0, employer.openRoles - 1);
  const employerDespair = clampDespair(
    state.employerDespair + getScaledEmployerDespairDelta(state, economyConfig.employerDespairPerClick),
  );

  return {
    message: pickRandom(CANCELLED_MESSAGES(pending.roleNumber)),
    type: 'rejection',
    state: checkGameOver({ ...state, employer, employerDespair }),
  };
}