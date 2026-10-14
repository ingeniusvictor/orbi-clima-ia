const normalizeFlag = (value: string | undefined) => value?.trim().toLowerCase();

export const OC22_ATMOSPHERIC_TRANSITIONS_ENABLED = ['1', 'true', 'on', 'enabled']
  .includes(normalizeFlag(import.meta.env.VITE_OC22_ATMOSPHERIC_TRANSITIONS) ?? '');

export const OC22_ATMOSPHERIC_TRANSITIONS_FLAG = 'VITE_OC22_ATMOSPHERIC_TRANSITIONS' as const;
