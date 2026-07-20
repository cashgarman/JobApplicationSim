export interface PendingApplication
{
  id: string;
  source: 'click' | 'auto';
  ticksRemaining: number;
}

export function scheduleApplication(source: PendingApplication['source']): PendingApplication
{
  return {
    id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    source,
    ticksRemaining: Math.floor(2 + Math.random() * 5),
  };
}

export function processPendingApplications(
  pendingApplications: PendingApplication[],
): {
  resolved: PendingApplication[];
  remaining: PendingApplication[];
}
{
  const resolved: PendingApplication[] = [];
  const remaining: PendingApplication[] = [];

  for (const pending of pendingApplications)
  {
    const nextTicks = pending.ticksRemaining - 1;

    if (nextTicks <= 0)
    {
      resolved.push(pending);
      continue;
    }

    remaining.push({ ...pending, ticksRemaining: nextTicks });
  }

  return { resolved, remaining };
}
