export type Perspective = 'seeker' | 'employer';

export type ApplicationOutcome = 'rejection' | 'aiInterview' | 'humanInterview';

export type GamePhase = 'start' | 'playing' | 'gameOver';

export type GameOverCause = 'seeker' | 'employer' | 'both';

export interface SeekerState {
  savings: number;
  applications: number;
  rejections: number;
  aiInterviews: number;
  humanInterviews: number;
  debt: number;
  loansTaken: number;
  upgradeLevels: Record<string, number>;
  generatorLevels: Record<string, number>;
}

export interface EmployerState {
  aiRecruitmentSpend: number;
  positionsFilled: number;
  revenue: number;
  openRoles: number;
  debt: number;
  loansTaken: number;
  upgradeLevels: Record<string, number>;
  generatorLevels: Record<string, number>;
}

export interface GameState {
  phase: GamePhase;
  perspective: Perspective;
  seeker: SeekerState;
  employer: EmployerState;
  seekerDespair: number;
  employerDespair: number;
  gameOverCause?: GameOverCause;
  totalPlaySeconds: number;
}

export interface FeedEvent {
  id: string;
  message: string;
  timestamp: number;
  type: 'rejection' | 'aiInterview' | 'humanInterview' | 'employer' | 'seeker' | 'neutral';
}

export type UpgradeSide = 'seeker' | 'employer';

export type CostType = 'savings' | 'revenue';

export interface UpgradeDefinition {
  id: string;
  side: UpgradeSide;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  costType: CostType;
  effects: {
    atsBonus?: number;
    aiInterviewBonus?: number;
    humanInterviewBonus?: number;
    applicationsPerSec?: number;
    savingsDrainPerSec?: number;
    aiSpendPerSec?: number;
    revenuePerSec?: number;
    revenuePenalty?: number;
    openRoles?: number;
  };
}

export interface GeneratorDefinition {
  id: string;
  side: UpgradeSide;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  costType: CostType;
  baseRate: number;
  ratePerLevel: number;
}

export interface OutcomeResult {
  outcome: ApplicationOutcome;
  message: string;
  positionFilled: boolean;
  seekerDespairGain: number;
  employerDespairGain: number;
}

export interface TickResult {
  state: GameState;
  events: FeedEvent[];
}

export type PipelineIconKind = 'application' | 'rejection' | 'aiInterview' | 'humanInterview';

export type PipelineIconPath =
  | 'seekerToAi'
  | 'aiToSeeker'
  | 'aiStays'
  | 'aiToEmployer'
  | 'employerToAi';

export interface PipelineIcon {
  id: string;
  kind: PipelineIconKind;
  path: PipelineIconPath;
  message: string;
  createdAt: number;
  duration: number;
  delay: number;
  wobbleY: number;
  wobbleX: number;
  rotationStart: number;
  rotationEnd: number;
  scalePeak: number;
}

export type FloatTextTone = 'bad' | 'hope' | 'good';

export type FloatTextColumn = 'seeker' | 'ai' | 'employer';

export interface FloatText {
  id: string;
  column: FloatTextColumn;
  text: string;
  tone: FloatTextTone;
  createdAt: number;
  offsetX: number;
  startBottom: number;
  duration: number;
  delay: number;
  driftX: number;
  riseY: number;
  scale: number;
}
