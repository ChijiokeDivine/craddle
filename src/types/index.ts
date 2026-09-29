export type ChainId = "1" | "8453" | "42161" | "10" | "137" | "56" | "5042" | "4663" | "5042002" | "11155111";

export interface ChainConfig {
  id: ChainId;
  name: string;
  shortName: string;
  explorer: string;
  nativeCurrency: string;
}

export interface ContractNode {
  address: string;
  name: string | null;
  isContract: boolean;
  isVerified: boolean;
  txCount: number;
}

export interface DepsResponse {
  address: string;
  chainId: ChainId;
  dependsOn: ContractNode[];
  dependsOnIt: ContractNode[];
  stats: {
    outbound: number;
    inbound: number;
    scanned: number;
  };
}

export interface ApiError {
  error: string;
  details?: string;
}
