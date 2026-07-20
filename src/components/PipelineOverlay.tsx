import type { FloatTextColumn, FloatTextTone, PipelineIcon } from '../game/types';
import { APPLICATION_ENVELOPE_TRAVEL_MS } from '../game/applicationProcess';
import {
  getAnchoredFlyStyle,
  getFloatLingerStyle,
  getFloatPathAnimationClass,
  getIconClass,
  getPathAnimationClass,
  getPipelineIconStyle,
  useAnimationStore,
} from '../store/animationStore';

const TONE_CLASSES: Record<FloatTextTone, string> = {
  bad: 'text-corp-red',
  hope: 'text-corp-amber',
  good: 'text-corp-green',
};

const COLUMN_TONE_CLASSES: Record<FloatTextColumn, Record<FloatTextTone, string>> = {
  seeker: TONE_CLASSES,
  employer: TONE_CLASSES,
  ai: {
    bad: 'float-text-ai text-corp-amber',
    hope: 'float-text-ai text-yellow-300',
    good: 'float-text-ai text-lime-300',
  },
};

function getToneClass(column: FloatTextColumn, tone: FloatTextTone): string
{
  return COLUMN_TONE_CLASSES[column][tone];
}

function getFloatTravelClass(text: {
  phase: 'travel' | 'linger';
  path: Parameters<typeof getFloatPathAnimationClass>[0];
}): string
{
  if (text.phase === 'linger' && (text.path === 'aiToSeeker' || text.path === 'processorToSeeker'))
  {
    return 'float-text-linger float-text-linger--seeker';
  }

  if (text.phase === 'linger' && text.path === 'employerToAi')
  {
    return 'float-text-linger float-text-linger--employer';
  }

  if (text.phase === 'linger' && text.path === 'roleProcessorToEmployer')
  {
    return 'float-text-linger float-text-linger--employer';
  }

  return getFloatPathAnimationClass(text.path);
}

function isInboundProcessorInFlight(icon: PipelineIcon): boolean
{
  if (icon.path !== 'seekerToProcessor' && icon.path !== 'employerToRoleProcessor')
  {
    return true;
  }

  return Date.now() - icon.createdAt < APPLICATION_ENVELOPE_TRAVEL_MS;
}

export function PipelineOverlay()
{
  const pipelineIcons = useAnimationStore((s) => s.pipelineIcons);
  const floatTexts = useAnimationStore((s) => s.floatTexts);

  return (
    <div className="pipeline-overlay pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {floatTexts.map((text) => (
        <div
          key={text.id}
          className={`float-text-travel absolute ${getFloatTravelClass(text)}`}
          style={text.phase === 'linger' ? getFloatLingerStyle(text) : getPipelineIconStyle(text)}
        >
          <span
            className={`float-text-label font-bold uppercase tracking-wide ${
              text.phase === 'linger' ? 'float-text-label--linger' : ''
            } ${getToneClass(text.column, text.tone)}`}
          >
            {text.text}
          </span>
        </div>
      ))}
      {pipelineIcons.filter(isInboundProcessorInFlight).map((icon) =>
      {
        const hasAnchoredFly = icon.flyFrom != null && icon.flyTo != null;
        const arriveFade = icon.path === 'processorToSeeker' || icon.path === 'roleProcessorToEmployer';

        return (
          <div
            key={icon.id}
            className={`pipeline-icon absolute ${
              hasAnchoredFly
                ? `pipeline-fly-anchored${arriveFade ? ' pipeline-fly-anchored--arrive' : ''}`
                : getPathAnimationClass(icon.path, {
                    smooth: icon.kind === 'application',
                  })
            }`}
            style={hasAnchoredFly ? getAnchoredFlyStyle(icon) : getPipelineIconStyle(icon)}
            title={icon.message}
          >
            <i
              className={`${icon.kind === 'application' ? 'text-base' : 'text-2xl'} ${getIconClass(icon.kind, icon.envelopeTone)}`}
            />
          </div>
        );
      })}
    </div>
  );
}
