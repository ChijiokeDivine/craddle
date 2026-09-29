import { NextRequest, NextResponse } from "next/server";
import { getContractDeps, getAddressInfo } from "@/lib/blockscout";
import { isValidAddress, CHAINS } from "@/lib/chains";
import { cacheGet, cacheSet, depsCacheKey } from "@/lib/redis";
import type { ChainId, DepsResponse, ApiError, CenterContract } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const SUPPORTED: ChainId[] = [
  "1",
  "8453",
  "42161",
  "10",
  "137",
  "56",
  "5042",
  "4663",
  "5042002",
  "11155111",
];
const CACHE_TTL = 60 * 5;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const address = (searchParams.get("address") || "").trim();
    const chainId = (searchParams.get("chainId") || "1") as ChainId;

    if (!address) {
      return NextResponse.json<ApiError>(
        { error: "Missing address parameter" },
        { status: 400 }
      );
    }

    if (!isValidAddress(address)) {
      return NextResponse.json<ApiError>(
        { error: "Invalid address format. Expected 0x + 40 hex characters." },
        { status: 400 }
      );
    }

    if (!SUPPORTED.includes(chainId) || !CHAINS[chainId]) {
      return NextResponse.json<ApiError>(
        { error: `Unsupported chainId. Supported: ${SUPPORTED.join(", ")}` },
        { status: 400 }
      );
    }

    if (!process.env.BLOCKSCOUT_API_KEY) {
      return NextResponse.json<ApiError>(
        { error: "Server misconfiguration: BLOCKSCOUT_API_KEY not set" },
        { status: 500 }
      );
    }

    const cacheKey = depsCacheKey(address, chainId) + ":v2";

    const cached = await cacheGet<DepsResponse>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "X-Cache": "HIT",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      });
    }

    const centerInfo = await getAddressInfo(address, chainId);
    if (centerInfo && !centerInfo.isContract) {
      return NextResponse.json<ApiError>(
        { error: "Address is not a smart contract" },
        { status: 400 }
      );
    }

    const center: CenterContract = centerInfo ?? {
      address: address.toLowerCase(),
      name: null,
      label: null,
      tags: [],
      isContract: true,
      isVerified: false,
      isProxy: false,
      proxyType: null,
      implementations: [],
    };

    const { dependsOn, dependsOnIt, scanned } = await getContractDeps(
      address,
      chainId,
      3
    );

    const body: DepsResponse = {
      address: address.toLowerCase(),
      chainId,
      center,
      dependsOn,
      dependsOnIt,
      stats: {
        outbound: dependsOn.length,
        inbound: dependsOnIt.length,
        scanned,
      },
    };

    await cacheSet(cacheKey, body, CACHE_TTL);

    return NextResponse.json(body, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/deps]", message);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch dependencies", details: message },
      { status: 502 }
    );
  }
}
