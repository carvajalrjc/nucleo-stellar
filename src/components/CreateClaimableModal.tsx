import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { AccountBalance, IAccount } from "../interfaces/account";
import Modal from "./Modal";
import { useStellarAccounts } from "../providers/StellarAccountProvider";
import { stellarService } from "../services/stellar.service";
import AccountBalancesInput from "./AccountBalanceInput";

interface ICreateModalProps {
  closeModal: () => void;
  getAccount: (name: string) => IAccount | null;
  onPaymentSuccess: () => Promise<void>;
  onClaimableBalanceCreated?: Dispatch<SetStateAction<string | null>>;
}

export interface PaymentFormData {
  sourceAccount: string;
  destinationAccount: string;
  amount: string;
}

function CreateClaimableModal({
  closeModal,
  getAccount,
  onPaymentSuccess,
  onClaimableBalanceCreated,
}: ICreateModalProps) {
  const [sourceAccount, setSourceAccount] = useState<IAccount | null>(null);
  const [destinationAccount, setDestinationAccount] = useState<IAccount | null>(
    null,
  );
  const [amount, setAmount] = useState<string>("");
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [sourceBalances, setSourceBalances] = useState<AccountBalance[]>([]);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setHashId } = useStellarAccounts();

  const accountNames = ["bob", "alice"];
  const availableAccounts: IAccount[] = accountNames
    .map((name) => getAccount(name))
    .filter((account): account is IAccount => account !== null);

  const getAccountName = (account: IAccount): string => {
    const name = accountNames.find(
      (name) => getAccount(name)?.publicKey === account.publicKey,
    );
    return name ? name.charAt(0).toUpperCase() + name.slice(1) : "Unknown";
  };

  useEffect(() => {
    const loadSourceBalances = async () => {
      if (!sourceAccount) {
        setSourceBalances([]);
        setSelectedAsset("");
        return;
      }

      setLoadingBalances(true);
      try {
        const balances = await stellarService.getAccountBalance(
          sourceAccount.publicKey,
        );
        setSourceBalances(balances);

        if (balances.length > 0) {
          setSelectedAsset(balances[0].assetCode);
        }
      } catch (error) {
        console.error("Failed to load balances:", error);
        setSourceBalances([]);
      } finally {
        setLoadingBalances(false);
      }
    };

    void loadSourceBalances();
  }, [sourceAccount]);

  const handleSubmit = async () => {
    if (!sourceAccount || !selectedAsset || !amount || !destinationAccount) {
      alert("Please fill all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await stellarService.createClaimableBalance(
        selectedAsset,
        amount,
        sourceAccount.secretKey,
        destinationAccount.secretKey,
      );

      if (response && onClaimableBalanceCreated) {
        const claimableBalanceId = response.claimableBalanceId;
        if (claimableBalanceId) {
          onClaimableBalanceCreated(claimableBalanceId);
        }
      }

      if (onPaymentSuccess) {
        await onPaymentSuccess();
      }

      setHashId(response?.transaction.hash);

      setSourceAccount(null);
      setDestinationAccount(null);
      setAmount("");
      setSelectedAsset("");
      closeModal();
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBalance = sourceBalances.find(
    (b) => b.assetCode === selectedAsset,
  );

  return (
    <Modal title="Create Claimable Balance" closeModal={closeModal}>
      <div className="p-4 md:p-5 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Source Account
          </label>
          <select
            value={sourceAccount?.publicKey || ""}
            onChange={(e) => {
              const selected = availableAccounts.find(
                (acc) => acc.publicKey === e.target.value,
              );
              setSourceAccount(selected || null);
            }}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white text-slate-900 font-medium"
          >
            <option value="">Select source account</option>
            {availableAccounts.map((account) => (
              <option key={account.publicKey} value={account.publicKey}>
                {getAccountName(account)}
              </option>
            ))}
          </select>
        </div>

        {sourceAccount && (
          <AccountBalancesInput
            loadingBalances={loadingBalances}
            sourceBalances={sourceBalances}
            selectedAsset={selectedAsset}
            selectedBalance={selectedBalance}
            setSelectedAsset={setSelectedAsset}
          />
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Destionation Account
          </label>
          <select
            value={destinationAccount?.publicKey || ""}
            onChange={(e) => {
              const selected = availableAccounts.find(
                (acc) => acc.publicKey === e.target.value,
              );
              setDestinationAccount(selected || null);
            }}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white text-slate-900 font-medium"
          >
            <option value="">Select destination account</option>
            {availableAccounts.map((account) => (
              <option key={account.publicKey} value={account.publicKey}>
                {getAccountName(account)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Amount to Claim
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors font-mono text-lg"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={closeModal}
            className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isSubmitting ? "Creating..." : "Create Claimable"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default CreateClaimableModal;
