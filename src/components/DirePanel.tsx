import type { CSSProperties } from 'react';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { DespairGlitchOverlay } from './DespairGlitchOverlay';
import { GlitchText } from './GlitchText';
import { useDespairGlitchIntensity } from '../hooks/useDespairGlitchIntensity';
import { useAnimationStore } from '../store/animationStore';
import { useGameStore } from '../store/gameStore';

interface DirePanelProps
{
  side: 'seeker' | 'employer';
}

function getSeekerLines(seeker: {
  applications: number;
  rejections: number;
  humanInterviews: number;
  savings: number;
  debt: number;
}): string[]
{
  const rejectionRate = seeker.applications > 0
    ? seeker.rejections / seeker.applications
    : 0;

  return [
    'You are not a candidate. You are traffic.',
    seeker.applications > 0
      ? `${Math.round(rejectionRate * 100)}% of your applications ended in silence or rejection.`
      : 'The ATS has not met you yet. It already dislikes you.',
    seeker.humanInterviews > 0
      ? `${seeker.humanInterviews} human interview(s). Still unemployed. Hope is a billing event.`
      : 'Human interviews are statistically negligible. The funnel is working as designed.',
    seeker.savings <= 0
      ? 'Savings: zero. Dignity: also zero.'
      : seeker.savings < 1000
        ? 'Your runway is measured in ramen packets.'
        : 'Every application costs money you do not have time to earn back.',
    seeker.debt > 0
      ? `Debt: ${Math.floor(seeker.debt).toLocaleString()}. The bank believes in you. Incorrectly.`
      : 'Loans are available when optimism runs out.',
    'Recruiters ghost. Algorithms judge. AI Recruitment invoices.',
  ];
}

function getEmployerLines(employer: {
  openRoles: number;
  positionsFilled: number;
  aiRecruitmentSpend: number;
  revenue: number;
  debt: number;
}): string[]
{
  return [
    'You need a human. The market sells you software.',
    employer.openRoles > 0
      ? `${employer.openRoles} open role(s). None are getting easier to fill.`
      : 'Post a role. Watch the applicant tsunami arrive. Hire nobody.',
    employer.positionsFilled > 0
      ? `${employer.positionsFilled} hire(s) made. The pipeline still feels broken.`
      : 'Positions filled: statistically embarrassing.',
    employer.revenue <= 0
      ? 'Revenue: gone. Open roles remain. Classic.'
      : employer.revenue < 2000
        ? 'Company revenue is bleeding out faster than you can hire.'
        : 'Every day without a hire costs money you are not making back.',
    employer.aiRecruitmentSpend > 0
      ? `$${Math.floor(employer.aiRecruitmentSpend).toLocaleString()} spent on AI recruiting. ROI: vibes.`
      : 'AI vendors are waiting to solve a problem they created.',
    employer.debt > 0
      ? `Corporate debt: ${Math.floor(employer.debt).toLocaleString()}. Growth at any cost.`
      : 'Bridge financing available. The bridge is on fire.',
    'Every rejected candidate still cost you money. AI Recruitment still got paid.',
  ];
}

export function DirePanel({ side }: DirePanelProps)
{
  const state = useGameStore((s) => s.state);
  const flavorLog = useAnimationStore((s) =>
    side === 'seeker' ? s.seekerDireFlavorLog : s.employerDireFlavorLog,
  );
  const despair = side === 'seeker' ? state.seekerDespair : state.employerDespair;
  const glitchIntensity = useDespairGlitchIntensity(despair);
  const lines = useMemo(
    () =>
      side === 'seeker'
        ? getSeekerLines(state.seeker)
        : getEmployerLines(state.employer),
    [side, state.seeker, state.employer],
  );
  const logRef = useRef<HTMLUListElement>(null);
  const lastFlavorEntryId = flavorLog[flavorLog.length - 1]?.id;

  useLayoutEffect(() =>
  {
    const log = logRef.current;
    if (!log || !lastFlavorEntryId)
    {
      return;
    }

    log.scrollTop = log.scrollHeight;
  }, [lastFlavorEntryId]);

  const accentClass = side === 'seeker' ? 'border-corp-red/40' : 'border-corp-amber/40';

  return (
    <div
      className={`relative flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded border ${accentClass} bg-corp-bg/80 p-2`}
    >
      {glitchIntensity > 0 && (
        <DespairGlitchOverlay side={side} intensity={glitchIntensity} />
      )}
      <div
        className={`relative z-10 flex min-h-0 flex-1 flex-col ${glitchIntensity > 0 ? 'despair-glitch-text' : ''}`}
        style={
          glitchIntensity > 0
            ? { '--glitch-intensity': glitchIntensity } as CSSProperties
            : undefined
        }
      >
        <ul
          ref={logRef}
          className={`dire-panel-list dire-panel-scroll dire-panel-scroll--${side} min-h-0 flex-1 text-xs text-corp-muted`}
        >
          {lines.map((line) => (
            <li
              key={line}
              className="dire-panel-line"
            >
              <GlitchText text={line} intensity={glitchIntensity} />
            </li>
          ))}
          {flavorLog.map((entry) => (
            <li
              key={entry.id}
              className={`dire-panel-line dire-panel-flavor ${
                side === 'seeker' ? 'text-corp-red' : 'text-corp-amber'
              }`}
            >
              <GlitchText text={entry.text} intensity={glitchIntensity} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
