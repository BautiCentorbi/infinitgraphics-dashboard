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

### Realineación a bcentorbi.com (2026-08-24)

A pedido de Bautista: que cm-suite se sienta parte del mismo universo visual
que `bcentorbi.com` (su portfolio/marca — Infinite Graphics), ya que la app
es una extensión operativa de esa identidad. **Sigue dark-first** — eso no
se reconsideró, solo se realinearon acento, tipografía y la interacción de
los botones:

- **Acento:** `--sky`/`--blue` en `globals.css` ahora son el azul real de
  bcentorbi.com (`#3080ff` / `#155dfc`, sus `blue-500`/`blue-600` — mismo
  azul que ya se usaba como puente en los mails, ver sección de Resend más
  abajo). `--amber`/`--teal` se desaturaron un poco para no competir con ese
  azul. Nuevo token `--ease: cubic-bezier(.4,0,.2,1)` (el easing que usa
  bcentorbi.com en todas sus transiciones) — reemplazó los `ease`/bezier
  sueltos de cada componente.
- **Botones:** `.btn-grad` dejó de ser un gradiente animado (shift de
  `background-position`) y pasó a ser sólido + pill (`border-radius:999px`),
  con hover de elevación + opacidad (`translateY(-2px)`, `opacity`,
  cambio de tono) — el mismo lenguaje de micro-interacción que los botones
  de bcentorbi.com. Nuevo `.btn-ghost` (mismo pill/hover, sin relleno) para
  acciones secundarias. `--grad` (usado en `avatar-ring`/`tab-indicator`,
  no en botones) pasó a gradiente de dos tonos (sky→blue), sin el ámbar que
  tenía antes.
- **Tipografía:** `layout.tsx` reemplazó Bricolage Grotesque/Plus Jakarta
  Sans por **Syne** (display/títulos) + **Darker Grotesque** (body) —
  las mismas familias que usa bcentorbi.com. Darker Grotesque es angosta/
  liviana por diseño, así que el body quedó en `font-weight: 500` (no 400)
  para no perder legibilidad en la UI densa de la app (tablas, formularios).
- **Alcance deliberadamente NO tocado:** el fondo sigue oscuro (no se pasó a
  claro como bcentorbi.com — Bautista lo confirmó explícitamente, la app es
  de uso diario, no una landing), y los colores semánticos de
  `.status-*` (draft/in_review/changes_requested/approved/scheduled/
  published) se mantuvieron distinguibles a propósito, solo retocados en
  tono para no chocar con el azul nuevo.
- Todo el cambio vive en `globals.css` + `layout.tsx` (tokens y clases
  reutilizables) — no se tocó el markup de los ~26 archivos que usan
  `.btn-grad`/`.tabs`/`.status-pill`, siguiendo el mismo patrón de sistema
  de componentes centralizado que ya describe esta sección.

**Ajuste (mismo día):** la primera versión de `.btn-grad`/`.btn-ghost`
(elevación + opacidad) no era el efecto real de bcentorbi.com. Corregido a
lo que Bautista describió: botón **blanco** (`background: var(--text)`,
texto oscuro `var(--bg)`) que al hover se **llena con un swipe de abajo
hacia arriba** (`::before` con `transform: translateY(101%→0)`,
`z-index:-1` dentro de un `isolation:isolate` para que quede recortado al
botón) y el texto pasa a blanco (`color` con su propia transición). También
se subió el tamaño de tipografía general: `html { font-size: 107.5% }` en
`globals.css` (escala todo lo que está en `rem`, o sea casi toda la UI en
Tailwind, sin tocar clase por clase) + los `font-size` en `px` de
`.btn-grad`/`.btn-ghost`/`.tab`/`.status-pill` subidos un poco a mano —
Darker Grotesque rinde más chica que una fuente estándar al mismo tamaño
nominal.

