// lib/examples.ts
import type { ChainId } from "@/types";

export interface ExampleContract {
  label: string;
  address: string;
  chainId: ChainId;
}

// One-click starting points shown under the search bar.
export const EXAMPLES: ExampleContract[] = [
  {
    label: "WETH",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    chainId: "1",
  },
  {
    label: "Uniswap V2 Router",
    address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    chainId: "1",
  },
  {
    label: "Aave V3 Pool",
    address: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
    chainId: "1",
  },
  {
    label: "USDC on Base",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    chainId: "8453",
  },
];
