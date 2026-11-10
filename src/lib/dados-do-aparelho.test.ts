import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { limparDadosDoAparelho, varrerDadosVencidos } from "./dados-do-aparelho";

const AGORA = Date.parse("2026-10-27T15:00:00Z");
const HORA = 3_600_000;

function armazenamentoFalso() {
  const itens = new Map<string, string>();
  return {
    get length() {
      return itens.size;
    },
    key: (i: number) => [...itens.keys()][i] ?? null,
    getItem: (chave: string) => itens.get(chave) ?? null,
    setItem: (chave: string, valor: string) => void itens.set(chave, valor),
    removeItem: (chave: string) => void itens.delete(chave),
  };
}

const contracao = (haHoras: number) => ({ inicio: AGORA - haHoras * HORA, fim: AGORA - haHoras * HORA + 60_000 });
const gravar = (chave: string, valor: unknown) => localStorage.setItem(chave, JSON.stringify(valor));

beforeEach(() => {
  vi.stubGlobal("localStorage", armazenamentoFalso());
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(AGORA);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("ao sair da conta", () => {
  it("apaga tudo o que é do app e nada além disso", () => {
    gravar("ninna:contracoes:conta-1", { contracoes: [contracao(1)], emAndamento: null });
    gravar("ninna:triagem-pendente", { respostas: {}, em: AGORA });
    gravar("outro-site", 1);
    limparDadosDoAparelho();
    expect(localStorage.length).toBe(1);
    expect(localStorage.getItem("outro-site")).toBe("1");
  });

  it("não quebra com o armazenamento bloqueado", () => {
    vi.stubGlobal("localStorage", undefined);
    expect(() => limparDadosDoAparelho()).not.toThrow();
    expect(() => varrerDadosVencidos()).not.toThrow();
  });
});

describe("ao abrir o site", () => {
  it("apaga a contagem de quem não voltou e mantém a recente", () => {
    gravar("ninna:contracoes:antiga", { contracoes: [contracao(13)], emAndamento: AGORA - 13 * HORA });
    gravar("ninna:contracoes:recente", { contracoes: [contracao(13), contracao(1)], emAndamento: null });
    varrerDadosVencidos();
    expect(localStorage.getItem("ninna:contracoes:antiga")).toBeNull();
    expect(JSON.parse(localStorage.getItem("ninna:contracoes:recente")!).contracoes).toEqual([contracao(1)]);
  });

  it("apaga a contagem antiga, que não dizia de qual conta era", () => {
    gravar("ninna:contracoes", { contracoes: [contracao(1)], emAndamento: null });
    varrerDadosVencidos();
    expect(localStorage.length).toBe(0);
  });

  it("apaga a triagem com mais de 24 horas e mantém a do dia", () => {
    gravar("ninna:triagem-pendente", { respostas: {}, em: AGORA - 25 * HORA });
    varrerDadosVencidos();
    expect(localStorage.length).toBe(0);
    gravar("ninna:triagem-pendente", { respostas: {}, em: AGORA - HORA });
    varrerDadosVencidos();
    expect(localStorage.length).toBe(1);
  });
});
