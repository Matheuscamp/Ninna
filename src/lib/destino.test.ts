import { describe, expect, it } from "vitest";
import { destinoSeguro } from "./destino";

describe("destino depois do login ou do convite", () => {
  it("mantém caminhos internos, com busca e âncora", () => {
    expect(destinoSeguro("/triagem")).toBe("/triagem");
    expect(destinoSeguro("/app/agenda?aba=proximas#topo")).toBe("/app/agenda?aba=proximas#topo");
  });

  it.each([
    "//site-malicioso.com",
    "https://site-malicioso.com",
    "/\\site-malicioso.com",
    "/\\/site-malicioso.com",
    "/\t/site-malicioso.com",
    "/\n/site-malicioso.com",
    "/.//site-malicioso.com",
    "site-malicioso.com",
    "",
  ])("recusa %j", (next) => {
    expect(destinoSeguro(next)).toBe("/");
    expect(destinoSeguro(next, "/app")).toBe("/app");
  });

  it("recusa o que não é texto", () => {
    expect(destinoSeguro(null)).toBe("/");
    expect(destinoSeguro(undefined, "/app")).toBe("/app");
  });
});
