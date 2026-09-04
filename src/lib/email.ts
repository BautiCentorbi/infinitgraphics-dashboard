import "server-only";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

// Notificaciones por mail — Resend, dominio bcentorbi.online verificado por
// Bautista. Server-only: nunca debe llegar al navegador.
function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

const FROM = process.env.EMAIL_FROM ?? "cm-suite <notificaciones@bcentorbi.online>";

// Los envíos nunca deben romper el flujo principal (comentar, aprobar,
// crear admin) si Resend falla — se loguea y listo, no se propaga el error.
async function sendEmail(to: string | string[], subject: string, html: string) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY no configurada — no se envió el mail:", subject);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("Error enviando mail vía Resend:", err);
  }
}

// Plantilla visual — alineada a la identidad de Infinite Graphics
// (bcentorbi.com: minimalista, blanco/negro/grises, acento azul frío) y al
// sistema de cm-suite (celeste/azul como familia fría, ámbar como
// contraste). Fondo claro a propósito: es mail, no la app dark-first —
// mejor legibilidad y compatibilidad entre clientes de correo.
// Logo real de la marca, subido una sola vez a Vercel Blob (público, mismo
// store que Document/avatares) — no re-subir en cada mail.
const LOGO_URL = "https://oawusurgainoiumv.public.blob.vercel-storage.com/brand/infinite-graphics-logo.png";
const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

function wrapEmail(title: string, bodyHtml: string, ctaUrl?: string, ctaLabel?: string): string {
  return `
    <body style="margin:0; padding:32px 16px; background:#f4f4f5; font-family:${FONT_STACK};">
      <div style="max-width: 480px; margin: 0 auto;">
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <div style="text-align: center; padding-bottom: 24px; margin-bottom: 24px; border-bottom: 1px solid #f4f4f5;">
            <img src="${LOGO_URL}" alt="Infinite Graphics" height="34" style="display: inline-block; height: 34px; width: auto;" />
            <p style="margin: 10px 0 0; font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: #9f9fa9; text-transform: uppercase;">cm-suite</p>
          </div>

          <h1 style="font-size: 18px; font-weight: 700; letter-spacing: -0.01em; color: #171717; margin: 0 0 16px;">${title}</h1>
          <div style="font-size: 14px; line-height: 1.65; color: #52525c;">${bodyHtml}</div>
          ${
            ctaUrl
              ? `<a href="${ctaUrl}" style="display: inline-block; margin-top: 24px; padding: 11px 20px; background: #155dfc; color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 13px; font-weight: 600;">${ctaLabel}</a>`
              : ""
          }
        </div>

        <p style="margin: 20px 4px 0; font-size: 11px; line-height: 1.5; color: #a1a1a1; text-align: center;">
          Enviado por cm-suite, la suite interna de gestión de contenido de Infinite Graphics.
        </p>
      </div>
    </body>
  `;
}

const ACTION_BADGE: Record<"comment" | "approved" | "changes_requested", { label: string; bg: string; fg: string }> = {
  comment: { label: "Comentario", bg: "#eff6ff", fg: "#155dfc" },
  approved: { label: "Aprobado", bg: "#f0fdf4", fg: "#16a34a" },
  changes_requested: { label: "Cambios pedidos", bg: "#fffbeb", fg: "#d97706" },
};

function badge(action: "comment" | "approved" | "changes_requested"): string {
  const { label, bg, fg } = ACTION_BADGE[action];
  return `<span style="display: inline-block; padding: 3px 10px; border-radius: 999px; background: ${bg}; color: ${fg}; font-size: 11px; font-weight: 700; letter-spacing: 0.02em;">${label}</span>`;
}

const APP_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

// Avisa a quien gestiona este cliente cuando el cliente comenta, aprueba o
// pide cambios en una pieza: el owner (siempre, ve todo) + los admins
// acotados que tengan este cliente asignado (ver AdminClientAccess,
// CLAUDE.md "Administradores acotados", 2026-09-04). Antes era "todos los
// admins sin importar cliente" — ya no aplica porque un admin acotado no
// debería enterarse de actividad de clientes que no le corresponden.
export async function notifyAdminsOfClientActivity({
  clientId,
  clientName,
  clientSlug,
  pieceTitle,
  pieceId,
  action,
  commentBody,
}: {
  clientId: string;
  clientName: string;
  clientSlug: string;
  pieceTitle: string;
  pieceId: string;
  action: "comment" | "approved" | "changes_requested";
  commentBody?: string;
}) {
  const recipients = await prisma.user.findMany({
    where: {
      OR: [{ role: "owner" }, { role: "admin", clientAccess: { some: { clientId } } }],
    },
    select: { email: true },
  });
  if (recipients.length === 0) return;

  const actionLabel = {
    comment: "dejó un comentario en",
    approved: "aprobó",
    changes_requested: "pidió cambios en",
  }[action];

  const html = wrapEmail(
    `${clientName} ${actionLabel} una pieza`,
    `<p style="margin: 0 0 12px;">${badge(action)}</p>
     <p style="margin: 0 0 12px; color: #171717; font-weight: 600;">${pieceTitle}</p>
     ${
       commentBody
         ? `<p style="margin:0; background:#fafafa; border: 1px solid #f4f4f5; padding:12px 14px; border-radius:10px; white-space:pre-wrap; color: #3f3f46;">${commentBody}</p>`
         : ""
     }`,
    `${APP_URL}/admin/${clientSlug}/calendar`,
    "Ver en el calendario"
  );

  const subject = `${clientName} ${actionLabel} "${pieceTitle}"`;
  // Un envío por destinatario, no un solo mail con todos en "to" — así cada
  // uno ve su propia copia (sin exponer el email de los demás) y no aparece
  // en la bandeja como un mail "para X y N más" con el desplegable de Gmail.
  await Promise.all(recipients.map((r) => sendEmail(r.email, subject, html)));
  // pieceId no se usa en el link todavía (el calendario no tiene deep-link
  // a una pieza puntual) — queda como parámetro por si se agrega después.
  void pieceId;
}

