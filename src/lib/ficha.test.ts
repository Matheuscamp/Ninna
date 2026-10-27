import { describe, expect, it } from "vitest";
import { criarFichaSchema, formatarTelefone, idade, soDigitos } from "./ficha";

const schema = criarFichaSchema("2026-10-27");
const erros = (dados: Record<string, string>) => {
  const r = schema.safeParse({ nome: "Raissa", ...dados });
  return r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]));
};

describe("ficha: campos opcionais", () => {
  it("aceita só o nome e trata campos vazios como não informados", () => {
    const r = schema.safeParse({ nome: " Raissa ", peso: "", altura: " ", tipoSanguineo: "", emergenciaTelefone: "" });
    expect(r.success && r.data).toEqual({ nome: "Raissa" });
  });

  it("converte peso com vírgula, altura e telefone formatado", () => {
    const r = schema.safeParse({
      nome: "Raissa",
      peso: "68,45",
      altura: "165",
      tipoSanguineo: "O+",
      emergenciaNome: "Mãe",
      emergenciaTelefone: "(11) 98765-4321",
    });
    expect(r.success && r.data).toMatchObject({ peso: 68.5, altura: 165, tipoSanguineo: "O+", emergenciaTelefone: "11987654321" });
  });
});

describe("ficha: valores recusados", () => {
  it("peso, altura e tipo sanguíneo fora do possível", () => {
    expect(erros({ peso: "12" }).peso).toMatch(/30 e 250/);
    expect(erros({ peso: "abc" }).peso).toMatch(/kg/);
    expect(erros({ altura: "1,65" }).altura).toBeDefined();
    expect(erros({ altura: "300" }).altura).toMatch(/100 e 230/);
    expect(erros({ tipoSanguineo: "Z+" }).tipoSanguineo).toBeDefined();
  });

  it("data de nascimento no futuro ou de quem teria menos de 10 anos", () => {
    expect(erros({ dataNascimento: "2030-01-01" }).dataNascimento).toBeDefined();
    expect(erros({ dataNascimento: "2020-01-01" }).dataNascimento).toBeDefined();
    expect(erros({ dataNascimento: "1995-06-15" }).dataNascimento).toBeUndefined();
  });

  it("contato de emergência precisa de nome e telefone juntos", () => {
    expect(erros({ emergenciaTelefone: "11987654321" }).emergenciaNome).toBeDefined();
    expect(erros({ emergenciaNome: "Mãe" }).emergenciaTelefone).toBeDefined();
    expect(erros({ emergenciaNome: "Mãe", emergenciaTelefone: "987654321" }).emergenciaTelefone).toMatch(/DDD/);
  });
});

describe("ficha: apresentação", () => {
  it("formata telefones celular e fixo", () => {
    expect(formatarTelefone("11987654321")).toBe("(11) 98765-4321");
    expect(formatarTelefone("1134567890")).toBe("(11) 3456-7890");
    expect(soDigitos("(11) 9 8765-4321")).toBe("11987654321");
  });

  it("calcula a idade considerando se já fez aniversário no ano", () => {
    expect(idade("1995-10-27", "2026-10-27")).toBe(31);
    expect(idade("1995-10-28", "2026-10-27")).toBe(30);
  });
});
