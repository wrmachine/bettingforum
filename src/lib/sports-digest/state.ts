import { prisma } from "@/lib/prisma";
import { SPORT_DIGEST_REGISTRY } from "@/lib/sports-digest/registry";

const KEY = "sports_digest_state";

export type DigestState = {
  enabled: Record<string, boolean>;
  /** UTC calendar date YYYY-MM-DD of last successful digest per sport */
  lastDigestDate: Record<string, string>;
};

/** New sports default to on; admin can turn off per sport. */
function defaultEnabled(): Record<string, boolean> {
  const o: Record<string, boolean> = {};
  for (const r of SPORT_DIGEST_REGISTRY) {
    o[r.sportKey] = true;
  }
  return o;
}

export async function getDigestState(): Promise<DigestState> {
  const r = await prisma.seoSettings.findUnique({
    where: { key: KEY },
    select: { value: true },
  });
  const base: DigestState = {
    enabled: defaultEnabled(),
    lastDigestDate: {},
  };
  if (!r?.value) return base;
  try {
    const p = JSON.parse(r.value) as Partial<DigestState>;
    return {
      enabled: { ...defaultEnabled(), ...(p.enabled ?? {}) },
      lastDigestDate: { ...(p.lastDigestDate ?? {}) },
    };
  } catch {
    return base;
  }
}

export async function setDigestState(state: DigestState): Promise<void> {
  await prisma.seoSettings.upsert({
    where: { key: KEY },
    create: { key: KEY, value: JSON.stringify(state) },
    update: { value: JSON.stringify(state) },
  });
}

export function utcDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}
