import { IAccount } from "../interfaces/account";
import BalanceTable from "./BalanceTable";

interface AccountCardProps {
  name: string;
  account: IAccount;
  onFund: () => void;
  variant: "primary" | "secondary";
}

function AccountCard({ name, account, onFund, variant }: AccountCardProps) {
  const isPrimary = variant === "primary";
  const headerBg = isPrimary
    ? "bg-gradient-to-r from-indigo-500 to-indigo-600"
    : "bg-gradient-to-r from-emerald-500 to-emerald-600";

  const fundButtonBg = isPrimary
    ? "bg-indigo-100 hover:bg-indigo-200 text-indigo-700"
    : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700";

  return (
    <div className="bg-white rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg transition-all duration-300 hover:shadow-2xl">
      <div className={`${headerBg} py-4 px-6 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-white opacity-10"></div>
        <h2 className="text-2xl font-bold text-white">{name}</h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Public Key
              </label>
              <button
                onClick={onFund}
                disabled={!!account.balances}
                className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer ${fundButtonBg}`}
              >
                {account.balances ? (
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Funded
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Fund Account
                  </span>
                )}
              </button>
            </div>
            <div className="p-0.5">
              <code className="text-xs font-mono text-slate-700 break-all leading-relaxed">
                {account.publicKey}
              </code>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Secret Key
            </label>
            <div className="p-0.5">
              <code className="text-xs font-mono text-slate-700 break-all leading-relaxed">
                {account.secretKey}
              </code>
            </div>
          </div>
        </div>

        {account.balances && account.balances.length > 0 && (
          <BalanceTable balances={account.balances} variant={variant} />
        )}
      </div>
    </div>
  );
}

export default AccountCard;
