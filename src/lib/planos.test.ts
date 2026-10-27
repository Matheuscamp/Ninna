import { describe, expect, it } from "vitest";
import { atingiuLimite, limite, vagasRestantes } from "./planos";

describe("planos", () => {
  it("gratuito: até 10 documentos e 3 consultas futuras", () => {
    expect(limite("gratuito", "documentos")).toBe(10);
    expect(limite("gratuito", "consultasFuturas")).toBe(3);
  });

  it("premium: ilimitado", () => {
    expect(limite("premium", "documentos")).toBeNull();
    expect(vagasRestantes("premium", "documentos", 500)).toBeNull();
    expect(atingiuLimite("premium", "documentos", 500)).toBe(false);
  });

  it("conta as vagas restantes sem ficar negativo", () => {
    expect(vagasRestantes("gratuito", "documentos", 7)).toBe(3);
    expect(vagasRestantes("gratuito", "documentos", 10)).toBe(0);
    expect(vagasRestantes("gratuito", "documentos", 12)).toBe(0);
    expect(atingiuLimite("gratuito", "documentos", 9)).toBe(false);
    expect(atingiuLimite("gratuito", "documentos", 10)).toBe(true);
  });
});
