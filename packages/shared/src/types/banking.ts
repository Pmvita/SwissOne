export type Currency = "CHF" | "EUR" | "USD" | "GBP";

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  currency: Currency;
  balance: number;
  account_number?: string;
  iban?: string;
  created_at: string;
  updated_at?: string;
}

export type AccountType =
  | "checking"
  | "savings"
  | "investment"
  | "credit"
  | "loan";

export interface Transaction {
  id: string;
  account_id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  description: string;
  category?: string;
  reference?: string;
  date: string;
  created_at: string;
}

export type TransactionType = "credit" | "debit" | "transfer";

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  total_value: number;
  currency: Currency;
  holdings: Holding[];
  created_at: string;
  updated_at?: string;
}

export interface Holding {
  id: string;
  portfolio_id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchase_price: number;
  current_price: number;
  currency: Currency;
}

