export enum MinioBuckets {
  TEMP = 'temp',
  USERS = 'users',
}

export const getAllMinioBuckets = (): string[] => {
  return Object.values(MinioBuckets);
};
