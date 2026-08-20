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

// Avisa a todos los admins cuando el cliente comenta, aprueba o pide
// cambios en una pieza — a todos, sin importar quién la haya cargado (ver
// charla con Bautista, 2026-08-21).
export async function notifyAdminsOfClientActivity({
  clientName,
  clientSlug,
  pieceTitle,
  pieceId,
  action,
  commentBody,
}: {
  clientName: string;
  clientSlug: string;
  pieceTitle: string;
  pieceId: string;
  action: "comment" | "approved" | "changes_requested";
  commentBody?: string;
}) {
  const admins = await prisma.user.findMany({ where: { role: "admin" }, select: { email: true } });
  if (admins.length === 0) return;

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

  await sendEmail(
    admins.map((a) => a.email),
    `${clientName} ${actionLabel} "${pieceTitle}"`,
    html
  );
  // pieceId no se usa en el link todavía (el calendario no tiene deep-link
  // a una pieza puntual) — queda como parámetro por si se agrega después.
  void pieceId;
}

// Avisa a un administrador nuevo que ya tiene acceso — sin la contraseña
// (eso se lo pasa quien lo invitó, por fuera del mail, mismo criterio que
// las demás credenciales de este proyecto).
export async function notifyNewAdmin({ email, invitedByEmail }: { email: string; invitedByEmail: string }) {
  const html = wrapEmail(
    "Te agregaron como administrador en cm-suite",
    `<p style="margin: 0 0 12px;">${invitedByEmail} te agregó como administrador — vas a poder ver y gestionar todos los clientes.</p>
     <p style="margin: 0;">Entrá con este email (<strong style="color:#171717;">${email}</strong>) y la contraseña que te haya pasado quien te invitó.</p>`,
    `${APP_URL}/login`,
    "Entrar a cm-suite"
  );
  await sendEmail(email, "Te agregaron como administrador en cm-suite", html);
}
