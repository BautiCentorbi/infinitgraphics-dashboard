// Compartido entre MediaField (subida/preview en el modal) y PieceCard
// (thumbnail en la vista Calendario) — no hay mimeType guardado para
// mediaUrl, así que se infiere del path.
export function isVideoUrl(url: string) {
  return /\.mp4($|\?)/i.test(url);
}