**Color del swipe (mismo día, segunda vuelta):** Bautista no quedó conforme
con el azul de bcentorbi como color de relleno — en una app dark-first el
mecanismo de contraste de bcentorbi no se traduce 1:1: ahí el negro es el
color de máximo contraste porque el fondo es claro; acá el blanco ya cumple
ese rol como estado default del botón, así que un relleno negro al hover
"apagaría" el botón contra el fondo oscuro en vez de resaltarlo, y un
relleno blanco (bordes blancos que se llenan de blanco) no cambia de tono,
así que no se lee como acción primaria. Conclusión: el mecanismo (swipe +
inversión de contraste) se puede copiar tal cual, pero el color de relleno
tiene que ser el acento de marca, no el azul literal de bcentorbi.

Se probaron 3 alternativas (índigo eléctrico / cian eléctrico / ámbar
profundo) y Bautista eligió **ámbar profundo** — retoma el ámbar que ya era
el contraste cálido de la identidad original de cm-suite (antes de este
cambio). Nuevo token `--accent: oklch(0.64 0.19 48)` (+ `--accent-shadow`)
en `globals.css`, **separado de `--amber`** (`oklch(0.78 0.13 65)`, que
sigue usándose solo en el badge de estado "changes_requested"): `--accent`
es más oscuro/saturado a propósito, por dos motivos — (1) necesita
suficiente contraste para que el texto blanco del botón se siga leyendo
encima, cosa que `--amber` (bastante claro) no daba, y (2) para que el
botón primario y el badge de "cambios pedidos" no compitan por el mismo
tono exacto y se confundan siendo los dos cálidos. `--blue`/`--sky` quedan
igual que antes (links, tabs, estado "scheduled") — el cambio fue solo en
el relleno de `.btn-grad`/`.btn-ghost`.

**Dropdowns y botones secundarios (mismo día, tercera vuelta) — esto quedó
firme, no se revirtió:**

- **Dropdowns:** todos (los `<select>` nativos de `FilterBar`/`PieceModal`/
  `NewTaskForm` y los propios de `StatusPicker`/`PriorityPicker`/
  `CardFieldsMenu`) comparten hover — clase `.select-field` (hover de
  borde + foco) para los `<select>`, y `.dd-trigger` (brillo + elevación
  sutil, sin swipe) para los disparadores custom que no lo tenían.
  **Gotcha real encontrado en el camino, útil para el futuro:** varios
  `<select>`/`<input>` (`inputCls` en `PieceModal.tsx`/`NewTaskForm.tsx`,
  y el pin/ítems del sidebar) tenían el color/fondo puesto por
  `style={{ ... }}` en vez de una clase — un `style` inline gana siempre
  sobre cualquier regla de CSS, `:hover` incluido, así que un `hover:` de
  Tailwind agregado a la clase nunca se iba a ver. Se movieron esos
  valores a `border-[var(--border)]`/`className` condicional (sacando el
  `style` inline) para que `hover:`/`focus:` funcionen de verdad. Si se
  agregan más campos con este patrón, no repetir el `style` inline para
  bordes/colores que necesiten reaccionar a `:hover`/`:focus`.
- **Botones secundarios tipo texto** ("Ver calendario →" en
  `CalendarPreview`, "+ Subir" en `DocumentsSection`, "Editar →" en
  `PiecePreview`) no tenían ningún estado de hover. Nueva clase
  `.link-accent` en `globals.css` — hover **a propósito distinto** del
  swipe de `.btn-grad`/`.btn-ghost`, que queda reservado para las acciones
  primarias.
- **Sidebar:** no tenía hover en ninguno de sus links (secciones del
  panel, lista de clientes, sublinks de cliente, "Salir") — mismo gotcha
  de arriba. Se agregó hover real en todos sin tocar qué color usa cada
  estado.

