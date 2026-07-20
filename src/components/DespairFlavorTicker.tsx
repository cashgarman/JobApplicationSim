import { useEffect, useMemo, useState } from 'react';
import { DESPAIR_FLAVOR_TIERS } from '../game/constants';
import { useGameStore } from '../store/gameStore';

function getDespairTier(peakDespair: number)
{
  let tier = DESPAIR_FLAVOR_TIERS[0];
  for (const candidate of DESPAIR_FLAVOR_TIERS)
  {
    if (peakDespair >= candidate.min)
    {
      tier = candidate;
    }
  }
  return tier;
}

export function DespairFlavorTicker()
{
  const seekerDespair = useGameStore((s) => s.state.seekerDespair);
  const employerDespair = useGameStore((s) => s.state.employerDespair);
  const peakDespair = Math.max(seekerDespair, employerDespair);

  const tier = useMemo(() => getDespairTier(peakDespair), [peakDespair]);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() =>
  {
    setMessageIndex(0);
  }, [tier]);

  useEffect(() =>
  {
    const interval = setInterval(() =>
    {
      setMessageIndex((current) => (current + 1) % tier.messages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [tier]);

  const severityClass =
    peakDespair >= 90
      ? 'text-corp-red animate-pulse'
      : peakDespair >= 50
        ? 'text-corp-amber'
        : 'text-corp-muted';

  return (
    <p
      className={`font-pixel truncate px-2 text-center text-xs sm:text-sm lg:text-base ${severityClass}`}
    >
      {tier.messages[messageIndex]}
    </p>
  );
}
