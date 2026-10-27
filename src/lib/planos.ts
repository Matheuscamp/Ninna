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
