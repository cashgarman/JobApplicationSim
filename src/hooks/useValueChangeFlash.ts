import { useEffect, useRef, useState } from 'react';

const FLASH_MS = 700;

type FlashDirection = 'drop' | 'rise';

export function useValueChangeFlash(value: number, direction: FlashDirection): boolean
{
  const prevRef = useRef(value);
  const [flashPulse, setFlashPulse] = useState(0);
  const [flashing, setFlashing] = useState(false);

  useEffect(() =>
  {
    const changed =
      direction === 'drop'
        ? value < prevRef.current
        : value > prevRef.current;

    if (changed)
    {
      setFlashPulse((pulse) => pulse + 1);
    }

    prevRef.current = value;
  }, [direction, value]);

  useEffect(() =>
  {
    if (flashPulse === 0)
    {
      return;
    }

    setFlashing(true);
    const timer = setTimeout(() => setFlashing(false), FLASH_MS);
    return () => clearTimeout(timer);
  }, [flashPulse]);

  return flashing;
}
