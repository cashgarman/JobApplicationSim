import type { CSSProperties } from 'react';
import { getScreenGlitchOptions } from '../config/screenGlitch';
import { DESPAIR_MAX } from '../game/constants';
import { useValueChangeFlash } from '../hooks/useValueChangeFlash';
import { useGameStore } from '../store/gameStore';
import { GlitchText } from './GlitchText';

function DespairBar({
  value,
  fillClass,
  fillDirection,
}: {
  value: number;
  fillClass: string;
  fillDirection: 'ltr' | 'rtl';
})
{
  const percent = Math.min(100, (value / DESPAIR_MAX) * 100);
  const isCritical = percent >= 85;
  const chevronCount = percent <= 0
    ? 0
    : Math.min(4, Math.max(1, Math.ceil(percent / 22)));
  const chevronIcon = fillDirection === 'ltr' ? 'fa-chevron-right' : 'fa-chevron-left';

  return (
    <div className="min-w-0 flex-1">
      <div
        className={`relative flex h-8 overflow-hidden rounded border border-corp-border bg-corp-bg lg:h-9 ${
          fillDirection === 'rtl' ? 'justify-end' : ''
        }`}
      >
        <div
          className={`relative h-full transition-all duration-500 ${
            fillDirection === 'rtl' ? 'ml-auto' : ''
          }`}
          style={{ width: `${percent}%` }}
        >
          <div
            className={`absolute inset-0 ${fillClass} ${isCritical ? 'animate-pulse' : ''}`}
          />
          {chevronCount > 0 && (
            <div
              className={`despair-chevron-strip despair-chevron-strip--${fillDirection}`}
              style={{
                '--despair-chevron-speed': `${Math.max(0.3, 1 - percent / 120)}s`,
                '--despair-chevron-opacity': `${0.4 + (percent / 100) * 0.6}`,
              } as CSSProperties}
            >
              {Array.from({ length: chevronCount }, (_, index) => (
                <i
                  key={index}
                  className={`fa-solid ${chevronIcon} despair-chevron`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  aria-hidden
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DespairHeader({ intensity, flash }: { intensity: number; flash: boolean })
{
  return (
    <div
      className={`despair-header despair-glitch-text px-4 ${
        flash ? 'despair-label-flash' : ''
      }`}
      style={{ '--glitch-intensity': intensity } as CSSProperties}
      aria-hidden
    >
      <GlitchText
        text="DESPAIR"
        intensity={intensity}
        options={getScreenGlitchOptions()}
      />
    </div>
  );
}

const DESPAIR_HEADER_VISIBILITY_THRESHOLD = 30;

function getDespairHeaderOpacity(seekerDespair: number, employerDespair: number): number
{
  const averagePercent = ((seekerDespair + employerDespair) / 2 / DESPAIR_MAX) * 100;

  if (averagePercent < DESPAIR_HEADER_VISIBILITY_THRESHOLD)
  {
    return 0;
  }

  return Math.min(
    1,
    (averagePercent - DESPAIR_HEADER_VISIBILITY_THRESHOLD)
      / (100 - DESPAIR_HEADER_VISIBILITY_THRESHOLD),
  );
}

export function DespairBars()
{
  const seekerDespair = useGameStore((s) => s.state.seekerDespair);
  const employerDespair = useGameStore((s) => s.state.employerDespair);
  const maxDespair = Math.max(seekerDespair, employerDespair);
  const headerOpacity = getDespairHeaderOpacity(seekerDespair, employerDespair);
  const glitchIntensity = headerOpacity <= 0
    ? 0
    : Math.min(1, 0.25 + (maxDespair / DESPAIR_MAX) * 0.75);
  const despairFlashing = useValueChangeFlash(maxDespair, 'rise');

  return (
    <div className="rounded border border-corp-border bg-corp-panel px-3 py-2.5">
      <div className="mb-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <span className="despair-bar-label despair-bar-label--seeker column-header__title font-pixel truncate text-corp-green seeker-sigh">
          Job Seekers
        </span>
        <div
          className="transition-opacity duration-500"
          style={{ opacity: headerOpacity }}
        >
          <DespairHeader intensity={glitchIntensity} flash={despairFlashing} />
        </div>
        <span className="despair-bar-label despair-bar-label--employer column-header__title font-pixel truncate text-right text-corp-green employer-bleed-text">
          Companies
        </span>
      </div>
      <div className="flex items-end gap-2">
        <DespairBar
          value={seekerDespair}
          fillClass="bg-gradient-to-r from-purple-900 to-corp-red"
          fillDirection="ltr"
        />
        <DespairBar
          value={employerDespair}
          fillClass="bg-gradient-to-l from-orange-900 to-corp-amber"
          fillDirection="rtl"
        />
      </div>
    </div>
  );
}
