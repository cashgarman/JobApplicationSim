import type { CSSProperties } from 'react';
import { create } from 'zustand';
import { APPLICATION_ENVELOPE_TRAVEL_MS } from '../game/applicationProcess';
import { getApplicationFlyCoords, getRolePostFlyCoords } from '../game/pipelineAnchors';
import { FLOAT_TEXT_POOLS, pickRandom } from '../game/constants';
import type {
  FloatText,
  FloatTextColumn,
  FloatTextTone,
  DireFlavorLogEntry,
  FeedEvent,
  OutcomeResult,
  PipelineIcon,
  PipelineIconKind,
  PipelineIconPath,
} from '../game/types';

const MAX_ICONS = 12;
const MAX_FLOAT_TEXTS = 24;
const MAX_DIRE_FLAVOR_LOG = 16;
const ICON_LIFETIME_MS = 4000;
const APPLICATION_ENVELOPE_TRAVEL_SEC = APPLICATION_ENVELOPE_TRAVEL_MS / 1000;

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

function makeApplicationEnvelope(
  path: PipelineIconPath,
  message: string,
  createdAt: number,
  envelopeTone: FloatTextTone = 'hope',
  queueItemId?: string,
): PipelineIcon
{
  const icon: PipelineIcon = {
    id: nextId('icon'),
    kind: 'application',
    path,
    message,
    createdAt,
    envelopeTone,
    duration: APPLICATION_ENVELOPE_TRAVEL_SEC,
    delay: 0,
    wobbleY: 0,
    wobbleX: 0,
    rotationStart: 0,
    rotationEnd: 0,
    scalePeak: 1,
    queueItemId,
  };

  if (path === 'seekerToProcessor' || path === 'processorToSeeker')
  {
    const flyCoords = getApplicationFlyCoords(path);

    if (flyCoords)
    {
      icon.flyFrom = flyCoords.flyFrom;
      icon.flyTo = flyCoords.flyTo;
    }
  }

  if (path === 'employerToRoleProcessor' || path === 'roleProcessorToEmployer')
  {
    const flyCoords = getRolePostFlyCoords(path);

    if (flyCoords)
    {
      icon.flyFrom = flyCoords.flyFrom;
      icon.flyTo = flyCoords.flyTo;
    }
  }

  return icon;
}

interface AnimationStore
{
  pipelineIcons: PipelineIcon[];
  floatTexts: FloatText[];
  seekerDireFlavorLog: DireFlavorLogEntry[];
  employerDireFlavorLog: DireFlavorLogEntry[];
  seekerDismayPulse: number;
  employerDismayPulse: number;
  spawnFromOutcome: (result: OutcomeResult, options?: SpawnOutcomeOptions) => void;
  spawnRolePostFromResolution: (
    resolution: { message: string; type: FeedEvent['type'] },
    options?: SpawnOutcomeOptions,
  ) => void;
  spawnApplicationSent: (queueItemId: string) => void;
  spawnRolePosted: (queueItemId: string) => void;
  clearInboundProcessorIcons: () => void;
  clearInboundRoleProcessorIcons: () => void;
  appendEmployerDireFlavor: (text?: string) => void;
  pruneExpired: () => void;
  clearAll: () => void;
}

