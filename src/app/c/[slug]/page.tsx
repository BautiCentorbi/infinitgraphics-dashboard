export default async function ClientCalendarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-lg font-semibold">Calendario — {slug}</h1>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">
        Acá va el calendario de contenido de este cliente (siguiente paso de
        implementación — ver ARCHITECTURE.md).
      </p>
    </div>
  );
}
