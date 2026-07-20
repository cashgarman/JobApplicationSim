export const QUEUE_NOT_STARTED = 0;

export interface QueueItem
{
  id: string;
  startedAt: number;
}

export function isQueueItemActive(item: QueueItem): boolean
{
  return item.startedAt > QUEUE_NOT_STARTED;
}

export function getActiveQueueItem<T extends QueueItem>(queue: T[]): T | null
{
  return queue.find(isQueueItemActive) ?? null;
}

export function activateNextInQueue<T extends QueueItem>(queue: T[]): {
  queue: T[];
  activated: T | null;
}
{
  if (getActiveQueueItem(queue))
  {
    return { queue, activated: null };
  }

  if (queue.length === 0)
  {
    return { queue, activated: null };
  }

  const activated = { ...queue[0], startedAt: Date.now() };
  return {
    queue: [activated, ...queue.slice(1)],
    activated,
  };
}

export function processFirstReadyItem<T extends QueueItem>(
  queue: T[],
  isReady: (item: T, now: number) => boolean,
  now = Date.now(),
): {
  resolved: T | null;
  remaining: T[];
}
{
  const active = getActiveQueueItem(queue);

  if (!active || !isReady(active, now))
  {
    return { resolved: null, remaining: queue };
  }

  return {
    resolved: active,
    remaining: queue.filter((item) => item.id !== active.id),
  };
}
