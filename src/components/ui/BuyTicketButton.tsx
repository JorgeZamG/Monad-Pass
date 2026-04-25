"use client";

import { useMemo } from "react";
import { parseEther, isAddress } from "viem";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";

type BuyTicketButtonProps = {
  eventAddress: string;
  amountMon?: string;
};

export function BuyTicketButton({ eventAddress, amountMon = "1" }: BuyTicketButtonProps) {
  const { isConnected } = useAccount();

  const canBuy = useMemo(() => isAddress(eventAddress), [eventAddress]);

  const { data: hash, isPending, sendTransaction, error } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleBuy = () => {
    if (!canBuy) return;

    sendTransaction({
      to: eventAddress as `0x${string}`,
      value: parseEther(amountMon),
    });
  };

  const disabled = !isConnected || !canBuy || isPending || isConfirming;

  return (
    <div style={{ display: "grid", gap: 10, alignItems: "start" }}>
      <button className="btn btn-primary" onClick={handleBuy} disabled={disabled}>
        {isPending || isConfirming ? "Procesando compra..." : `Comprar ticket por ${amountMon} MON`}
      </button>

      {!isConnected && <p className="meta">Conecta tu wallet para comprar.</p>}
      {!canBuy && <p className="meta">Dirección de evento inválida.</p>}
      {error && <p className="meta">Error: {error.message}</p>}
      {isSuccess && <p className="meta">¡Compra confirmada en cadena!</p>}
    </div>
  );
}
