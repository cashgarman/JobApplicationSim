import { getIconClass, getPathAnimationClass, getPipelineIconStyle, useAnimationStore } from '../store/animationStore';

export function PipelineOverlay()
{
  const pipelineIcons = useAnimationStore((s) => s.pipelineIcons);

  return (
    <div className="pipeline-overlay pointer-events-none absolute inset-0 z-20 overflow-hidden">
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
