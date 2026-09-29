# craddle

Contract dependency explorer for EVM chains.

Paste a smart contract address, pick a chain, and see:

- **Depends on** — contracts this one has called (outbound internal calls)
- **Depends on it** — contracts that have called this one (inbound)

Results can be viewed as a ranked list or an interactive graph. Each relationship includes call count, native value moved, and first/last interaction time. Known labels and tags from Blockscout are attached when available. Proxy contracts show their implementation addresses.

---

## Features

- **Multi-chain** — Ethereum, Base, Arbitrum, Optimism, Polygon, BNB Smart Chain, Arc, Robinhood Chain, Arc Testnet, Ethereum Sepolia
- **Call intensity** — call count, total value (wei), first/last block and timestamp per dependency
- **Labels & tags** — human-readable names and public tags from Blockscout
- **Proxy resolution** — detects common proxy patterns (e.g. EIP-1967, EIP-1822) and surfaces implementation contracts
- **List & graph views** — switch between a structured list and a React Flow graph
- **Export** — CSV, JSON, GraphML; copy DOT or JSON for tools like Gephi or NetworkX
- **Shareable URLs** — `?address=0x…&chainId=1&view=graph` loads the same view for collaborators
- **Redis cache** (optional) — repeated lookups are cached for 5 minutes
- **Dark mode** — system preference or manual toggle

Data comes from [Blockscout](https://www.blockscout.com) internal transactions via the PRO API.

---

## Prerequisites

- Node.js 18+
- A Blockscout PRO API key — free tier works ([dev.blockscout.com](https://dev.blockscout.com))
- Optional: Redis (e.g. [Upstash](https://upstash.com)) for caching

---

## Setup

```bash
git clone https://github.com/ChijiokeDivine/craddle.git
cd craddle
npm install
```

Create `.env.local` in the project root:

```env
BLOCKSCOUT_API_KEY=proapi_your_key_here

# Optional
REDIS_URL=rediss://default:password@host:6379
THE_GRAPH_API_KEY=
```

`THE_GRAPH_API_KEY` is not required for the current feature set. It is reserved for future subgraph-based indexing.

Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Usage

1. Select a chain from the dropdown.
2. Paste a contract address (`0x` + 40 hex characters).
3. Submit. The app loads outbound and inbound dependencies.
4. Toggle **list** or **graph**.
5. Use **Export** for CSV / JSON / GraphML, or copy DOT / JSON.
6. Use the link icon to copy a shareable URL for the current view.

EOAs (wallets) are rejected; the address must be a smart contract.

---

## API

```
GET /api/deps?address=0x…&chainId=1
```

| Parameter | Required | Description |
|-----------|----------|-------------|
| `address` | Yes | Contract address |
| `chainId` | No (default `1`) | Chain ID (see supported chains below) |

**Supported `chainId` values**

| ID | Network |
|----|---------|
| `1` | Ethereum |
| `8453` | Base |
| `42161` | Arbitrum One |
| `10` | Optimism |
| `137` | Polygon |
| `56` | BNB Smart Chain |
| `5042` | Arc |
| `4663` | Robinhood Chain |
| `5042002` | Arc Testnet |
| `11155111` | Ethereum Sepolia |

**Response shape (simplified)**

```json
{
  "address": "0x…",
  "chainId": "1",
  "center": {
    "address": "0x…",
    "name": "…",
    "label": "…",
    "tags": ["…"],
    "isProxy": false,
    "proxyType": null,
    "implementations": []
  },
  "dependsOn": [
    {
      "address": "0x…",
      "label": "Uniswap V3 Router",
      "tags": ["…"],
      "callCount": 12,
      "totalValueWei": "0",
      "firstBlock": 18000000,
      "lastBlock": 19000000,
      "firstTimestamp": "2023-…",
      "lastTimestamp": "2024-…",
      "isProxy": false,
      "implementations": []
    }
  ],
  "dependsOnIt": [ "…" ],
  "stats": {
    "outbound": 5,
    "inbound": 3,
    "scanned": 120
  }
}
```

When Redis is configured, responses include `X-Cache: HIT` or `X-Cache: MISS`.

---

## Deploy on Vercel

1. Import the repo into Vercel.
2. Set environment variables:
   - `BLOCKSCOUT_API_KEY` (required)
   - `REDIS_URL` (optional)
3. Deploy.

No separate backend is required; API routes run on Vercel’s serverless functions.

---

## Notes

- Coverage is limited to internal transactions indexed by Blockscout (up to a few pages per direction per request). High-activity contracts may not show every historical counterparty in one query.
- Labels and proxy metadata depend on what Blockscout has indexed for that address on that chain.
- Redis is optional. Without it, every request hits Blockscout; the app still works.
