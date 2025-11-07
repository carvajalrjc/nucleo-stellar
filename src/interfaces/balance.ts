import { Horizon } from "@stellar/stellar-sdk";

export type IAccountBalanceResponse =
  | Horizon.HorizonApi.BalanceLineAsset<"credit_alphanum4">
  | Horizon.HorizonApi.BalanceLineAsset<"credit_alphanum12">;
