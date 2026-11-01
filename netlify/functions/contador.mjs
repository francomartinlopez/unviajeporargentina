// Cuenta cuántas personas escribieron por el formulario "Sumate".
// Necesita la variable de entorno NETLIFY_TOKEN (token personal de Netlify, solo lectura de formularios).
const SITE_ID = "e0d9199a-aa89-4d54-aacc-7d2f60968077";
const FORMS = ["sumate"];

export default async () => {
  const token = process.env.NETLIFY_TOKEN;
  if (!token) return Response.json({ contactos: null, motivo: "sin token" }, { status: 200 });
  try {
    const r = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/forms`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return Response.json({ contactos: null }, { status: 200 });
    const forms = await r.json();
    const contactos = forms
      .filter((f) => FORMS.includes(f.name))
      .reduce((s, f) => s + (f.submission_count || 0), 0);
    return Response.json({ contactos }, { headers: { "Cache-Control": "public, max-age=600" } });
  } catch {
    return Response.json({ contactos: null }, { status: 200 });
  }
};

export const config = { path: "/api/contador" };
