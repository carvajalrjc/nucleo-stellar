import { IAccount } from "../interfaces/account";

const STORAGE_PREFIX = "account_";
const CURRENT_ACCOUNT_KEY = "current_account";

export const saveAccountToStorage = (name: string, account: IAccount) => {
  localStorage.setItem(STORAGE_PREFIX + name, JSON.stringify(account));
};

export const getAccountFromStorage = (name: string): IAccount | null => {
  const data = localStorage.getItem(STORAGE_PREFIX + name);
  if (!data) return null;
  return JSON.parse(data) as IAccount;
};

export const saveCurrentAccount = (name: string | null) => {
  if (name) {
    localStorage.setItem(CURRENT_ACCOUNT_KEY, name);
  } else {
    localStorage.removeItem(CURRENT_ACCOUNT_KEY);
  }
};

export const getCurrentAccountFromStorage = (): string => {
  return localStorage.getItem(CURRENT_ACCOUNT_KEY) as string;
};
