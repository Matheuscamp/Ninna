import { SECOES_PLANO, type Pergunta } from "@/content/plano-parto";

// Respostas do plano de parto: id da pergunta → texto, uma opção ou várias opções.
export type RespostasPlano = Record<string, string | string[]>;

const PERGUNTAS: Pergunta[] = SECOES_PLANO.flatMap((s) => s.perguntas);

// Lê o formulário guardando só perguntas e opções que existem (o resto é ignorado),
// com textos aparados e cortados no tamanho máximo. Respostas vazias saem.
export function lerRespostas(formData: FormData): RespostasPlano {
  const respostas: RespostasPlano = {};
  for (const p of PERGUNTAS) {
    if (p.tipo === "texto") {
      const valor = String(formData.get(p.id) ?? "").trim().slice(0, p.max);
      if (valor) respostas[p.id] = valor;
    } else {
      const validas = new Set(p.opcoes.map((o) => o.id));
      const marcadas = formData.getAll(p.id).filter((v): v is string => typeof v === "string" && validas.has(v));
      if (p.tipo === "unica" && marcadas[0]) respostas[p.id] = marcadas[0];
      if (p.tipo === "varias" && marcadas.length > 0) respostas[p.id] = [...new Set(marcadas)];
    }
  }
  return respostas;
}

// Respostas lidas do banco (jsonb): mesma limpeza, para nunca mostrar algo fora do formulário.
export function normalizarRespostas(dados: unknown): RespostasPlano {
  const formData = new FormData();
  if (dados && typeof dados === "object") {
    for (const [chave, valor] of Object.entries(dados)) {
      for (const v of Array.isArray(valor) ? valor : [valor]) if (typeof v === "string") formData.append(chave, v);
    }
  }
  return lerRespostas(formData);
}

// O que vai para o documento impresso: só seções com alguma resposta, já com os rótulos.
export function documentoDoPlano(respostas: RespostasPlano) {
  return SECOES_PLANO.map((secao) => ({
    id: secao.id,
    titulo: secao.titulo,
    itens: secao.perguntas.flatMap((p) => {
      const r = respostas[p.id];
      if (!r) return [];
      if (p.tipo === "texto") return [{ titulo: p.titulo, valores: [r as string] }];
      const ids = Array.isArray(r) ? r : [r];
      const valores = p.opcoes.filter((o) => ids.includes(o.id)).map((o) => o.rotulo);
      return valores.length > 0 ? [{ titulo: p.titulo, valores }] : [];
    }),
  })).filter((s) => s.itens.length > 0);
}

export function totalRespondidas(respostas: RespostasPlano) {
  return Object.keys(respostas).length;
}

export const TOTAL_PERGUNTAS = PERGUNTAS.length;
