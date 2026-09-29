export type ChainId =
  | "1"
  | "8453"
  | "42161"
  | "10"
  | "137"
  | "56"
  | "5042"
  | "4663"
  | "5042002"
  | "11155111";

export interface ChainConfig {
  id: ChainId;
  name: string;
  shortName: string;
  explorer: string;
  nativeCurrency: string;
}

export interface ImplementationInfo {
  address: string;
  name: string | null;
}

export interface ContractNode {
  address: string;
  name: string | null;
  label: string | null;
  tags: string[];
  isContract: boolean;
  isVerified: boolean;
  isProxy: boolean;
  proxyType: string | null;
  implementations: ImplementationInfo[];
  /** Number of internal calls involving this pair */
  callCount: number;
  /** Sum of native value transferred (wei, as string) */
  totalValueWei: string;
  firstBlock: number | null;
  lastBlock: number | null;
  firstTimestamp: string | null;
  lastTimestamp: string | null;
}

export interface CenterContract {
  address: string;
  name: string | null;
  label: string | null;
  tags: string[];
  isContract: boolean;
  isVerified: boolean;
  isProxy: boolean;
  proxyType: string | null;
  implementations: ImplementationInfo[];
}

export interface DepsResponse {
  address: string;
  chainId: ChainId;
  center: CenterContract;
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

export type ViewMode = "list" | "graph";
