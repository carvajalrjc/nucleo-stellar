import {
  Horizon,
  Keypair,
  TransactionBuilder,
  Operation,
  Asset,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import {
  STELLAR_NETWORK,
  HORIZON_URL,
  STELLAR_FRIENDBOT_URL,
  HORIZON_NETWORK_PASSPHRASE,
} from "../utils/contants";
import { IKeyPair } from "../interfaces/keypair";
import { AccountBalance } from "../interfaces/account";

interface IAccountBalanceResponse {
  asset_code: string;
}

export class StellarService {
  private network: string;
  private horizonUrl: string;
  private server: Horizon.Server;
  private friendbotUrl: string;
  private networkPassphrase: string;

  constructor() {
    this.network = STELLAR_NETWORK as string;
    this.horizonUrl = HORIZON_URL as string;
    this.friendbotUrl = STELLAR_FRIENDBOT_URL as string;
    this.networkPassphrase = HORIZON_NETWORK_PASSPHRASE as string;

    this.server = new Horizon.Server(this.horizonUrl, {
      allowHttp: true,
    });
  }

  private async getAccount(address: string): Promise<Horizon.AccountResponse> {
    try {
      return await this.server.loadAccount(address);
    } catch (error) {
      console.error(error);
      throw new Error("Account not found");
    }
  }

  async getAccountBalance(publicKey: string): Promise<AccountBalance[]> {
    const account = await this.getAccount(publicKey);

    return account.balances.map((b) => ({
      assetCode:
        b.asset_type === "native"
          ? "XLM"
          : (b as IAccountBalanceResponse).asset_code,
      amount: b.balance,
    }));
  }

  createAccount(): IKeyPair {
    const pair = Keypair.random();
    return {
      publicKey: pair.publicKey(),
      secretKey: pair.secret(),
    };
  }

  async fundAccount(publicKey: string): Promise<boolean> {
    try {
      if (this.network !== "testnet") {
        throw new Error("Friendbot is only available on testnet");
      }

      const response = await fetch(`${this.friendbotUrl}?addr=${publicKey}`);

      if (!response.ok) {
        return false;
      }

      return true;
    } catch (error: unknown) {
      throw new Error(
        `Error when funding account with Friendbot: ${error as string}`,
      );
    }
  }

  private async loadAccount(address: string): Promise<Horizon.AccountResponse> {
    try {
      return await this.server.loadAccount(address);
    } catch (error) {
      console.error(error);
      throw new Error("Account not found");
    }
  }

  async payment(
    senderPubKey: string,
    senderSecret: string,
    receiverPubKey: string,
    amount: string,
  ): Promise<Horizon.HorizonApi.SubmitTransactionResponse> {
    const sourceAccount = await this.loadAccount(senderPubKey);
    const sourceKeypair = Keypair.fromSecret(senderSecret);

    const transaction = new TransactionBuilder(sourceAccount, {
      networkPassphrase: this.networkPassphrase,
      fee: BASE_FEE,
    })
      .addOperation(
        Operation.payment({
          amount,
          asset: Asset.native(),
          destination: receiverPubKey,
        }),
      )
      .setTimeout(180)
      .build();

    transaction.sign(sourceKeypair);

    try {
      const result = await this.server.submitTransaction(transaction);
      return result;
    } catch (error: unknown) {
      console.error(error);
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "extras" in error.response.data &&
        error.response.data.extras &&
        typeof error.response.data.extras === "object" &&
        "result_codes" in error.response.data.extras
      ) {
        console.error(
          "❌ Error en la transacción:",
          error.response.data.extras.result_codes,
        );
      } else {
        console.error("❌ Error general:", error);
      }
      throw error;
    }
  }
}

export const stellarService = new StellarService();
