import type { Caption } from "@remotion/captions";
import { FPS } from "./tema";

// Respiro antes e depois da fala de cada cena, e a duração das transições, em quadros.
// DEPOIS precisa ser maior que a transição, para ela acontecer no silêncio entre as falas.
export const ANTES = 12;
const DEPOIS = 22;
export const TRANSICAO = 16;

type Narracao = { cenas: Record<string, { duracao: number; palavras: Caption[] }> };

export type Cena = {
  id: string;
  // Quadro em que a cena começa no vídeo inteiro (as transições sobrepõem as cenas).
  inicio: number;
  duracao: number;
  palavras: Caption[];
  // Quadro (dentro da cena) em que a palavra começa a ser falada.
  quando: (palavra: string, ocorrencia?: number) => number;
};

const normalizar = (texto: string) => texto.trim().toLowerCase().replace(/[.,!?:;]/g, "");

// Monta a linha do tempo a partir da narração: cada cena dura a fala mais os respiros,
// e as animações podem ser presas a palavras ("quando('seis')").
export function montarCenas(ids: string[], narracao: Narracao, extraNoFim = 0): Cena[] {
  let inicio = 0;
  return ids.map((id, i) => {
    const { duracao, palavras } = narracao.cenas[id];
    const ultima = i === ids.length - 1;
    const total = ANTES + Math.ceil(duracao * FPS) + DEPOIS + (ultima ? extraNoFim : 0);
    const quando = (palavra: string, ocorrencia = 1) => {
      const achadas = palavras.filter((p) => normalizar(p.text) === normalizar(palavra));
      const achada = achadas[ocorrencia - 1];
      if (!achada) throw new Error(`A palavra "${palavra}" (${ocorrencia}ª) não está na fala da cena "${id}"`);
      return ANTES + Math.round((achada.startMs / 1000) * FPS);
    };
    const cena = { id, inicio, duracao: total, palavras, quando };
    inicio += total - TRANSICAO;
    return cena;
  });
}

export const duracaoTotal = (cenas: Cena[]) => cenas[cenas.length - 1].inicio + cenas[cenas.length - 1].duracao;
