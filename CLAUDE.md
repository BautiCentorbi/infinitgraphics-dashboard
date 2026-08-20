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

Próximo paso de producto (paso 5 del orden de implementación): login de
cliente + vista `/c/[slug]` de solo lectura del calendario, con comentarios
y aprobación (`Comment`, cambios de `status` desde el lado del cliente).

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
