import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

interface InstantTooltipProps
{
  text: string;
  icon: string;
  children: ReactNode;
}

export function InstantTooltip({ text, icon, children }: InstantTooltipProps)
{
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const clampToViewport = useCallback((x: number, y: number) =>
  {
    const tooltip = tooltipRef.current;
    const padding = 10;
    const width = tooltip?.offsetWidth ?? 320;
    const height = tooltip?.offsetHeight ?? 80;

    let left = x;
    let top = y;

    if (left + width > window.innerWidth - padding)
    {
      left = window.innerWidth - width - padding;
    }
    if (top + height > window.innerHeight - padding)
    {
      top = window.innerHeight - height - padding;
    }

    left = Math.max(padding, left);
    top = Math.max(padding, top);

    return { left, top };
  }, []);

  useLayoutEffect(() =>
  {
    if (!visible)
    {
      setPosition(null);
      return;
    }

    setPosition(clampToViewport(cursor.x, cursor.y));
  }, [visible, cursor, text, clampToViewport]);

  useEffect(() =>
  {
    if (!visible)
    {
      return;
    }

    const hideOnScroll = () =>
    {
      setVisible(false);
    };

    window.addEventListener('scroll', hideOnScroll, true);
    return () => window.removeEventListener('scroll', hideOnScroll, true);
  }, [visible]);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) =>
  {
    setCursor({ x: event.clientX, y: event.clientY });
    setVisible(true);
  };

  const hide = () =>
  {
    setVisible(false);
  };

  return (
    <>
      <div
        className="w-full"
        onMouseEnter={handleMouseMove}
        onMouseMove={handleMouseMove}
        onMouseLeave={hide}
      >
        {children}
      </div>
      {visible
        && createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            className="instant-tooltip"
            style={{
              top: position?.top ?? cursor.y,
              left: position?.left ?? cursor.x,
              visibility: position ? 'visible' : 'hidden',
            }}
          >
            <i className={`${icon} instant-tooltip-icon`} aria-hidden="true" />
            <span className="instant-tooltip-text">{text}</span>
          </div>,
          document.body,
        )}
    </>
  );
}

function getUpgradeIcon(
  item: { id: string; side: string },
  isGenerator: boolean,
): string
{
  if (isGenerator)
  {
    return item.side === 'seeker'
      ? 'fa-solid fa-paper-plane'
      : 'fa-solid fa-user-group';
  }

  const icons: Record<string, string> = {
    keywordStuffing: 'fa-solid fa-key',
    aiResumeRewriter: 'fa-solid fa-robot',
    linkedinPremium: 'fa-brands fa-linkedin',
    openToWork: 'fa-solid fa-id-badge',
    bootcampCert: 'fa-solid fa-graduation-cap',
    aiScreener: 'fa-solid fa-filter',
    experienceFilter: 'fa-solid fa-clock-rotate-left',
    cultureQuiz: 'fa-solid fa-clipboard-question',
    ghostJob: 'fa-solid fa-ghost',
    linkedinBot: 'fa-brands fa-linkedin',
    indeedBot: 'fa-solid fa-magnifying-glass',
    hrIntern: 'fa-solid fa-mug-hot',
    outsourcedRecruiter: 'fa-solid fa-headset',
  };

  return icons[item.id] ?? 'fa-solid fa-circle-info';
}

export { getUpgradeIcon };
