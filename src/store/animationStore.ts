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

let animCounter = 0;
const pendingAnimationTimeouts = new Set<ReturnType<typeof setTimeout>>();

function scheduleAnimationTimeout(callback: () => void, delayMs: number): void
{
  const timeoutId = setTimeout(() =>
  {
    pendingAnimationTimeouts.delete(timeoutId);
    callback();
  }, delayMs);

  pendingAnimationTimeouts.add(timeoutId);
}

function clearAnimationTimeouts(): void
{
  for (const timeoutId of pendingAnimationTimeouts)
  {
    clearTimeout(timeoutId);
  }

  pendingAnimationTimeouts.clear();
}

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

function getFloatLifetimeMs(text: FloatText): number
{
  const travelMs = text.delay + text.duration * 1000;
  const lingerMs = text.lingerDuration ? text.lingerDuration * 1000 : 0;
  return travelMs + lingerMs + 500;
}

function makeFloatForIcon(
  icon: PipelineIcon,
  column: FloatTextColumn,
  tone: FloatTextTone,
  text?: string,
  options?: { lingerAtDestination?: boolean },
): FloatText
{
  const float: FloatText = {
    id: nextId('float'),
    path: icon.path,
    column,
    text: text ?? pickFloat(column, tone),
    tone,
    phase: 'travel',
    createdAt: icon.createdAt,
    duration: icon.duration,
    delay: icon.delay,
    wobbleY: icon.wobbleY,
    wobbleX: icon.wobbleX,
    rotationStart: icon.rotationStart,
    rotationEnd: icon.rotationEnd,
    scalePeak: icon.scalePeak,
  };

  if (options?.lingerAtDestination)
  {
    float.lingerDuration = randomBetween(3, 4.8);
    float.lingerDriftX = randomBetween(-30, 30);
  }

  return float;
}

function registerFloatLingerTransition(
  float: FloatText,
  getState: () => AnimationStore,
  setState: (partial: Partial<AnimationStore> | ((state: AnimationStore) => Partial<AnimationStore>)) => void,
): void
{
  if (!float.lingerDuration)
  {
    return;
  }

  const travelMs = float.delay + float.duration * 1000;
  scheduleAnimationTimeout(() =>
  {
    const state = getState();
    if (!state.floatTexts.some((entry) => entry.id === float.id))
    {
      return;
    }

    setState({
      floatTexts: state.floatTexts.map((entry) =>
        entry.id === float.id ? { ...entry, phase: 'linger' } : entry,
      ),
    });
  }, travelMs);
}

function addFloatForIcon(
  texts: FloatText[],
  icon: PipelineIcon,
  column: FloatTextColumn,
  tone: FloatTextTone,
  text?: string,
  options?: { lingerAtDestination?: boolean },
  lingerHandlers?: {
    getState: () => AnimationStore;
    setState: (partial: Partial<AnimationStore> | ((state: AnimationStore) => Partial<AnimationStore>)) => void;
  },
): FloatText[]
{
  const float = makeFloatForIcon(icon, column, tone, text, options);
  if (lingerHandlers)
  {
    registerFloatLingerTransition(float, lingerHandlers.getState, lingerHandlers.setState);
  }
  return addFloat(texts, float);
}

export const useAnimationStore = create<AnimationStore>((set, get) => {
  const lingerHandlers = {
    getState: get,
    setState: set,
  };

  return {
  pipelineIcons: [],
  floatTexts: [],
  seekerDismayPulse: 0,
  employerDismayPulse: 0,

  spawnApplicationSent: () =>
  {
    const now = Date.now();
    const applicationIcon = makeIcon('application', 'seekerToAi', 'Application submitted', now);

    set((store) => ({
      pipelineIcons: addIcon(store.pipelineIcons, applicationIcon),
      floatTexts: addFloatForIcon(
        store.floatTexts,
        applicationIcon,
        'seeker',
        'hope',
        'Sent!',
        undefined,
        lingerHandlers,
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

    const applicationIcon = makeIcon('application', 'seekerToAi', result.message, now - 400);
    icons = addIcon(icons, applicationIcon);

    switch (result.outcome)
    {
      case 'rejection':
      {
        const rejectionIcon = makeIcon('rejection', 'aiToSeeker', result.message, now);
        icons = addIcon(icons, rejectionIcon);
        texts = addFloatForIcon(texts, rejectionIcon, 'seeker', 'bad', undefined, {
          lingerAtDestination: true,
        }, lingerHandlers);
        seekerDismayPulse = now;
        employerDismayPulse = now;
        break;
      }

      case 'aiInterview':
      {
        const interviewIcon = makeIcon('aiInterview', 'aiStays', result.message, now);
        icons = addIcon(icons, interviewIcon);
        texts = addFloatForIcon(texts, interviewIcon, 'seeker', 'hope', 'Progress?!', undefined, lingerHandlers);
        seekerDismayPulse = now;
        break;
      }

      case 'humanInterview':
      {
        const interviewIcon = makeIcon('humanInterview', 'aiToEmployer', result.message, now);
        icons = addIcon(icons, interviewIcon);
        texts = addFloatForIcon(texts, interviewIcon, 'employer', 'good', 'Human detected?!', undefined, lingerHandlers);
        if (!result.positionFilled)
        {
          scheduleAnimationTimeout(() =>
          {
            const state = get();
            const rejectionIcon = makeIcon(
              'rejection',
              'aiToSeeker',
              'Rescheduled to AI screen',
              Date.now(),
            );

            set({
              pipelineIcons: addIcon(state.pipelineIcons, rejectionIcon),
              floatTexts: addFloatForIcon(
                state.floatTexts,
                rejectionIcon,
                'seeker',
                'bad',
                undefined,
                { lingerAtDestination: true },
                lingerHandlers,
              ),
              seekerDismayPulse: Date.now(),
              employerDismayPulse: Date.now(),
            });
          }, 800);
        }
        break;
      }
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
        (text) => now - text.createdAt < getFloatLifetimeMs(text),
      ),
    }));
  },

  clearAll: () =>
  {
    clearAnimationTimeouts();
    set({
      pipelineIcons: [],
      floatTexts: [],
      seekerDismayPulse: 0,
      employerDismayPulse: 0,
    });
  },
  };
});

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

export function getFloatPathAnimationClass(path: PipelineIconPath): string
{
  switch (path)
  {
    case 'seekerToAi':
      return 'float-seeker-to-ai';
    case 'aiToSeeker':
      return 'float-ai-to-seeker';
    case 'aiStays':
      return 'float-ai-stays';
    case 'aiToEmployer':
      return 'float-ai-to-employer';
    case 'employerToAi':
      return 'float-employer-to-ai';
  }
}

export function getFloatLingerStyle(text: FloatText): CSSProperties
{
  return {
    ...getPipelineIconStyle(text),
    '--linger-dur': `${text.lingerDuration ?? 3.5}s`,
    '--linger-drift': `${text.lingerDriftX ?? 0}px`,
  } as CSSProperties;
}

export function getPipelineIconStyle(icon: Pick<
  PipelineIcon,
  'duration' | 'delay' | 'wobbleY' | 'wobbleX' | 'rotationStart' | 'rotationEnd' | 'scalePeak'
>): CSSProperties
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
