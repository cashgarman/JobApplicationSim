import { useMemo } from 'react';
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
    'Recruiters ghost. Algorithms judge. Agencies invoice.',
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
    'Every rejected candidate still cost you money. The agency still got paid.',
  ];
}

export function DirePanel({ side }: DirePanelProps)
{
  const state = useGameStore((s) => s.state);
  const lines = useMemo(
    () =>
      side === 'seeker'
        ? getSeekerLines(state.seeker)
        : getEmployerLines(state.employer),
    [side, state.seeker, state.employer],
  );

  const accentClass = side === 'seeker' ? 'border-corp-red/40' : 'border-corp-amber/40';
  const titleClass = side === 'seeker' ? 'text-corp-red' : 'text-corp-amber';

  return (
    <div className={`mt-3 flex min-h-0 flex-1 flex-col rounded border ${accentClass} bg-corp-bg/80 p-3`}>
      <h3 className={`font-pixel mb-2 text-[10px] ${titleClass} lg:text-xs`}>
        {side === 'seeker' ? 'The Seeker\'s Reality' : 'The Employer\'s Trap'}
      </h3>
      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 text-xs leading-relaxed text-corp-muted lg:text-sm">
        {lines.map((line) => (
          <li key={line} className="border-b border-corp-border/40 pb-2 last:border-0">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
