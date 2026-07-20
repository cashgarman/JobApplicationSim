import economyJson from './economy.json';

export interface EconomyConfig
{
  humanInterviewFillRate: number;
  rolePostFillChance: number;
  savingsDrainPerSec: number;
  revenueDrainPerSec: number;
  baseAiSpendPerSec: number;
  hrInternAiSpendPerSec: number;
  outsourcedRecruiterAiSpendPerSec: number;
  subscriptionRevenuePerSale: number;
  agencySeekerSpendShare: number;
  agencyProfitMargin: number;
  agencyUpgradeAiSpendShare: number;
  agencyGeneratorAiSpendShare: number;
  agencyRolePostAiSpendMin: number;
  agencyRolePostAiSpendMax: number;
  seekerDespairPerClick: number;
  employerDespairPerClick: number;
  tickerScrollSpeedPxPerSec: number;
  tickerMessageGapPx: number;
  binaryRainSpeed: number;
  binaryRainGlowDurationSec: number;
  binaryRainCharColor: string;
  binaryRainGlowPeakColor: string;
  applicationProcessMinSec: number;
  applicationProcessMaxSec: number;
  rolePostProcessMinSec: number;
  rolePostProcessMaxSec: number;
}

export const economyConfig = economyJson.economy as EconomyConfig;
