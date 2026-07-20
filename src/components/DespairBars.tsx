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
        className={`mb-1 flex items-center justify-between gap-2 ${
          alignLabel === 'right' ? 'flex-row-reverse' : ''
        }`}
      >
        <span className="font-pixel truncate text-[9px] text-corp-muted lg:text-[10px]">
          {label}
        </span>
        <span className={`shrink-0 text-[9px] lg:text-[10px] ${isCritical ? 'text-corp-red' : 'text-corp-muted'}`}>
          {Math.floor(value)}%
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

  return (
    <div className="rounded border border-corp-border bg-corp-panel px-3 py-2.5">
      <p className="font-pixel mb-2 text-center text-[9px] text-corp-red lg:text-[10px]">
        Despair Meter — rising inevitably
      </p>
      <div className="flex items-stretch gap-1 sm:gap-2">
        <DespairBar
          label="Job Seeker"
          value={seekerDespair}
          fillClass="bg-gradient-to-r from-purple-900 to-corp-red"
          fillDirection="ltr"
          alignLabel="left"
        />
        <div className="w-px shrink-0 self-stretch bg-corp-border/80" aria-hidden />
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
