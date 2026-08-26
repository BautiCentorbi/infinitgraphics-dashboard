// Miniatura de video reutilizable (PieceCard, PiecePreview, PieceDetail,
// MediaField) — un <video> sin más no pinta ningún frame en la mayoría de
// los navegadores hasta que el usuario interactúa o arranca a reproducirse
// (no alcanza con "muted" solo). autoPlay + muted + loop + playsInline es
// la única combinación que todos los navegadores dejan reproducir sin
// gesto del usuario — por eso esto reemplaza el <video muted> suelto que
// había en varios lados y nunca mostraba nada.
export function VideoThumbnail({ src, className }: { src: string; className?: string }) {
  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video src={src} className={className} muted autoPlay loop playsInline preload="metadata" />
  );
}
