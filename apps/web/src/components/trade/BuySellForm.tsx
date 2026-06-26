"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { isApiError } from "@/lib/api-error";

import { tradingFeePercent, tradingFeeRate } from "@/features/trades/schema";
import { useBuyTrade, useSellTrade } from "@/features/trades/hooks";
import type { TradeSide } from "@/features/trades/types";

import {
  formatCryptoAmount,
  formatUsd,
} from "@/features/wallet/formatters";
import type { Wallet } from "@/features/wallet/types";

import { useAuthStore } from "@/store/auth-store";
import { useToastStore } from "@/store/toast-store";

type TradeCoin = {
  name: string;
  symbol: string;
  price: string;
};

type BuySellFormProps = {
  coin: TradeCoin;
  wallet: Wallet | null;
};

function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `trade:${Date.now()}:${Math.random().toString(16).slice(2)}`;
}

function toNumber(value: string | number | null | undefined) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function BuySellForm({ coin, wallet }: BuySellFormProps) {
  const [side, setSide] = useState<TradeSide>("buy");
  const [amount, setAmount] = useState("");
  const [confirming, setConfirming] = useState(false);

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const showToast = useToastStore((state) => state.showToast);

  const buyTrade = useBuyTrade(token);
  const sellTrade = useSellTrade(token);

  const price = toNumber(coin.price);
  const parsedAmount = toNumber(amount);
  const usdBalance = toNumber(wallet?.summary.cashBalanceUsd ?? wallet?.balanceUsd);
  const asset = wallet?.assets.find(
    (walletAsset) => walletAsset.coin.symbol === coin.symbol,
  );
  const cryptoBalance = toNumber(asset?.amount);

  const preview = useMemo(() => {
    if (side === "buy") {
      const grossTotal = parsedAmount;
      const fee = grossTotal * tradingFeeRate;
      const chargedUsd = grossTotal + fee;
      const cryptoAmount = price > 0 ? grossTotal / price : 0;

      return {
        grossTotal,
        fee,
        chargedUsd,
        receivedUsd: 0,
        cryptoAmount,
      };
    }

    const cryptoAmount = parsedAmount;
    const grossTotal = cryptoAmount * price;
    const fee = grossTotal * tradingFeeRate;
    const receivedUsd = grossTotal - fee;

    return {
      grossTotal,
      fee,
      chargedUsd: 0,
      receivedUsd,
      cryptoAmount,
    };
  }, [parsedAmount, price, side]);

  const amountError = getAmountError();
  const isPending = buyTrade.isPending || sellTrade.isPending;
  const canTrade = Boolean(user?.emailVerified);

  function getAmountError() {
    if (!amount.trim()) {
      return "Amount is required.";
    }

    if (!/^\d+(\.\d+)?$/.test(amount.trim()) || parsedAmount <= 0) {
      return "Enter a positive decimal amount.";
    }

    if (side === "buy" && preview.chargedUsd > usdBalance) {
      return "Insufficient USD balance including fee.";
    }

    if (side === "sell" && parsedAmount > cryptoBalance) {
      return `Insufficient ${coin.symbol} balance.`;
    }

    return null;
  }

  function fillPercent(percent: number) {
    if (side === "buy") {
      const grossSpend = (usdBalance * percent) / 100 / (1 + tradingFeeRate);
      setAmount(grossSpend > 0 ? grossSpend.toFixed(2) : "");
      return;
    }

    const cryptoAmount = (cryptoBalance * percent) / 100;
    setAmount(cryptoAmount > 0 ? cryptoAmount.toFixed(8).replace(/0+$/, "").replace(/\.$/, "") : "");
  }

  async function submitTrade() {
    if (amountError || !canTrade) {
      return;
    }

    try {
      const result =
        side === "buy"
          ? await buyTrade.mutateAsync({
              symbol: coin.symbol,
              usdAmount: amount.trim(),
              idempotencyKey: createIdempotencyKey(),
            })
          : await sellTrade.mutateAsync({
              symbol: coin.symbol,
              coinAmount: amount.trim(),
              idempotencyKey: createIdempotencyKey(),
            });

      showToast({
        title: side === "buy" ? "Buy order filled" : "Sell order filled",
        description: `${formatCryptoAmount(result.transaction.amount)} ${
          coin.symbol
        } at ${formatUsd(result.transaction.price)}`,
        tone: "success",
      });
      setAmount("");
      setConfirming(false);
    } catch (error) {
      showToast({
        title: "Trade failed",
        description: isApiError(error) ? error.message : "Please try again.",
        tone: "error",
      });
    }
  }

  return (
    <>
      <Card className="p-4">
        <div className="mb-4 grid grid-cols-2 gap-3">
          <Button
            variant={side === "buy" ? "green" : "secondary"}
            onClick={() => {
              setSide("buy");
              setAmount("");
            }}
            type="button"
          >
            Buy
          </Button>

          <Button
            variant={side === "sell" ? "red" : "secondary"}
            onClick={() => {
              setSide("sell");
              setAmount("");
            }}
            type="button"
          >
            Sell
          </Button>
        </div>

        {!canTrade ? (
          <div className="mb-4 flex gap-3 rounded-xl border border-amber-400/25 bg-amber-500/10 p-3 text-sm text-amber-100">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>Please verify your email before trading.</p>
          </div>
        ) : null}

        <div className="mb-4 grid gap-3 rounded-xl border border-white/10 bg-white/4 p-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-zinc-400">Current price</span>
            <span className="font-medium text-white">{formatUsd(price)}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-zinc-400">Available USD</span>
            <span className="font-medium text-white">
              {formatUsd(usdBalance)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-zinc-400">Available {coin.symbol}</span>
            <span className="font-medium text-white">
              {formatCryptoAmount(cryptoBalance)} {coin.symbol}
            </span>
          </div>
        </div>

        <label className="mb-3 block text-sm text-zinc-300">
          {side === "buy" ? "USD amount" : `${coin.symbol} amount`}
          <Input
            className="mt-2"
            inputMode="decimal"
            onChange={(event) => setAmount(event.target.value)}
            placeholder={side === "buy" ? "100.00" : "0.00"}
            value={amount}
          />
        </label>

        <div className="mb-4 grid grid-cols-5 gap-2 text-center text-xs text-zinc-400">
          {[0, 25, 50, 75, 100].map((percent) => (
            <button
              className="rounded-lg border border-white/10 py-2 transition hover:bg-white/8"
              key={percent}
              onClick={() => fillPercent(percent)}
              type="button"
            >
              {percent}%
            </button>
          ))}
        </div>

        <div className="mb-4 space-y-2 rounded-xl border border-white/10 bg-black/15 p-3 text-sm">
          <PreviewRow label="Gross total" value={formatUsd(preview.grossTotal)} />
          <PreviewRow
            label={`Fee (${tradingFeePercent}%)`}
            value={formatUsd(preview.fee)}
          />
          {side === "buy" ? (
            <>
              <PreviewRow
                label="Total charged"
                value={formatUsd(preview.chargedUsd)}
              />
              <PreviewRow
                label={`Estimated ${coin.symbol}`}
                value={`${formatCryptoAmount(preview.cryptoAmount)} ${coin.symbol}`}
              />
            </>
          ) : (
            <PreviewRow
              label="Estimated USD received"
              value={formatUsd(preview.receivedUsd)}
            />
          )}
        </div>

        {amount && amountError ? (
          <p className="mb-3 text-sm text-red-300">{amountError}</p>
        ) : null}

        <Button
          className="w-full"
          disabled={Boolean(amountError) || isPending || !canTrade}
          onClick={() => setConfirming(true)}
          type="button"
          variant={side === "buy" ? "green" : "red"}
        >
          {isPending
            ? "Submitting..."
            : side === "buy"
              ? `Buy ${coin.symbol}`
              : `Sell ${coin.symbol}`}
        </Button>
      </Card>

      {confirming ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
          <Card className="w-full max-w-md p-5">
            <h2 className="text-lg font-semibold text-white">Confirm trade</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Review the final preview before submitting this market order.
            </p>

            <div className="mt-5 space-y-2 rounded-xl border border-white/10 bg-white/4 p-3 text-sm">
              <PreviewRow label="Side" value={side.toUpperCase()} />
              <PreviewRow label="Asset" value={`${coin.name} (${coin.symbol})`} />
              <PreviewRow label="Price" value={formatUsd(price)} />
              <PreviewRow label="Gross total" value={formatUsd(preview.grossTotal)} />
              <PreviewRow label="Fee" value={formatUsd(preview.fee)} />
              <PreviewRow
                label={side === "buy" ? "Charged USD" : "Received USD"}
                value={
                  side === "buy"
                    ? formatUsd(preview.chargedUsd)
                    : formatUsd(preview.receivedUsd)
                }
              />
            </div>

            <div className="mt-5 flex gap-3">
              <Button
                className="flex-1"
                disabled={isPending}
                onClick={() => {
                  void submitTrade();
                }}
                variant={side === "buy" ? "green" : "red"}
              >
                {isPending ? "Submitting..." : "Confirm"}
              </Button>

              <Button
                className="flex-1"
                disabled={isPending}
                onClick={() => setConfirming(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-zinc-400">{label}</span>
      <span className="text-right font-medium text-white">{value}</span>
    </div>
  );
}
