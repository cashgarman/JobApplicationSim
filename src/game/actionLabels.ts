import type { Perspective } from './types';

interface ActionLabelTier
{
  minDespair: number;
  seeker: string;
  employer: string;
}

const ACTION_LABEL_TIERS: ActionLabelTier[] = [
  { minDespair: 0, seeker: 'Apply', employer: 'Post Role' },
  { minDespair: 25, seeker: 'Apply Again', employer: 'Post Again' },
  { minDespair: 50, seeker: 'Keep Applying', employer: 'Keep Posting' },
  { minDespair: 75, seeker: 'Please Hire Me', employer: 'Please Apply' },
  { minDespair: 90, seeker: 'ANYTHING PLEASE', employer: 'ANYONE PLEASE' },
];

export function getActionLabel(side: Perspective, despair: number): string
{
  const clamped = Math.max(0, Math.min(100, despair));
  let label = ACTION_LABEL_TIERS[0][side];

  for (const tier of ACTION_LABEL_TIERS)
  {
    if (clamped >= tier.minDespair)
    {
      label = tier[side];
    }
  }

  return label;
}

export function getLoanOverlapProgress(despair: number): number
{
  const clamped = Math.max(0, Math.min(100, despair));
  return Math.max(0, (clamped - 75) / 25);
}
