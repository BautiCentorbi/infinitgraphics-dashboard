// Segmentos de ruta fijos bajo /admin/* (secciones del panel: métricas,
// calendario general, configuración) — un cliente nunca puede terminar con
// uno de estos slugs, porque la ruta estática le taparía el acceso a su
// propio workspace en /admin/[slug]. Ver createClient en admin/actions.ts.
export const RESERVED_SLUGS = ["metrics", "calendars", "settings"];

// Genera un slug URL-safe a partir de un nombre de cliente (ej. "Cuenca del
// Sur" -> "cuenca-del-sur"). Se usa para las rutas /admin/[slug] y /c/[slug].
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // saca acentos (marcas diacríticas tras NFD)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
