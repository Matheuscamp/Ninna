import { afterEach, describe, expect, it } from "vitest";
import { caminhoLivre, codigoDoConvite, conviteValido, destinoSeguro, resumoDoConvite } from "./convite";

afterEach(() => {
  delete process.env.CODIGO_CONVITE;
});

describe("acesso por convite", () => {
  it("sem CODIGO_CONVITE o site fica aberto", () => {
    expect(codigoDoConvite()).toBeNull();
    process.env.CODIGO_CONVITE = "   ";
    expect(codigoDoConvite()).toBeNull();
    process.env.CODIGO_CONVITE = " cegonha-azul ";
    expect(codigoDoConvite()).toBe("cegonha-azul");
  });

  it("o cookie guarda um resumo, não o código, e só vale para o código certo", async () => {
    const resumo = await resumoDoConvite("cegonha-azul");
    expect(resumo).toMatch(/^[0-9a-f]{64}$/);
    expect(resumo).not.toContain("cegonha");
    expect(await conviteValido(resumo, "cegonha-azul")).toBe(true);
    expect(await conviteValido(resumo, "outro-codigo")).toBe(false);
    expect(await conviteValido(undefined, "cegonha-azul")).toBe(false);
    expect(await resumoDoConvite(" cegonha-azul ")).toBe(resumo);
  });

  it("a tela do convite e o webhook do Mercado Pago funcionam sem convite", () => {
    expect(caminhoLivre("/convite")).toBe(true);
    expect(caminhoLivre("/api/mercadopago/webhook")).toBe(true);
    expect(caminhoLivre("/robots.txt")).toBe(true);
    expect(caminhoLivre("/")).toBe(false);
    expect(caminhoLivre("/app")).toBe(false);
    expect(caminhoLivre("/convitezinho")).toBe(false);
  });

  it("só volta para caminhos internos", () => {
    expect(destinoSeguro("/triagem")).toBe("/triagem");
    expect(destinoSeguro("//site-malicioso.com")).toBe("/");
    expect(destinoSeguro("https://site-malicioso.com")).toBe("/");
    expect(destinoSeguro(null)).toBe("/");
  });
});
