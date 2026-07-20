import type { CSSProperties, ElementType } from 'react';
import { getScreenGlitchOptions, screenGlitchConfig } from '../config/screenGlitch';
import { GlitchText } from './GlitchText';

interface ScreenGlitchTextProps
{
  text: string;
  className?: string;
  as?: ElementType;
}

export function ScreenGlitchText({
  text,
  className = '',
  as: Tag = 'span',
}: ScreenGlitchTextProps)
{
  const intensity = screenGlitchConfig.intensity;

  return (
    <Tag
      className={`despair-glitch-text ${className}`}
      style={{ '--glitch-intensity': intensity } as CSSProperties}
    >
      <GlitchText
        text={text}
        intensity={intensity}
        options={getScreenGlitchOptions()}
      />
    </Tag>
  );
}
