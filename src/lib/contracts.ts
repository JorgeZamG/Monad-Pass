export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const FACTORY_ABI = [
  {
    name: "events",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "contractAddress", type: "address" },
      { name: "organizer", type: "address" },
      { name: "name", type: "string" },
      { name: "date", type: "uint256" },
      { name: "active", type: "bool" },
    ],
  },
  {
    name: "getEventCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const EVENT_TICKET_ABI = [
  {
    name: "eventInfo",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "name", type: "string" },
      { name: "location", type: "string" },
      { name: "date", type: "uint256" },
      { name: "price", type: "uint256" },
      { name: "maxSupply", type: "uint256" },
      { name: "totalMinted", type: "uint256" },
      { name: "active", type: "bool" },
    ],
  },
  {
    name: "purchaseTicket",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "tokenURI", type: "string" }],
    outputs: [],
  },
] as const;
