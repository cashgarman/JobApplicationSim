export function getDespairGlitchIntensity(despair: number): number
{
  const normalized = Math.max(0, (despair - 25) / 75);
  return Math.pow(normalized, 1.4);
}

export function useDespairGlitchIntensity(despair: number): number
{
  return getDespairGlitchIntensity(despair);
}
