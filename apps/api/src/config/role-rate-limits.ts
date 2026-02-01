export const ROLE_RATE_LIMITS = {
  ADMIN: {
    limit: 300,
    window: 60,
  },
  MODERATOR: {
    limit: 40,
    window: 60,
  },
  PUBLIC: {
    limit: 30,
    window: 60,
  },
} as const;