import { beforeEach, describe, expect, it, vi } from "vitest";
import { criarSupabaseFalso, destinoDe } from "@/test/supabase-falso";

const estado = vi.hoisted(() => ({
  falso: null as unknown as ReturnType<typeof import("@/test/supabase-falso").criarSupabaseFalso>,
}));

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

const { salvarPlanoDeParto } = await import("./actions");

function respostas() {
  const dados = new FormData();
  dados.set("maternidade", "Hospital Sofia Feldman");
  dados.set("analgesia", "se_pedir");
  dados.append("alivio", "banho");
  dados.set("campo_inventado", "x");
  return dados;
}

beforeEach(() => {
  estado.falso = criarSupabaseFalso();
  estado.falso.responder("assinaturas", { data: { plano: "premium", valido_ate: null } });
});

describe("salvar plano de parto", () => {
  it("Premium: grava só as respostas válidas e abre o documento", async () => {
    expect(await destinoDe(salvarPlanoDeParto(undefined, respostas()))).toBe("/app/guias/plano-parto/documento?ok=salvo");
    const [gravado, opcoes] = estado.falso.consultas.planos_de_parto[0].upsert.mock.calls[0];
    expect(gravado).toMatchObject({
      user_id: "usuaria-1",
      respostas: { maternidade: "Hospital Sofia Feldman", analgesia: "se_pedir", alivio: ["banho"] },
    });
    expect(opcoes).toEqual({ onConflict: "user_id" });
  });

  it("plano gratuito não grava", async () => {
    estado.falso.responder("assinaturas", { data: null });
    expect(await salvarPlanoDeParto(undefined, respostas())).toEqual({ erro: "O plano de parto é um recurso Premium." });
    expect(estado.falso.consultas.planos_de_parto).toBeUndefined();
  });

  it("antes da migração (tabela inexistente), avisa em vez de quebrar", async () => {
    estado.falso.responder("planos_de_parto", { error: { code: "PGRST205", message: "tabela não encontrada" } });
    expect(await salvarPlanoDeParto(undefined, respostas())).toMatchObject({ erro: expect.stringMatching(/ainda não está disponível/) });
  });

  it("deslogada vai para o login", async () => {
    estado.falso.deslogar();
    expect(await destinoDe(salvarPlanoDeParto(undefined, respostas()))).toBe("/entrar?next=/app/guias/plano-parto");
  });
});
