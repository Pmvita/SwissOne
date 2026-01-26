export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },
  ACCOUNTS: {
    LIST: "/accounts",
    DETAIL: (id: string) => `/accounts/${id}`,
    CREATE: "/accounts",
    UPDATE: (id: string) => `/accounts/${id}`,
    DELETE: (id: string) => `/accounts/${id}`,
  },
  TRANSACTIONS: {
    LIST: "/transactions",
    DETAIL: (id: string) => `/transactions/${id}`,
    CREATE: "/transactions",
  },
  PORTFOLIO: {
    GET: "/portfolio",
    UPDATE: "/portfolio",
  },
} as const;

export const CURRENCIES = ["CHF", "EUR", "USD", "GBP"] as const;

export const ACCOUNT_TYPES = [
  "checking",
  "savings",
  "investment",
  "credit",
  "loan",
] as const;

