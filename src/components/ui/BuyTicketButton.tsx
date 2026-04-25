"use client";

import { parseEther } from "viem";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";

type BuyTicketButtonProps = {
  eventAddress: `0x${string}`;
  amountMon?: string;
};

export function BuyTicketButton({ eventAddress, amountMon = "1" }: BuyTicketButtonProps) {
  const { isConnected } = useAccount();

  const { data: hash, isPending, sendTransaction, error } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleBuy = () => {
    sendTransaction({
      to: eventAddress,
      value: parseEther(amountMon),
    });
  };

  const disabled = !isConnected || isPending || isConfirming;

  return (
    <div style={{ display: "grid", gap: 10, alignItems: "start" }}>
      <button className="btn btn-primary" onClick={handleBuy} disabled={disabled}>
        {isPending || isConfirming ? "Procesando compra..." : `Comprar ticket por ${amountMon} MON`}
      </button>

      {!isConnected && <p className="meta">Conecta tu wallet para comprar.</p>}
      {error && <p className="meta">Error: {error.message}</p>}
      {isSuccess && <p className="meta">¡Compra confirmada en cadena!</p>}
    </div>
  );
}