// Avisa a un administrador nuevo que ya tiene acceso. Incluye la
// contraseña en el cuerpo del mail — a pedido explícito de Bautista
// (2026-08-21), como solución momentánea mientras no haya un flow de
// "elegí tu contraseña"/reseteo. Si más adelante se agrega ese flow, volver
// a sacarla de acá y mandar solo un link de activación.
export async function notifyNewAdmin({
  email,
  password,
  invitedByEmail,
  clientNames,
}: {
  email: string;
  password: string;
  invitedByEmail: string;
  // Clientes que ya le asignaron al invitarlo — puede estar vacío si el
  // owner todavía no le asignó ninguno (queda sin poder ver clientes hasta
  // que se lo asignen desde /admin/settings).
  clientNames: string[];
}) {
  const accessLine =
    clientNames.length > 0
      ? `Vas a poder ver y gestionar: <strong>${clientNames.join(", ")}</strong>.`
      : `Todavía no tenés ningún cliente asignado — ${invitedByEmail} te va a dar acceso a los que correspondan.`;

  const html = wrapEmail(
    "Te agregaron como administrador en cm-suite",
    `<p style="margin: 0 0 12px;">${invitedByEmail} te agregó como administrador. ${accessLine}</p>
     <p style="margin: 0 0 12px;">Entrá con estos datos:</p>
     <div style="background:#fafafa; border: 1px solid #f4f4f5; border-radius:10px; padding:12px 14px; margin: 0 0 12px;">
       <p style="margin: 0 0 4px; color: #171717;"><strong>Email:</strong> ${email}</p>
       <p style="margin: 0; color: #171717;"><strong>Contraseña:</strong> ${password}</p>
     </div>
     <p style="margin: 0; font-size: 12px; color: #9f9fa9;">Guardá este mail en un lugar seguro o borralo una vez que hayas entrado.</p>`,
    `${APP_URL}/login`,
    "Entrar a cm-suite"
  );
  await sendEmail(email, "Te agregaron como administrador en cm-suite", html);
}

// Un admin acotado sin permiso de alta directa (User.canCreateClients)
// pidió un cliente nuevo — avisa a todos los owners para que lo aprueben o
// rechacen desde /admin/settings (ver ClientRequest en el schema).
export async function notifyOwnersOfClientRequest({
  requesterEmail,
  clientName,
}: {
  requesterEmail: string;
  clientName: string;
}) {
  const owners = await prisma.user.findMany({ where: { role: "owner" }, select: { email: true } });
  if (owners.length === 0) return;

  const html = wrapEmail(
    "Solicitud de cliente nuevo",
    `<p style="margin: 0 0 12px;">${requesterEmail} pidió dar de alta un cliente nuevo:</p>
     <p style="margin: 0 0 12px; color: #171717; font-weight: 600;">${clientName}</p>
     <p style="margin: 0;">Aprobalo o rechazalo desde Configuración.</p>`,
    `${APP_URL}/admin/settings`,
    "Revisar solicitud"
  );
  await Promise.all(owners.map((o) => sendEmail(o.email, `Solicitud de cliente: ${clientName}`, html)));
}

// Avisa al admin que pidió el cliente si el owner lo aprobó o rechazó.
export async function notifyClientRequestResolved({
  requesterEmail,
  clientName,
  approved,
}: {
  requesterEmail: string;
  clientName: string;
  approved: boolean;
}) {
  const html = wrapEmail(
    approved ? "Tu solicitud fue aprobada" : "Tu solicitud fue rechazada",
    approved
      ? `<p style="margin:0;">Se creó el cliente <strong>${clientName}</strong> que pediste — ya lo tenés asignado.</p>`
      : `<p style="margin:0;">Se rechazó tu pedido de alta del cliente <strong>${clientName}</strong>.</p>`,
    approved ? `${APP_URL}/admin` : undefined,
    approved ? "Ver clientes" : undefined
  );
  await sendEmail(requesterEmail, approved ? `Aprobado: ${clientName}` : `Rechazado: ${clientName}`, html);
}
