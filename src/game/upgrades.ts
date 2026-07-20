import type { GeneratorDefinition, UpgradeDefinition } from './types';

export const SEEKER_UPGRADES: UpgradeDefinition[] = [
  {
    id: 'keywordStuffing',
    side: 'seeker',
    name: 'Keyword Stuffing',
    description: 'Slightly more AI interviews. ATS gets much smarter.',
    baseCost: 200,
    costMultiplier: 1.6,
    maxLevel: 10,
    costType: 'savings',
    effects: {
      atsBonus: 0.8,
      aiInterviewBonus: 0.005,
    },
  },
  {
    id: 'aiResumeRewriter',
    side: 'seeker',
    name: 'AI Resume Rewriter',
    description: 'Big interview bump. Bigger ATS spike. Net negative.',
    baseCost: 500,
    costMultiplier: 1.8,
    maxLevel: 8,
    costType: 'savings',
    effects: {
      atsBonus: 2.0,
      aiInterviewBonus: 0.015,
    },
  },
  {
    id: 'linkedinPremium',
    side: 'seeker',
    name: 'LinkedIn Premium',
    description: 'Tiny human interview chance. Ongoing savings drain.',
    baseCost: 300,
    costMultiplier: 1.5,
    maxLevel: 5,
    costType: 'savings',
    effects: {
      humanInterviewBonus: 0.00005,
      savingsDrainPerSec: 0.15,
    },
  },
  {
    id: 'openToWork',
    side: 'seeker',
    name: '"Open to Work" Badge',
    description: 'More applications per second. More rejections per second.',
    baseCost: 50,
    costMultiplier: 1.4,
    maxLevel: 15,
    costType: 'savings',
    effects: {
      applicationsPerSec: 0.2,
      atsBonus: 0.2,
    },
  },
  {
    id: 'bootcampCert',
    side: 'seeker',
    name: 'Third Bootcamp Certificate',
    description: 'Diminishing returns. Companies still want 10 years experience.',
    baseCost: 2000,
    costMultiplier: 2.5,
    maxLevel: 3,
    costType: 'savings',
    effects: {
      atsBonus: 1.5,
      aiInterviewBonus: 0.002,
    },
  },
];

export const EMPLOYER_UPGRADES: UpgradeDefinition[] = [
  {
    id: 'aiScreener',
    side: 'employer',
    name: 'AI Resume Screener',
    description: 'Filters more candidates. Zero effect on positions filled.',
    baseCost: 1000,
    costMultiplier: 2.0,
    maxLevel: 5,
    costType: 'revenue',
    effects: {
      atsBonus: 1.5,
      aiSpendPerSec: 0.3,
    },
  },
  {
    id: 'experienceFilter',
    side: 'employer',
    name: '10 Years in 5-Year-Old Tech',
    description: 'Must have experience in technology that did not exist long enough.',
    baseCost: 500,
    costMultiplier: 1.7,
    maxLevel: 5,
    costType: 'revenue',
    effects: {
      atsBonus: 1.0,
      aiSpendPerSec: 0.1,
    },
  },
  {
    id: 'cultureQuiz',
    side: 'employer',
    name: 'Mandatory Culture Fit Quiz',
    description: '47 questions. No correlation with job performance.',
    baseCost: 750,
    costMultiplier: 1.6,
    maxLevel: 5,
    costType: 'revenue',
    effects: {
      atsBonus: 0.8,
      aiSpendPerSec: 0.15,
    },
  },
  {
    id: 'ghostJob',
    side: 'employer',
    name: 'Ghost Job Posting',
    description: 'Burns revenue. Inflates applications. Never fills.',
    baseCost: 200,
    costMultiplier: 1.3,
    maxLevel: 10,
    costType: 'revenue',
    effects: {
      atsBonus: 0.5,
      revenuePenalty: 0.1,
      openRoles: 1,
    },
  },
];

export const SEEKER_GENERATORS: GeneratorDefinition[] = [
  {
    id: 'linkedinBot',
    side: 'seeker',
    name: 'LinkedIn Easy Apply Bot',
    description: 'Auto-applies to 0.5 jobs/sec. Quality not included.',
    baseCost: 150,
    costMultiplier: 1.5,
    maxLevel: 20,
    costType: 'savings',
    baseRate: 0.5,
    ratePerLevel: 0.5,
  },
  {
    id: 'indeedBot',
    side: 'seeker',
    name: 'Indeed Auto-Applier',
    description: 'Sprays applications into the void at 0.3/sec.',
    baseCost: 250,
    costMultiplier: 1.6,
    maxLevel: 20,
    costType: 'savings',
    baseRate: 0.3,
    ratePerLevel: 0.3,
  },
];

export const EMPLOYER_GENERATORS: GeneratorDefinition[] = [
  {
    id: 'hrIntern',
    side: 'employer',
    name: 'HR Intern',
    description: 'Cheap labor that somehow costs AI subscription fees.',
    baseCost: 500,
    costMultiplier: 1.5,
    maxLevel: 15,
    costType: 'revenue',
    baseRate: 0.2,
    ratePerLevel: 0.2,
  },
  {
    id: 'outsourcedRecruiter',
    side: 'employer',
    name: 'Outsourced Recruiter',
    description: 'Adds AI spend. Still no hires.',
    baseCost: 1500,
    costMultiplier: 1.8,
    maxLevel: 10,
    costType: 'revenue',
    baseRate: 0.5,
    ratePerLevel: 0.5,
  },
];

export const ALL_UPGRADES = [...SEEKER_UPGRADES, ...EMPLOYER_UPGRADES];
export const ALL_GENERATORS = [...SEEKER_GENERATORS, ...EMPLOYER_GENERATORS];

export function getUpgradeById(id: string): UpgradeDefinition | undefined
{
  return ALL_UPGRADES.find((u) => u.id === id);
}

export function getGeneratorById(id: string): GeneratorDefinition | undefined
{
  return ALL_GENERATORS.find((g) => g.id === id);
}
