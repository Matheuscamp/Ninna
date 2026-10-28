// Acesso por convite durante o teste fechado: com CODIGO_CONVITE definido, o site
// só abre para quem digitar o código (fica guardado num cookie). Sem a variável,
// o site fica aberto, como no lançamento.

export const COOKIE_CONVITE = "ninna-convite";
export const DIAS_CONVITE = 90;

// Caminhos que funcionam sem convite: a própria tela do convite, os avisos do
// Mercado Pago (que não têm cookie) e o robots.txt (que pede aos buscadores para não indexar).
const LIVRES = ["/convite", "/api/mercadopago/webhook", "/robots.txt"];

export function caminhoLivre(pathname: string) {
  return LIVRES.some((c) => pathname === c || pathname.startsWith(c + "/"));
}

// O cookie guarda um resumo do código, nunca o código em si.
export async function resumoDoConvite(codigo: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`ninna:${codigo.trim()}`));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

// O código esperado (null = site aberto).
export function codigoDoConvite() {
  const codigo = process.env.CODIGO_CONVITE?.trim();
  return codigo ? codigo : null;
}

export async function conviteValido(valorDoCookie: string | undefined, codigo: string) {
  if (!valorDoCookie) return false;
  return valorDoCookie === (await resumoDoConvite(codigo));
}

// Só aceita voltar para caminhos internos, para o "next" não virar um redirecionamento aberto.
export function destinoSeguro(next: unknown) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}
