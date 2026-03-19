export enum MinioBuckets {
  TEMP = 'temp',
  USERS = 'users',
  PATIENT_DOCUMENTS = 'patient-documents',
}

export const getAllMinioBuckets = (): string[] => {
  return Object.values(MinioBuckets);
};
