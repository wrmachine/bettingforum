import { BASE_URL } from "@/lib/seo";
import { prisma } from "@/lib/prisma";

const API_BASE = "https://rapid-indexer.com/api/v1/index.php";

export interface RapidIndexerSettings {
  enabled: boolean;
  apiKey: string;
  batchSize: number;
  autoSubmit: boolean;
}

const DEFAULTS: RapidIndexerSettings = {
  enabled: false,
  apiKey: "",
  batchSize: 100,
  autoSubmit: true,
};

const SETTING_KEYS = ["rapidIndexerEnabled", "rapidIndexerApiKey", "rapidIndexerBatchSize", "rapidIndexerAutoSubmit"] as const;

export async function getRapidIndexerSettings(): Promise<RapidIndexerSettings> {
  try {
    const rows = await prisma.seoSettings.findMany({
      where: { key: { in: [...SETTING_KEYS] } },
    });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      enabled: map.rapidIndexerEnabled === "true",
      apiKey: map.rapidIndexerApiKey ?? "",
      batchSize: Number(map.rapidIndexerBatchSize) || DEFAULTS.batchSize,
      autoSubmit: map.rapidIndexerAutoSubmit !== "false",
    };
  } catch {
    return DEFAULTS;
  }
}

export async function saveRapidIndexerSettings(
  settings: Partial<RapidIndexerSettings>
): Promise<RapidIndexerSettings> {
  const pairs: { key: string; value: string }[] = [];

  if (settings.enabled !== undefined)
    pairs.push({ key: "rapidIndexerEnabled", value: String(settings.enabled) });
  if (settings.apiKey !== undefined)
    pairs.push({ key: "rapidIndexerApiKey", value: settings.apiKey });
  if (settings.batchSize !== undefined)
    pairs.push({ key: "rapidIndexerBatchSize", value: String(settings.batchSize) });
  if (settings.autoSubmit !== undefined)
    pairs.push({ key: "rapidIndexerAutoSubmit", value: String(settings.autoSubmit) });

  for (const { key, value } of pairs) {
    await prisma.seoSettings.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  return getRapidIndexerSettings();
}

function getApiKey(apiKey: string): string {
  if (!apiKey) throw new Error("Rapid Indexer API key is not configured");
  return apiKey;
}

interface CreateTaskResponse {
  success: boolean;
  task_id?: string;
  error?: string;
  message?: string;
}

interface TaskStatus {
  success: boolean;
  task_id: string;
  title?: string;
  status?: string;
  total_links?: number;
  indexed?: number;
  not_indexed?: number;
  pending?: number;
  created_at?: string;
  error?: string;
}

interface TaskLink {
  url: string;
  status: string;
  indexed_at?: string;
}

interface TaskLinksResponse {
  success: boolean;
  task_id: string;
  links?: TaskLink[];
  error?: string;
}

export async function submitUrlsForIndexing(
  urls: string[],
  options?: { title?: string; vip?: boolean; engine?: "google" | "yandex"; apiKey?: string }
): Promise<CreateTaskResponse> {
  const settings = await getRapidIndexerSettings();
  const key = options?.apiKey ?? settings.apiKey;

  const res = await fetch(`${API_BASE}?action=create_task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": getApiKey(key),
    },
    body: JSON.stringify({
      urls,
      type: "indexer",
      engine: options?.engine ?? "google",
      title: options?.title ?? `Betting Forum - ${new Date().toISOString().split("T")[0]}`,
      ...(options?.vip && { vip: true }),
    }),
  });

  if (!res.ok) {
    return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
  }

  return res.json();
}

/**
 * Submit URLs in batches according to the configured batchSize.
 * Returns results for each batch.
 */
export async function submitUrlsInBatches(
  urls: string[],
  options?: { title?: string; vip?: boolean }
): Promise<{ batches: CreateTaskResponse[]; totalSubmitted: number }> {
  const settings = await getRapidIndexerSettings();
  const batchSize = settings.batchSize || 100;
  const batches: CreateTaskResponse[] = [];
  let totalSubmitted = 0;

  for (let i = 0; i < urls.length; i += batchSize) {
    const chunk = urls.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(urls.length / batchSize);
    const result = await submitUrlsForIndexing(chunk, {
      ...options,
      title: `${options?.title ?? "Batch"} (${batchNum}/${totalBatches})`,
      apiKey: settings.apiKey,
    });
    batches.push(result);
    totalSubmitted += chunk.length;
  }

  return { batches, totalSubmitted };
}

export async function checkTaskStatus(taskId: string): Promise<TaskStatus> {
  const settings = await getRapidIndexerSettings();
  const res = await fetch(
    `${API_BASE}?action=get_task&task_id=${encodeURIComponent(taskId)}`,
    {
      headers: { "X-API-Key": getApiKey(settings.apiKey) },
    }
  );

  if (!res.ok) {
    return { success: false, task_id: taskId, error: `HTTP ${res.status}` };
  }

  return res.json();
}

export async function getTaskLinks(taskId: string): Promise<TaskLinksResponse> {
  const settings = await getRapidIndexerSettings();
  const res = await fetch(
    `${API_BASE}?action=get_task_links&task_id=${encodeURIComponent(taskId)}`,
    {
      headers: { "X-API-Key": getApiKey(settings.apiKey) },
    }
  );

  if (!res.ok) {
    return { success: false, task_id: taskId, error: `HTTP ${res.status}` };
  }

  return res.json();
}

/**
 * Auto-submit a single URL if Rapid Indexer is enabled and autoSubmit is on.
 * Designed to be called fire-and-forget from post creation routes.
 */
export async function autoSubmitUrl(type: string, slug: string, title: string): Promise<void> {
  try {
    const settings = await getRapidIndexerSettings();
    if (!settings.enabled || !settings.autoSubmit || !settings.apiKey) return;
    const url = buildPostUrl(type, slug);
    await submitUrlsForIndexing([url], {
      title: `New ${type}: ${title}`,
      apiKey: settings.apiKey,
    });
  } catch {
    // fire-and-forget
  }
}

const TYPE_TO_PATH: Record<string, string> = {
  product: "products",
  thread: "threads",
  listicle: "listicles",
  article: "articles",
  bonus: "bonuses",
};

export function buildPostUrl(type: string, slug: string): string {
  const path = TYPE_TO_PATH[type];
  if (!path) return `${BASE_URL}/${slug}`;
  return `${BASE_URL}/${path}/${slug}`;
}

export type { CreateTaskResponse, TaskStatus, TaskLink, TaskLinksResponse };
