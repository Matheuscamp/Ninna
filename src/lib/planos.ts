// Limites do plano gratuito. No Premium, os recursos abaixo são ilimitados.
// O limite de documentos também é garantido no banco (migração 20261031000000_planos.sql).

export type Plano = "gratuito" | "premium";

export const LIMITES_GRATUITOS = {
  consultasFuturas: 3,
  documentos: 10,
} as const;

export type Recurso = keyof typeof LIMITES_GRATUITOS;

// null = ilimitado
export function limite(plano: Plano, recurso: Recurso): number | null {
  return plano === "premium" ? null : LIMITES_GRATUITOS[recurso];
}

export function vagasRestantes(plano: Plano, recurso: Recurso, usados: number): number | null {
  const maximo = limite(plano, recurso);
  return maximo === null ? null : Math.max(0, maximo - usados);
}

export function atingiuLimite(plano: Plano, recurso: Recurso, usados: number) {
  return vagasRestantes(plano, recurso, usados) === 0;
}

// Períodos do Premium, pagos uma vez (sem renovação automática). Preço em reais.
// Mudar um preço aqui vale para os próximos pagamentos; o webhook confere o valor pago contra esta tabela.
export const PERIODOS = {
  mensal: { titulo: "Ninna Premium · 1 mês", rotulo: "1 mês", meses: 1, preco: 14.9 },
  anual: { titulo: "Ninna Premium · 12 meses", rotulo: "12 meses", meses: 12, preco: 99.9 },
} as const;

export type Periodo = keyof typeof PERIODOS;

export function ehPeriodo(valor: unknown): valor is Periodo {
  return typeof valor === "string" && Object.hasOwn(PERIODOS, valor);
}

export function formatarPreco(reais: number) {
  return reais.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Quanto o período sai por mês e quanto economiza em relação a pagar mês a mês (em %, arredondado para baixo).
export function precoPorMes(periodo: Periodo) {
  const { preco, meses } = PERIODOS[periodo];
  const porMes = preco / meses;
  return { porMes, economia: Math.floor((1 - porMes / PERIODOS.mensal.preco) * 100) };
}
