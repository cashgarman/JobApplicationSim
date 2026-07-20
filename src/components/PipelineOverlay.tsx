import type { FloatTextColumn, FloatTextTone } from '../game/types';
import {
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
  if (text.phase === 'linger' && text.path === 'aiToSeeker')
  {
    return 'float-text-linger float-text-linger--seeker';
  }

  if (text.phase === 'linger' && text.path === 'employerToAi')
  {
    return 'float-text-linger float-text-linger--employer';
  }

  return getFloatPathAnimationClass(text.path);
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
      {pipelineIcons.map((icon) => (
        <div
          key={icon.id}
          className={`pipeline-icon absolute ${getPathAnimationClass(icon.path)}`}
          style={getPipelineIconStyle(icon)}
          title={icon.message}
        >
          <i className={`text-2xl ${getIconClass(icon.kind)}`} />
        </div>
      ))}
    </div>
  );
}