**Color del acento — vueltas 4 y 5, revertidas el mismo día:** después de
elegir `--accent` (ámbar) para el swipe de los botones, se probó llevar
ese mismo ámbar a más lugares — primero el fondo+texto de "seleccionado"
en el sidebar, después (a pedido explícito) **todo** el resto de la app
que todavía usaba `--sky`/`--blue` (texto, íconos, gradientes, bordes de
foco, dots de estado, blobs del login — retiñendo directamente los
tokens `--sky`/`--blue` en `:root` para no editar archivo por archivo).
Bautista probó el resultado y decidió volver atrás: **el ámbar queda
únicamente en el relleno de `.btn-grad`/`.btn-ghost`** (el swipe al
hover) — todo lo demás volvió a azul tal cual estaba antes de esta
sesión (`--sky: #3080ff`, `--blue: #155dfc`, sin retinte). Los tokens
`--accent-bg`/`--accent-border` que se habían agregado para el
"seleccionado" ámbar del sidebar se eliminaron (quedaron sin uso al
revertir). **Si se vuelve a tocar el acento de la app, no dar por hecho
que "más ámbar" es lo que se quiere** — ya se probó dos veces en la misma
sesión y se revirtió las dos veces; confirmar alcance antes de expandirlo
más allá de los botones.
`src/lib/email.ts` nunca se tocó en ninguna de estas vueltas — los mails
transaccionales (Resend) usan `#155dfc` a propósito, documentado más abajo
en la sección de Resend: es la identidad de bcentorbi.com/Infinite
Graphics aplicada solo a los mails (fondo claro), un sistema aparte del
dark-first de la app.

**Sub-ítems de cliente en el sidebar (mismo día, sexta vuelta):**
Workspace/Tareas/Documentación/Notas/Calendario (bajo cada cliente activo
en la lista) tenían el activo en `--sky` (azul) — primer pedido de
Bautista fue que el activo pase a blanco, con como mucho un toque de azul
al hover. Nuevo token `--text-hover: oklch(0.87 0.035 230)` en
`globals.css` (blanco con apenas un tinte de temperatura fría, no "azul"
perceptible) para ese hover sutil — se mantiene, reusar este token si
hace falta el mismo efecto "apenas tibio" en otro lado.

**Ajuste (mismo día, séptima vuelta):** Bautista aclaró que el patrón que
quiere es el mismo en **todo** el menú lateral (secciones del panel arriba
y sub-ítems de cliente abajo): **claro por defecto, azul cuando está
seleccionado, azul (el mismo `--text-hover` sutil) al hacer hover** — no
"nunca azul salvo hover" como se había entendido en la vuelta anterior.
Los sub-ítems volvieron a `text-[var(--sky)]` cuando están activos (antes
en blanco), y el color por defecto (no activo, no hover) pasó de
`--text-faint` a `--text-dim` (un poco más claro, "blanco o clarito" en
palabras de Bautista) para las 4 secciones (Workspace/Tareas/Documentación
/Notas) y el link de Calendario. Las secciones generales del panel
(`TOP_NAV`) ya seguían este mismo patrón sin cambios (default `--text-dim`,
activo con ícono `--sky`).

**Ajuste (mismo día, octava vuelta) — causa real encontrada de "todo se ve
azul" en el sidebar:** Bautista insistió en que TODO el texto por defecto
del menú lateral (no solo los sub-ítems) se veía azul, no solo lo
seleccionado. La sospecha de caché de la vuelta anterior era incorrecta —
había una causa real: `--text-dim`/`--text-faint` (usados en toda la app
para texto secundario) tienen **hue 275**, que en la rueda de color cae del
lado azul-violeta — heredado de la paleta fría original de cm-suite (todos
los grises de la app, `--bg`/`--surface`/`--text` incluidos, se definieron
sobre ese mismo hue a propósito, ver la nota de "Identidad visual"
2026-08-21). Con chroma baja (0.02) no debería notarse, pero a esta
luminosidad en dark mode ese tinte se percibe como azulado — más aún
después de tantas vueltas mirando específicamente "qué es azul y qué no".

Se agregaron dos tokens **100% neutros** (`hue 0`, sin ningún tinte) en
`globals.css`: `--text-dim-plain: oklch(0.75 0 0)` y `--text-faint-plain:
oklch(0.55 0 0)` — misma luminosidad que `--text-dim`/`--text-faint`, pero
sin nada de color. Se aplicaron **solo dentro de `Sidebar.tsx`**
(deliberadamente acotado al menú lateral, no a toda la app — no se tocaron
`--text-dim`/`--text-faint` globales ni su uso en el resto de los
componentes): pin no fijado, ítems de `TOP_NAV` (texto + ícono default +
ícono en hover), fila de cada cliente, label "Tus clientes", botón
"Salir". Si en algún otro lugar de la app se reporta el mismo efecto
("esto se ve azul pero no debería"), esta es la causa más probable a
revisar primero — no asumir caché.

