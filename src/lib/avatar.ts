// Compartido entre ClientRow (dashboard) y Sidebar — mismo cliente, mismo
// color en los dos lados.
export const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, var(--sky), var(--blue))",
  "linear-gradient(135deg, var(--amber), var(--blue))",
  "linear-gradient(135deg, var(--teal), var(--sky))",
  "linear-gradient(135deg, var(--blue), var(--amber))",
  "linear-gradient(135deg, var(--sky), var(--amber))",
];

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}
