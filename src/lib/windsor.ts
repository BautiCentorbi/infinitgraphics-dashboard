import "server-only";

// Cliente para la API REST pública de Windsor.ai (connectors.windsor.ai) —
// pilar de Métricas. Server-only: usa WINDSOR_API_KEY, nunca debe llegar al
// navegador.
//
// Nota de comportamiento verificada a mano (2026-08-21, curl directo contra
// la API real, no solo el MCP): el parámetro `accounts`/`filters` en la
// query NO filtra las filas devueltas para el connector "instagram" — la
// API igual devuelve todas las cuentas conectadas. Por eso acá siempre se
// pide `account_id` en los fields y se filtra del lado de la app. Si algún
// día Windsor arregla el filtro server-side, esto sigue funcionando igual
// (solo un poco menos eficiente).
const BASE_URL = "https://connectors.windsor.ai";

async function windsorFetch(
  connector: string,
  fields: string[],
  opts: { datePreset?: string } = {}
): Promise<Record<string, unknown>[]> {
  const apiKey = process.env.WINDSOR_API_KEY;
  if (!apiKey) throw new Error("WINDSOR_API_KEY no está configurada.");

  const params = new URLSearchParams({ api_key: apiKey, fields: fields.join(",") });
  if (opts.datePreset) params.set("date_preset", opts.datePreset);

  const res = await fetch(`${BASE_URL}/${connector}?${params.toString()}`, {
    // Los números cambian todo el tiempo — no cachear entre requests.
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Windsor.ai respondió ${res.status}`);

  const json = (await res.json()) as { data?: Record<string, unknown>[]; error?: string };
  if (json.error) throw new Error(json.error);
  return json.data ?? [];
}

export type WindsorInstagramAccount = {
  accountId: string;
  username: string;
  followers: number;
};

// Lista las cuentas de Instagram ya conectadas en Windsor.ai (conectarlas
// en sí se hace en el dashboard de Windsor, fuera de esta app) — para que
// el admin elija cuál corresponde a cada cliente.
export async function listInstagramAccounts(): Promise<WindsorInstagramAccount[]> {
  const rows = await windsorFetch("instagram", ["account_id", "username", "followers_count"]);
  return rows.map((r) => ({
    accountId: String(r.account_id),
    username: String(r.username),
    followers: Math.round(Number(r.followers_count) || 0),
  }));
}

export type InstagramSummary = {
  username: string;
  followers: number;
  following: number;
  mediaCount: number;
  last30d: {
    likes: number;
    comments: number;
    views: number;
    saves: number;
    totalInteractions: number;
  };
  recentPosts: {
    timestamp: string;
    mediaType: string;
    permalink: string;
    thumbnailUrl: string | null;
    likes: number;
    comments: number;
    reach: number;
  }[];
};

export async function getInstagramSummary(accountId: string): Promise<InstagramSummary> {
  const [profileRows, dailyRows, postRows] = await Promise.all([
    windsorFetch("instagram", ["account_id", "username", "followers_count", "follows_count", "media_count"]),
    windsorFetch(
      "instagram",
      ["account_id", "date", "likes", "comments", "views", "saves", "total_interactions"],
      { datePreset: "last_30dT" }
    ),
    windsorFetch(
      "instagram",
      ["account_id", "timestamp", "media_type", "media_permalink", "media_url", "media_like_count", "media_comments_count", "media_reach"],
      { datePreset: "last_30dT" }
    ),
  ]);

  const profile = profileRows.find((r) => String(r.account_id) === accountId);
  const days = dailyRows.filter((r) => String(r.account_id) === accountId);
  const posts = postRows
    .filter((r) => String(r.account_id) === accountId)
    .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)))
    .slice(0, 6);

  const sum = (key: string) => days.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);

  return {
    username: profile ? String(profile.username) : "",
    followers: profile ? Math.round(Number(profile.followers_count) || 0) : 0,
    following: profile ? Math.round(Number(profile.follows_count) || 0) : 0,
    mediaCount: profile ? Math.round(Number(profile.media_count) || 0) : 0,
    last30d: {
      likes: sum("likes"),
      comments: sum("comments"),
      views: sum("views"),
      saves: sum("saves"),
      totalInteractions: sum("total_interactions"),
    },
    recentPosts: posts.map((p) => ({
      timestamp: String(p.timestamp),
      mediaType: String(p.media_type ?? ""),
      permalink: String(p.media_permalink ?? ""),
      thumbnailUrl: p.media_url ? String(p.media_url) : null,
      likes: Math.round(Number(p.media_like_count) || 0),
      comments: Math.round(Number(p.media_comments_count) || 0),
      reach: Math.round(Number(p.media_reach) || 0),
    })),
  };
}
