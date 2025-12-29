import { useState } from "react";
import { useStellarAccounts } from "../providers/StellarAccountProvider";
import { stellarService } from "../services/stellar.service";
import Modal from "./Modal";

interface IAccount {
  publicKey: string;
  secretKey: string;
  balances?: Array<{
    amount: string;
    assetCode: string;
  }>;
}

interface ClaimBalanceModalProps {
  closeModal: () => void;
  getAccount: (name: string) => IAccount | null;
  claimableBalanceId: string;
  onClaimSuccess: () => Promise<void>;
}

function ClaimBalanceModal({
  closeModal,
  getAccount,
  claimableBalanceId,
  onClaimSuccess,
}: ClaimBalanceModalProps) {
  const [claimantAccount, setClaimantAccount] = useState<IAccount | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
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

  const handleClaim = async () => {
    if (!claimantAccount) {
      alert("Please select a claimant account");
      return;
    }

    setIsClaiming(true);
    try {
      const response = await stellarService.claimClaimableBalance(
        claimantAccount.secretKey,
        claimableBalanceId,
      );

      if (onClaimSuccess) {
        await onClaimSuccess();
      }

      setHashId(response.hash);

      setClaimantAccount(null);
      closeModal();
    } catch (error) {
      console.error("Claim failed:", error);
      alert("Failed to claim balance. Please try again.");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Modal title="Claim Claimable Balance" closeModal={closeModal}>
      <div className="p-4 md:p-5 space-y-5">
        <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-green-500 mt-0.5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm text-green-800 font-medium">
                Claimable Balance Available
              </p>
              <p className="text-xs text-green-700 mt-1 font-mono break-all">
                ID: {claimableBalanceId}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Claimant Account
          </label>
          <select
            value={claimantAccount?.publicKey || ""}
            onChange={(e) => {
              const selected = availableAccounts.find(
                (acc) => acc.publicKey === e.target.value,
              );
              setClaimantAccount(selected || null);
            }}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white text-slate-900 font-medium"
          >
            <option value="">Select claimant account</option>
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
            disabled={isClaiming}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleClaim()}
            disabled={isClaiming || !claimantAccount}
            className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isClaiming ? "Claiming..." : "Claim Balance"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ClaimBalanceModal;
