import type { Filtros } from "@/lib/documentos";

// Monta o endereço da lista com os filtros (sem parâmetros vazios ou padrão).
export function urlDaLista(f: Filtros, mudancas: Partial<Filtros> = {}) {
  const final = { ...f, ...mudancas };
  const params = new URLSearchParams();
  if (final.q) params.set("q", final.q);
  if (final.categoria) params.set("categoria", final.categoria);
  if (final.de) params.set("de", final.de);
  if (final.ate) params.set("ate", final.ate);
  if (final.ordem && final.ordem !== "recentes") params.set("ordem", final.ordem);
  const texto = params.toString();
  return texto ? `/app/documentos?${texto}` : "/app/documentos";
}
