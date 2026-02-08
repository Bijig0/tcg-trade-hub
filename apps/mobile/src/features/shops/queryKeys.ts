export const shopKeys = {
  all: ['shops'] as const,
  nearby: (lat: number, lng: number, radius: number) =>
    [...shopKeys.all, 'nearby', lat, lng, radius] as const,
  detail: (id: string) => [...shopKeys.all, 'detail', id] as const,
};
