export interface FlyPoint
{
  x: number;
  y: number;
}

export const PIPELINE_ANCHORS = {
  seekerApply: '[data-pipeline-anchor="seeker-apply"]',
  processorSlot: '[data-pipeline-anchor="processor-slot"]',
  employerPostRole: '[data-pipeline-anchor="employer-post-role"]',
  roleProcessorSlot: '[data-pipeline-anchor="role-processor-slot"]',
} as const;

export function getPipelineAnchorPoint(anchor: string): FlyPoint | null
{
  const element = document.querySelector(anchor);
  const overlay = document.querySelector('.pipeline-overlay');

  if (!element || !overlay)
  {
    return null;
  }

  const elementRect = element.getBoundingClientRect();
  const overlayRect = overlay.getBoundingClientRect();

  return {
    x: elementRect.left + elementRect.width / 2 - overlayRect.left,
    y: elementRect.top + elementRect.height / 2 - overlayRect.top,
  };
}

export function getApplicationFlyCoords(
  path: 'seekerToProcessor' | 'processorToSeeker',
): { flyFrom: FlyPoint; flyTo: FlyPoint } | null
{
  const fromAnchor = path === 'seekerToProcessor'
    ? PIPELINE_ANCHORS.seekerApply
    : PIPELINE_ANCHORS.processorSlot;
  const toAnchor = path === 'seekerToProcessor'
    ? PIPELINE_ANCHORS.processorSlot
    : PIPELINE_ANCHORS.seekerApply;
  const flyFrom = getPipelineAnchorPoint(fromAnchor);
  const flyTo = getPipelineAnchorPoint(toAnchor);

  if (!flyFrom || !flyTo)
  {
    return null;
  }

  return { flyFrom, flyTo };
}

export function getRolePostFlyCoords(
  path: 'employerToRoleProcessor' | 'roleProcessorToEmployer',
): { flyFrom: FlyPoint; flyTo: FlyPoint } | null
{
  const fromAnchor = path === 'employerToRoleProcessor'
    ? PIPELINE_ANCHORS.employerPostRole
    : PIPELINE_ANCHORS.roleProcessorSlot;
  const toAnchor = path === 'employerToRoleProcessor'
    ? PIPELINE_ANCHORS.roleProcessorSlot
    : PIPELINE_ANCHORS.employerPostRole;
  const flyFrom = getPipelineAnchorPoint(fromAnchor);
  const flyTo = getPipelineAnchorPoint(toAnchor);

  if (!flyFrom || !flyTo)
  {
    return null;
  }

  return { flyFrom, flyTo };
}
