import type { CSSProperties } from 'react';
import { DESPAIR_MAX } from '../game/constants';
import { useHireSituationMessage } from '../hooks/useHireSituationMessage';
import { useGameStore } from '../store/gameStore';

function DespairBar({
  label,
  value,
  fillClass,
  fillDirection,
  alignLabel,
}: {
  label: string;
  value: number;
  fillClass: string;
  fillDirection: 'ltr' | 'rtl';
  alignLabel: 'left' | 'right';
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
        className={`mb-1 flex items-center ${
          alignLabel === 'right' ? 'justify-end' : 'justify-start'
        }`}
      >
        <span className="font-pixel truncate text-[9px] text-corp-muted lg:text-[10px]">
          {label}
        </span>
      </div>
      <div
        className={`relative flex h-3 overflow-hidden rounded border border-corp-border bg-corp-bg ${
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

export function DespairBars()
{
  const seekerDespair = useGameStore((s) => s.state.seekerDespair);
  const employerDespair = useGameStore((s) => s.state.employerDespair);
  const positionsFilled = useGameStore((s) => s.state.employer.positionsFilled);

  const peakDespair = Math.max(seekerDespair, employerDespair);
  const isCritical = peakDespair >= 85;
  const { message: hireSituationLabel, flashKey } = useHireSituationMessage(
    positionsFilled,
    peakDespair,
  );

  return (
    <div className="rounded border border-corp-border bg-corp-panel px-3 py-2.5">
      <div className="mb-1.5 flex w-full justify-center px-1">
        <span
          key={flashKey}
          className={`despair-label font-pixel text-center text-[8px] leading-snug lg:text-[9px] ${
            flashKey > 0 ? 'despair-label-flash' : ''
          } ${isCritical ? 'text-corp-red' : 'text-corp-muted'}`}
        >
          {hireSituationLabel}
        </span>
      </div>
      <div className="flex items-end gap-2">
        <DespairBar
          label="Job Seeker"
          value={seekerDespair}
          fillClass="bg-gradient-to-r from-purple-900 to-corp-red"
          fillDirection="ltr"
          alignLabel="left"
        />
        <DespairBar
          label="Employer"
          value={employerDespair}
          fillClass="bg-gradient-to-l from-orange-900 to-corp-amber"
          fillDirection="rtl"
          alignLabel="right"
        />
      </div>
    </div>
  );
}
