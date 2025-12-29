import { Horizon } from "@stellar/stellar-sdk";

export interface ICreateClaimableBalanceResponse {
  transaction: Horizon.HorizonApi.SubmitTransactionResponse;
  claimableBalanceId: string;
}
