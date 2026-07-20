import { formatCurrency, formatNumber } from '../game/formulas';
import { useGameStore } from '../store/gameStore';

interface StatRowProps
{
  label: string;
  value: string;
  highlight?: 'red' | 'amber' | 'green';
}

function StatRow({ label, value, highlight }: StatRowProps)
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
    <div className="flex justify-between py-1 text-xs lg:text-sm">
      <span className="text-corp-muted">{label}</span>
      <span className={`stat-value font-semibold ${colorClass}`}>{value}</span>
    </div>
  );
}

export function SeekerStats()
{
  const seeker = useGameStore((s) => s.state.seeker);

  return (
    <div className="rounded border border-corp-green/50 bg-corp-panel p-3">
      <StatRow
        label="$ Savings"
        value={formatCurrency(seeker.savings)}
        highlight={seeker.savings < 500 ? 'red' : undefined}
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
