import { formatCurrency, getAgencyStats } from '../game/formulas';
import { useGameStore } from '../store/gameStore';
import { EventFeed } from './EventFeed';

interface AgencyStatRowProps
{
  label: string;
  value: string;
  highlight?: 'profit' | 'bad' | 'muted';
}

function AgencyStatRow({ label, value, highlight }: AgencyStatRowProps)
{
  const colorClass =
    highlight === 'profit'
      ? 'text-corp-green'
      : highlight === 'bad'
        ? 'text-corp-red'
        : 'text-corp-text';

  return (
    <div className="flex justify-between gap-2 py-1 text-xs lg:text-sm">
      <span className="text-corp-muted">{label}</span>
      <span className={`stat-value text-right font-semibold ${colorClass}`}>{value}</span>
    </div>
  );
}

export function AILayerColumn()
{
  const state = useGameStore((s) => s.state);
  const agency = getAgencyStats(state);
  const thriving = agency.agencyProfit > 500;

  return (
    <div
      className={`column-panel relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded border bg-corp-panel p-2 lg:p-3 ${
        thriving
          ? 'border-corp-green/50 agency-profit-glow'
          : 'border-corp-amber/40'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 rounded bg-red-500/30" />
      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <div className="shrink-0 text-center">
          <div className="agency-icon mb-1 inline-block">
            <i className="fa-solid fa-hand-holding-dollar text-2xl text-corp-green lg:text-3xl" />
          </div>
          <h2 className="font-pixel text-xs text-corp-amber lg:text-sm">Recruitment Agencies</h2>
          <p className="text-sm text-corp-green lg:text-base">profiting from failure</p>
        </div>

        <div className="mt-2 shrink-0 rounded border border-corp-border bg-corp-bg p-3 text-xs lg:text-sm">
          <AgencyStatRow
            label="Agency Profit"
            value={formatCurrency(agency.agencyProfit)}
            highlight="profit"
          />
          <AgencyStatRow
            label="Total Billed"
            value={formatCurrency(agency.totalBilled)}
          />
          <AgencyStatRow
            label="Profit Margin"
            value={`${agency.profitMargin}%`}
            highlight="profit"
          />
          <AgencyStatRow
            label="Apps Monetized"
            value={agency.applicationsMonetized.toLocaleString()}
          />
          <AgencyStatRow
            label="Placements Made"
            value={agency.placementsMade.toLocaleString()}
            highlight="bad"
          />
          <AgencyStatRow
            label="Cost Per Hire"
            value={agency.costPerHire}
            highlight="bad"
          />
          <AgencyStatRow
            label="Subscriptions Sold"
            value={agency.activeSubscriptions.toLocaleString()}
            highlight="profit"
          />
          <AgencyStatRow
            label="Humanity Blocked"
            value={agency.humanityBlocked.toLocaleString()}
            highlight="bad"
          />
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center gap-1.5 border-y border-corp-border/50 py-3 text-center">
          <i className="fa-solid fa-scale-unbalanced text-2xl text-corp-amber opacity-90 lg:text-3xl" />
          <p className="text-xs text-corp-muted lg:text-sm">
            Seekers apply. Employers post. Agencies profit. Humanity optional.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <EventFeed compact />
        </div>
      </div>
    </div>
  );
}
