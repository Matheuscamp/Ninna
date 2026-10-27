import { describe, expect, it } from "vitest";
import { ARTIGOS } from "./artigos";
import { EXAMES, FASES, faseDaSemana, resultadoSintomas, SEMANA_MAX, SEMANA_MIN } from "./guias";

describe("fases da gestação", () => {
  it("cobrem todas as semanas, sem buracos nem sobreposição", () => {
    for (let i = 1; i < FASES.length; i++) expect(FASES[i].de).toBe(FASES[i - 1].ate + 1);
    expect(SEMANA_MIN).toBe(4);
    expect(SEMANA_MAX).toBe(42);
  });

  it("encontra a fase de cada semana", () => {
    expect(faseDaSemana(4).id).toBe("f1");
    expect(faseDaSemana(10).id).toBe("f1");
    expect(faseDaSemana(11).id).toBe("f2");
    expect(faseDaSemana(24).id).toBe("f5");
    expect(faseDaSemana(42).id).toBe("f8");
    expect(faseDaSemana(2).id).toBe("f1");
  });

  it("usa só exames existentes e ids de tarefa únicos", () => {
    const ids = FASES.flatMap((f) => f.tarefas.map((t) => t.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const f of FASES) for (const e of f.exames) expect(EXAMES[e]).toBeDefined();
  });
});

describe("resultado dos sintomas", () => {
  it("prioriza o atraso e avisa sobre sangramento", () => {
    expect(resultadoSintomas(new Set()).titulo).toBe("Marque o que você sente");
    expect(resultadoSintomas(new Set(["enjoo"])).titulo).toBe("Ainda é cedo para saber");
    expect(resultadoSintomas(new Set(["enjoo", "atraso"])).titulo).toBe("Hora de fazer o teste");
    expect(resultadoSintomas(new Set(["sangramento"])).texto).toContain("procure atendimento");
  });
});

describe("artigos", () => {
  it("têm slugs únicos e conteúdo gratuito para cada perfil", () => {
    expect(new Set(ARTIGOS.map((a) => a.slug)).size).toBe(ARTIGOS.length);
    for (const perfil of ["tentante", "suspeita", "gestante", "puerpera", "acolhimento"] as const) {
      expect(ARTIGOS.some((a) => a.perfil === perfil && !a.premium)).toBe(true);
    }
  });

  it("nunca bloqueia conteúdo do perfil acolhimento", () => {
    expect(ARTIGOS.filter((a) => a.perfil === "acolhimento" && a.premium)).toHaveLength(0);
  });
});
