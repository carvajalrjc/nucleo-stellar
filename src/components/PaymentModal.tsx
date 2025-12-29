import { useEffect, useState } from "react";
import { AccountBalance, IAccount } from "../interfaces/account";
import { useStellarAccounts } from "../providers/StellarAccountProvider";
import { stellarService } from "../services/stellar.service";
import Modal from "./Modal";

interface PaymentModalProps {
  closeModal: () => void;
  getAccount: (name: string) => IAccount | null;
  onPaymentSuccess: () => Promise<void>;
}

export interface PaymentFormData {
  sourceAccount: string;
  destinationAccount: string;
  amount: string;
}

function PaymentModal({
  closeModal,
  getAccount,
  onPaymentSuccess,
}: PaymentModalProps) {
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
    if (!sourceAccount || !destinationAccount || !amount || !selectedAsset) {
      alert("Please fill all fields");
      return;
    }

    if (sourceAccount.publicKey === destinationAccount.publicKey) {
      alert("Source and destination accounts must be different");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await stellarService.payment(
        sourceAccount.publicKey,
        sourceAccount.secretKey,
        destinationAccount.publicKey,
        destinationAccount.secretKey,
        amount,
        selectedAsset,
      );

      console.log("Payment successful:", response);

      if (onPaymentSuccess) {
        await onPaymentSuccess();
      }

      setHashId(response.hash);

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
    <Modal title="Send Payment" closeModal={closeModal}>
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
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Asset
            </label>
            {loadingBalances ? (
              <div className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg bg-slate-50 text-slate-500 flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading balances...
              </div>
            ) : sourceBalances.length === 0 ? (
              <div className="w-full px-4 py-3 border-2 border-red-200 bg-red-50 rounded-lg text-red-600 text-sm">
                No assets available in this account
              </div>
            ) : (
              <>
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white text-slate-900 font-medium"
                >
                  <option value="">Select asset</option>
                  {sourceBalances.map((balance: AccountBalance) => (
                    <option key={balance.assetCode} value={balance.assetCode}>
                      {balance.assetCode}
                    </option>
                  ))}
                </select>

                {selectedBalance && (
                  <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Available:{" "}
                      <span className="font-bold">
                        {Number(selectedBalance.amount).toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 7,
                          },
                        )}{" "}
                        {selectedBalance.assetCode}
                      </span>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Amount (XLM)
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors font-mono text-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Destination Account
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
            {isSubmitting ? "Sending..." : "Send Payment"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default PaymentModal;
