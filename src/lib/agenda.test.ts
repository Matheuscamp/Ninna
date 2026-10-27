import { describe, expect, it } from "vitest";
import { consultaSchema, separarConsultas } from "./agenda";
import { formatarDataHora, isoParaLocal, localParaIso, partesDaData, quantoFalta } from "./datas";

describe("consultaSchema", () => {
  it("aceita uma consulta completa e uma só com o obrigatório", () => {
    expect(consultaSchema.safeParse({ titulo: "Ultrassom", data: "2026-11-19", hora: "14:30", local: "Clínica" }).success).toBe(true);
    expect(consultaSchema.safeParse({ titulo: "Ultrassom", data: "2026-11-19", hora: "14:30" }).success).toBe(true);
  });

  it("recusa título vazio, data e horário em formato errado", () => {
    expect(consultaSchema.safeParse({ titulo: "   ", data: "2026-11-19", hora: "14:30" }).success).toBe(false);
    expect(consultaSchema.safeParse({ titulo: "Ultrassom", data: "19/11/2026", hora: "14:30" }).success).toBe(false);
    expect(consultaSchema.safeParse({ titulo: "Ultrassom", data: "2026-11-19", hora: "" }).success).toBe(false);
  });
});

describe("separarConsultas", () => {
  const agora = new Date("2026-10-27T15:00:00Z");
  const consultas = [
    { id: 1, data_hora: "2026-10-20T12:00:00Z", concluida_em: null },
    { id: 2, data_hora: "2026-10-25T12:00:00Z", concluida_em: "2026-10-25T14:00:00Z" },
    { id: 3, data_hora: "2026-11-09T12:00:00Z", concluida_em: null },
    { id: 4, data_hora: "2026-11-20T12:00:00Z", concluida_em: "2026-10-27T10:00:00Z" },
  ];

  it("não conclui sozinha uma consulta cuja data passou", () => {
    const { paraConfirmar, concluidas } = separarConsultas(consultas, agora);
    expect(paraConfirmar.map((c) => c.id)).toEqual([1]);
    expect(concluidas.map((c) => c.id)).toEqual([4, 2]);
  });

  it("mostra em próximas só o que é futuro e não foi concluído", () => {
    expect(separarConsultas(consultas, agora).proximas.map((c) => c.id)).toEqual([3]);
  });
});

describe("datas da agenda", () => {
  it("interpreta o horário digitado como horário de São Paulo", () => {
    expect(localParaIso("2026-11-09", "09:00")).toBe("2026-11-09T12:00:00.000Z");
  });

  it("volta do instante salvo para o que estava no formulário", () => {
    expect(isoParaLocal("2026-11-09T12:00:00.000Z")).toEqual({ data: "2026-11-09", hora: "09:00" });
    // 22h em São Paulo já é o dia seguinte em UTC
    expect(isoParaLocal(localParaIso("2026-11-09", "22:30"))).toEqual({ data: "2026-11-09", hora: "22:30" });
  });

  it("diz quanto falta em dias de calendário de São Paulo", () => {
    const agora = new Date("2026-10-27T15:00:00Z"); // 12h em São Paulo
    expect(quantoFalta("2026-10-27T22:00:00Z", agora)).toBe("hoje");
    expect(quantoFalta("2026-10-28T02:30:00Z", agora)).toBe("hoje"); // 23h30 do dia 27 em SP
    expect(quantoFalta("2026-10-28T12:00:00Z", agora)).toBe("amanhã");
    expect(quantoFalta("2026-11-09T12:00:00Z", agora)).toBe("em 13 dias");
  });

  it("mostra a data e a hora em São Paulo", () => {
    expect(formatarDataHora("2026-11-09T12:00:00.000Z")).toMatch(/9 de nov.* · 09:00/);
    expect(partesDaData("2026-11-10T01:30:00.000Z")).toMatchObject({ dia: "9", hora: "22:30", mesAno: "novembro de 2026" });
  });
});
