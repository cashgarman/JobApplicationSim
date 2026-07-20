import { useEffect, useMemo, useState } from 'react';
import { getHireSituationMessages, getHireSituationTier } from '../game/hireSituation';

export function useHireSituationMessage(positionsFilled: number, peakDespair: number): string
{
  const tier = useMemo(() => getHireSituationTier(peakDespair), [peakDespair]);
  const messages = useMemo(
    () => getHireSituationMessages(positionsFilled, peakDespair),
    [positionsFilled, peakDespair],
  );
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() =>
  {
    setMessageIndex(0);
  }, [tier, positionsFilled]);

  useEffect(() =>
  {
    const interval = setInterval(() =>
    {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [messages]);

  return messages[messageIndex] ?? messages[0];
}
