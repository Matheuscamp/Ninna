import { REGRA_IR_PARA_MATERNIDADE } from "@/content/contracoes";

// Contas do contador de contrações. Instantes em milissegundos (Date.now()).

export type Contracao = { inicio: number; fim: number };

const MINUTO = 60_000;

function media(valores: number[]) {
  return valores.length === 0 ? null : valores.reduce((a, b) => a + b, 0) / valores.length;
}

// Intervalo de cada contração até a anterior (de começo a começo). A primeira não tem.
export function comIntervalos(contracoes: Contracao[]) {
  const ordenadas = [...contracoes].sort((a, b) => a.inicio - b.inicio);
  return ordenadas.map((c, i) => ({
    ...c,
    duracaoSeg: Math.round((c.fim - c.inicio) / 1000),
    intervaloSeg: i === 0 ? null : Math.round((c.inicio - ordenadas[i - 1].inicio) / 1000),
  }));
}

// Contrações que começaram na última hora (ou no período da regra), com médias.
export function resumoDoPeriodo(contracoes: Contracao[], agora: number, periodoMin: number = REGRA_IR_PARA_MATERNIDADE.periodoMin) {
  const desde = agora - periodoMin * MINUTO;
  const todas = comIntervalos(contracoes);
  const janela = todas.filter((c) => c.inicio >= desde);
  // Só intervalos entre contrações da própria janela.
  const intervalos = janela.slice(1).map((c, i) => (c.inicio - janela[i].inicio) / 1000);
  return {
    quantidade: janela.length,
    duracaoMediaSeg: media(janela.map((c) => c.duracaoSeg)),
    intervaloMedioSeg: media(intervalos),
    // Quanto do período as contrações registradas cobrem (do começo da primeira ao da última).
    coberturaMin: janela.length < 2 ? 0 : (janela[janela.length - 1].inicio - janela[0].inicio) / MINUTO,
  };
}

// O ritmo da regra se manteve durante todo o período?
// Exige registros cobrindo a hora inteira (tolerando um intervalo no começo),
// intervalo médio dentro do máximo e duração média de pelo menos o mínimo.
export function atingiuPadrao(contracoes: Contracao[], agora: number, regra = REGRA_IR_PARA_MATERNIDADE) {
  const r = resumoDoPeriodo(contracoes, agora, regra.periodoMin);
  if (r.intervaloMedioSeg === null || r.duracaoMediaSeg === null) return false;
  return (
    r.coberturaMin >= regra.periodoMin - regra.intervaloMaximoMin &&
    r.intervaloMedioSeg <= regra.intervaloMaximoMin * 60 &&
    r.duracaoMediaSeg >= regra.duracaoMinimaSeg
  );
}

// "1:05" para 65 segundos; "12 min" a partir de 10 minutos.
export function formatarDuracao(segundos: number) {
  const s = Math.max(0, Math.round(segundos));
  if (s >= 600) return `${Math.round(s / 60)} min`;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Registros antigos não servem mais para o ritmo atual: guarda só as últimas 12 horas.
export const GUARDAR_HORAS = 12;

export function descartarAntigas(contracoes: Contracao[], agora: number) {
  return contracoes.filter((c) => c.inicio >= agora - GUARDAR_HORAS * 60 * MINUTO);
}

// Lê o que estava salvo no aparelho, ignorando qualquer coisa malformada.
export function lerSalvas(texto: string | null): { contracoes: Contracao[]; emAndamento: number | null } {
  const vazio = { contracoes: [], emAndamento: null };
  if (!texto) return vazio;
  try {
    const dados = JSON.parse(texto) as { contracoes?: unknown; emAndamento?: unknown };
    const contracoes = Array.isArray(dados.contracoes)
      ? dados.contracoes.filter(
          (c): c is Contracao => typeof c?.inicio === "number" && typeof c?.fim === "number" && c.fim >= c.inicio,
        )
      : [];
    return { contracoes, emAndamento: typeof dados.emAndamento === "number" ? dados.emAndamento : null };
  } catch {
    return vazio;
  }
}
