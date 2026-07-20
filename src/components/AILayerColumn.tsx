import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { formatCurrency, getAgencyStats } from '../game/formulas';
import { getActiveQueueItem } from '../game/processingQueue';
import { useGameStore } from '../store/gameStore';
import { EventFeed } from './EventFeed';

interface AgencyStatRowProps
{
  label: string;
  value: string;
  highlight?: 'profit' | 'bad' | 'muted';
  featured?: boolean;
}

interface AgencyQueueItem
{
  id: string;
  flavorMessage: string;
  startedAt: number;
  arrivedAt: number;
  durationMs: number;
}

interface AgencyQueueIndicatorProps
{
  items: AgencyQueueItem[];
  idleTitle: string;
  idleQueueLabel: string;
  slotAnchor: string;
  slotEnvelopeIcon: string;
  iconClass: string;
  queuePulseAt: number;
}

function AgencyStatRow({ label, value, highlight, featured }: AgencyStatRowProps)
{
  const colorClass =
    highlight === 'profit'
      ? 'text-corp-green'
      : highlight === 'bad'
        ? 'text-corp-red'
        : 'text-corp-text';

  return (
    <div className={`game-stat-row${featured ? ' game-stat-row--featured' : ''}`}>
      <span className="text-corp-muted">{label}</span>
      <span className={`stat-value text-right font-semibold ${colorClass}`}>{value}</span>
    </div>
  );
}

function AgencyQueueIndicator({
  items,
  idleTitle,
  idleQueueLabel,
  slotAnchor,
  slotEnvelopeIcon,
  iconClass,
  queuePulseAt,
}: AgencyQueueIndicatorProps)
{
  const [countPulse, setCountPulse] = useState(false);
  const lastPulseAt = useRef(0);
  const queueCount = items.length;
  const slotCount = items.filter((item) => item.arrivedAt > 0).length;
  const active = getActiveQueueItem(items);
  const isIdle = queueCount === 0;
  const envelopeArrived = Boolean(active && active.arrivedAt > 0);

  useEffect(() =>
  {
    if (queuePulseAt === 0 || queuePulseAt === lastPulseAt.current)
    {
      return;
    }

    lastPulseAt.current = queuePulseAt;
    setCountPulse(true);
    const timeoutId = window.setTimeout(() => setCountPulse(false), 700);
    return () => window.clearTimeout(timeoutId);
  }, [queuePulseAt]);

  return (
    <div
      className={`agency-processing relative mt-1.5 shrink-0 overflow-visible rounded border px-2 py-1.5 ${
        isIdle
          ? 'border-corp-border/60 bg-corp-bg/50'
          : 'border-corp-amber/40 bg-corp-bg/80'
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`agency-processing-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-corp-panel ${
            isIdle
              ? 'agency-processing-icon--idle border-corp-border/60'
              : 'border-corp-amber/50'
          }`}
        >
          <i
            className={`${iconClass} text-xs ${
              isIdle ? 'text-corp-muted' : 'text-white'
            }`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-[0.72rem] font-semibold leading-tight lg:text-[0.78rem] ${
              isIdle ? 'text-corp-muted' : 'text-corp-amber'
            }`}
          >
            {isIdle ? idleTitle : active!.flavorMessage}
          </p>
          <p className="truncate text-[0.65rem] leading-tight text-corp-muted lg:text-[0.7rem]">
            {isIdle ? idleQueueLabel : '\u00A0'}
          </p>
          <div
            className="agency-processing-bar mt-1 h-1 overflow-hidden rounded-full bg-corp-border/80"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={envelopeArrived ? undefined : 0}
            aria-label="Queue processing progress"
            aria-busy={Boolean(active) && envelopeArrived}
          >
            {active && envelopeArrived && (
              <div
                key={active.id}
                className="agency-processing-bar__fill agency-processing-bar__fill--active h-full rounded-full bg-corp-amber"
                style={{ '--fill-duration': `${active.durationMs}ms` } as CSSProperties}
              />
            )}
          </div>
        </div>
        <div
          data-pipeline-anchor={slotAnchor}
          className={`agency-processing-slot flex h-9 w-9 shrink-0 items-center justify-center rounded border ${
            queueCount > 0
              ? 'agency-processing-slot--occupied border-corp-amber/60 bg-corp-panel/90'
              : 'border-corp-border/50 border-dashed bg-corp-bg/40'
          } ${countPulse ? 'agency-processing-slot--pulse' : ''}`}
          aria-hidden="true"
        >
          {queueCount > 0 && (
            <i className={`agency-processing-slot__envelope ${slotEnvelopeIcon} text-base text-white`} />
          )}
          {slotCount > 0 && (
            <span
              className={`agency-processing-slot__count ${
                countPulse ? 'agency-processing-slot__count--pulse' : ''
              }`}
            >
              x{slotCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function AILayerColumn()
{
  const state = useGameStore((s) => s.state);
  const pendingApplications = useGameStore((s) => s.pendingApplications);
  const pendingRolePosts = useGameStore((s) => s.pendingRolePosts);
  const applicationQueuePulseAt = useGameStore((s) => s.applicationQueuePulseAt);
  const roleQueuePulseAt = useGameStore((s) => s.roleQueuePulseAt);
  const agency = getAgencyStats(state);
  const thriving = agency.agencyProfit > 500;
  const isProcessing = pendingApplications.length > 0 || pendingRolePosts.length > 0;

  return (
    <div
      className={`column-panel column-panel--agency relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded border p-2 lg:p-2.5 ${
        isProcessing
          ? 'border-corp-amber/60 ai-pulse-border'
          : thriving
            ? 'border-corp-green/50 agency-profit-glow'
            : 'border-corp-amber/40'
      }`}
    >
      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <div className="column-header shrink-0">
          <div className="column-header__icon agency-icon">
            <i className="fa-solid fa-hand-holding-dollar text-xl text-corp-green lg:text-2xl" />
          </div>
          <div className="column-header__text">
            <h2 className="column-header__title font-pixel text-corp-amber">AI Recruitment</h2>
            <p className="text-xs leading-tight text-corp-green lg:text-sm">profiting from failure</p>
          </div>
        </div>

        <div className="mt-1.5 shrink-0 rounded border border-corp-border bg-corp-bg p-1.5">
          <AgencyStatRow
            label="AI Recruitment Profit"
            value={formatCurrency(agency.agencyProfit)}
            highlight="profit"
            featured
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

        <AgencyQueueIndicator
          items={pendingApplications}
          idleTitle="Awaiting applications..."
          idleQueueLabel="No applications in queue"
          slotAnchor="processor-slot"
          slotEnvelopeIcon="fa-solid fa-envelope"
          iconClass="fa-solid fa-envelope-open-text"
          queuePulseAt={applicationQueuePulseAt}
        />

        <AgencyQueueIndicator
          items={pendingRolePosts}
          idleTitle="Awaiting roles..."
          idleQueueLabel="No roles in queue"
          slotAnchor="role-processor-slot"
          slotEnvelopeIcon="fa-solid fa-envelope"
          iconClass="fa-solid fa-briefcase"
          queuePulseAt={roleQueuePulseAt}
        />

        <div className="mt-1.5 min-h-0 flex-1 overflow-hidden">
          <EventFeed compact />
        </div>
      </div>
    </div>
  );
}
