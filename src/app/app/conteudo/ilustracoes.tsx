// Visual de cada artigo nos cards de conteúdo. As ilustrações ficam em
// src/components/ilustracoes.tsx, usadas também nas telas públicas.
import { FUNDOS, Ilustracao, type Fundo, type NomeIlustracao } from "@/components/ilustracoes";

export { FUNDOS, Ilustracao, type Fundo, type NomeIlustracao };

export const VISUAL_DOS_ARTIGOS: Record<string, { ilustracao: NomeIlustracao; fundo: Fundo }> = {
  "primeira-consulta-pre-natal": { ilustracao: "prancheta", fundo: "rosa" },
  "exames-pre-natal": { ilustracao: "prancheta", fundo: "azul" },
  "direitos-gestante-trabalho": { ilustracao: "coracao", fundo: "lilas" },
  "alimentacao-gestacao": { ilustracao: "maca", fundo: "menta" },
  "quando-fazer-teste": { ilustracao: "teste", fundo: "rosa" },
  "teste-gratuito-ubs": { ilustracao: "casa", fundo: "azul" },
  "sinais-iniciais": { ilustracao: "teste", fundo: "lilas" },
  "deu-positivo": { ilustracao: "coracao", fundo: "pessego" },
  "acido-folico": { ilustracao: "folha", fundo: "menta" },
  "consulta-pre-concepcional": { ilustracao: "prancheta", fundo: "rosa" },
  "periodo-fertil": { ilustracao: "calendario", fundo: "azul" },
  "habitos-engravidar": { ilustracao: "folha", fundo: "baunilha" },
  "recuperacao-pos-parto": { ilustracao: "lua", fundo: "lilas" },
  "amamentacao-primeiros-dias": { ilustracao: "gota", fundo: "azul" },
  "tristeza-depressao-pos-parto": { ilustracao: "conversa", fundo: "rosa" },
  "sono-bebe-mae": { ilustracao: "lua", fundo: "azul" },
  "luto-gestacional": { ilustracao: "flor", fundo: "lilas" },
  "corpo-depois-da-perda": { ilustracao: "coracao", fundo: "pessego" },
  "grupos-de-apoio": { ilustracao: "conversa", fundo: "menta" },
  "tentar-de-novo": { ilustracao: "flor", fundo: "baunilha" },
  "vacinas-gestacao": { ilustracao: "gota", fundo: "menta" },
  "direitos-gestante-sus": { ilustracao: "casa", fundo: "lilas" },
  "pressao-pre-eclampsia": { ilustracao: "coracao", fundo: "rosa" },
  "infeccao-urinaria": { ilustracao: "gota", fundo: "azul" },
  "diabetes-gestacional": { ilustracao: "lupa", fundo: "baunilha" },
  "ganho-de-peso": { ilustracao: "maca", fundo: "pessego" },
  "atividade-fisica-gestacao": { ilustracao: "folha", fundo: "menta" },
  "saude-bucal-gestacao": { ilustracao: "flor", fundo: "azul" },
  "pre-natal-parceiro": { ilustracao: "conversa", fundo: "lilas" },
  "sinais-parto-chegando": { ilustracao: "calendario", fundo: "rosa" },
  "cuidados-no-parto": { ilustracao: "prancheta", fundo: "pessego" },
  "saude-emocional-gestacao": { ilustracao: "conversa", fundo: "baunilha" },
  "violencia-onde-buscar-ajuda": { ilustracao: "casa", fundo: "rosa" },
  "cuidados-recem-nascido": { ilustracao: "bebe", fundo: "rosa" },
  "contracepcao-pos-parto": { ilustracao: "calendario", fundo: "menta" },
  "plano-pos-parto": { ilustracao: "casa", fundo: "baunilha" },
  "sexualidade-pos-parto": { ilustracao: "coracao", fundo: "lilas" },
  "direitos-perda-gestacional": { ilustracao: "flor", fundo: "azul" },
};

export function visualDoArtigo(slug: string) {
  return VISUAL_DOS_ARTIGOS[slug] ?? { ilustracao: "coracao" as const, fundo: "rosa" as const };
}