Los sub-ítems de cliente (Workspace/Tareas/Documentación/Notas/Calendario)
quedaron: **blanco por defecto** (`var(--text)`, no `--text-dim-plain` —
Bautista pidió "blanco" explícitamente esta vez, no "clarito"), **azul
tanto en hover como en seleccionado** (`var(--sky)` en los dos casos, ya
no el tinte sutil `--text-hover` de la vuelta anterior — ese token quedó
sin uso y se eliminó de `globals.css`). Si se necesita ese mismo patrón
"blanco / azul sólo en hover-o-activo" en otra lista de la app, replicar
esta combinación (`text-[var(--text)]` default,
`hover:text-[var(--sky)]`, activo en `text-[var(--sky)]`).

**Ajuste (mismo día, novena vuelta):** el texto default de `TOP_NAV`
(Clientes/Métricas/Calendarios/Configuración) había quedado en
`--text-dim-plain` (gris neutro, sin tinte azul, pero no "blanco") — 
Bautista pidió expresamente blanco ahí también, igual que en los
sub-ítems. Pasó a `text-[var(--text)]`. El ícono default sigue en
`--text-faint-plain` (no se tocó, no era parte del pedido) y el activo
sigue exactamente igual (`bg-[var(--surface-2)]` + ícono `--sky`) — sigue
siendo lo único "destacado", ahora con más contraste porque el texto de
alrededor es uniformemente blanco. La fila de cada cliente (nombre, ej.
"Bodega iMatorras") no se tocó en esta vuelta — sigue en
`--text-dim-plain` (gris neutro) por default, no fue parte de lo pedido.

**Ajuste (mismo día, décima vuelta):** faltaba que el texto (no solo el
ícono) del ítem seleccionado de `TOP_NAV` se viera azul, y que ese azul
apareciera únicamente cuando la ruta coincide con ese nav — no al hacer
hover. Antes el texto activo estaba en `text-[var(--text)]` (blanco,
igual que el resto) y solo el ícono cambiaba a `--sky`; ahora el texto
activo también es `text-[var(--sky)]`. El hover de los no-activos sigue
siendo solo `hover:bg-[var(--surface-2)]` (resalta el fondo, no el
texto) — el azul queda exclusivamente atado a `active` (comparación de
ruta), nunca a `:hover`.

**Bug real (mismo día, undécima vuelta) — causa de fondo de varias
"vueltas" anteriores:** después de la décima vuelta, Bautista reportó que
TODOS los ítems del nav volvían a verse azules, estuvieran activos, en
hover, o ninguna de las dos cosas — no era un problema de qué clase usar
en cada estado, era **cascada de CSS**. `globals.css` tenía
`a { color: var(--sky); ... }` escrito SUELTO (fuera de cualquier
`@layer`), después de `@import "tailwindcss"`. En CSS Cascade Layers, una
regla sin capa le gana SIEMPRE a cualquier regla dentro de una capa, sin
importar especificidad — y las clases de Tailwind (incluidas las
arbitrarias, `text-[var(--sky)]`/`text-[var(--text)]`) viven en
`@layer utilities`. Como cada ítem del nav es un `<Link>` (renderiza
`<a>`), ese `a{color}` suelto los forzaba a azul sin importar qué
className tuvieran — por eso ningún ajuste de clases en `Sidebar.tsx`
lograba nada de forma consistente.

