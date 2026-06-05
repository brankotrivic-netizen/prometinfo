import { NextResponse } from "next/server";
import { getBorders } from "@/lib/cache";

// Vedno dinamicno (scraping), Node runtime (cheerio + fetch).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/borders
 * Skupni backend endpoint za web in mobilno aplikacijo.
 * Query: ?force=1 za obvod cache-a.
 */
export async function GET(req: Request) {
  const force = new URL(req.url).searchParams.get("force") === "1";
  try {
    const payload = await getBorders(force);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "Access-Control-Allow-Origin": "*", // mobilna aplikacija dostopa do istega API-ja
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Neznana napaka" },
      { status: 502 }
    );
  }
}
