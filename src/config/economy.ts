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
  seekerDespairPerClick: number;
  employerDespairPerClick: number;
}

export const economyConfig = economyJson.economy as EconomyConfig;
