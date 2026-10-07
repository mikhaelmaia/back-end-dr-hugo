export const NotificationEvents = {
  ACCESS_CODE_USED: 'access-code-used',
} as const;

export type NotificationEvent =
  (typeof NotificationEvents)[keyof typeof NotificationEvents];
