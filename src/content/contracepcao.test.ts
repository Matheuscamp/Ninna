import { describe, expect, it } from "vitest";
import { faixaDoMetodo, formatarTaxa, METODOS, metodosPorFaixa } from "./contracepcao";

const metodo = (id: string) => METODOS.find((m) => m.id === id)!;

describe("métodos contraceptivos", () => {
  it("ids únicos", () => {
    expect(new Set(METODOS.map((m) => m.id)).size).toBe(METODOS.length);
  });

  it("separa por eficácia no uso comum", () => {
    expect(faixaDoMetodo(metodo("implante"))).toBe("muito-eficaz");
    expect(faixaDoMetodo(metodo("diu-cobre"))).toBe("muito-eficaz");
    expect(faixaDoMetodo(metodo("pilula-combinada"))).toBe("eficaz");
    expect(faixaDoMetodo(metodo("camisinha"))).toBe("menos-eficaz");
    expect(faixaDoMetodo(metodo("tabelinha"))).toBe("menos-eficaz");
  });

  it("ordena cada faixa do mais ao menos eficaz e não perde nenhum método", () => {
    const faixas = metodosPorFaixa();
    expect(faixas.flatMap((f) => f.metodos)).toHaveLength(METODOS.length);
    for (const { metodos } of faixas) {
      const taxas = metodos.map((m) => m.usoComum ?? 85);
      expect(taxas).toEqual([...taxas].sort((a, b) => a - b));
    }
  });

  it("só as camisinhas protegem contra infecções", () => {
    expect(METODOS.filter((m) => m.protegeIst).map((m) => m.id).sort()).toEqual(["camisinha", "camisinha-interna"]);
  });

  it("formata a taxa com vírgula", () => {
    expect(formatarTaxa(0.15)).toBe("0,15");
    expect(formatarTaxa(null)).toBe("sem dados");
  });
});
