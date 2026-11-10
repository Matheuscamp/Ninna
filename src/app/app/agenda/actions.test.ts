import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { criarConsulta as consultaFalsa, criarSupabaseFalso, destinoDe } from "@/test/supabase-falso";

const estado = vi.hoisted(() => ({ falso: null as unknown as ReturnType<typeof criarSupabaseFalso> }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => estado.falso.supabase }));
vi.mock("next/navigation", async () => {
  const { Redirecionou } = await import("@/test/supabase-falso");
  return {
    redirect: (destino: string) => {
      throw new Redirecionou(destino);
    },
  };
});

const { alternarConcluida, criarConsulta } = await import("./actions");

const FUTURA = "2026-12-10T13:00:00.000Z";
const PASSADA = "2026-10-01T13:00:00.000Z";
const BARRADA_PELO_BANCO = { error: { code: "P0001", message: "limite_consultas" } };

// Cada consulta à tabela da agenda devolve o próximo resultado da lista, na ordem.
function agendaResponde(...resultados: Parameters<typeof consultaFalsa>[0][]) {
  const feitas: ReturnType<typeof consultaFalsa>[] = [];
  const original = estado.falso.supabase.from.getMockImplementation()!;
  estado.falso.supabase.from.mockImplementation((tabela: string) => {
    if (tabela !== "appointments") return original(tabela);
    const consulta = consultaFalsa(resultados.shift());
    feitas.push(consulta);
    return consulta;
  });
  return feitas;
}

function formulario(campos: Record<string, string>) {
  const dados = new FormData();
  for (const [campo, valor] of Object.entries(campos)) dados.set(campo, valor);
  return dados;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-10T15:00:00Z"));
  estado.falso = criarSupabaseFalso();
  estado.falso.responder("assinaturas", { data: null }); // plano gratuito
});

afterEach(() => {
  vi.useRealTimers();
});

describe("limite de consultas futuras no plano gratuito", () => {
  it("se o banco barrar (ex.: dois envios ao mesmo tempo), explica o limite", async () => {
    agendaResponde({ count: 2 }, BARRADA_PELO_BANCO);
    const estadoForm = await criarConsulta(undefined, formulario({ titulo: "Ultrassom", data: "2026-12-10", hora: "10:00" }));
    expect(estadoForm?.erro).toMatch(/até 3 consultas futuras/);
  });

  it("desmarcar uma consulta futura não passa do limite", async () => {
    const feitas = agendaResponde({ data: { data_hora: FUTURA } }, { count: 3 });
    expect(await destinoDe(alternarConcluida(formulario({ id: "7", concluir: "nao" })))).toBe("/app/agenda?ok=limite");
    expect(feitas.some((c) => c.update.mock.calls.length > 0)).toBe(false);
  });

  it("desmarca quando ainda há vaga", async () => {
    const feitas = agendaResponde({ data: { data_hora: FUTURA } }, { count: 2 }, { data: [{ id: 7 }] });
    expect(await destinoDe(alternarConcluida(formulario({ id: "7", concluir: "nao" })))).toBe("/app/agenda?ok=reaberta");
    expect(feitas[2].update).toHaveBeenCalledWith({ concluida_em: null });
  });

  it("consulta que já passou não conta no limite", async () => {
    agendaResponde({ data: { data_hora: PASSADA } }, { data: [{ id: 7 }] });
    expect(await destinoDe(alternarConcluida(formulario({ id: "7", concluir: "nao" })))).toBe("/app/agenda?ok=reaberta");
  });

  it("se o banco barrar ao desmarcar, explica o limite", async () => {
    agendaResponde({ data: { data_hora: FUTURA } }, { count: 0 }, BARRADA_PELO_BANCO);
    expect(await destinoDe(alternarConcluida(formulario({ id: "7", concluir: "nao" })))).toBe("/app/agenda?ok=limite");
  });

  it("marcar como concluída nunca esbarra no limite", async () => {
    const feitas = agendaResponde({ data: [{ id: 7 }] });
    expect(await destinoDe(alternarConcluida(formulario({ id: "7", concluir: "sim", aba: "confirmar" })))).toBe(
      "/app/agenda?ok=concluida&aba=confirmar",
    );
    expect(feitas).toHaveLength(1);
  });
});
