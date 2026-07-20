import type { FeedEvent, GameState } from './types';
import { checkGameOver, getScaledEmployerDespairDelta, clampDespair } from './formulas';
import { pickRandom } from './constants';

export interface PendingRolePost
{
  id: string;
  roleNumber: number;
  applicantCount: number;
  ticksRemaining: number;
}

export interface RolePostResolution
{
  message: string;
  type: FeedEvent['type'];
  state: GameState;
}

const FILLED_MESSAGES = (roleNumber: number) => [
  `Employer: Role #${roleNumber} filled. Candidate starts Monday. AI takes credit.`,
  `Employer: Role #${roleNumber} closed. Offer accepted. ATS still shows "Under Review."`,
  `Employer: Role #${roleNumber} filled after 47 rounds. Miracles happen.`,
];

const NO_CANDIDATES_MESSAGES = (roleNumber: number, applicants: number) => [
  `Employer: Role #${roleNumber} — AI screened ${applicants} applicants. Zero qualified.`,
  `Employer: Role #${roleNumber} pipeline empty. Requirements raised again.`,
  `Employer: Role #${roleNumber} — perfect candidates exist. ATS disagrees.`,
];

const STALLED_MESSAGES = (roleNumber: number, applicants: number) => [
  `Employer: Role #${roleNumber} — ${applicants} applicants stuck in AI review limbo.`,
  `Employer: Role #${roleNumber} still open. Top candidate ghosted after round 6.`,
  `Employer: Role #${roleNumber} — hiring manager "will circle back next quarter."`,
];

const CANCELLED_MESSAGES = (roleNumber: number) => [
  `Employer: Role #${roleNumber} pulled. Budget reallocated to more AI tools.`,
  `Employer: Role #${roleNumber} cancelled. Headcount freeze. Listing still live.`,
  `Employer: Role #${roleNumber} removed. Internal transfer filled it weeks ago.`,
];

export function scheduleRolePost(
  roleNumber: number,
  applicantCount: number,
): PendingRolePost
{
  return {
    id: `role-${roleNumber}-${Date.now()}`,
    roleNumber,
    applicantCount,
    ticksRemaining: Math.floor(3 + Math.random() * 9),
  };
}

export function resolvePostedRole(
  pending: PendingRolePost,
  state: GameState,
): RolePostResolution
{
  const roll = Math.random();
  const employer = { ...state.employer };
  let employerDespair = state.employerDespair;

  if (roll < 0.12)
  {
    employer.positionsFilled += 1;
    employer.openRoles = Math.max(0, employer.openRoles - 1);
    employer.revenue += 25;
    employerDespair = clampDespair(employerDespair + getScaledEmployerDespairDelta(state, -1.2));

    return {
      message: pickRandom(FILLED_MESSAGES(pending.roleNumber)),
      type: 'humanInterview',
      state: checkGameOver({ ...state, employer, employerDespair }),
    };
  }

  if (roll < 0.45)
  {
    employer.openRoles = Math.max(0, employer.openRoles - 1);
    employer.aiRecruitmentSpend += Math.floor(200 + Math.random() * 800);
    employerDespair = clampDespair(employerDespair + getScaledEmployerDespairDelta(state, 0.6));

    return {
      message: pickRandom(NO_CANDIDATES_MESSAGES(pending.roleNumber, pending.applicantCount)),
      type: 'rejection',
      state: checkGameOver({ ...state, employer, employerDespair }),
    };
  }

  if (roll < 0.78)
  {
    employerDespair = clampDespair(employerDespair + getScaledEmployerDespairDelta(state, 0.35));

    return {
      message: pickRandom(STALLED_MESSAGES(pending.roleNumber, pending.applicantCount)),
      type: 'aiInterview',
      state: checkGameOver({ ...state, employer, employerDespair }),
    };
  }

  employer.openRoles = Math.max(0, employer.openRoles - 1);
  employerDespair = clampDespair(employerDespair + getScaledEmployerDespairDelta(state, 0.5));

  return {
    message: pickRandom(CANCELLED_MESSAGES(pending.roleNumber)),
    type: 'rejection',
    state: checkGameOver({ ...state, employer, employerDespair }),
  };
}

export function processPendingRolePosts(
  pendingPosts: PendingRolePost[],
  state: GameState,
): {
  state: GameState;
  events: Array<{ message: string; type: FeedEvent['type'] }>;
  remaining: PendingRolePost[];
}
{
  const events: Array<{ message: string; type: FeedEvent['type'] }> = [];
  let currentState = state;
  const remaining: PendingRolePost[] = [];

  for (const pending of pendingPosts)
  {
    const nextTicks = pending.ticksRemaining - 1;

    if (nextTicks <= 0)
    {
      const resolution = resolvePostedRole(pending, currentState);
      currentState = resolution.state;
      events.push({ message: resolution.message, type: resolution.type });
      continue;
    }

    remaining.push({ ...pending, ticksRemaining: nextTicks });
  }

  return { state: currentState, events, remaining };
}
