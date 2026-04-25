import type { EventSummary } from "@/types";

export const EVENTS: EventSummary[] = [
  {
    address: "0x1111111111111111111111111111111111111111",
    title: "Monad Blitz",
    location: "Online",
    date: "12 Jun 2026",
    priceMon: "1.00",
    sold: 12,
    total: 150,
    soldOut: false,
  },
  {
    address: "0x0000000000000000000000000000000000001010",
    title: "Monad Dev Summit",
    location: "Miami",
    date: "18 Jul 2026",
    priceMon: "0.45",
    sold: 128,
    total: 300,
    soldOut: false,
  },
  {
    address: "0x0000000000000000000000000000000000002020",
    title: "Web3 Product Night",
    location: "CDMX",
    date: "03 Ago 2026",
    priceMon: "0.30",
    sold: 300,
    total: 300,
    soldOut: true,
  },
  {
    address: "0x0000000000000000000000000000000000003030",
    title: "Monad Builders Camp",
    location: "Madrid",
    date: "22 Sep 2026",
    priceMon: "0.25",
    sold: 42,
    total: 180,
    soldOut: false,
  },
];
