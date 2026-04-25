"use client";

import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";

import { FACTORY_ABI, FACTORY_ADDRESS } from "@/lib/contracts";
import type { EventSummary } from "@/types";

type FactoryEventTuple = {
  contractAddress: `0x${string}`;
  organizer: `0x${string}`;
  name: string;
  date: bigint;
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

export function useTicketFactory() {
  const countQuery = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "getEventCount",
  });

  const eventCount = Number(countQuery.data ?? 0n);

  const eventsQuery = useReadContracts({
    contracts: Array.from({ length: eventCount }, (_, index) => ({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "events" as const,
      args: [BigInt(index)],
    })),
    query: {
      enabled: eventCount > 0,
    },
  });

  const events = useMemo<EventSummary[]>(() => {
    if (!eventsQuery.data) {
      return [];
    }

    return eventsQuery.data
      .filter((item) => item.status === "success" && item.result)
      .map((item) => {
        const rawEvent = item.result as FactoryEventTuple;

        return {
          address: rawEvent.contractAddress,
          title: rawEvent.name,
          location: "Por definir",
          date: formatEpochDate(rawEvent.date),
          priceMon: "0.00",
          sold: 0,
          total: 0,
          soldOut: !rawEvent.active,
        };
      });
  }, [eventsQuery.data]);

  return {
    events,
    eventCount,
    isLoading: countQuery.isLoading || eventsQuery.isLoading,
    error: countQuery.error ?? eventsQuery.error,
  };
}
