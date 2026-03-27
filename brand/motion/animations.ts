export type AuraState = 'idle' | 'sync' | 'peak' | 'success';

export const AURA_COLORS: Record<AuraState, string> = {
  idle: 'var(--aura-idle-fg)',
  sync: 'var(--aura-cyan)',
  peak: 'var(--aura-magenta)',
  success: 'var(--aura-lime)',
};

export const CORE_NODE_SELECTOR = '#core-node';

export const auraStateByContext: Record<
  'professional' | 'interaction-loading' | 'highlight-feature' | 'success-confirmation',
  AuraState
> = {
  professional: 'idle',
  'interaction-loading': 'sync',
  'highlight-feature': 'peak',
  'success-confirmation': 'success',
};

export const coreNodeAnimations = {
  idle: {
    animate: { scale: 1, x: 0, filter: 'none' },
    transition: { duration: 0 },
  },
  sync: {
    animate: { scale: [1, 1.05, 1] },
    transition: {
      duration: 2,
      ease: [0.4, 0, 0.2, 1],
      repeat: Infinity,
    },
  },
  peak: {
    animate: { x: [0, -2, 2, -1, 0] },
    transition: {
      duration: 0.4,
      repeat: Infinity,
    },
  },
  success: {
    animate: {
      filter: 'drop-shadow(0 0 6px currentColor)',
    },
    transition: { duration: 0.3 },
  },
} as const;

export function getCoreNodeMotion(state: AuraState) {
  return {
    color: AURA_COLORS[state],
    ...coreNodeAnimations[state],
  };
}
