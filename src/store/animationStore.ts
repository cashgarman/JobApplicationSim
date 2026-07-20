import type { CSSProperties } from 'react';
import { create } from 'zustand';
import { FLOAT_TEXT_POOLS, pickRandom } from '../game/constants';
import type {
  FloatText,
  FloatTextColumn,
  FloatTextTone,
  OutcomeResult,
  PipelineIcon,
  PipelineIconKind,
  PipelineIconPath,
} from '../game/types';

const MAX_ICONS = 12;
const MAX_FLOAT_TEXTS = 24;
const ICON_LIFETIME_MS = 2500;
const FLOAT_LIFETIME_MS = 1500;

let animCounter = 0;

function nextId(prefix: string): string
{
  animCounter += 1;
  return `${prefix}-${Date.now()}-${animCounter}`;
}

function pickFloat(column: FloatTextColumn, tone: FloatTextTone): string
{
  return pickRandom(FLOAT_TEXT_POOLS[column][tone]);
}

function randomBetween(min: number, max: number): number
{
  return min + Math.random() * (max - min);
}

function createIconVariation(kind: PipelineIconKind): Pick<
  PipelineIcon,
  'duration' | 'delay' | 'wobbleY' | 'wobbleX' | 'rotationStart' | 'rotationEnd' | 'scalePeak'
>
{
  const isRejection = kind === 'rejection';
  const isHope = kind === 'humanInterview';

  return {
    duration: randomBetween(isRejection ? 0.9 : 0.7, isRejection ? 2.0 : 1.6),
    delay: randomBetween(0, isRejection ? 120 : 200),
    wobbleY: randomBetween(-35, 35),
    wobbleX: randomBetween(-28, 28),
    rotationStart: randomBetween(-35, 35),
    rotationEnd: randomBetween(isRejection ? -90 : -25, isRejection ? 45 : 25),
    scalePeak: randomBetween(isHope ? 1.1 : 0.75, isHope ? 1.5 : 1.25),
  };
}

function makeIcon(
  kind: PipelineIconKind,
  path: PipelineIconPath,
  message: string,
  createdAt: number,
): PipelineIcon
{
  return {
    id: nextId('icon'),
    kind,
    path,
    message,
    createdAt,
    ...createIconVariation(kind),
  };
}

interface AnimationStore
{
  pipelineIcons: PipelineIcon[];
  floatTexts: FloatText[];
  seekerDismayPulse: number;
  employerDismayPulse: number;
  spawnFromOutcome: (result: OutcomeResult) => void;
  spawnApplicationSent: () => void;
  pruneExpired: () => void;
  clearAll: () => void;
}

function addIcon(icons: PipelineIcon[], icon: PipelineIcon): PipelineIcon[]
{
  return [icon, ...icons].slice(0, MAX_ICONS);
}

function addFloat(texts: FloatText[], text: FloatText): FloatText[]
{
  return [text, ...texts].slice(0, MAX_FLOAT_TEXTS);
}

function createFloatVariation(): Pick<
  FloatText,
  'offsetX' | 'startBottom' | 'duration' | 'delay' | 'driftX' | 'riseY' | 'scale'
>
{
  return {
    offsetX: randomBetween(-45, 45),
    startBottom: randomBetween(12, 58),
    duration: randomBetween(1.3, 2.6),
    delay: randomBetween(0, 0.35),
    driftX: randomBetween(-30, 30),
    riseY: randomBetween(-55, -95),
    scale: randomBetween(0.85, 1.2),
  };
}

function spawnFloat(
  texts: FloatText[],
  column: FloatTextColumn,
  tone: FloatTextTone,
  override?: string,
): FloatText[]
{
  return addFloat(texts, {
    id: nextId('float'),
    column,
    text: override ?? pickFloat(column, tone),
    tone,
    createdAt: Date.now(),
    ...createFloatVariation(),
  });
}

