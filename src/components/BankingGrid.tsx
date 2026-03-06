"use client";

import {
  parseBankingMethods,
  parseAcceptedCurrencies,
  BANKING_OPTIONS,
  type BankingMethodEntry,
} from "@/lib/product-options";

interface BankingGridProps {
  bankingMethodsJson: string | null;
  acceptedCurrenciesJson?: string | null;
  showDeposit?: boolean;
  showWithdrawal?: boolean;
}

function BankingCard({
  entry,
  option,
  showDeposit,
  showWithdrawal,
}: {
  entry: BankingMethodEntry;
  option: { name: string; displayName: string; color?: string };
  showDeposit: boolean;
  showWithdrawal: boolean;
}) {
  const deposit = entry.deposit;
  const withdrawal = entry.withdrawal;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className="flex h-12 w-24 shrink-0 items-center justify-center rounded-lg px-2"
        style={{ backgroundColor: option.color ? `${option.color}15` : "#f1f5f9" }}
      >
        <span
          className="text-sm font-bold"
          style={{ color: option.color ?? "#475569" }}
        >
          {option.displayName}
        </span>
      </div>
      <div className="min-w-0 flex-1 space-y-1 text-sm">
        {showDeposit && deposit && (
          <div className="text-slate-600">
            <span className="font-medium text-slate-700">Deposit: </span>
            {deposit.min != null && (
              <span>Min: ${deposit.min.toLocaleString()}</span>
            )}
            {deposit.max != null && (
              <>
                {deposit.min != null && " "}
                <span>Max: ${deposit.max.toLocaleString()}</span>
              </>
            )}
            {deposit.fee != null && (
              <>
                {(deposit.min != null || deposit.max != null) && " • "}
                <span>Fee: {deposit.fee}</span>
              </>
            )}
          </div>
        )}
        {showWithdrawal && withdrawal && (
          <div className="text-slate-600">
            <span className="font-medium text-slate-700">Withdrawal: </span>
            <span>Fee: {withdrawal.fee ?? "—"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function BankingGrid({
  bankingMethodsJson,
  acceptedCurrenciesJson,
  showDeposit = true,
  showWithdrawal = true,
}: BankingGridProps) {
  const methods = parseBankingMethods(bankingMethodsJson);
  const currencies = parseAcceptedCurrencies(acceptedCurrenciesJson ?? null);

  if (methods.length === 0) return null;

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Banking</h2>

      {currencies.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-600">
            Accepted Currencies
          </h3>
          <p className="mt-1 text-slate-700">{currencies.join(", ")}</p>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-medium text-slate-600">
          Methods of Deposit
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {methods
            .filter((m) => m.deposit)
            .map((entry) => {
              const option =
                BANKING_OPTIONS[entry.id.toLowerCase()] ??
                BANKING_OPTIONS[entry.id] ?? {
                  name: entry.id,
                  displayName: entry.id.charAt(0).toUpperCase() + entry.id.slice(1).replace(/_/g, " "),
                };
              return (
                <BankingCard
                  key={`deposit-${entry.id}`}
                  entry={entry}
                  option={option}
                  showDeposit={true}
                  showWithdrawal={false}
                />
              );
            })}
        </div>
      </div>

      {showWithdrawal && methods.some((m) => m.withdrawal) && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-slate-600">
            Methods of Withdrawal
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {methods
              .filter((m) => m.withdrawal)
              .map((entry) => {
                const option =
                  BANKING_OPTIONS[entry.id.toLowerCase()] ??
                  BANKING_OPTIONS[entry.id] ?? {
                    name: entry.id,
                    displayName: entry.id.charAt(0).toUpperCase() + entry.id.slice(1).replace(/_/g, " "),
                  };
                return (
                  <BankingCard
                    key={`withdrawal-${entry.id}`}
                    entry={entry}
                    option={option}
                    showDeposit={false}
                    showWithdrawal={true}
                  />
                );
              })}
          </div>
        </div>
      )}

      {showWithdrawal && methods.some((m) => m.withdrawal) === false && methods.some((m) => m.deposit) && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-slate-600">
            Methods of Withdrawal
          </h3>
          <p className="text-slate-500">Same as deposit methods.</p>
        </div>
      )}
    </section>
  );
}
