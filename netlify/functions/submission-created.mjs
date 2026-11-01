// Se ejecuta solo cada vez que llega un formulario (Sumate o Sumá tu perfil).
// Manda el aviso a Franco con copia a quien completó el formulario, si dejó un correo.
// Variables de entorno en Netlify: GMAIL_USER (la cuenta de Gmail) y GMAIL_APP_PASSWORD (contraseña de aplicación).
import nodemailer from "nodemailer";

const NOMBRES = {
  sumate: "Sumate",
  perfil: "Sumá tu perfil",
};
const OCULTOS = new Set(["form-name", "sitio", "web", "subject", "ip", "user_agent", "referrer"]);
const ROTULOS = {
  motivo: "Cómo quiere sumarse", nombre: "Nombre", localidad: "Localidad",
  mensaje: "Mensaje", consentimiento: "Consentimiento", grupo: "Tipo de cargo", seccion: "Sección",
  cargo: "Cargo", jurisdiccion: "Dónde", organismo: "Organismo", organismo_texto: "Organismo (escrito)",
  provincia: "Provincia", email: "Correo", telefono: "Teléfono o WhatsApp", experiencia: "Experiencia y por qué le interesa",
};
const esMail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());

export const handler = async (event) => {
  const user = process.env.GMAIL_USER, pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return { statusCode: 200, body: "sin credenciales de correo" };
  const { payload } = JSON.parse(event.body || "{}");
  const d = (payload && payload.data) || {};
  const form = (payload && payload.form_name) || d["form-name"] || "";
  const titulo = NOMBRES[form] || form;
  const copia = esMail(d.email) ? String(d.email).trim() : null;

  const filas = Object.keys(d).filter((k) => !OCULTOS.has(k) && String(d[k] || "").trim())
    .map((k) => `${ROTULOS[k] || k}: ${d[k]}`);
  const asunto = form === "perfil"
    ? (d.subject || "Perfil")
    : `Sumate: ${d.motivo || "mensaje"} · ${d.nombre || ""}`.trim();
  const texto = [
    `Formulario "${titulo}" de argentinaenviaje.netlify.app`,
    "",
    ...filas,
    "",
    copia ? `Copia enviada a: ${copia}` : "Sin correo para mandar copia.",
    "",
    "—",
    "Un viaje por Argentina · Todos juntos bajo un mismo cielo",
  ].join("\n");

  const t = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  await t.sendMail({
    from: `"Un viaje por Argentina" <${user}>`,
    to: user,
    cc: copia || undefined,
    replyTo: copia || undefined,
    subject: asunto,
    text: texto,
  });
  return { statusCode: 200, body: "ok" };
};
