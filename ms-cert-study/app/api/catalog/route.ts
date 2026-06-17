import { NextRequest, NextResponse } from "next/server";
import { fetchCatalog } from "@/lib/learnApi";
import type { CatalogFilters, CertLevel } from "@/types/certification";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const filters: CatalogFilters = {
    product: searchParams.get("product") ?? undefined,
    level: (searchParams.get("level") as CertLevel) ?? undefined,
    role: searchParams.get("role") ?? undefined,
    subject: searchParams.get("subject") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  };

  const certs = await fetchCatalog(filters);
  return NextResponse.json(certs);
}
