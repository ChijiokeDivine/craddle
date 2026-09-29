import type { ChainConfig, ChainId } from "@/types";

export const CHAINS: Record<ChainId, ChainConfig> = {
  "1": {
    id: "1",
    name: "Ethereum",
    shortName: "ETH",
    explorer: "https://eth.blockscout.com",
    nativeCurrency: "ETH",
  },
  "8453": {
    id: "8453",
    name: "Base",
    shortName: "Base",
    explorer: "https://base.blockscout.com",
    nativeCurrency: "ETH",
  },
  "42161": {
    id: "42161",
    name: "Arbitrum One",
    shortName: "ARB",
    explorer: "https://arbitrum.blockscout.com",
    nativeCurrency: "ETH",
  },
  "10": {
    id: "10",
    name: "Optimism",
    shortName: "OP",
    explorer: "https://optimism.blockscout.com",
    nativeCurrency: "ETH",
  },
  "137": {
    id: "137",
    name: "Polygon",
    shortName: "POL",
    explorer: "https://polygon.blockscout.com",
    nativeCurrency: "POL",
  },
  "56": {
    id: "56",
    name: "BNB Smart Chain",
    shortName: "BSC",
    explorer: "https://bsc.blockscout.com",
    nativeCurrency: "BNB",
  },
    "5042": {
    id: "5042",
    name: "Arc",
    shortName: "ARC",
    explorer: "https://explorer.arc.io",
    nativeCurrency: "USDC",
  },
  "4663": {
    id: "4663",
    name: "Robinhood Chain",
    shortName: "HOOD",
    explorer: "https://robinhoodchain.blockscout.com",
    nativeCurrency: "ETH",
  },
  "5042002": {
    id: "5042002",
    name: "Arc Testnet",
    shortName: "ARC-T",
    explorer: "https://explorer.testnet.arc.io",
    nativeCurrency: "USDC",
  },
  "11155111": {
    id: "11155111",
    name: "Ethereum Sepolia",
    shortName: "SEP",
    explorer: "https://eth-sepolia.blockscout.com",
    nativeCurrency: "ETH",
  },
};

export const CHAIN_LIST = Object.values(CHAINS);

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}
