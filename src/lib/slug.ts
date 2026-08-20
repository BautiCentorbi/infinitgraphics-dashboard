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
