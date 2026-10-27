import { describe, expect, it } from "vitest";
import { SECOES_PLANO } from "@/content/plano-parto";
import { documentoDoPlano, lerRespostas, normalizarRespostas } from "./plano-parto";

function formulario(campos: [string, string][]) {
  const dados = new FormData();
  for (const [chave, valor] of campos) dados.append(chave, valor);
  return dados;
}

describe("perguntas do plano de parto", () => {
  it("ids únicos de perguntas e de opções", () => {
    const perguntas = SECOES_PLANO.flatMap((s) => s.perguntas);
    expect(new Set(perguntas.map((p) => p.id)).size).toBe(perguntas.length);
    for (const p of perguntas) if (p.tipo !== "texto") expect(new Set(p.opcoes.map((o) => o.id)).size).toBe(p.opcoes.length);
  });
});

describe("lerRespostas", () => {
  it("guarda texto, opção única e várias opções", () => {
    const r = lerRespostas(
      formulario([
        ["maternidade", "  Maternidade Odete Valadares  "],
        ["analgesia", "se_pedir"],
        ["alivio", "banho"],
        ["alivio", "bola"],
      ]),
    );
    expect(r).toEqual({ maternidade: "Maternidade Odete Valadares", analgesia: "se_pedir", alivio: ["banho", "bola"] });
  });

  it("ignora perguntas e opções que não existem, respostas vazias e repetidas", () => {
    const r = lerRespostas(
      formulario([
        ["inventada", "x"],
        ["analgesia", "opcao_falsa"],
        ["alivio", "banho"],
        ["alivio", "banho"],
        ["alivio", "<script>"],
        ["equipe", "   "],
      ]),
    );
    expect(r).toEqual({ alivio: ["banho"] });
  });

  it("corta textos no tamanho máximo", () => {
    const r = lerRespostas(formulario([["observacoes", "a".repeat(1000)]]));
    expect((r.observacoes as string).length).toBe(600);
  });
});

describe("normalizarRespostas (dados do banco)", () => {
  it("aceita o formato salvo e descarta o que não serve", () => {
    expect(normalizarRespostas({ analgesia: "quero", alivio: ["banho", 3], lixo: "x" })).toEqual({ analgesia: "quero", alivio: ["banho"] });
    expect(normalizarRespostas(null)).toEqual({});
    expect(normalizarRespostas("texto")).toEqual({});
  });
});

describe("documentoDoPlano", () => {
  it("só seções respondidas, com os rótulos das opções", () => {
    const doc = documentoDoPlano({ analgesia: "quero", primeira_hora: ["pele_a_pele", "mamar"] });
    expect(doc.map((s) => s.id)).toEqual(["trabalho", "bebe"]);
    expect(doc[0].itens).toEqual([{ titulo: "Analgesia (anestesia para a dor)", valores: ["Quero analgesia assim que for possível"] }]);
    expect(doc[1].itens[0].valores).toHaveLength(2);
  });

  it("sem respostas, documento vazio", () => {
    expect(documentoDoPlano({})).toEqual([]);
  });
});
