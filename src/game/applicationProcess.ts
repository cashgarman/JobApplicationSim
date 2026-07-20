import { economyConfig } from '../config/economy';
import { AGENCY_PROCESSING_MESSAGES, pickRandom } from './constants';
import { processFirstReadyItem } from './processingQueue';

export const APPLICATION_ENVELOPE_TRAVEL_MS = 750;

export interface PendingApplication
{
  id: string;
  source: 'click' | 'auto';
  startedAt: number;
  arrivedAt: number;
  durationMs: number;
  flavorMessage: string;
}

export function scheduleApplication(source: PendingApplication['source']): PendingApplication
{
  const minMs = economyConfig.applicationProcessMinSec * 1000;
  const maxMs = economyConfig.applicationProcessMaxSec * 1000;

  return {
    id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    source,
    startedAt: 0,
    arrivedAt: 0,
    durationMs: minMs + Math.random() * (maxMs - minMs),
    flavorMessage: pickRandom(AGENCY_PROCESSING_MESSAGES),
  };
}

export function getApplicationProcessingTotalMs(pending: PendingApplication): number
{
  return APPLICATION_ENVELOPE_TRAVEL_MS + pending.durationMs;
}

export function getApplicationBarProgress(pending: PendingApplication, now = Date.now()): number
{
  if (pending.startedAt <= 0)
  {
    return 0;
  }

  const elapsed = now - pending.startedAt;
  if (elapsed <= APPLICATION_ENVELOPE_TRAVEL_MS)
  {
    return 0;
  }

  if (pending.durationMs <= 0)
  {
    return 1;
  }

  return Math.min(1, (elapsed - APPLICATION_ENVELOPE_TRAVEL_MS) / pending.durationMs);
}

export function hasApplicationEnvelopeArrived(pending: PendingApplication, now = Date.now()): boolean
{
  if (pending.startedAt <= 0)
  {
    return false;
  }

  return now - pending.startedAt >= APPLICATION_ENVELOPE_TRAVEL_MS;
}

export function getApplicationProgress(pending: PendingApplication, now = Date.now()): number
{
  const totalMs = getApplicationProcessingTotalMs(pending);
  if (totalMs <= 0)
  {
    return 1;
  }

  return Math.min(1, (now - pending.startedAt) / totalMs);
}

export function isApplicationReady(pending: PendingApplication, now = Date.now()): boolean
{
  if (pending.startedAt <= 0)
  {
    return false;
  }

  return now - pending.startedAt >= getApplicationProcessingTotalMs(pending);
}

export function processPendingApplications(
  pendingApplications: PendingApplication[],
  now = Date.now(),
): {
  resolved: PendingApplication | null;
  remaining: PendingApplication[];
}
{
  return processFirstReadyItem(pendingApplications, isApplicationReady, now);
}
