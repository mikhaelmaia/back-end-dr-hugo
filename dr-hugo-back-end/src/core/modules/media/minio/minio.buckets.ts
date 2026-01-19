export enum MinioBuckets {
  TEMP = 'temp',
}

export const getAllMinioBuckets = (): string[] => {
  return Object.values(MinioBuckets);
};
