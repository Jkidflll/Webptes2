import { neon } from "@netlify/neon";

const COD_ADMIN = "ADMIN2025";

export async function handler(event) {
  if (event.method !== 'POST') return new Response("Only POST", { status:405 });

  const { codigo } = await event.json();
  if (codigo === COD_ADMIN) {
    return new Response(JSON.stringify({ acceso: "admin" }), { headers:{ "Content-Type":"application/json"} });
  }

  const sql = neon(process.env.DATABASE_URL);

  const rows = await sql(
    "SELECT * FROM accesos WHERE codigo = $1 LIMIT 1",
    [codigo.toUpperCase()]
  );

  if (!rows.length) {
    return new Response(JSON.stringify({ error: "Código inválido" }), { status:401, headers:{ "Content-Type":"application/json"} });
  }

  const exp = new Date(rows[0].expiracion);
  if (new Date() > exp) {
    return new Response(JSON.stringify({ error: "Código expirado" }), { status:403, headers:{ "Content-Type":"application/json"} });
  }

  return new Response(JSON.stringify({ acceso: "permitido" }), { headers:{ "Content-Type":"application/json"} });
}
