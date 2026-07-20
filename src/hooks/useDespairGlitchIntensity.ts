const DESPAIR_GLITCH_THRESHOLD = 75;

export function getDespairGlitchIntensity(despair: number): number
{
  const clamped = Math.max(0, Math.min(100, despair));
  if (clamped < DESPAIR_GLITCH_THRESHOLD)
  {
    return 0;
  }

  const normalized = (clamped - DESPAIR_GLITCH_THRESHOLD) / (100 - DESPAIR_GLITCH_THRESHOLD);
  return Math.pow(normalized, 1.1);
}

export function useDespairGlitchIntensity(despair: number): number
{
  return getDespairGlitchIntensity(despair);
}
