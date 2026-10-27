import { describe, expect, it } from "vitest";
import { atingiuPadrao, comIntervalos, descartarAntigas, formatarDuracao, lerSalvas, resumoDoPeriodo, type Contracao } from "./contracoes";

const MIN = 60_000;
const AGORA = Date.parse("2026-10-27T15:00:00Z");

// `quantas` contrações de `duracaoSeg`, a cada `aCadaMin`, terminando perto de agora.
function serie(quantas: number, aCadaMin: number, duracaoSeg: number, terminaHaMin = 1): Contracao[] {
  return Array.from({ length: quantas }, (_, i) => {
    const inicio = AGORA - (terminaHaMin + (quantas - 1 - i) * aCadaMin) * MIN;
    return { inicio, fim: inicio + duracaoSeg * 1000 };
  });
}

describe("contas das contrações", () => {
  it("intervalo é de começo a começo; a primeira não tem", () => {
    const c = comIntervalos(serie(3, 5, 60));
    expect(c.map((x) => x.intervaloSeg)).toEqual([null, 300, 300]);
    expect(c.map((x) => x.duracaoSeg)).toEqual([60, 60, 60]);
  });

  it("resumo considera só a última hora", () => {
    const antigas = serie(5, 10, 40, 120);
    const recentes = serie(4, 6, 50);
    const r = resumoDoPeriodo([...antigas, ...recentes], AGORA);
    expect(r.quantidade).toBe(4);
    expect(r.duracaoMediaSeg).toBe(50);
    expect(r.intervaloMedioSeg).toBe(360);
  });

  it("sem contrações, médias vazias", () => {
    expect(resumoDoPeriodo([], AGORA)).toMatchObject({ quantidade: 0, duracaoMediaSeg: null, intervaloMedioSeg: null });
  });
});

describe("padrão de ir para a maternidade (5-1-1)", () => {
  it("1 minuto a cada 5, por 1 hora: atingiu", () => {
    expect(atingiuPadrao(serie(13, 5, 60), AGORA)).toBe(true);
  });

  it("ritmo certo há só 30 minutos: ainda não", () => {
    expect(atingiuPadrao(serie(7, 5, 60), AGORA)).toBe(false);
  });

  it("contrações curtas ou espaçadas: não", () => {
    expect(atingiuPadrao(serie(13, 5, 40), AGORA)).toBe(false);
    expect(atingiuPadrao(serie(8, 8, 60), AGORA)).toBe(false);
  });

  it("parou de registrar há meia hora: não avisa com dados velhos", () => {
    expect(atingiuPadrao(serie(13, 5, 60, 30), AGORA)).toBe(false);
  });
});

describe("guardar no aparelho", () => {
  it("descarta registros de mais de 12 horas", () => {
    const velha = { inicio: AGORA - 13 * 60 * MIN, fim: AGORA - 13 * 60 * MIN + 60_000 };
    const nova = { inicio: AGORA - MIN, fim: AGORA };
    expect(descartarAntigas([velha, nova], AGORA)).toEqual([nova]);
  });

  it("lê o salvo e ignora o que estiver malformado", () => {
    const texto = JSON.stringify({ contracoes: [{ inicio: 1, fim: 2 }, { inicio: "x" }, { inicio: 5, fim: 3 }], emAndamento: 10 });
    expect(lerSalvas(texto)).toEqual({ contracoes: [{ inicio: 1, fim: 2 }], emAndamento: 10 });
    expect(lerSalvas("não é json")).toEqual({ contracoes: [], emAndamento: null });
    expect(lerSalvas(null)).toEqual({ contracoes: [], emAndamento: null });
  });
});

describe("formatarDuracao", () => {
  it("minutos e segundos; acima de 10 minutos, só minutos", () => {
    expect(formatarDuracao(5)).toBe("0:05");
    expect(formatarDuracao(65)).toBe("1:05");
    expect(formatarDuracao(300)).toBe("5:00");
    expect(formatarDuracao(720)).toBe("12 min");
  });
});
