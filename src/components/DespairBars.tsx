import { useEffect, useRef, useState } from 'react';
import { DESPAIR_MAX } from '../game/constants';
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
        className={`flex h-3 overflow-hidden rounded border border-corp-border bg-corp-bg ${
          fillDirection === 'rtl' ? 'justify-end' : ''
        }`}
      >
        <div
          className={`h-full transition-all duration-500 ${fillClass} ${isCritical ? 'animate-pulse' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function DespairBars()
{
  const seekerDespair = useGameStore((s) => s.state.seekerDespair);
  const employerDespair = useGameStore((s) => s.state.employerDespair);
  const [isHit, setIsHit] = useState(false);
  const previousDespair = useRef({ seeker: seekerDespair, employer: employerDespair });

  useEffect(() =>
  {
    const seekerGained = seekerDespair > previousDespair.current.seeker;
    const employerGained = employerDespair > previousDespair.current.employer;

    if (seekerGained || employerGained)
    {
      setIsHit(true);
      const timeout = setTimeout(() => setIsHit(false), 700);
      previousDespair.current = { seeker: seekerDespair, employer: employerDespair };
      return () => clearTimeout(timeout);
    }

    previousDespair.current = { seeker: seekerDespair, employer: employerDespair };
  }, [seekerDespair, employerDespair]);

  const peakDespair = Math.max(seekerDespair, employerDespair);
  const isCritical = peakDespair >= 85;

  return (
    <div className="rounded border border-corp-border bg-corp-panel px-3 py-2.5">
      <div className="flex items-end gap-2">
        <DespairBar
          label="Job Seeker"
          value={seekerDespair}
          fillClass="bg-gradient-to-r from-purple-900 to-corp-red"
          fillDirection="ltr"
          alignLabel="left"
        />
        <div className="flex shrink-0 flex-col items-center justify-end self-stretch px-1 pb-0.5">
          <span
            className={`despair-label font-pixel text-[9px] lg:text-[10px] ${
              isHit ? 'despair-label-hit' : ''
            } ${isCritical ? 'text-corp-red' : 'text-corp-muted'}`}
          >
            DISPAIR
          </span>
        </div>
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
