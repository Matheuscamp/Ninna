import { describe, expect, it } from "vitest";
import {
  calcularDum,
  classificarPerfil,
  dataProvavelDoParto,
  dumPlausivel,
  idadeGestacional,
  respostasSchema,
  trimestre,
} from "./triagem";

describe("classificarPerfil", () => {
  it("leva cada momento ao seu perfil", () => {
    expect(classificarPerfil({ momento: "tentando" })).toBe("tentante");
    expect(classificarPerfil({ momento: "gravida" })).toBe("gestante");
    expect(classificarPerfil({ momento: "nasceu" })).toBe("puerpera");
    expect(classificarPerfil({ momento: "perda" })).toBe("acolhimento");
  });

  it("suspeita com teste positivo vira gestante", () => {
    expect(classificarPerfil({ momento: "suspeita", teste: "positivo" })).toBe("gestante");
    expect(classificarPerfil({ momento: "suspeita", teste: "negativo" })).toBe("suspeita");
    expect(classificarPerfil({ momento: "suspeita" })).toBe("suspeita");
  });
});

describe("idade gestacional", () => {
  const hoje = "2026-10-26";

  it("converte semanas informadas em DUM e volta", () => {
    const dum = calcularDum({ fonteData: "semanas", semanas: 9 }, hoje)!;
    expect(dum).toBe("2026-08-24");
    expect(idadeGestacional(dum, hoje)).toEqual({ semanas: 9, dias: 0 });
  });

  it("calcula a DUM a partir da DPP (280 dias antes)", () => {
    const dum = calcularDum({ fonteData: "dpp", data: "2027-05-31" }, hoje)!;
    expect(dum).toBe("2026-08-24");
    expect(dataProvavelDoParto(dum)).toBe("2027-05-31");
  });

  it("usa a DUM informada diretamente", () => {
    expect(calcularDum({ fonteData: "dum", data: "2026-09-01" }, hoje)).toBe("2026-09-01");
    expect(idadeGestacional("2026-09-01", hoje)).toEqual({ semanas: 7, dias: 6 });
  });

  it("recusa datas fora de 1 a 42 semanas", () => {
    expect(dumPlausivel("2026-10-20", hoje)).toBe(false);
    expect(dumPlausivel("2025-10-01", hoje)).toBe(false);
    expect(dumPlausivel("2026-08-24", hoje)).toBe(true);
  });

  it("separa os trimestres em 13 e 27 semanas", () => {
    expect(trimestre(13)).toBe(1);
    expect(trimestre(14)).toBe(2);
    expect(trimestre(27)).toBe(2);
    expect(trimestre(28)).toBe(3);
  });
});

describe("respostasSchema", () => {
  it("exige a data quando o perfil é gestante", () => {
    expect(respostasSchema.safeParse({ momento: "gravida", jaMae: false }).success).toBe(false);
    expect(
      respostasSchema.safeParse({ momento: "gravida", jaMae: false, fonteData: "semanas", semanas: 9 }).success,
    ).toBe(true);
  });

  it("não exige data para os outros perfis", () => {
    expect(respostasSchema.safeParse({ momento: "tentando", jaMae: true }).success).toBe(true);
  });
});
