import { useEffect, useMemo, useState } from 'react';
import { getHireSituationMessages, getHireSituationTier } from '../game/hireSituation';

const HIRE_SITUATION_FLASH_INTERVAL_MS = 5000;

export function useHireSituationMessage(
  positionsFilled: number,
  peakDespair: number,
): { message: string; flashKey: number }
{
  const tier = useMemo(() => getHireSituationTier(peakDespair), [peakDespair]);
  const messages = useMemo(
    () => getHireSituationMessages(positionsFilled, peakDespair),
    [positionsFilled, peakDespair],
  );
  const [messageIndex, setMessageIndex] = useState(0);
  const [flashKey, setFlashKey] = useState(0);

  useEffect(() =>
  {
    setMessageIndex(0);
  }, [tier, positionsFilled]);

  useEffect(() =>
  {
    const interval = setInterval(() =>
    {
      setMessageIndex((current) => (current + 1) % messages.length);
      setFlashKey((current) => current + 1);
    }, HIRE_SITUATION_FLASH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [messages]);

  return {
    message: messages[messageIndex] ?? messages[0],
    flashKey,
  };
}