**Fix:** todo `globals.css` se reestructuró en `@layer base` (estilos de
elementos HTML puros: `html`, `body`, `h1-h3`, `a`) y `@layer components`
(todas las clases reutilizables: `.btn-grad`, `.btn-ghost`, `.surface`,
`.link-accent`, `.dd-trigger`, `.select-field`, `.card-anim`,
`.avatar-ring`, `.tabs`/`.tab`/`.tab-indicator`, `.status-*`, `.bg-blobs`,
`.bg-app`, `.grain`) — así quedan en el orden de capas que ya establece
Tailwind (`theme, base, components, utilities`) y cualquier clase de
utilidad los puede pisar normalmente, como se espera. **Regla para el
futuro: cualquier CSS nuevo que se agregue a este archivo (selector de
elemento o clase reutilizable) va dentro de uno de estos dos `@layer`,
nunca suelto** — dejarlo suelto reintroduce exactamente este bug,
silencioso y difícil de diagnosticar porque el className en el JSX se ve
perfectamente correcto.

**Ajuste (mismo día, duodécima vuelta):** el `html{font-size:107.5%}` de
la vuelta 1 escala todo lo que está en `rem` parejo, pero Bautista señaló
puntualmente que `text-sm`/`text-base` (los tamaños más usados en toda la
UI — labels, botones, texto de tabla) seguían sintiéndose chicos.
Overrides en `@theme inline` (`globals.css`): `--text-sm: 0.9375rem`
(antes 0.875rem) y `--text-base: 1.0625rem` (antes 1rem), cada uno con su
`--text-*--line-height` a juego — esto redefine lo que generan las
clases `text-sm`/`text-base` de Tailwind en **toda la app**, sin tocar
componente por componente. Verificado en el CSS generado por el build
(`.text-sm{font-size:.9375rem}`, `.text-base{font-size:1.0625rem}`).
**`--text-xs` no se tocó a propósito** (badges/labels chicos) — no
subirlo sin que se pida explícitamente.

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

### Prioridad en tareas (2026-08-21)

`Task.priority` (enum `low`/`medium`/`high`, default `medium`). Chip de
color + menú propio (`PriorityPicker.tsx`, mismo patrón que `StatusPicker`)
en `TaskItem`; se elige también al crear en `NewTaskForm`. Tareas ordenadas
pendientes primero, después por prioridad (alta→baja), después por fecha.

### Pilar de Métricas — arrancado con Instagram (2026-08-21)

Primer paso real del pilar de analytics (antes solo el placeholder
"Próximamente" en `/admin/metrics`). Ojo: esto vive en `/admin/[slug]`
(métricas *por cliente*), no en `/admin/metrics` (esa sigue siendo la vista
general multi-cliente, todavía sin construir).

- **Modelo:** `DataConnection` (cliente ↔ cuenta externa). `@@unique([clientId,
  platform])` — un cliente tiene una sola cuenta conectada por plataforma.
  `provider` default `"windsor"`.
- **Decisión de arquitectura (confirmada con Bautista):** la API key de
  Windsor.ai es **una sola, compartida por todo el deployment** (env var
  `WINDSOR_API_KEY`), no por cliente ni por organización — encaja con "uso
  interno" (ver arriba). **Si esto se vende a otras agencias en el futuro**,
  ahí hace falta un modelo de organizaciones (cada una con su propia key,
  guardada en la base, no como env var global) y los clientes colgando de
  una organización — es una re-arquitectura real, no antes de que haga
  falta de verdad.
- **`src/lib/windsor.ts`**: cliente REST server-only (`import "server-only"`)
  contra `https://connectors.windsor.ai`. **Gotcha real, verificado a mano
  con curl** (no asumido del MCP): el parámetro `accounts`/`filters` de la
  query **no filtra** las filas para el connector `instagram` — la API
  devuelve todas las cuentas conectadas sin importar el filtro. Por eso
  siempre se pide `account_id` en los `fields` y se filtra del lado de la
  app (`Array.filter` en JS). Si se agregan más connectors (Facebook,
  TikTok, LinkedIn), volver a verificar esto con curl antes de asumir que
  el filtro funciona — puede variar por connector.
- **Flujo de conexión:** la cuenta se conecta a Windsor.ai *fuera* de esta
  app (dashboard de Windsor) — lo que hace `ConnectInstagram.tsx` es listar
  las cuentas que Windsor ya ve y dejar elegir cuál corresponde a este
  cliente. No hay OAuth propio acá.
