import "server-only";
import { headers } from "next/headers";

// Endereço público do site, para links que saem do app (e-mails, login com Google, checkout).
// Só a origem (protocolo + domínio + porta): um caminho a mais no
// NEXT_PUBLIC_SITE_URL duplicaria o /auth/callback dos links.
export async function origem() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || (await headers()).get("origin") || "http://localhost:3000";
  return new URL(base).origin;
}
