# Contexto del proyecto — Suite CM (nombre provisorio)

Este archivo se carga automáticamente en cualquier sesión de Claude Code
abierta en esta carpeta. Es la ficha de objetivos del proyecto — actualizarla
a medida que se tomen decisiones nuevas o cambie el alcance.

**Repo nuevo, separado de `cds-script`** (ese repo queda como está: dashboard
de auditoría Google/Meta Ads específico del cliente CDS). Este proyecto es más
amplio: una suite propia para gestionar el trabajo de Community Manager sobre
varios clientes a la vez.

Uso: `bcentorbi.designer@gmail.com`.

---

## Qué es esto

Una suite interna (**uso propio, no SaaS por ahora**) para trabajar como
Community Manager con varios clientes desde un solo lugar, con tres pilares:

1. **Workspace multi-cliente tipo Notion** — organizar cada cuenta/cliente
   dentro de la misma app: notas, información del cliente, activos, tareas,
   etc. Es el "hub" desde donde se accede a todo lo demás por cliente.
2. **Calendario de contenido compartible con feedback del cliente** — armar
   calendarios editoriales dentro de la app y compartirlos con el cliente para
   que pueda verlos, dejar comentarios y dar el visto bueno (aprobación de
   piezas antes de publicar).
3. **Analytics multi-plataforma** (Instagram, Google Ads, Meta Ads) — conectar
   las cuentas de cada cliente para ver métricas y tendencias, y tomar
   decisiones de contenido/pauta en base a datos reales.

**Idea a futuro (no confirmada, solo exploratoria):** sumar otra API para
análisis de competencia. No es parte del alcance actual, solo queda anotado
para no perderlo.

---

## Prioridad de construcción (definida 2026-08-20)

1. **Primero:** Workspace multi-cliente + Calendario de contenido con
   feedback del cliente (van juntos, son el MVP).
2. **Después:** Analytics multi-plataforma (Instagram / Google Ads / Meta
   Ads).
3. **Más adelante / exploratorio:** análisis de competencia vía otra API.

No construir analytics antes de tener el workspace y el calendario
funcionando — ese es el orden acordado.

---

## Decisiones ya tomadas

- **Modelo:** herramienta de uso interno, no se vende ni se da como producto
  a terceros (por ahora — podría reconsiderarse más adelante, pero no es el
  plan actual).
- **Base técnica:** repo nuevo, no se construye sobre `vercel-dashboard` de
  `cds-script`. Ese dashboard sigue existiendo aparte, específico para la
  auditoría de Ads de CDS.
- **Stack:** sin preferencia definida todavía — a elegir en la etapa de
  diseño técnico (razonable arrancar con algo similar a lo ya conocido:
  Vercel + Node/Python, dado el precedente de `cds-script`, pero no es una
  decisión cerrada).
- **Acceso de clientes al calendario:** login simple por cliente (usuario/
  contraseña propios por cliente, no link público sin autenticación).
- **Escala inicial:** pensado para 1–3 clientes reales al arrancar (ej. CDS +
  algún otro), no para decenas de cuentas desde el día uno.

---

## Arquitectura técnica (definida 2026-08-20)

Ver `ARCHITECTURE.md` para el detalle completo (stack, modelo de datos,
rutas, orden de implementación). Resumen:

- **Stack:** Next.js + TypeScript en Vercel, Postgres (Neon o Vercel
  Postgres) vía Prisma, auth con NextAuth (email + password).
- **Roles:** `admin` (vos, ve todos los clientes) y `client` (login acotado a
  un solo cliente, solo ve su calendario y puede comentar/aprobar).
- **Datos de analytics (pilar 3, más adelante):** Windsor.ai como agregador
  único para Instagram/Google Ads/Meta Ads — ya disponible como MCP en este
  entorno, evita integrar cada API por separado.
- **Modelo de datos MVP:** `Client`, `Note`, `Task`, `ContentPiece` (con
  `status`: draft → in_review → changes_requested/approved →
  scheduled/published), `Comment`, `ApprovalEvent`.
- **Nombre del proyecto:** sigue siendo `cm-suite` por ahora (placeholder,
  sin apuro por definir nombre de marca).

## Estado actual (2026-08-20)

Paso 1 del orden de implementación (ver ARCHITECTURE.md) **completo y en
producción**:

- **Repo:** https://github.com/BautiCentorbi/infinitgraphics-dashboard
  (nombre del repo tiene un typo histórico — falta la "e" de "infinite" — no
  tocar, ya está todo apuntando ahí).
