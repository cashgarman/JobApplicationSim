export const DESPAIR_MAX = 100;
export const SEEKER_DESPAIR_PER_SEC = 0.12;
export const EMPLOYER_DESPAIR_PER_SEC = 0.1;

export const SEEKER_LOAN_AMOUNT = 2500;
export const EMPLOYER_LOAN_AMOUNT = 5000;
export const BASE_LOAN_INTEREST_PER_SEC = 0.0015;
export const LOAN_INTEREST_ESCALATION = 0.25;
export const DEBT_DESPAIR_REFERENCE = 10000;
export const DEBT_DESPAIR_PER_SEC = 0.04;
export const SEEKER_LOAN_LOW_FUNDS = 1000;
export const EMPLOYER_LOAN_LOW_FUNDS = 2000;
export const LOAN_DESPAIR_BUMP = 0.5;

export const INITIAL_SAVINGS = 5000;
export const INITIAL_REVENUE = 10000;
export const BASE_SAVINGS_DRAIN_PER_SEC = 0.5;
export const BASE_REVENUE_PER_SEC = 2;
export const REVENUE_PENALTY_PER_OPEN_ROLE = 0.05;

export const BASE_ATS = 1;
export const AI_INTERVIEW_FAIL_RATE = 0.9;
export const HUMAN_INTERVIEW_FILL_RATE = 0.001;

export const REJECTION_MESSAGES = [
  "Rejected: You have 8 years of React. Role requires 10.",
  "Rejected: PDF parsing failed. Please re-enter 12 pages manually.",
  "Rejected: Missing keyword 'synergy'.",
  "Rejected: Overqualified for this entry-level role paying $12/hr.",
  "Rejected: Underqualified. Role requires 5 years in a 2-year-old framework.",
  "Rejected: Application auto-closed. Position filled internally.",
  "Rejected: Your cover letter was 301 characters. Maximum is 300.",
  "Rejected: Gap in employment detected. Human detected.",
  "Rejected: ATS could not parse your name. Try initials only.",
  "Rejected: You live 47 miles away. Must be within 45.",
  "Rejected: Degree required. Your bootcamp doesn't count.",
  "Rejected: We went with a candidate who 'fit the culture better.'",
  "Rejected: Salary expectations too low. Suspicious.",
  "Rejected: Salary expectations too high. Budget is vibes.",
  "Rejected: You didn't answer 'What is your spirit animal?' correctly.",
  "Rejected: Resume font not ATS-compliant. Use Comic Sans.",
  "Rejected: Applied at 2:03 AM. Not a team player.",
  "Rejected: LinkedIn profile photo too professional.",
  "Rejected: Too many jobs on resume. Job hopper.",
  "Rejected: Too few jobs on resume. Lack of experience.",
  "Rejected: AI detected enthusiasm. Red flag.",
  "Rejected: You have a GitHub. We don't hire people with side projects.",
  "Rejected: You don't have a GitHub. Where's your passion?",
  "Rejected: Position closed. We forgot to take down the listing.",
  "Rejected: Thank you for your interest. (Generic template #4,847)",
];

export const AI_INTERVIEW_MESSAGES = [
  "AI Interview: Please describe synergy to a camera for 3 minutes.",
  "AI Interview: Record 47 one-way video answers. Good luck.",
  "AI Interview: Chatbot asks you to rate yourself 1-10 on humility.",
  "AI Interview: 'Tell us about a time you failed' — AI has no follow-ups.",
  "AI Interview: Smile detection failed. Try again.",
  "AI Interview: Background noise detected. Unprofessional.",
  "AI Interview: You blinked too often. Confidence score: 12%.",
  "AI Interview: Completed! Results under review for 6-8 months.",
  "AI Interview: Bot asked same question twice. You answered differently. Inconsistent.",
  "AI Interview: Voice analysis says you're 'not hungry enough.'",
];

export const AI_INTERVIEW_FAIL_MESSAGES = [
  "AI Interview failed: Algorithm decided you're not a culture fit.",
  "AI Interview failed: Your eye contact score was 34%.",
  "AI Interview failed: Response too thoughtful. Not concise enough.",
  "AI Interview failed: Ghosted after AI screen. Status: 'Under review.'",
  "AI Interview failed: Rescheduled to another AI screen. Forever.",
];

export const HUMAN_INTERVIEW_MESSAGES = [
  "Human Interview scheduled! A real person wants to talk!",
  "Human Interview: Calendar invite from an actual recruiter!",
  "Human Interview: Phone screen with a human! (Rare drop)",
];

export const HUMAN_INTERVIEW_FAIL_MESSAGES = [
  "Human Interview rescheduled to AI screen. Sorry.",
  "Human Interview cancelled. Position on hold.",
  "Human Interview: Interviewer no-showed. You'll hear back soon™.",
  "Human Interview: Great conversation! We went with someone else.",
];

export const EMPLOYER_MESSAGES = [
  "Employer: $50,000 spent on AI tools. 0 positions filled.",
  "Employer: 847 applicants. AI shortlisted 0. Role still open.",
  "Employer: Revenue down. Role open 180 days.",
  "Employer: AI says 'no qualified candidates.'",
  "Employer: Posted role. 400 applications in 1 hour. All rejected by AI.",
  "Employer: HR approved another AI subscription. Problem unsolved.",
  "Employer: Candidate had perfect qualifications. ATS score: 12%.",
  "Employer: Ghost job posting attracting thousands. Zero intent to hire.",
  "Employer: Internal candidate hired. Job listing still live.",
  "Employer: AI recommended raising requirements. Applicant pool now zero.",
];

