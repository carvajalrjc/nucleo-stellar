import {
  Horizon,
  Keypair,
  TransactionBuilder,
  Operation,
  Asset,
  BASE_FEE,
  Transaction,
  xdr,
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

  getAsset(assetCode: string, assetIssuer: string): Asset {
    if (assetCode !== "XML") {
      return new Asset(assetCode, assetIssuer);
    }
    return Asset.native();
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

  private transactionBuilder(sourceAccount: Horizon.AccountResponse) {
    return new TransactionBuilder(sourceAccount, {
      networkPassphrase: this.networkPassphrase,
      fee: BASE_FEE,
    });
  }

  async createAsset(
    issuerSecret: string,
    distributorSecret: string,
    assetCode: string,
    amount: string,
  ) {
    const issuerKeys = Keypair.fromSecret(issuerSecret);
    const distributorKeys = Keypair.fromSecret(distributorSecret);
    const newAsset = new Asset(assetCode, issuerKeys.publicKey());
    const assetLimit = Number(amount) * 100;

    try {
      const distributorAccount = await this.loadAccount(
        distributorKeys.publicKey(),
      );

      const trustTransaction = new TransactionBuilder(distributorAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          Operation.changeTrust({
            asset: newAsset,
            source: distributorKeys.publicKey(),
            limit: assetLimit.toString(),
          }),
        )
        .setTimeout(30)
        .build();

      trustTransaction.sign(distributorKeys);
      await this.server.submitTransaction(trustTransaction);

      const issuerAccount = await this.loadAccount(issuerKeys.publicKey());

      const issueTransaction = new TransactionBuilder(issuerAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          Operation.payment({
            destination: distributorKeys.publicKey(),
            asset: newAsset,
            amount,
          }),
        )
        .setTimeout(30)
        .build();

      issueTransaction.sign(issuerKeys);
      return await this.server.submitTransaction(issueTransaction);
    } catch (error) {
      console.error("Error creating asset:", error);
      throw error;
    }
  }

  private createPaymentOperation(
    amount: string,
    asset: Asset,
    destination: string,
  ): xdr.Operation<Operation> {
    return Operation.payment({
      amount,
      asset,
      destination,
    });
  }

  private async checkTrustline(
    assetIssuer: string,
    assetCode: string,
    destinationPubKey: string,
  ): Promise<boolean> {
    const account = await this.loadAccount(destinationPubKey);
    const balances = account.balances;
    const assetToVerify = new Asset(assetCode, assetIssuer);

    for (const balance of balances) {
      if ("asset_code" in balance) {
        const asset = new Asset(balance.asset_code, balance.asset_issuer);

        if (asset.equals(assetToVerify)) return true;
      }
    }

    return false;
  }

  createTrustlineOperation(
    asset: Asset,
    source: string,
    amount: string,
  ): xdr.Operation<Operation.ChangeTrust> {
    const assetLimit = Number(amount) * 100;

    return Operation.changeTrust({
      asset,
      source,
      limit: assetLimit.toString(),
    });
  }

  async payment(
    senderPubKey: string,
    senderSecret: string,
    receiverPubKey: string,
    receiverSecret: string,
    amount: string,
    assetCode: string,
  ): Promise<Horizon.HorizonApi.SubmitTransactionResponse> {
    const sourceAccount = await this.loadAccount(senderPubKey);
    const sourceKeypair = Keypair.fromSecret(senderSecret);
    let hasTrustline: boolean = true;

    const asset = this.getAsset(assetCode, receiverPubKey);
    const transactionBuilder = this.transactionBuilder(sourceAccount);

    if (asset.code !== "XLM" && asset.issuer !== receiverPubKey) {
      hasTrustline = await this.checkTrustline(
        receiverPubKey,
        assetCode,
        asset.issuer,
      );

      if (!hasTrustline) {
        const changeTrustOp = this.createTrustlineOperation(
          asset,
          receiverPubKey,
          amount,
        );
        transactionBuilder.addOperation(changeTrustOp);
      }
    }

    const paymentOperation = this.createPaymentOperation(
      amount,
      asset,
      receiverPubKey,
    );

    transactionBuilder.addOperation(paymentOperation);

    const transaction = transactionBuilder.setTimeout(180).build();

    transaction.sign(sourceKeypair);

    if (!hasTrustline) {
      const recieveKeypair = Keypair.fromSecret(receiverSecret);
      transaction.sign(recieveKeypair);
    }

    return await this.submitTransaction(transaction);
  }

  private async submitTransaction(
    transaction: Transaction,
  ): Promise<Horizon.HorizonApi.SubmitTransactionResponse> {
    try {
      return await this.server.submitTransaction(transaction);
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
