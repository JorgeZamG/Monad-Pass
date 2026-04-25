import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet-explorer.monad.xyz",
    },
  },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName: "Monad Pass",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "demo-project-id",
  chains: [monadTestnet],
  ssr: true,
});
