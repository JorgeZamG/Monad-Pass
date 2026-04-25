"use client";

import { formatEther } from "viem";
import { useReadContract } from "wagmi";

import { EVENT_TICKET_ABI } from "@/lib/contracts";

export type EventInfoView = {
  name: string;
  location: string;
  date: string;
  priceMon: string;
  maxSupply: number;
  totalMinted: number;
  active: boolean;
};

const formatEpochDate = (epochSeconds: bigint) => {
  const date = new Date(Number(epochSeconds) * 1000);
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export function useEventTicket(eventAddress: `0x${string}`) {
  const query = useReadContract({
    address: eventAddress,
    abi: EVENT_TICKET_ABI,
    functionName: "eventInfo",
    query: {
      enabled: Boolean(eventAddress),
    },
  });

  const eventInfo = query.data
    ? {
        name: query.data[0],
        location: query.data[1],
        date: formatEpochDate(query.data[2]),
        priceMon: Number(formatEther(query.data[3])).toFixed(4),
        maxSupply: Number(query.data[4]),
        totalMinted: Number(query.data[5]),
        active: query.data[6],
      }
    : null;

  return {
    eventInfo: eventInfo as EventInfoView | null,
    isLoading: query.isLoading,
    error: query.error,
  };
}
