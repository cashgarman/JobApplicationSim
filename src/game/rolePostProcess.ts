import { APPLICATION_ENVELOPE_TRAVEL_MS } from './applicationProcess';
import { processFirstReadyItem } from './processingQueue';
import type { PendingRolePost } from './rolePost';

export function hasRoleEnvelopeArrived(pending: Pick<PendingRolePost, 'startedAt'>, now = Date.now()): boolean
{
  if (pending.startedAt <= 0)
  {
    return false;
  }

  return now - pending.startedAt >= APPLICATION_ENVELOPE_TRAVEL_MS;
}

export function getRolePostProcessingTotalMs(pending: PendingRolePost): number
{
  return APPLICATION_ENVELOPE_TRAVEL_MS + pending.durationMs;
}

export function isRolePostReady(pending: PendingRolePost, now = Date.now()): boolean
{
  if (pending.startedAt <= 0)
  {
    return false;
  }

  return now - pending.startedAt >= getRolePostProcessingTotalMs(pending);
}

export function processPendingRolePosts(
  pendingPosts: PendingRolePost[],
  now = Date.now(),
): {
  resolved: PendingRolePost | null;
  remaining: PendingRolePost[];
}
{
  return processFirstReadyItem(pendingPosts, isRolePostReady, now);
}