- **`InstagramSection.tsx`**: resumen básico (decisión tomada con
  Bautista, no el detalle completo post-por-post) — seguidores, posts
  totales, interacciones/likes/comentarios/views/saves de los últimos 30
  días, y miniaturas de las últimas publicaciones.
- Este es el patrón a repetir para Facebook/TikTok/LinkedIn cuando se
  pidan (Bautista decidió arrancar solo por Instagram primero, ver charla
  del 2026-08-21) — mismo `DataConnection.platform`, mismo patrón de
  `lib/windsor.ts` por connector, verificando el comportamiento real de
  esa API antes de escribir el parser.

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

### Configuración: administradores + notificaciones por mail (2026-08-21)

**`/admin/settings`** — sección "Administradores": listar, invitar (email +
contraseña) y borrar. Todos los administradores tienen el mismo acceso (ven
y gestionan todos los clientes, no hay permisos más finos todavía).
Protecciones: no podés borrarte a vos mismo desde ahí, y siempre tiene que
quedar al menos un administrador (`src/app/admin/settings/actions.ts`).

**Notificaciones por mail** — vía **Resend**, con dominio propio
**`bcentorbi.online`** ya verificado por Bautista. `src/lib/email.ts`
(`import "server-only"`) expone dos funciones:

- `notifyAdminsOfClientActivity`: el cliente comenta, aprueba o pide
  cambios en una pieza desde `/c/[slug]` → mail a **todos** los
  administradores (no solo a quien creó la pieza — decisión tomada con
  Bautista el 2026-08-21). Enganchado en `src/app/c/[slug]/actions.ts`
  (`addComment` y `clientSetStatus`, esta última cubre tanto aprobar como
  pedir cambios).
- `notifyNewAdmin`: se agrega un administrador nuevo desde
  `/admin/settings` → mail de bienvenida a esa persona. **A propósito no
  incluye la contraseña** (mismo criterio que el resto del proyecto: nunca
  poner secretos donde no hace falta) — la contraseña se la pasa quien
  invita, por fuera del mail.
- Los envíos **nunca rompen el flujo principal**: `sendEmail` en
  `email.ts` loguea y traga el error si Resend falla, no lo propaga. Si
  falta `RESEND_API_KEY`, solo lo advierte por consola y sigue.
- Env vars: `RESEND_API_KEY`, `EMAIL_FROM` (`"cm-suite <notificaciones@
  bcentorbi.online>"`) — en `.env` local y en las 3 environments de Vercel.

**Identidad visual del mail** — a pedido de Bautista, alineada a
**Infinite Graphics** (bcentorbi.com: minimalista, blanco/negro/grises,
acento azul frío), no al dark-first de la app (los mails van con fondo
claro a propósito, por legibilidad/compatibilidad entre clientes de
correo):

- Logo real de Infinite Graphics (bajado de bcentorbi.com, convertido a
  PNG con `sharp`, subido una sola vez a Vercel Blob —
  `brand/infinite-graphics-logo.png`, store `cm-suite-docs`, público) —
  centrado arriba de la tarjeta, con el tag "cm-suite" chico debajo.
- Tarjeta blanca centrada, `max-width: 480px`, sobre fondo gris muy claro.
- Acento **azul `#155dfc`** para el botón principal (CTA) — puente entre
  el azul de bcentorbi.com y el celeste/azul de cm-suite.
- Badges de color por tipo de acción en el mail de actividad de cliente:
  azul (comentario), verde (aprobado), **ámbar** (cambios pedidos — nexo
  con el contraste cálido de la identidad de cm-suite).
- Tipografía: stack de sistema (`-apple-system, Segoe UI, Helvetica,
  Arial`) — las fuentes de la app (Bricolage Grotesque/Plus Jakarta Sans)
  no cargan de forma confiable en clientes de correo, no usarlas acá.
- 3 iteraciones de preview reales (mails de verdad a la casilla de
  Bautista) antes de aprobar el diseño final — no asumir el resultado
  visual de HTML de mail sin mandarlo de verdad, los clientes de correo
  rendean distinto a un navegador.

**Dominio de producción:** el deploy de hoy quedó aliasado también a
**`https://www.bcentorbi.online`** (dominio propio conectado al proyecto
Vercel `cm-suite`, además del `cm-suite-delta.vercel.app` de siempre — los
dos apuntan al mismo deployment).

