import { formatCurrency, formatNumber } from '../game/formulas';
import { useValueChangeFlash } from '../hooks/useValueChangeFlash';
import { useGameStore } from '../store/gameStore';

interface StatRowProps
{
  label: string;
  value: string;
  highlight?: 'red' | 'amber' | 'green';
  featured?: boolean;
  dropFlash?: boolean;
}

function StatRow({ label, value, highlight, featured, dropFlash }: StatRowProps)
{
  const colorClass =
    highlight === 'red'
      ? 'text-corp-red'
      : highlight === 'amber'
        ? 'text-corp-amber'
        : highlight === 'green'
          ? 'text-corp-green'
          : 'text-corp-text';

  return (
    <div
      className={`game-stat-row${featured ? ' game-stat-row--featured' : ''}${dropFlash ? ' stat-value-drop-flash' : ''}`}
    >
      <span className="text-corp-muted">{label}</span>
      <span className={`stat-value font-semibold ${colorClass}`}>{value}</span>
    </div>
  );
}

export function SeekerStats()
{
  const seeker = useGameStore((s) => s.state.seeker);
  const savingsDropFlash = useValueChangeFlash(seeker.savings, 'drop');

  return (
    <div className="side-column-stats h-full rounded border border-corp-green/50 bg-corp-panel p-2">
      <StatRow
        label="$ Savings"
        value={formatCurrency(seeker.savings)}
        highlight={seeker.savings < 500 ? 'red' : undefined}
        featured
        dropFlash={savingsDropFlash}
      />
      <StatRow
        label="Debt"
        value={formatCurrency(seeker.debt)}
        highlight={seeker.debt > 0 ? 'red' : undefined}
      />
      <StatRow label="Applications Sent" value={formatNumber(seeker.applications)} />
      <StatRow label="Rejections Received" value={formatNumber(seeker.rejections)} highlight="red" />
      <StatRow label="AI Interviews Survived" value={formatNumber(seeker.aiInterviews)} highlight="amber" />
      <StatRow
        label="Human Interviews"
        value={formatNumber(seeker.humanInterviews)}
        highlight="green"
      />
    </div>
  );
}
