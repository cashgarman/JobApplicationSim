import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CSSProperties } from 'react';
import { economyConfig } from '../config/economy';
import { DESPAIR_FLAVOR_TIERS, pickRandom } from '../game/constants';
import { useGameStore } from '../store/gameStore';

const TICKER_ANIMATION_NAME = 'led-ticker-scroll';

interface TickerItem
{
  id: number;
  text: string;
  style: CSSProperties;
}

function getDespairTier(peakDespair: number)
{
  let tier = DESPAIR_FLAVOR_TIERS[0];
  for (const candidate of DESPAIR_FLAVOR_TIERS)
  {
    if (peakDespair >= candidate.min)
    {
      tier = candidate;
    }
  }
  return tier;
}

function pickTierMessage(messages: string[], exclude?: string): string
{
  const pool = exclude && messages.length > 1
    ? messages.filter((message) => message !== exclude)
    : messages;

  return pickRandom(pool);
}

function measureTextWidth(measureEl: HTMLSpanElement, text: string): number
{
  measureEl.textContent = text;

  return Math.max(
    measureEl.scrollWidth,
    measureEl.offsetWidth,
    measureEl.getBoundingClientRect().width,
  );
}

function getTickerDurationSec(trackWidth: number, textWidth: number): number
{
  const distance = trackWidth + textWidth;
  return distance / economyConfig.tickerScrollSpeedPxPerSec;
}

function getNextSpawnDelayMs(textWidth: number): number
{
  const gap = economyConfig.tickerMessageGapPx;
  const speed = economyConfig.tickerScrollSpeedPxPerSec;
  return ((textWidth + gap) / speed) * 1000;
}

export function DespairFlavorTicker()
{
  const seekerDespair = useGameStore((s) => s.state.seekerDespair);
  const employerDespair = useGameStore((s) => s.state.employerDespair);
  const peakDespair = Math.max(seekerDespair, employerDespair);

  const tier = useMemo(() => getDespairTier(peakDespair), [peakDespair]);
  const tierRef = useRef(tier);
  tierRef.current = tier;

  const trackRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const nextItemIdRef = useRef(0);
  const spawnTimeoutRef = useRef(0);
  const lastSpawnedTextRef = useRef('');

  const [items, setItems] = useState<TickerItem[]>([]);
  const [trackReady, setTrackReady] = useState(false);

  const clearSpawnTimeout = useCallback(() =>
  {
    if (spawnTimeoutRef.current)
    {
      window.clearTimeout(spawnTimeoutRef.current);
      spawnTimeoutRef.current = 0;
    }
  }, []);

  const removeItem = useCallback((id: number) =>
  {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const spawnMessage = useCallback((exclude?: string) =>
  {
    const track = trackRef.current;
    const measure = measureRef.current;

    if (!track || !measure)
    {
      return false;
    }

    const trackWidth = track.clientWidth;
    const text = pickTierMessage(tierRef.current.messages, exclude);
    const textWidth = measureTextWidth(measure, text);

    if (trackWidth <= 0 || textWidth <= 0)
    {
      return false;
    }

    const duration = getTickerDurationSec(trackWidth, textWidth);
    const id = nextItemIdRef.current + 1;
    nextItemIdRef.current = id;
    lastSpawnedTextRef.current = text;

    const style = {
      '--ticker-start': `${trackWidth}px`,
      '--ticker-end': `${-textWidth}px`,
      '--ticker-duration': `${duration}s`,
    } as CSSProperties;

    setItems((current) => [...current, { id, text, style }]);

    clearSpawnTimeout();
    spawnTimeoutRef.current = window.setTimeout(() =>
    {
      spawnMessage(lastSpawnedTextRef.current);
    }, getNextSpawnDelayMs(textWidth));

    return true;
  }, [clearSpawnTimeout]);

  const trySpawnMessage = useCallback((exclude?: string) =>
  {
    if (spawnMessage(exclude))
    {
      return;
    }

    void document.fonts.ready.then(() =>
    {
      spawnMessage(exclude);
    });
  }, [spawnMessage]);

  useLayoutEffect(() =>
  {
    const track = trackRef.current;

    if (!track)
    {
      return;
    }

    const updateReady = () =>
    {
      setTrackReady(track.clientWidth > 0);
    };

    updateReady();

    const resizeObserver = new ResizeObserver(updateReady);
    resizeObserver.observe(track);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() =>
  {
    if (!trackReady)
    {
      return;
    }

    setItems([]);
    clearSpawnTimeout();
    trySpawnMessage();

    return () =>
    {
      clearSpawnTimeout();
    };
  // Start once the track has measurable width.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackReady]);

  const handleAnimationEnd = (event: React.AnimationEvent<HTMLSpanElement>, id: number) =>
  {
    if (event.currentTarget !== event.target)
    {
      return;
    }

    if (!event.animationName.includes(TICKER_ANIMATION_NAME))
    {
      return;
    }

    removeItem(id);
  };

  return (
    <div className="led-ticker-tape min-w-0 flex-1">
      <div className="led-ticker-tape__screen">
        <div className="led-ticker-tape__scanlines" aria-hidden="true" />
        <div ref={trackRef} className="led-ticker-tape__track">
          <span
            ref={measureRef}
            className="led-ticker-tape__glyphs led-ticker-tape__glyphs--measure"
            aria-hidden="true"
          />
          {items.map((item) => (
            <span
              key={item.id}
              className="led-ticker-tape__glyphs led-ticker-tape__glyphs--live led-ticker-tape__glyphs--scrolling"
              style={item.style}
              onAnimationEnd={(event) => handleAnimationEnd(event, item.id)}
            >
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
