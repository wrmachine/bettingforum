import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

/**
 * PATCH /api/products/[id] - Update product (admin only)
 * AI-friendly: Use this to update banking, crypto, media, and other product fields.
 *
 * Body: Partial<ProductUpdate>
 * - logoUrl, media (JSON string), bankingMethods (JSON string), cryptoMethods (JSON string), acceptedCurrencies (JSON string)
 * - bonusSummary, minDeposit, fiatSupported, cryptoSupported, etc.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id: productId } = await params;
  const body = await request.json();

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};

  const stringFields = [
    "brandName",
    "siteUrl",
    "productType",
    "logoUrl",
    "media",
    "bankingMethods",
    "cryptoMethods",
    "acceptedCurrencies",
    "bonusSummary",
    "minDeposit",
    "shortDescription",
    "licenseJurisdiction",
    "geoRestrictions",
  ] as const;
  for (const key of stringFields) {
    if (body[key] !== undefined) {
      updates[key] = body[key] === null || body[key] === "" ? null : String(body[key]);
    }
  }

  if (typeof body.fiatSupported === "boolean") {
    updates.fiatSupported = body.fiatSupported;
  }
  if (typeof body.cryptoSupported === "boolean") {
    updates.cryptoSupported = body.cryptoSupported;
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: updates,
  });

  return NextResponse.json(updated);
}
