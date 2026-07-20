import type { CSSProperties, ElementType } from 'react';
import type { GlitchTextOptions } from './GlitchText';
import { getScreenGlitchOptions, screenGlitchConfig } from '../config/screenGlitch';
import { GlitchText } from './GlitchText';

interface ScreenGlitchTextProps
{
  text: string;
  className?: string;
  as?: ElementType;
  hovered?: boolean;
  hoverOptions?: GlitchTextOptions;
  hoverSpeedMultiplier?: number;
}

export function ScreenGlitchText({
  text,
  className = '',
  as: Tag = 'span',
  hovered = false,
  hoverOptions,
  hoverSpeedMultiplier,
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
        hovered={hovered}
        hoverOptions={hoverOptions}
        hoverSpeedMultiplier={hoverSpeedMultiplier}
      />
    </Tag>
  );
}
