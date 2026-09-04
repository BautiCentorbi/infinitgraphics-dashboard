# Arquitectura — cm-suite

Decisiones técnicas del proyecto. Ver `CLAUDE.md` para los objetivos y el
alcance de negocio. Este archivo se actualiza a medida que se implementa
(pasar cosas de "planeado" a "hecho").

---

## Stack

- **Framework:** Next.js (App Router, TypeScript).
- **Hosting:** Vercel — mismo ecosistema que `cds-script`.
- **Base de datos:** Postgres (Neon o Vercel Postgres — a confirmar cuál al
  provisionar, funcionalmente equivalentes para esto).
- **ORM:** Prisma.
- **Auth:** NextAuth (Credentials provider: email + password). Dos tipos de
  usuario, ver más abajo.
- **Fuente de datos de analytics (pilar 3, más adelante):** Windsor.ai como
  agregador único para Instagram, Google Ads y Meta Ads — ya disponible como
  MCP en este entorno. Evita integrar cada API de plataforma por separado.
  Cuando se llegue a ese pilar, se decide si se usa vía MCP en tiempo de
  desarrollo, vía su API REST desde la app en producción, o ambos.

---

## Roles y acceso

Tres tipos de usuario (`owner`/`admin` acotado agregados 2026-09-04 — antes
solo existía `admin` con acceso total, ver más abajo):

- **`owner`** (vos): único, ve/gestiona todos los clientes y a todo dentro de
  cada uno, y es el único que puede invitar/borrar administradores y decidir
  qué clientes ve cada uno (`/admin/settings`).
- **`admin`** (administrador acotado, invitado por el owner): solo ve/opera
  los clientes que tiene asignados (`AdminClientAccess`) — workspace,
  calendario, notas, tareas, documentos, logins de cliente, métricas dentro
  de esos clientes. Nunca gestiona otros administradores ni ve
  `/admin/settings`. Solo puede dar de alta un cliente nuevo directo si
  `User.canCreateClients` está en `true` (lo decide el owner); si no, su
  pedido queda como `ClientRequest` pendiente y le llega un mail al owner
  para aprobar/rechazar (ver `src/lib/access.ts`, `src/app/admin/actions.ts`).
- **`client`**: login propio, acotado a **un solo cliente** (el suyo). Ve el
  calendario de contenido de su cliente y puede comentar / aprobar piezas.
  No ve el workspace interno del CM (notas, tareas) ni otros clientes.

Login simple email+password por ahora (ya definido). Sin roles más finos
dentro de `admin` (por cliente, editor/viewer, etc.) — se agregan si hace
falta más adelante.

**Dónde se verifica el acceso acotado:** el middleware (`src/proxy.ts`) solo
distingue owner/admin/client a nivel de ruta (`/admin/*` vs `/c/[slug]`, y
`/admin/settings` solo owner) porque corre en Edge sin Prisma. La
verificación real de "¿este admin puede ver/operar este cliente puntual?"
vive en `src/lib/access.ts` (`requireClientAccess`/`requireClientAccessBySlug`)
y se llama tanto al principio de cada página (`/admin/[slug]`,
`/admin/[slug]/calendar`) como al principio de cada server action que
recibe un `clientId`/`slug` — las actions son endpoints invocables directo,
no alcanza con que la UI oculte el botón (mismo criterio que ya se usaba
para `/c/[slug]`, ver más abajo en este archivo).

---

## Modelo de datos (MVP: workspace + calendario)

```
User
  id, email, passwordHash, role (admin | client), clientId (null si admin)

Client
  id, name, slug, createdAt
  (esto es el "tenant" — cada cliente es un espacio separado)

Note              -- pieza suelta de workspace tipo Notion, simple para MVP
  id, clientId, title, body (markdown), updatedAt

Task
  id, clientId, title, done (bool), dueDate (nullable)

ContentPiece       -- una pieza del calendario editorial
  id, clientId
  platform (instagram | facebook | linkedin | tiktok | otro)
  scheduledDate
  title, copy (texto), mediaUrl (nullable, referencia a asset)
  status (draft | in_review | changes_requested | approved | scheduled | published)
  createdBy (userId, siempre admin)
  updatedAt

Comment
  id, contentPieceId, authorUserId, body, createdAt
  -- tanto admin como client pueden comentar; el hilo de comentarios vive
     colgado de la pieza de contenido

ApprovalEvent       -- historial simple de cambios de status (opcional MVP,
  id, contentPieceId, status, changedByUserId, createdAt
  -- pero deja auditoría de "quién aprobó/pidió cambios y cuándo" sin
     necesidad de lógica extra: útil para no perder ese registro)
```

Notas de diseño:
- Todo cuelga de `clientId` — aísla los datos por cliente a nivel de query,
  no solo de UI (importante porque el login `client` tiene que ver *solo* lo
  suyo).
- `Note`/`Task` quedan deliberadamente simples en el MVP (sin jerarquías,
  sin bloques tipo Notion) — se puede enriquecer después si hace falta, pero
  no vale la pena construir un editor de bloques desde el día uno.
- `status` de `ContentPiece` modela el flujo de aprobación: el CM crea en
  `draft`, pasa a `in_review` cuando lo comparte, el cliente puede dejarlo en
  `changes_requested` (con comentario) o `approved`. `scheduled`/`published`
  son estados posteriores, opcionales de trackear a mano en el MVP.

**Pendiente para el pilar de analytics (no se modela todavía, se anota para
no perderlo):**
```
DataConnection
  id, clientId, platform, provider ("windsor"), externalAccountId, connectedAt

MetricSnapshot
  id, dataConnectionId, date, metrics (jsonb) -- flexible por plataforma
```

---

## Estructura de rutas (propuesta)

- `/admin` — login de CM, dashboard con lista de clientes.
- `/admin/[clientSlug]` — workspace del cliente: notas, tareas, acceso al
  calendario.
- `/admin/[clientSlug]/calendar` — vista de calendario editorial (edición).
- `/c/[clientSlug]` — login del cliente, ve solo su calendario.
- `/c/[clientSlug]/calendar` — vista de calendario para el cliente (comentar,
  aprobar).

---

## Orden de implementación (MVP)

1. Scaffold Next.js + Prisma + Postgres + NextAuth. Un solo admin
   hardcodeado al inicio (como en `cds-script`, login único de agencia) para
   no bloquear en gestión de usuarios desde el día uno.
2. Modelo `Client` + CRUD básico de clientes desde `/admin`.
3. Workspace mínimo por cliente: `Note` y `Task` (CRUD simple).
4. `ContentPiece`: CRUD + vista de calendario (mes/lista) desde `/admin`.
5. Login `client` + vista `/c/[clientSlug]` de solo lectura del calendario.
6. `Comment` + cambio de `status` desde la vista del cliente (aprobar / pedir
   cambios).
7. (Fase siguiente, pilar 2 del roadmap) Integración Windsor.ai para
   analytics: `DataConnection` + `MetricSnapshot` + dashboards por
   plataforma.

---

## Pendiente de decidir (no bloqueante, pero anotado)

- Neon vs Vercel Postgres (equivalentes para este caso — decidir al
  provisionar).
- Si los adjuntos de `ContentPiece` (imágenes/video del post) se guardan en
  Vercel Blob (mismo patrón que `cds-script`) — probablemente sí, por
  consistencia.
- Notificaciones (¿el cliente recibe un mail cuando el CM publica algo nuevo
  para revisar? ¿el CM recibe un mail cuando el cliente comenta?) — no es
  parte del MVP pero conviene decidirlo antes de construir `Comment`.