export const useAnimationStore = create<AnimationStore>((set, get) => ({
  pipelineIcons: [],
  floatTexts: [],
  seekerDismayPulse: 0,
  employerDismayPulse: 0,

  spawnApplicationSent: () =>
  {
    const now = Date.now();
    set((store) => ({
      pipelineIcons: addIcon(
        store.pipelineIcons,
        makeIcon('application', 'seekerToAi', 'Application submitted', now),
      ),
      floatTexts: spawnFloat(
        spawnFloat(store.floatTexts, 'seeker', 'hope', 'Sent!'),
        'ai',
        'hope',
        'Parsing PDF...',
      ),
    }));
  },

  spawnFromOutcome: (result: OutcomeResult) =>
  {
    const now = Date.now();
    let icons = get().pipelineIcons;
    let texts = get().floatTexts;
    let seekerDismayPulse = get().seekerDismayPulse;
    let employerDismayPulse = get().employerDismayPulse;

    icons = addIcon(
      icons,
      makeIcon('application', 'seekerToAi', result.message, now - 400),
    );

    switch (result.outcome)
    {
      case 'rejection':
        icons = addIcon(
          icons,
          makeIcon('rejection', 'aiToSeeker', result.message, now),
        );
        texts = spawnFloat(texts, 'seeker', 'bad', 'REJECTED');
        texts = spawnFloat(texts, 'ai', 'bad');
        seekerDismayPulse = now;
        employerDismayPulse = now;
        break;

      case 'aiInterview':
        icons = addIcon(
          icons,
          makeIcon('aiInterview', 'aiStays', result.message, now),
        );
        texts = spawnFloat(texts, 'seeker', 'hope', 'Progress?!');
        texts = spawnFloat(texts, 'ai', 'hope', 'Record 47 videos');
        seekerDismayPulse = now;
        break;

      case 'humanInterview':
        icons = addIcon(
          icons,
          makeIcon('humanInterview', 'aiToEmployer', result.message, now),
        );
        texts = spawnFloat(texts, 'employer', 'good', 'Human detected?!');
        texts = spawnFloat(texts, 'ai', 'good', 'Anomaly detected');
        if (!result.positionFilled)
        {
          setTimeout(() =>
          {
            const state = get();
            set({
              pipelineIcons: addIcon(
                state.pipelineIcons,
                makeIcon('rejection', 'aiToSeeker', 'Rescheduled to AI screen', Date.now()),
              ),
              floatTexts: spawnFloat(
                spawnFloat(state.floatTexts, 'seeker', 'bad', 'Rescheduled to AI'),
                'ai',
                'bad',
              ),
              seekerDismayPulse: Date.now(),
              employerDismayPulse: Date.now(),
            });
          }, 800);
        }
        break;
    }

    set({
      pipelineIcons: icons.slice(0, MAX_ICONS),
      floatTexts: texts.slice(0, MAX_FLOAT_TEXTS),
      seekerDismayPulse,
      employerDismayPulse,
    });
  },

  pruneExpired: () =>
  {
    const now = Date.now();
    set((store) => ({
      pipelineIcons: store.pipelineIcons.filter(
        (icon) => now - icon.createdAt < ICON_LIFETIME_MS,
      ),
      floatTexts: store.floatTexts.filter(
        (text) => now - text.createdAt < FLOAT_LIFETIME_MS,
      ),
    }));
  },

  clearAll: () =>
  {
    set({
      pipelineIcons: [],
      floatTexts: [],
      seekerDismayPulse: 0,
      employerDismayPulse: 0,
    });
  },
}));

export function getIconClass(kind: PipelineIconKind): string
{
  switch (kind)
  {
    case 'application':
      return 'fa-solid fa-paper-plane text-corp-text';
    case 'rejection':
      return 'fa-solid fa-ban text-corp-red';
    case 'aiInterview':
      return 'fa-solid fa-robot text-corp-amber';
    case 'humanInterview':
      return 'fa-solid fa-user-check text-corp-green';
  }
}

export function getPathAnimationClass(path: PipelineIconPath): string
{
  switch (path)
  {
    case 'seekerToAi':
      return 'pipeline-seeker-to-ai';
    case 'aiToSeeker':
      return 'pipeline-ai-to-seeker';
    case 'aiStays':
      return 'pipeline-ai-stays';
    case 'aiToEmployer':
      return 'pipeline-ai-to-employer';
    case 'employerToAi':
      return 'pipeline-employer-to-ai';
  }
}

export function getPipelineIconStyle(icon: PipelineIcon): CSSProperties
{
  return {
    '--dur': `${icon.duration}s`,
    '--delay': `${icon.delay}ms`,
    '--wy': `${icon.wobbleY}px`,
    '--wx': `${icon.wobbleX}px`,
    '--rs': `${icon.rotationStart}deg`,
    '--re': `${icon.rotationEnd}deg`,
    '--scale': `${icon.scalePeak}`,
  } as CSSProperties;
}
