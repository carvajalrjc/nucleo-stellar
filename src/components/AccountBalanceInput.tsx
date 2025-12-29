import { AccountBalance } from "../interfaces/account";

interface IAccountBalancesInputProps {
  loadingBalances: boolean;
  sourceBalances: AccountBalance[];
  selectedAsset: string;
  selectedBalance: AccountBalance | undefined;
  setSelectedAsset: React.Dispatch<React.SetStateAction<string>>;
}

function AccountBalancesInput({
  loadingBalances,
  sourceBalances,
  selectedAsset,
  selectedBalance,
  setSelectedAsset,
}: IAccountBalancesInputProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Asset
      </label>
      {loadingBalances ? (
        <div className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg bg-slate-50 text-slate-500 flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
                  {Number(selectedBalance.amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 7,
                  })}{" "}
                  {selectedBalance.assetCode}
                </span>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AccountBalancesInput;
