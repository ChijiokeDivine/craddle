import type {
  ChainId,
  ContractNode,
  CenterContract,
  ImplementationInfo,
} from "@/types";

const BASE = "https://api.blockscout.com";

interface BlockscoutAddress {
  hash?: string;
  name?: string | null;
  ens_domain_name?: string | null;
  is_contract?: boolean;
  is_verified?: boolean;
  implementation_name?: string | null;
  proxy_type?: string | null;
  implementations?: Array<{
    address_hash?: string;
    address?: string;
    name?: string | null;
  }>;
  public_tags?: Array<{ display_name?: string; label?: string; name?: string }>;
  metadata?: {
    tags?: Array<{ name?: string; slug?: string; tagType?: string }>;
  };
}

interface InternalTxItem {
  from?: BlockscoutAddress | string;
  to?: BlockscoutAddress | string;
  type?: string;
  value?: string;
  created_contract?: BlockscoutAddress | null;
  success?: boolean;
  error?: string | null;
  block_number?: number;
  timestamp?: string;
  transaction_hash?: string;
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

function extractAddress(
  value: BlockscoutAddress | string | undefined | null
): string | null {
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

function parseImplementations(data: BlockscoutAddress): ImplementationInfo[] {
  const list = data.implementations ?? [];
  return list
    .map((i) => {
      const addr = (i.address_hash || i.address || "").toLowerCase();
      if (!addr || !addr.startsWith("0x")) return null;
      return { address: addr, name: i.name ?? null };
    })
    .filter(Boolean) as ImplementationInfo[];
}

function parseTags(data: BlockscoutAddress): string[] {
  const tags = new Set<string>();
  for (const t of data.public_tags ?? []) {
    const n = t.display_name || t.label || t.name;
    if (n) tags.add(n);
  }
  for (const t of data.metadata?.tags ?? []) {
    if (t.name) tags.add(t.name);
  }
  return Array.from(tags);
}

function bestLabel(
  name: string | null,
  tags: string[],
  implName?: string | null
): string | null {
  if (name) return name;
  if (implName) return implName;
  if (tags.length > 0) return tags[0];
  return null;
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

export async function getAddressInfo(
  address: string,
  chainId: ChainId
): Promise<CenterContract | null> {
  try {
    const url = `${BASE}/${chainId}/api/v2/addresses/${address.toLowerCase()}?apikey=${getApiKey()}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as BlockscoutAddress & {
      hash?: string;
      is_contract?: boolean;
    };

    const name = data.name || data.ens_domain_name || null;
    const tags = parseTags(data);
    const implementations = parseImplementations(data);
    const proxyType = data.proxy_type || null;
    const isProxy = Boolean(proxyType && proxyType !== "unknown");

    return {
      address: (data.hash || address).toLowerCase(),
      name,
      label: bestLabel(name, tags, data.implementation_name),
      tags,
      isContract: Boolean(data.is_contract),
      isVerified: Boolean(data.is_verified),
      isProxy,
      proxyType,
      implementations,
    };
  } catch {
    return null;
  }
}

/** Enrich a batch of addresses with labels, tags, proxy info (capped concurrency). */
async function enrichAddresses(
  addresses: string[],
  chainId: ChainId,
  limit = 12
): Promise<Map<string, Partial<ContractNode>>> {
  const result = new Map<string, Partial<ContractNode>>();
  const unique = [...new Set(addresses)].slice(0, limit);

  await Promise.all(
    unique.map(async (addr) => {
      const info = await getAddressInfo(addr, chainId);
      if (!info) return;
      result.set(addr, {
        name: info.name,
        label: info.label,
        tags: info.tags,
        isContract: info.isContract,
        isVerified: info.isVerified,
        isProxy: info.isProxy,
        proxyType: info.proxyType,
        implementations: info.implementations,
      });
    })
  );

  return result;
}

function emptyNode(addr: string, meta: ReturnType<typeof extractMeta>): ContractNode {
  return {
    address: addr,
    name: meta.name,
    label: meta.name,
    tags: [],
    isContract: meta.isContract,
    isVerified: meta.isVerified,
    isProxy: false,
    proxyType: null,
    implementations: [],
    callCount: 0,
    totalValueWei: "0",
    firstBlock: null,
    lastBlock: null,
    firstTimestamp: null,
    lastTimestamp: null,
  };
}

function mergeCall(
  node: ContractNode,
  item: InternalTxItem
): void {
  node.callCount += 1;

  const val = item.value || "0";
  try {
    node.totalValueWei = (BigInt(node.totalValueWei) + BigInt(val)).toString();
  } catch {
    /* ignore bad value */
  }

  const block = item.block_number ?? null;
  const ts = item.timestamp ?? null;

  if (block !== null) {
    if (node.firstBlock === null || block < node.firstBlock) {
      node.firstBlock = block;
      node.firstTimestamp = ts;
    }
    if (node.lastBlock === null || block > node.lastBlock) {
      node.lastBlock = block;
      node.lastTimestamp = ts;
    }
  } else if (ts) {
    if (!node.firstTimestamp || ts < node.firstTimestamp) {
      node.firstTimestamp = ts;
    }
    if (!node.lastTimestamp || ts > node.lastTimestamp) {
      node.lastTimestamp = ts;
    }
  }
}

/**
 * Fetch unique contract dependencies with call intensity + enrichment.
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
        if (item.error || item.success === false) continue;

        const counterpart =
          filter === "from" ? item.to || item.created_contract : item.from;

        const addr = extractAddress(counterpart);
        if (!addr || addr === normalized) continue;
        if (addr === "0x0000000000000000000000000000000000000000") continue;

        const meta = extractMeta(counterpart);
        if (!meta.isContract && filter === "to") continue;

        let node = map.get(addr);
        if (!node) {
          node = emptyNode(addr, meta);
          map.set(addr, node);
        }
        mergeCall(node, item);
      }

      pages += 1;
      if (!data.next_page_params || items.length === 0) break;
      pageParams = data.next_page_params;
    }
  }

  await Promise.all([collect("from", outbound), collect("to", inbound)]);

  // Enrich top nodes by call volume (label + proxy)
  const topAddrs = [
    ...Array.from(outbound.values())
      .sort((a, b) => b.callCount - a.callCount)
      .slice(0, 10)
      .map((n) => n.address),
    ...Array.from(inbound.values())
      .sort((a, b) => b.callCount - a.callCount)
      .slice(0, 10)
      .map((n) => n.address),
  ];

  const enriched = await enrichAddresses(topAddrs, chainId, 20);

  for (const [addr, extra] of enriched) {
    const o = outbound.get(addr);
    if (o) Object.assign(o, extra, { label: extra.label || o.label });
    const i = inbound.get(addr);
    if (i) Object.assign(i, extra, { label: extra.label || i.label });
  }

  const sortByCalls = (a: ContractNode, b: ContractNode) =>
    b.callCount - a.callCount;

  return {
    dependsOn: Array.from(outbound.values()).sort(sortByCalls),
    dependsOnIt: Array.from(inbound.values()).sort(sortByCalls),
    scanned,
  };
}