**Ajustes tras probar en vivo (mismo día):**

- **`notifyAdminsOfClientActivity` manda un mail por admin, no uno solo con
  todos en "to"** — un único mail con varios destinatarios en el mismo
  campo aparece en Gmail colapsado como "para mí y N más" (el desplegable
  que reportó Bautista) y además expone el email de cada admin a los
  demás. Ahora es `Promise.all` de un `sendEmail` individual por
  destinatario.
- **`notifyNewAdmin` ahora incluye la contraseña en el cuerpo del mail**
  (pedido explícito de Bautista, 2026-08-21) — en un bloque destacado
  junto al email, con una nota de que conviene guardarlo en un lugar
  seguro o borrarlo después de entrar. **Es una solución momentánea**: si
  más adelante se construye un flujo de "elegí tu contraseña" o reseteo
  propio, hay que sacar la contraseña de acá y mandar en su lugar un link
  de activación — no dejar las dos cosas conviviendo.

## Vista de solo lectura por link + 3 vistas del lado cliente (2026-09-04)

A pedido de Bautista: que se pueda compartir el calendario de un cliente
por link, sin necesitar mail/login, pero sin poder modificar nada — y que
tanto esa vista como la del cliente logueado tengan las mismas 3 vistas que
ya tiene el admin (Calendario/Kanban/Lista), no solo la lista simple que
había antes.

- **`Client.shareToken`** (nullable, único): token de 24 bytes al azar en
  base64url (`src/lib/shareToken.ts`, `generateShareToken`) — no es un
  `@default` de Prisma a propósito, para poder regenerarlo (revocar el
  link viejo) sin tocar el schema. Se genera al crear un cliente
  (`createClient`, `approveClientRequest`) y se puede regenerar desde
  `/admin/[slug]` (`ShareLinkSection.tsx` → `regenerateShareToken`). Los 3
  clientes que ya existían se migraron con
  `prisma/backfill-share-tokens.ts` (script de un solo uso, ya corrido).
- **`/p/[token]`** (nueva ruta, pública): busca el `Client` por
  `shareToken`, 404 si no existe. A propósito **no pasa por `src/proxy.ts`**
  (el matcher del middleware solo cubre `/admin` y `/c`) — es pública por
  diseño, protegida únicamente por lo impredecible del token. Mismo filtro
  que `/c/[slug]`: nunca muestra piezas en `draft` (un link es todavía
  menos confiable que un login).
- **`ClientCalendarApp.tsx`** (`src/app/c/[slug]/`): reemplazó al viejo
  `ClientCalendar.tsx` (una lista simple) — ahora las 3 vistas
  (`views/ClientCalendarGrid.tsx`, `ClientKanbanView.tsx`,
  `ClientListView.tsx`, versiones livianas y de solo lectura de las
  vistas admin, sin drag & drop) compartidas entre `/c/[slug]` (logueado)
  y `/p/[token]` (link público) — la única diferencia entre ambos modos es
  la prop `interactive`.
- **`interactive={false}`** en `PieceDetail.tsx`: oculta los botones de
  aprobar/pedir cambios y el form de comentar (se siguen viendo los
  comentarios existentes, para dar contexto) — comentar/aprobar sigue
  requiriendo el login real de cliente en `/c/[slug]`, nunca el link
  público. El banner de "pendientes de tu revisión" tampoco aparece sin
  login (no tiene sentido pedirle acción a alguien sin cuenta).

## Administradores acotados: owner + admin (2026-09-04)

A pedido de Bautista: poder invitar administradores que solo vean los
clientes que él autorice, sin poder gestionar otros administradores ni
tocar esos permisos. Ver ARCHITECTURE.md, "Roles y acceso", para el detalle
completo — resumen acá:

- **`UserRole` pasó de `admin`/`client` a `owner`/`admin`/`client`.**
  `bcentorbi.designer@gmail.com` (el admin original, seedeado) se promovió a
  `owner` con un script de un solo uso (`prisma/promote-owner.ts`, se deja
  en el repo por si hace falta repetirlo en otro entorno). El seed
  (`prisma/seed.ts`) ahora crea directamente un `owner`, no un `admin`.
