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
        label="AI Money Burned"
        value={formatCurrency(employer.aiRecruitmentSpend)}
        highlight="red"
      />
      <StatRow
        label="Roles Actually Filled"
        value={formatNumber(employer.positionsFilled)}
        highlight={employer.positionsFilled > 0 ? 'green' : 'red'}
      />
      <StatRow label="Revenue (Shrinking)" value={formatCurrency(employer.revenue)} />
      <StatRow
        label="Debt"
        value={formatCurrency(employer.debt)}
        highlight={employer.debt > 0 ? 'red' : undefined}
      />
      <StatRow label="Open Roles (Growing)" value={formatNumber(employer.openRoles)} highlight="amber" />
    </div>
  );
}