export const NEUTRAL_MESSAGES = [
  "The grind continues.",
  "Another day, another application black hole.",
  "Somewhere, a human wants to hire a human. The AI won't allow it.",
  "Cost savings achieved. Humanity optional.",
];

export const SEEKER_LOAN_MESSAGES = [
  'Loan approved! APR: 847%. Your future self thanks you.',
  'Emergency credit extended. Interest is our love language.',
  'Personal loan disbursed. Dignity sold separately.',
  'Bridge loan secured. The bridge is collapsing.',
];

export const EMPLOYER_LOAN_MESSAGES = [
  'Bridge financing secured. Bridge is on fire.',
  'Credit line opened. Burn rate now includes interest.',
  'Working capital loan approved. Capital stopped working years ago.',
  'Corporate credit extended. Shareholders not informed.',
];

export const INTEREST_FEED_MESSAGES = [
  'Interest charged. Compounding is a feature.',
  'Minimum payment missed. Debt appreciates your optimism.',
  'APR applied. Math is undefeated.',
  'Servicing debt. Servitude included at no extra charge.',
];

export function pickRandom<T>(arr: T[]): T
{
  return arr[Math.floor(Math.random() * arr.length)];
}

export const FLOAT_TEXT_SEEKER_BAD = [
  'REJECTED',
  'Not a fit',
  'Ghosted',
  'Auto-reply: No',
  'Better luck never',
  'Status: Closed',
  'Silence...',
  'We regret to inform',
  'Culture mismatch',
  'Overqualified',
];

export const FLOAT_TEXT_SEEKER_HOPE = [
  'Sent!',
  'Progress?!',
  'Any day now...',
  'This could be the one',
  'Manifesting',
  'Fingers crossed',
  'Easy Apply!',
  'Spray and pray',
  'Someone will see this',
  'Hope springs eternal',
];

export const FLOAT_TEXT_SEEKER_GOOD = [
  'Human detected?!',
  'Real recruiter!',
  'Calendar invite!',
  'Is this real?',
  'Actual person!',
  'Phone screen!',
  'Miracle!',
  'Breakthrough!',
  'They called back!',
  'Interview scheduled!',
];

export const FLOAT_TEXT_AI_BAD = [
  'Invoice sent',
  'Renewal auto-charged',
  'Upsell successful',
  'Pipeline empty = profit',
  'No hires, more fees',
  'Blocked another human',
  'Subscription locked in',
  'Failure = recurring revenue',
  'ATS upgrade sold',
  'Commission secured',
];

export const FLOAT_TEXT_AI_HOPE = [
  'Processing fees...',
  'Billing per applicant',
  'SaaS margins rising',
  'Another subscription',
  'Monetizing despair',
  'Churn is zero',
  'Investors pleased',
  'Volume over value',
  'Selling hope™',
  'Dashboard looks great',
];

export const FLOAT_TEXT_AI_GOOD = [
  'Record revenue!',
  'Bonus unlocked',
  'Upsell opportunity',
  'Billable activity',
  'Stakeholders happy',
  'Growth at all costs',
  'Cha-ching',
  'Quarter exceeded',
  'More contracts sold',
  'Profit up 400%',
];

export const FLOAT_TEXT_EMPLOYER_BAD = [
  '0 shortlisted',
  'No candidates',
  'Role still open',
  'Budget burned',
  'AI says no',
  'Pool empty',
  '180 days vacant',
  'Zero hires',
  'Filters too tight',
  'Spending more...',
];

export const FLOAT_TEXT_EMPLOYER_HOPE = [
  '400 applicants!',
  'Pipeline full',
  'AI working hard',
  'Sifting resumes...',
  'Cost savings!',
  'Automated!',
  'Efficiency!',
  'Subscriptions active',
  'More filters!',
  'Trust the process',
];

export const FLOAT_TEXT_EMPLOYER_GOOD = [
  'Human detected?!',
  'Interview incoming',
  'Candidate found?',
  'Rare event!',
  'Schedule call?',
  'Real person!',
  'Miracle hire?',
  'Override approved',
  'Manual review',
  'Connection possible',
];

export const FLOAT_TEXT_POOLS: Record<
  'seeker' | 'ai' | 'employer',
  Record<'bad' | 'hope' | 'good', string[]>
> = {
  seeker: {
    bad: FLOAT_TEXT_SEEKER_BAD,
    hope: FLOAT_TEXT_SEEKER_HOPE,
    good: FLOAT_TEXT_SEEKER_GOOD,
  },
  ai: {
    bad: FLOAT_TEXT_AI_BAD,
    hope: FLOAT_TEXT_AI_HOPE,
    good: FLOAT_TEXT_AI_GOOD,
  },
  employer: {
    bad: FLOAT_TEXT_EMPLOYER_BAD,
    hope: FLOAT_TEXT_EMPLOYER_HOPE,
    good: FLOAT_TEXT_EMPLOYER_GOOD,
  },
};
