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

export function EmployerStats()
{
  const employer = useGameStore((s) => s.state.employer);
  const aiSpendFlash = useValueChangeFlash(employer.aiRecruitmentSpend, 'rise');

  return (
    <div className="side-column-stats h-full rounded border border-corp-green/50 bg-corp-panel p-2">
      <StatRow
        label="AI Money Burned"
        value={formatCurrency(employer.aiRecruitmentSpend)}
        highlight="red"
        featured
        dropFlash={aiSpendFlash}
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
