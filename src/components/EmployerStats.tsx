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

export function EmployerStats()
{
  const employer = useGameStore((s) => s.state.employer);

  return (
    <div className="rounded border border-corp-green/50 bg-corp-panel p-3">
      <StatRow
        label="AI Spend"
        value={formatCurrency(employer.aiRecruitmentSpend)}
        highlight="red"
      />
      <StatRow
        label="Positions Filled"
        value={formatNumber(employer.positionsFilled)}
        highlight="green"
      />
      <StatRow label="Revenue" value={formatCurrency(employer.revenue)} />
      <StatRow label="Open Roles" value={formatNumber(employer.openRoles)} />
    </div>
  );
}
