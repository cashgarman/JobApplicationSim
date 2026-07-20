import { useGameStore } from '../store/gameStore';
import { BinaryRainBackground } from './BinaryRainBackground';

const TYPE_COLORS: Record<string, string> = {
  rejection: 'text-corp-red',
  aiInterview: 'text-corp-amber',
  humanInterview: 'text-corp-green',
  employer: 'text-corp-muted',
  seeker: 'text-corp-green',
  neutral: 'text-corp-text',
};

const SYSTEM_LOG_TYPES = new Set([
  'rejection',
  'aiInterview',
  'humanInterview',
  'employer',
  'seeker',
]);

const COMPACT_LOG_COLORS: Record<string, string> = {
  rejection: 'text-gray-200',
  aiInterview: 'text-amber-200',
  humanInterview: 'text-emerald-300',
  employer: 'text-blue-200',
  seeker: 'text-green-200',
  neutral: 'text-corp-text',
};

interface EventFeedProps
{
  compact?: boolean;
}

export function EventFeed({ compact = false }: EventFeedProps)
{
  const feedEvents = useGameStore((s) => s.feedEvents);
  const visibleEvents = compact
    ? feedEvents.filter((event) => SYSTEM_LOG_TYPES.has(event.type)).slice(0, 8)
    : feedEvents.slice(0, 8);

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded border border-corp-border bg-corp-bg">
      {compact && <BinaryRainBackground />}
      <h3 className="font-pixel relative z-10 shrink-0 border-b border-corp-border bg-corp-bg/50 px-3 py-2 text-[10px] text-corp-muted backdrop-blur-[1px] lg:text-xs">
        {compact ? 'System Log' : 'Event Feed'}
      </h3>
      <div
        className={`relative z-10 min-h-0 flex-1 overflow-hidden px-3 backdrop-blur-[0.5px] ${
          compact ? 'flex flex-col bg-corp-bg/55 py-2' : 'bg-corp-bg/30 py-2'
        }`}
      >
        {visibleEvents.length === 0 ? (
          <p className="text-xs text-corp-muted italic lg:text-sm">
            Awaiting applications to shred...
          </p>
        ) : compact ? (
          <div className="event-feed-scroll flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto">
            {visibleEvents.map((event) => (
              <p
                key={event.id}
                className={`rounded-sm border-b border-corp-border/40 bg-corp-bg/35 py-1 text-xs leading-snug break-words whitespace-normal last:border-0 lg:text-sm ${COMPACT_LOG_COLORS[event.type] ?? 'text-corp-text'}`}
              >
                {event.message}
              </p>
            ))}
          </div>
        ) : (
          visibleEvents.map((event) => (
            <p
              key={event.id}
              className={`relative mb-1.5 break-words border-b border-corp-border/50 pb-1.5 text-xs leading-relaxed whitespace-normal last:border-0 lg:text-sm ${TYPE_COLORS[event.type] ?? 'text-corp-text'}`}
            >
              {event.message}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
