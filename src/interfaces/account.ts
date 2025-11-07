export interface IAccount {
  publicKey: string;
  secretKey: string;
  balances?: AccountBalance[];
}

export interface AccountBalance {
  amount: string;
  assetCode: string;
}
