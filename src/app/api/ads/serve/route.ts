import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slot = searchParams.get("slot");

  if (!slot) {
    return NextResponse.json({ error: "slot required" }, { status: 400 });
  }

  const space = await prisma.adSpace.findFirst({
    where: { slot, enabled: true },
    include: {
      ads: {
        where: { active: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!space) {
    return NextResponse.json({ ad: null });
  }

  const now = new Date();
  const eligibleAds = space.ads.filter((ad) => {
    if (ad.startDate && ad.startDate > now) return false;
    if (ad.endDate && ad.endDate < now) return false;
    return true;
  });

  if (eligibleAds.length === 0) {
    return NextResponse.json({ ad: null });
  }

  let selected: (typeof eligibleAds)[0];

  switch (space.rotation) {
    case "round_robin": {
      const totalImpressions = eligibleAds.reduce((s, a) => s + a.impressions, 0);
      const idx = totalImpressions % eligibleAds.length;
      selected = eligibleAds[idx];
      break;
    }
    case "weighted": {
      const totalWeight = eligibleAds.reduce((s, a) => s + Math.max(1, a.weight), 0);
      let r = Math.random() * totalWeight;
      for (const ad of eligibleAds) {
        r -= Math.max(1, ad.weight);
        if (r <= 0) {
          selected = ad;
          break;
        }
      }
      selected ??= eligibleAds[0];
      break;
    }
    default: {
      selected = eligibleAds[Math.floor(Math.random() * eligibleAds.length)];
    }
  }

  await prisma.ad.update({
    where: { id: selected.id },
    data: { impressions: { increment: 1 } },
  });

  return NextResponse.json({
    ad: {
      id: selected.id,
      name: selected.name,
      imageUrl: selected.imageUrl,
      linkUrl: selected.linkUrl,
      width: space.width,
      height: space.height,
    },
  });
}
