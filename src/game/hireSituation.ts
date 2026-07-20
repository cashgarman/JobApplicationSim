export interface HireSituationTier
{
  minDespair: number;
  messages: (hires: number) => string[];
}

export const HIRE_SITUATION_FLAVOR_TIERS: HireSituationTier[] = [
  {
    minDespair: 0,
    messages: (hires) => [
      `${formatHireCount(hires)}. The funnel is open. So is the wound.`,
      `${formatHireCount(hires)}. Everyone is hiring. Nobody is hiring you.`,
      `${formatHireCount(hires)}. Optimism detected. Please disable.`,
    ],
  },
  {
    minDespair: 25,
    messages: (hires) => [
      `${formatHireCount(hires)}. Rejections are trending upward.`,
      `${formatHireCount(hires)}. The ATS is warming up.`,
      `${formatHireCount(hires)}. Hope is still refundable. Barely.`,
    ],
  },
  {
    minDespair: 50,
    messages: (hires) => [
      `${formatHireCount(hires)}. Morale is a line item now.`,
      `${formatHireCount(hires)}. Both sides are bleeding money.`,
      `${formatHireCount(hires)}. Agencies report record engagement.`,
    ],
  },
  {
    minDespair: 75,
    messages: (hires) => [
      `${formatHireCount(hires)}. Human connection: packet loss.`,
      `${formatHireCount(hires)}. Systems failing. Invoices still deliver.`,
      `${formatHireCount(hires)}. This is fine. This is all fine.`,
    ],
  },
  {
    minDespair: 90,
    messages: (hires) => [
      `${formatHireCount(hires)}. TOTAL MARKET COLLAPSE IMMINENT`,
      `${formatHireCount(hires)}. NO WINNERS. ONLY SUBSCRIPTIONS.`,
      `${formatHireCount(hires)}. PLEASE HOLD. NO ONE IS COMING.`,
    ],
  },
];

export function formatHireCount(hires: number): string
{
  if (hires === 1)
  {
    return '1 hire';
  }

  return `${hires} hires`;
}

export function getHireSituationTier(peakDespair: number): HireSituationTier
{
  let tier = HIRE_SITUATION_FLAVOR_TIERS[0];

  for (const candidate of HIRE_SITUATION_FLAVOR_TIERS)
  {
    if (peakDespair >= candidate.minDespair)
    {
      tier = candidate;
    }
  }

  return tier;
}

export function getHireSituationMessages(hires: number, peakDespair: number): string[]
{
  return getHireSituationTier(peakDespair).messages(hires);
}
