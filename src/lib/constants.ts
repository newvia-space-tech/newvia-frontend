export const ROLES = {
  customer: process.env.NEXT_PUBLIC_ROLE_CUSTOMER ?? 'customer',
  provider: process.env.NEXT_PUBLIC_ROLE_PROVIDER ?? 'provider',
} as const;