- **Vercel:** proyecto `infinite-graphics/cm-suite`. **Ojo con el nombre:**
  este equipo (`infinite-graphics`) también tiene el proyecto viejo
  `infinitegraphics-dashboard` (el dashboard de CDS, de `cds-script` — no
  confundir, son cosas separadas).
  - URL producción: **https://cm-suite-delta.vercel.app**
  - Deploy hoy hecho a mano por CLI (`vercel --prod`). El auto-deploy en cada
    push todavía no está conectado — falta que Bautista apruebe el "Login
    Connection" con GitHub en Vercel (Settings → Git del proyecto) para que
    el import automático funcione. Hasta que eso esté, cualquier cambio que
    se quiera ver en producción hay que redeployarlo a mano con
    `npx vercel --prod`.
- **Base de datos:** Neon, provisionada vía `vercel integration add neon` y
  conectada automáticamente al proyecto `cm-suite` (esto carga solo un
  montón de env vars `POSTGRES_*`/`PG*`/`DATABASE_URL*` en Vercel). Migración
  inicial corrida (`prisma migrate dev --name init`) y usuario admin creado
  (`prisma/seed.ts`, email `bcentorbi.designer@gmail.com`, password guardada
  por Bautista fuera de este archivo — no está escrita acá).
- **Env vars ya cargadas en Vercel (Production):** `DATABASE_URL` (via Neon,
  automático), `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (estas 3
  cargadas a mano por CLI). `.env` local (gitignored) tiene los mismos
  valores para desarrollo.
- **Flujo de trabajo acordado:** antes de pushear cualquier cambio, probarlo
  en local primero (`npm run dev`, contra la misma DB de Neon — no hay DB de
  desarrollo separada todavía). Recién cuando funciona ahí se commitea/pushea.
- Login probado de punta a punta (local y producción): auth contra Neon
  funciona, `/admin` protegido carga bien.

Paso 2 (CRUD de clientes) también **completo y deployado**:

- Crear cliente (slug autogenerado, sufijo numérico si el nombre se repite),
  renombrar (el slug nunca cambia al renombrar — evita romper el login de
  clientes ya creados) y borrar (cascada sobre notas/tareas/contenido).
- `/admin/[slug]` como placeholder de detalle — se completa en el paso 3
  (workspace: notas y tareas).
- Probado en local por el propio Bautista desde el navegador (crear/
  renombrar/borrar) y deployado a producción.

Paso 3 (workspace mínimo por cliente) también **completo y deployado**:

- `Note`: crear, editar, borrar.
- `Task`: crear (con fecha opcional), marcar hecha/no hecha, borrar.
- Todo en `/admin/[slug]`, scoped por cliente. Probado en local (lógica +
  verificación manual de Bautista en navegador) antes de pushear.

Paso 4 (calendario editorial) también **completo y deployado**, en
`/admin/[slug]/calendar`:

- **Decisión de arquitectura:** se construyó sobre la propia base (Postgres),
  no sobre la API de Notion — se evaluó explícitamente y se descartó, para
  no partir el modelo de datos (login de clientes, comentarios, aprobación)
  entre dos sistemas. Ver charla del 2026-08-20 si hace falta retomar esto.
- Modelo ampliado: `Topic` (categorías fijas por cliente, dropdown, no texto
  libre) + `ContentPiece.hashtags`.
- **3 vistas:** Calendario (grilla mensual, drag & drop entre días para
  reprogramar), Kanban (columnas por estado, drag & drop para cambiar
  estado — deja registro en `ApprovalEvent`), Lista (tabla con filtros por
  plataforma/estado/tema).
- Modal de crear/editar pieza con todos los campos (plataforma, fecha, copy,
  hashtags, tema, URL de media — todavía sin upload real, ver pendientes).
- Gestión de temas inline (agregar/borrar) por cliente.
- Librería usada para drag & drop: `@dnd-kit/core`.
- Probado: lógica de negocio contra Neon (creación, reprogramado, cambio de
  estado con auditoría, `SetNull` al borrar tema, cascada al borrar
  cliente) + verificación manual de Bautista en navegador (encontró un bug
  de caché real — el dev server tenía el cliente de Prisma viejo en memoria
  de antes de la migración de `Topic`; se resolvió reiniciando `npm run dev`
  después de `prisma generate`, no era un bug de código).

Paso 5 (vista de cliente) también **completo y deployado** — con esto el
**MVP completo está terminado** (los 3 pilares base: workspace + calendario +
feedback del cliente, ver el orden de implementación en ARCHITECTURE.md):

- Admin: sección "Acceso del cliente" en `/admin/[slug]` para crear/borrar
  logins de cliente (puede haber más de uno por cliente).
- `/c/[slug]`: el cliente ve su calendario (oculta piezas en `draft` — solo
  ve desde "en revisión" en adelante), separado en "pendientes de tu
  revisión" vs el resto. Puede aprobar / pedir cambios y comentar por pieza.
- Las server actions del lado cliente re-verifican ownership server-side
  (no confían solo en el middleware) — un cliente no puede tocar piezas de
  otro cliente aunque llame la action directo.
- El admin ahora también ve y responde los comentarios del cliente desde el
  modal de edición de pieza en `/admin/[slug]/calendar`.
- Bug real encontrado y arreglado en el camino: `<form>` anidado en
  `PieceModal` (el botón "Borrar" estaba dentro del form de "Guardar")
  causaba un hydration error de React — se separaron como forms hermanos,
  usando el atributo `form=` en el botón "Guardar" para que siga enviando
  el form principal desde afuera.

**Siguiente pilar del roadmap (no MVP, ver `CLAUDE.md` sección "Prioridad de
construcción"): analytics multi-plataforma vía Windsor.ai** — recién ahora
que el workspace/calendario/feedback están andando tiene sentido arrancarlo,
según el orden que se acordó al principio del proyecto.

## Identidad visual (definida 2026-08-21)

Antes de esto la app era Tailwind minimalista blanco/negro genérico. Se
diseñó una identidad propia primero en Claude Design (prototipo clickeable:
login, dashboard de clientes, calendario con sus 3 vistas) y se llevó 1:1 al
código.

- **Paleta:** dark-first, celeste + azul como familia fría (`--sky`,
  `--blue`), ámbar como contraste cálido opuesto (`--amber`), teal para
  "aprobado". Definida en oklch en `src/app/globals.css`. Iteración: primera
  versión fue violeta/magenta/naranja, Bautista pidió cambiar a
  celestes/azules con un contraste opuesto — no volver a esa paleta vieja.
- **Tipografía:** Bricolage Grotesque (display/títulos) + Plus Jakarta Sans
  (body), vía `next/font/google` en `layout.tsx` — reemplazó Geist.
- **Sistema de componentes reutilizable** en `globals.css`: `.btn-grad`
  (botón con gradiente animado), `.surface`/`.surface-hover` (cards),
  `.status-pill` + `.status-{draft,in_review,changes_requested,approved,
  scheduled,published}` (badges de estado de `ContentPiece`), `.tabs`/`.tab`/
  `.tab-indicator` (tabs con indicador deslizante, ver `CalendarApp.tsx`),
  `.bg-blobs`/`.grain` (fondo animado del login), `.card-anim` (entrada
  escalonada de cards). `src/lib/content.ts` expone `STATUS_CLASS` para
  mapear `ContentStatus` → la clase `.status-*` correspondiente (reemplazó
  un `STATUS_COLORS` viejo de clases Tailwind sueltas — no reintroducirlo).
- **`AdminNav`** (`src/components/AdminNav.tsx`): navbar compartida entre
  `/admin`, `/admin/[slug]` y `/admin/[slug]/calendar`.
- Aplicado a las 5 pantallas reales, no solo al lado admin — incluye
  `/c/[slug]` (vista de cliente) para que la experiencia sea consistente de
  punta a punta.
- El diseño original (con la paleta actualizada) sigue publicado como
  artifact de Claude Design — sirve de referencia visual si hay que diseñar
  pantallas nuevas (analytics) en la misma identidad.

### Micro-interacciones del calendario (2026-08-21)

- **Hover-preview** (`PiecePreview.tsx`): en Calendario/Kanban, hacer hover
  sobre una pieza (con delay de 300ms para no titilar) muestra un popover
  con todo el detalle — copy, hashtags, tema, estado, cantidad de
  comentarios — y un botón "Editar" directo. Posicionado con
  `position: fixed` calculado del `getBoundingClientRect()` del elemento
  (así escapa el `overflow:hidden` de la grilla del calendario y las
  columnas del kanban, que si no lo recortarían).
- **Click ya no abre el modal directo** en Calendario/Kanban: navega a la
  vista Lista y resalta esa fila (scroll + flash de fondo). Para editar:
  desde el botón del hover-preview, o con click directo sobre la fila en la
  propia Lista (ahí sí abre el modal, sin cambios).
- **Filtros compartidos** (`FilterBar.tsx`): plataforma/estado/tema, subidos
  de `ListView` a `CalendarApp` — filtran las 3 vistas, no solo la Lista.
- Acciones de `NoteItem`/`TaskItem` (editar/borrar) ahora aparecen solo al
  hover (mismo patrón que ya tenía `ClientRow` en el dashboard de
  clientes) — consistencia general de microinteracciones en toda la app.

### Dashboard del cliente: documentación + resumen (2026-08-21)

`/admin/[slug]` dejó de ser solo notas/tareas — ahora es un dashboard real:

- **`Document`** (modelo Prisma nuevo): manuales/guías reales, subidos por
  el admin. El archivo vive en **Vercel Blob**, store `cm-suite-docs`,
  **acceso público** (la URL no es indexable/adivinable, pero no requiere
  token para servirla — si en algún momento hace falta que sean privados,
  hay que migrar a `access: "private"` y resolver cómo generar URLs
  firmadas para verlos/descargarlos).
- **Upload directo navegador→Blob** (`@vercel/blob/client`, no server
  action con el archivo) — necesario porque un PDF puede superar el límite
  de tamaño de una server action normal (~4.5MB). El flujo:
  `src/app/api/documents/upload/route.ts` (autoriza el token, solo
  `role: "admin"`) → el navegador sube directo a Blob → el cliente llama
  `createDocumentRecord` (server action normal) para guardar los metadatos
  en la base. El callback `onUploadCompleted` de Vercel (webhook) **no
  llega en localhost** — por eso el registro en la base se crea desde el
  cliente, no desde ese webhook; si se necesitara procesar el archivo del
  lado servidor en el futuro, tenerlo en cuenta.
- **`StatTiles`**: piezas totales / pendientes de revisión / tareas
  pendientes / documentos — resumen arriba de la página.
- **`CalendarPreview`**: próximas 5 piezas programadas, con link al
  calendario completo.
- Layout: dos columnas (calendario+tareas | documentación+notas),
  contenedor `max-w-6xl`.
- **Gotcha real que costó una vuelta**: varias filas de formularios usaban
  clases `sm:` de Tailwind (reaccionan al ancho de la *ventana*, no del
  contenedor) — al pasar de una sola columna ancha a dos columnas
  angostas, esas filas desbordaban aunque la ventana fuera ancha. Si se
  agregan más widgets a columnas angostas, revisar que no se reintroduzca
  este problema (usar `min-w-0`/`flex-wrap` en vez de asumir que hay
  espacio, y evitar grids `sm:grid-cols-N` dentro de columnas que ya son
  la mitad del ancho).

### Tarjetas configurables + Formato/Notas internas (2026-08-21)

A pedido de Bautista (inspirado en el viejo esquema de Notion de CDS —
`CDS-Script-Notion/build_notion.py`, que tenía Formato como select y Notas
internas como rich_text separado del Copy):

- **`ContentPiece.format`** (enum `ContentFormat`, opcional): Carrusel /
  Post imagen / Reel / Video / Story / Texto / Otro.
- **`ContentPiece.internalNotes`** (texto, opcional): notas que **solo ve el
  admin** — nunca se serializan ni se mandan a `/c/[slug]` (a propósito, ver
  `src/app/c/[slug]/types.ts` y `page.tsx` — no tienen este campo).
- **Tarjetas configurables** (`CardFieldsMenu.tsx` + `useCardFields` en
  `src/lib/content.ts`): qué propiedades se muestran en las tarjetas de
  Calendario/Kanban (plataforma, estado, tema, formato, hashtags,
  comentarios, notas internas) es elegible desde un menú "Tarjetas" al lado
  de los filtros. **Se persiste en `localStorage`, no en la base** — es una
  preferencia de visualización personal/del navegador, no un dato del
  cliente. Kanban oculta "estado" automáticamente aunque esté tildado (ya
  está implícito en la columna).
- Formato y Notas internas también están en el modal de edición, el hover-
  preview, y (Formato) como columna en la vista Lista.

### Editar estado desde cualquier vista + revisión del cliente en "programado" (2026-08-21)

- **`updateContentPiece`** (el submit del modal) ahora también guarda el
  estado — antes el estado solo cambiaba arrastrando en el kanban
  (`changePieceStatus`). Deja el mismo registro en `ApprovalEvent` que el
  drag&drop, y solo si el estado realmente cambió (no genera eventos de
  auditoría de más al guardar sin tocarlo).
- **`StatusPicker.tsx`**: reemplaza el `<select>` nativo que se usaba para
  el estado. Motivo: los `<option>` de un select no se pueden colorear de
  forma confiable entre navegadores — terminaban con texto casi invisible
  sobre el fondo blanco que el navegador les pone por default. Es un menú
  propio (con `motion` para la animación de apertura) que reusa las mismas
  clases `.status-*`. Usado en 3 lugares: el popover de hover
  (Calendario/Kanban — cambia al instante, sin abrir nada), la columna
  Estado de la vista Lista (ídem, con `stopPropagation` para no disparar el
  click de la fila), y el modal de edición (ahí es distinto: va como
  `<input type="hidden">` + estado de React, se guarda recién al tocar
  "Guardar" junto con el resto de los campos — no al instante como en los
  otros dos, para ser consistente con cómo se comporta el resto del form).
- **Cliente:** ahora puede aprobar/pedir cambios también en piezas
  `scheduled` (programado), no solo `in_review`/`changes_requested`.
  `approved`/`published` siguen siendo de solo-comentario. `draft` sigue
  oculto para el cliente (sin cambios — decisión reconfirmada con
  Bautista, no revertir esto sin volver a preguntar).
- **`motion`** (ex Framer Motion) instalada — animaciones de entrada/salida
  en el popover de hover, el modal, el menú "Tarjetas", y transición al
  cambiar de vista en el calendario. Usar esta librería (no otra) si se
  agregan más animaciones — ya está integrada y es la que Bautista pidió.

### Sidebar flotante del panel admin (2026-08-21)

Reemplaza el viejo `AdminNav` (top bar). Vive en `src/components/Sidebar.tsx`
+ `src/app/admin/layout.tsx` (shell compartido por todo `/admin/*` — fetch de
clientes ahí, no en cada página).

- **Isla flotante**: separada de los bordes de la ventana (`GAP=12px`), no
  pegada a la pared. Se expande sobre el contenido (no lo empuja) al hover o
  al fijarla con el **pin** (grande, siempre visible, con label "Fijar
  menú"/"Fijado" — persistido en localStorage `cm-suite:sidebar-pinned`).
- **4 secciones de panel** (`TOP_NAV` en Sidebar.tsx): Clientes (la lista de
  siempre, con sub-items Workspace/Tareas/Documentación/Notas — anchors
  dentro de la misma página, ver ids en `admin/[slug]/page.tsx` — y
  Calendario), **Métricas**, **Calendarios** (vista general multi-cliente
  con filtro), **Configuración** (administradores del equipo). Las últimas 3
  son páginas "Próximamente" (`src/components/ComingSoon.tsx`) — Bautista
  las va a pedir una por una más adelante, esto solo dejó el lugar en la
  navegación.
- **`RESERVED_SLUGS`** en `src/lib/slug.ts` (`metrics`, `calendars`,
  `settings`): un cliente nunca puede terminar con uno de estos slugs — si
  no, la ruta estática de esa sección le taparía el acceso a su propio
  workspace en `/admin/[slug]`. Si se agrega una sección nueva bajo
  `/admin/<algo>`, sumar `<algo>` a esta lista.
- **`Client.avatarUrl`**: foto de perfil real por cliente, mismo patrón de
  Blob que `Document` (`ClientAvatarUpload.tsx`, sube desde
  `/admin/[slug]`). Si no hay foto, cae al gradiente+iniciales de siempre
  (`src/lib/avatar.ts`, compartido entre `ClientRow` y `Sidebar` para que el
  mismo cliente tenga el mismo color en los dos lados).

### Nota: warning de SSL de `pg` (resuelto 2026-08-21)

El warning "SECURITY WARNING: The SSL modes 'prefer', 'require'..." que
aparecía en consola no era una vulnerabilidad — era un aviso de la librería
`pg` de que en su próxima versión mayor `sslmode=require` va a dejar de
comportarse como `verify-full` (validación de certificado) y va a pasar a
la semántica libpq estándar (más débil, no valida certificado). Se resolvió
seteando explícitamente `sslmode=verify-full` en `DATABASE_URL` — en
`.env`, `.env.local` (ambos gitignored, no viajan con el repo) y en las 3
environments de Vercel (Production/Preview/Development, vía `vercel env
rm`/`add`). Si se clona el repo en otra PC o se recrea `.env`/`.env.local`
desde cero, usar `sslmode=verify-full` (no `sslmode=require`) en el
connection string de Neon.

### Pendiente operativo (no bloquea seguir developeando)

- Conectar GitHub↔Vercel para auto-deploy (Bautista lo hace desde la web).
- Decidir si vale la pena separar una DB de desarrollo distinta de la de
  producción en Neon (hoy comparten la misma) — no urgente a esta escala.

## Pendiente de definir (no bloqueante, ver detalle en ARCHITECTURE.md)

- Neon vs Vercel Postgres.
- Dónde se guardan los adjuntos de las piezas de calendario (probablemente
  Vercel Blob, como en `cds-script`).
- Si hay notificaciones (mail al cliente cuando hay algo nuevo para revisar,
  mail al CM cuando el cliente comenta) — decidir antes de construir
  `Comment`.
