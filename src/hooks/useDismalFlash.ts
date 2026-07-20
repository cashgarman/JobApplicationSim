import { useEffect, useState } from 'react';
import { useAnimationStore } from '../store/animationStore';

const FLASH_MS = 700;

export function useDismalFlash(side: 'seeker' | 'employer'): boolean
{
  const pulse = useAnimationStore((s) =>
    side === 'seeker' ? s.seekerDismayPulse : s.employerDismayPulse,
  );
  const [flashing, setFlashing] = useState(false);

  useEffect(() =>
  {
    if (pulse === 0)
    {
      return;
    }

    setFlashing(true);
    const timer = setTimeout(() => setFlashing(false), FLASH_MS);
    return () => clearTimeout(timer);
  }, [pulse]);

  return flashing;
}
