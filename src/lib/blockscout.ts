import type { ChainId, ContractNode } from "@/types";

const BASE = "https://api.blockscout.com";

interface BlockscoutAddress {
  hash?: string;
  name?: string | null;
  ens_domain_name?: string | null;
  is_contract?: boolean;
  is_verified?: boolean;
  implementation_name?: string | null;
}

interface InternalTxItem {
  from?: BlockscoutAddress | string;
  to?: BlockscoutAddress | string;
  type?: string;
  value?: string;
  created_contract?: BlockscoutAddress | null;
  success?: boolean;
  error?: string | null;
}

interface InternalTxResponse {
  items?: InternalTxItem[];
  next_page_params?: Record<string, unknown> | null;
}

function getApiKey(): string {
  const key = process.env.BLOCKSCOUT_API_KEY;
  if (!key) throw new Error("BLOCKSCOUT_API_KEY is not set");
  return key;
}

function extractAddress(value: BlockscoutAddress | string | undefined | null): string | null {
  if (!value) return null;
  if (typeof value === "string") return value.toLowerCase();
  if (value.hash) return value.hash.toLowerCase();
  return null;
}

function extractMeta(value: BlockscoutAddress | string | undefined | null): {
  name: string | null;
  isContract: boolean;
  isVerified: boolean;
} {
  if (!value || typeof value === "string") {
    return { name: null, isContract: true, isVerified: false };
  }
  return {
    name: value.name || value.ens_domain_name || value.implementation_name || null,
    isContract: value.is_contract !== false,
    isVerified: Boolean(value.is_verified),
  };
}

async function fetchInternalPage(
  chainId: ChainId,
  address: string,
  filter: "from" | "to",
  pageParams?: Record<string, unknown> | null
): Promise<InternalTxResponse> {
  const params = new URLSearchParams({
    apikey: getApiKey(),
    filter,
  });

  if (pageParams) {
    for (const [k, v] of Object.entries(pageParams)) {
      if (v !== null && v !== undefined) params.set(k, String(v));
    }
  }

  const url = `${BASE}/${chainId}/api/v2/addresses/${address}/internal-transactions?${params}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Blockscout ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

/**
 * Fetch unique contract dependencies for an address.
 * - dependsOn  = contracts this address called (filter=from)
 * - dependsOnIt = contracts that called this address (filter=to)
 */
export async function getContractDeps(
  address: string,
  chainId: ChainId,
  maxPages = 3
): Promise<{
  dependsOn: ContractNode[];
  dependsOnIt: ContractNode[];
  scanned: number;
}> {
  const normalized = address.toLowerCase();

  const outbound = new Map<string, ContractNode>();
  const inbound = new Map<string, ContractNode>();
  let scanned = 0;

  async function collect(
    filter: "from" | "to",
    map: Map<string, ContractNode>
  ) {
    let pageParams: Record<string, unknown> | null | undefined = undefined;
    let pages = 0;

    while (pages < maxPages) {
      const data = await fetchInternalPage(chainId, normalized, filter, pageParams);
      const items = data.items ?? [];
      scanned += items.length;

      for (const item of items) {
        // Skip failed calls
        if (item.error || item.success === false) continue;

        const counterpart =
          filter === "from"
            ? item.to || item.created_contract
            : item.from;

        const addr = extractAddress(counterpart);
        if (!addr || addr === normalized) continue;
        // Skip zero address
        if (addr === "0x0000000000000000000000000000000000000000") continue;

        const meta = extractMeta(counterpart);
        // Prefer contract counterparts
        if (!meta.isContract && filter === "to") {
          // inbound from EOA is less useful for dependency graph
          continue;
        }

        const existing = map.get(addr);
        if (existing) {
          existing.txCount += 1;
        } else {
          map.set(addr, {
            address: addr,
            name: meta.name,
            isContract: meta.isContract,
            isVerified: meta.isVerified,
            txCount: 1,
          });
        }
      }

      pages += 1;
      if (!data.next_page_params || items.length === 0) break;
      pageParams = data.next_page_params;
    }
  }

  await Promise.all([
    collect("from", outbound),
    collect("to", inbound),
  ]);

  const sortByTx = (a: ContractNode, b: ContractNode) => b.txCount - a.txCount;

  return {
    dependsOn: Array.from(outbound.values()).sort(sortByTx),
    dependsOnIt: Array.from(inbound.values()).sort(sortByTx),
    scanned,
  };
}

export async function getAddressInfo(
  address: string,
  chainId: ChainId
): Promise<{ isContract: boolean; name: string | null; isVerified: boolean } | null> {
  try {
    const url = `${BASE}/${chainId}/api/v2/addresses/${address.toLowerCase()}?apikey=${getApiKey()}`;
    const res = await fetch(url, { headers: { Accept: "application/json" }, next: { revalidate: 120 } });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      isContract: Boolean(data.is_contract),
      name: data.name || data.ens_domain_name || null,
      isVerified: Boolean(data.is_verified),
    };
  } catch {
    return null;
  }
}
