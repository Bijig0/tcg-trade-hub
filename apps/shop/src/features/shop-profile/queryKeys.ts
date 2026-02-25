export const shopKeys = {
  all: ['shop'] as const,
  mine: () => [...shopKeys.all, 'mine'] as const,
};