- **`AdminClientAccess`** (tabla nueva): qué clientes puede ver/operar un
  `admin` acotado. El owner no tiene filas acá — accede a todos siempre.
  `src/lib/access.ts` centraliza toda la verificación (`requireClientAccess`
  /`requireClientAccessBySlug`/`accessibleClientIds`) y se llama tanto en
  las páginas (`/admin/[slug]`, `/admin/[slug]/calendar`, `/admin/tasks`)
  como al principio de **cada** server action que recibe un `clientId`/
  `slug` — las actions son invocables directo, no alcanza con ocultar el
  botón en la UI (antes ninguna action de `/admin/[slug]/*` verificaba nada,
  confiaban en que el middleware ya había cortado el acceso a `/admin`; eso
  dejó de alcanzar en cuanto "admin" dejó de significar "acceso total").
- **`/admin/settings`** (gestión de administradores) pasó a ser exclusivo
  del owner — bloqueado en `src/proxy.ts` a nivel de ruta, oculto en el
  sidebar (`Sidebar.tsx`, prop `isOwner`), y cada server action de
  `settings/actions.ts` lo re-verifica igual.
- **Alta de clientes con permiso condicional** (pedido explícito de
  Bautista: "que puedan solo si yo los autorizo, tanto desde el panel, como
  una confirmación si deciden agregar algo"): `User.canCreateClients`
  (default `false`) — el owner lo tildable por admin desde
  `/admin/settings`. Si un admin sin ese permiso intenta crear un cliente
  desde `/admin`, no se crea: queda como `ClientRequest` (`pending`) y le
  llega un mail al owner (`notifyOwnersOfClientRequest`) para aprobar
  (crea el cliente de verdad y se lo asigna a quien lo pidió) o rechazar
  desde una sección nueva en `/admin/settings` (`PendingRequests.tsx`) — el
  admin ve el resultado por mail (`notifyClientRequestResolved`) y sus
  solicitudes pendientes en su propio `/admin` (`MyClientRequests.tsx`).
- **Borrar/renombrar cliente:** renombrar y avatar quedaron permitidos para
  cualquier admin con acceso a ese cliente (no es destructivo). **Borrar
  un cliente quedó reservado al owner** (cascada sobre todo lo del
  cliente — decisión tomada sin volver a preguntar, por ser la acción más
  destructiva del set; revisar con Bautista si en algún momento hace falta
  relajarlo).
- **`notifyAdminsOfClientActivity`** (mail cuando el cliente comenta/aprueba/
  pide cambios) dejó de mandarse a "todos los admins sin importar cliente"
  — ahora va al owner + los admins acotados que tengan ese cliente
  puntual asignado (`AdminClientAccess`), para no filtrar actividad de
  clientes ajenos a un admin acotado.
- **Prisma 7 + `prisma.config.ts`:** la migración de este cambio (agregar
  `owner`, `AdminClientAccess`, `ClientRequest`) reveló que el datasource
  `url`/`directUrl` en `schema.prisma` ya no es válido en Prisma 7 (se
  configura en `prisma.config.ts`). Se agregó `DATABASE_URL_UNPOOLED` a
  `.env` y `prisma.config.ts` lo usa para `prisma migrate` — el pooler de
  Neon (PgBouncer transacción) no soporta bien los advisory locks que usa
  Migrate. El runtime de la app (`src/lib/prisma.ts`) sigue usando el
  pooled `DATABASE_URL` de siempre, sin cambios (ver charla del
  2026-09-04 sobre performance/pooling).

## Pendiente de definir (no bloqueante, ver detalle en ARCHITECTURE.md)

- Neon vs Vercel Postgres.
- Dónde se guardan los adjuntos de las piezas de calendario (probablemente
  Vercel Blob, como en `cds-script`).
- Si hay notificaciones (mail al cliente cuando hay algo nuevo para revisar,
  mail al CM cuando el cliente comenta) — decidir antes de construir
  `Comment`.
