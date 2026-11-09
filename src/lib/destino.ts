const BASE = "http://ninna.invalid";

// Só aceita caminhos internos, para o "next" não virar um redirecionamento aberto.
// Interpreta o valor como o navegador faria: "/\site.com" e "/" + tabulação + "/site.com"
// começam com uma barra, mas levam a outro site. Devolve o caminho já normalizado.
export function destinoSeguro(next: unknown, padrao = "/") {
  if (typeof next !== "string" || !next.startsWith("/")) return padrao;
  try {
    const url = new URL(next, BASE);
    if (url.origin !== BASE || url.pathname.startsWith("//")) return padrao;
    return url.pathname + url.search + url.hash;
  } catch {
    return padrao;
  }
}