export interface SpawnOutcomeOptions
{
  onSeekerFeedbackDisplayed?: () => void;
  onEmployerFeedbackDisplayed?: () => void;
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

function appendDireFlavorLog(logs: DireFlavorLogEntry[], text: string): DireFlavorLogEntry[]
{
  return [
    ...logs,
    { id: nextId('dire-log'), text, createdAt: Date.now() },
  ].slice(-MAX_DIRE_FLAVOR_LOG);
}

function makeSeekerArrivalFloat(
  tone: FloatTextTone,
  text?: string,
): FloatText
{
  const float: FloatText = {
    id: nextId('float'),
    path: 'processorToSeeker',
    column: 'seeker',
    text: text ?? pickFloat('seeker', tone),
    tone,
    phase: 'linger',
    createdAt: Date.now(),
    duration: 0,
    delay: 0,
    wobbleY: 0,
    wobbleX: 0,
    rotationStart: 0,
    rotationEnd: 0,
    scalePeak: 1,
    lingerDuration: randomBetween(3, 4.8),
    lingerDriftX: randomBetween(-30, 30),
  };

  return float;
}

function makeEmployerArrivalFloat(
  tone: FloatTextTone,
  text?: string,
): FloatText
{
  const float: FloatText = {
    id: nextId('float'),
    path: 'employerToAi',
    column: 'employer',
    text: text ?? pickFloat('employer', tone),
    tone,
    phase: 'linger',
    createdAt: Date.now(),
    duration: 0,
    delay: 0,
    wobbleY: 0,
    wobbleX: 0,
    rotationStart: 0,
    rotationEnd: 0,
    scalePeak: 1,
    lingerDuration: randomBetween(3, 4.8),
    lingerDriftX: randomBetween(-30, 30),
  };

  return float;
}

function scheduleSeekerArrivalFloat(
  tone: FloatTextTone,
  lingerHandlers: {
    getState: () => AnimationStore;
    setState: (partial: Partial<AnimationStore> | ((state: AnimationStore) => Partial<AnimationStore>)) => void;
  },
  textOverride?: string,
  onDisplayed?: () => void,
): { float: FloatText; travelMs: number }
{
  const float = makeSeekerArrivalFloat(tone, textOverride);
  const travelMs = APPLICATION_ENVELOPE_TRAVEL_MS;

  scheduleAnimationTimeout(() =>
  {
    const state = lingerHandlers.getState();
    lingerHandlers.setState({
      floatTexts: addFloat(state.floatTexts, float),
    });
    onDisplayed?.();
  }, travelMs);

  return { float, travelMs };
}

function scheduleEmployerArrivalFloat(
  tone: FloatTextTone,
  lingerHandlers: {
    getState: () => AnimationStore;
    setState: (partial: Partial<AnimationStore> | ((state: AnimationStore) => Partial<AnimationStore>)) => void;
  },
  textOverride?: string,
  onDisplayed?: () => void,
): { float: FloatText; travelMs: number }
{
  const float = makeEmployerArrivalFloat(tone, textOverride);
  const travelMs = APPLICATION_ENVELOPE_TRAVEL_MS;

  scheduleAnimationTimeout(() =>
  {
    const state = lingerHandlers.getState();
    lingerHandlers.setState({
      floatTexts: addFloat(state.floatTexts, float),
    });
    onDisplayed?.();
  }, travelMs);

  return { float, travelMs };
}

export const useAnimationStore = create<AnimationStore>((set, get) => {
  const lingerHandlers = {
    getState: get,
    setState: set,
  };

  return {
  pipelineIcons: [],
  floatTexts: [],
  seekerDireFlavorLog: [],
  employerDireFlavorLog: [],
  seekerDismayPulse: 0,
  employerDismayPulse: 0,

  spawnApplicationSent: (queueItemId) =>
  {
    const now = Date.now();
    const applicationIcon = makeApplicationEnvelope(
      'seekerToProcessor',
      'Application submitted',
      now,
      'hope',
      queueItemId,
    );

    set((store) => ({
      pipelineIcons: addIcon(store.pipelineIcons, applicationIcon),
    }));
  },

  spawnRolePosted: (queueItemId) =>
  {
    const now = Date.now();
    const roleIcon = makeApplicationEnvelope(
      'employerToRoleProcessor',
      'Role posted',
      now,
      'hope',
      queueItemId,
    );

    set((store) => ({
      pipelineIcons: addIcon(store.pipelineIcons, roleIcon),
      employerDismayPulse: now,
    }));
  },

  clearInboundProcessorIcons: () =>
  {
    set((store) => ({
      pipelineIcons: store.pipelineIcons.filter((icon) => icon.path !== 'seekerToProcessor'),
    }));
  },

  clearInboundRoleProcessorIcons: () =>
  {
    set((store) => ({
      pipelineIcons: store.pipelineIcons.filter((icon) => icon.path !== 'employerToRoleProcessor'),
    }));
  },

  spawnRolePostFromResolution: (resolution, options) =>
  {
    const now = Date.now();
    const onEmployerFeedbackDisplayed = options?.onEmployerFeedbackDisplayed;
    let icons = get().pipelineIcons;
    let employerDireFlavorLog = get().employerDireFlavorLog;
    const tone: FloatTextTone = resolution.type === 'humanInterview'
      ? 'good'
      : resolution.type === 'aiInterview'
        ? 'hope'
        : 'bad';
    const returnIcon = makeApplicationEnvelope(
      'roleProcessorToEmployer',
      resolution.message,
      now,
      tone,
    );
    icons = addIcon(icons, returnIcon);
    const employerFloat = scheduleEmployerArrivalFloat(
      tone,
      lingerHandlers,
      undefined,
      onEmployerFeedbackDisplayed,
    );

    if (resolution.type === 'rejection' || resolution.type === 'aiInterview')
    {
      employerDireFlavorLog = appendDireFlavorLog(employerDireFlavorLog, employerFloat.float.text);
    }

    set({
      pipelineIcons: icons.slice(0, MAX_ICONS),
      employerDireFlavorLog,
      employerDismayPulse: now,
    });
  },

  appendEmployerDireFlavor: (text?: string) =>
  {
    const flavorText = text ?? pickFloat('employer', 'bad');
    set((store) => ({
      employerDireFlavorLog: appendDireFlavorLog(store.employerDireFlavorLog, flavorText),
      employerDismayPulse: Date.now(),
    }));
  },

  spawnFromOutcome: (result, options) =>
  {
    const now = Date.now();
    const onSeekerFeedbackDisplayed = options?.onSeekerFeedbackDisplayed;
    let icons = get().pipelineIcons;
    let seekerDireFlavorLog = get().seekerDireFlavorLog;
    let seekerDismayPulse = get().seekerDismayPulse;
    let employerDismayPulse = get().employerDismayPulse;

    switch (result.outcome)
    {
      case 'rejection':
      {
        const returnIcon = makeApplicationEnvelope('processorToSeeker', result.message, now, 'bad');
        icons = addIcon(icons, returnIcon);
        const rejectionFloat = scheduleSeekerArrivalFloat(
          'bad',
          lingerHandlers,
          undefined,
          onSeekerFeedbackDisplayed,
        );
        seekerDireFlavorLog = appendDireFlavorLog(seekerDireFlavorLog, rejectionFloat.float.text);
        seekerDismayPulse = now;
        employerDismayPulse = now;
        break;
      }

      case 'aiInterview':
      {
        const returnIcon = makeApplicationEnvelope('processorToSeeker', result.message, now, 'hope');
        icons = addIcon(icons, returnIcon);
        scheduleSeekerArrivalFloat('hope', lingerHandlers, 'Progress?!', onSeekerFeedbackDisplayed);
        seekerDismayPulse = now;
        break;
      }

      case 'humanInterview':
      {
        const interviewIcon = makeApplicationEnvelope('aiToEmployer', result.message, now, 'good');
        icons = addIcon(icons, interviewIcon);
        scheduleEmployerArrivalFloat(
          'good',
          lingerHandlers,
          'Human detected?!',
          result.positionFilled ? onSeekerFeedbackDisplayed : undefined,
        );
        if (!result.positionFilled)
        {
          scheduleAnimationTimeout(() =>
          {
            const delayedNow = Date.now();
            const rejectionIcon = makeApplicationEnvelope(
              'processorToSeeker',
              'Rescheduled to AI screen',
              delayedNow,
              'bad',
            );
            const rejectionFloat = scheduleSeekerArrivalFloat(
              'bad',
              lingerHandlers,
              undefined,
              onSeekerFeedbackDisplayed,
            );

            set((state) => ({
              pipelineIcons: addIcon(state.pipelineIcons, rejectionIcon),
              seekerDireFlavorLog: appendDireFlavorLog(
                state.seekerDireFlavorLog,
                rejectionFloat.float.text,
              ),
              seekerDismayPulse: delayedNow,
              employerDismayPulse: delayedNow,
            }));
          }, 800);
        }
        break;
      }
    }

    set({
      pipelineIcons: icons.slice(0, MAX_ICONS),
      seekerDireFlavorLog,
      seekerDismayPulse,
      employerDismayPulse,
    });
  },

  pruneExpired: () =>
  {
    const now = Date.now();
    set((store) => ({
      pipelineIcons: store.pipelineIcons.filter(
        (icon) =>
          icon.path === 'seekerToProcessor'
          || icon.path === 'employerToRoleProcessor'
          || now - icon.createdAt < ICON_LIFETIME_MS,
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
      seekerDireFlavorLog: [],
      employerDireFlavorLog: [],
      seekerDismayPulse: 0,
      employerDismayPulse: 0,
    });
  },
  };
});

export function getIconClass(kind: PipelineIconKind, envelopeTone?: FloatTextTone): string
{
  switch (kind)
  {
    case 'application':
      if (envelopeTone === 'bad')
      {
        return 'fa-solid fa-envelope text-corp-red';
      }
      if (envelopeTone === 'good')
      {
        return 'fa-solid fa-envelope text-corp-green';
      }
      if (envelopeTone === 'hope')
      {
        return 'fa-solid fa-envelope text-corp-amber';
      }
      return 'fa-solid fa-envelope text-white';
    case 'rejection':
      return 'fa-solid fa-ban text-corp-red';
    case 'aiInterview':
      return 'fa-solid fa-robot text-corp-amber';
    case 'humanInterview':
      return 'fa-solid fa-user-check text-corp-green';
  }
}

export function getPathAnimationClass(
  path: PipelineIconPath,
  options?: { smooth?: boolean },
): string
{
  if (options?.smooth)
  {
    switch (path)
    {
      case 'seekerToAi':
        return 'pipeline-seeker-to-ai-smooth';
      case 'seekerToProcessor':
        return 'pipeline-seeker-to-processor-smooth';
      case 'processorToSeeker':
        return 'pipeline-processor-to-seeker-smooth';
      case 'aiToSeeker':
        return 'pipeline-ai-to-seeker-smooth';
      case 'aiToEmployer':
        return 'pipeline-ai-to-employer-smooth';
      case 'employerToAi':
        return 'pipeline-employer-to-ai-smooth';
      case 'employerToRoleProcessor':
        return 'pipeline-employer-to-ai-smooth';
      case 'roleProcessorToEmployer':
        return 'pipeline-ai-to-employer-smooth';
      default:
        break;
    }
  }

  switch (path)
  {
    case 'seekerToAi':
      return 'pipeline-seeker-to-ai';
    case 'seekerToProcessor':
      return 'pipeline-seeker-to-processor';
    case 'processorToSeeker':
      return 'pipeline-processor-to-seeker';
    case 'aiToSeeker':
      return 'pipeline-ai-to-seeker';
    case 'aiStays':
      return 'pipeline-ai-stays';
    case 'aiToEmployer':
      return 'pipeline-ai-to-employer';
    case 'employerToAi':
      return 'pipeline-employer-to-ai';
    case 'employerToRoleProcessor':
      return 'pipeline-employer-to-ai';
    case 'roleProcessorToEmployer':
      return 'pipeline-ai-to-employer';
  }

  return 'pipeline-seeker-to-ai';
}

export function getFloatPathAnimationClass(path: PipelineIconPath): string
{
  switch (path)
  {
    case 'seekerToAi':
    case 'seekerToProcessor':
      return 'float-seeker-to-ai';
    case 'aiToSeeker':
    case 'processorToSeeker':
      return 'float-ai-to-seeker';
    case 'aiStays':
      return 'float-ai-stays';
    case 'aiToEmployer':
      return 'float-ai-to-employer';
    case 'employerToAi':
    case 'employerToRoleProcessor':
      return 'float-employer-to-ai';
    case 'roleProcessorToEmployer':
      return 'float-ai-to-employer';
  }

  return 'float-seeker-to-ai';
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

export function getAnchoredFlyStyle(icon: PipelineIcon): CSSProperties
{
  if (!icon.flyFrom || !icon.flyTo)
  {
    return getPipelineIconStyle(icon);
  }

  return {
    ...getPipelineIconStyle(icon),
    left: icon.flyFrom.x,
    top: icon.flyFrom.y,
    '--fly-dx': `${icon.flyTo.x - icon.flyFrom.x}px`,
    '--fly-dy': `${icon.flyTo.y - icon.flyFrom.y}px`,
  } as CSSProperties;
}
