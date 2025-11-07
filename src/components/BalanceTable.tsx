import { AccountBalance } from "../interfaces/account";

interface BalanceTableProps {
  balances: AccountBalance[];
  variant?: "primary" | "secondary";
}

export default function BalanceTable({
  balances,
  variant = "primary",
}: BalanceTableProps) {
  if (!balances || balances.length === 0) return null;

  const isPrimary = variant === "primary";
  const headerBg = isPrimary ? "bg-indigo-50" : "bg-emerald-50";
  const headerText = isPrimary ? "text-indigo-900" : "text-emerald-900";
  const rowHover = isPrimary
    ? "hover:bg-indigo-50/50"
    : "hover:bg-emerald-50/50";

  return (
    <div className="pt-6 border-t border-slate-200">
      <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
        Account Balances
      </h3>

      <div className="overflow-hidden rounded-xl border-2 border-slate-200">
        <table className="w-full text-center">
          <thead className={`text-center ${headerBg}`}>
            <tr>
              <th
                className={`px-4 py-3 text-xs font-bold uppercase tracking-wider ${headerText}`}
              >
                Amount
              </th>
              <th
                className={`px-4 py-3 text-xs font-bold uppercase tracking-wider ${headerText}`}
              >
                Asset Code
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {balances.map((balance) => (
              <tr
                key={balance.assetCode}
                className={`transition-colors ${rowHover}`}
              >
                <td className="px-4 py-3 text-lg font-bold text-slate-900">
                  {Number(balance.amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 7,
                  })}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-600">
                  {balance.assetCode}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
