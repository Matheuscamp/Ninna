import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VERSAO_CONSENTIMENTO } from "@/lib/consentimento";
import { criarSupabaseFalso } from "@/test/supabase-falso";

const estado = vi.hoisted(() => ({ falso: null as unknown as ReturnType<typeof criarSupabaseFalso> }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => estado.falso.supabase }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

const { salvarTriagem } = await import("./actions");

const CONSENTIDA = { data: [{ tipo: "dados_saude" }, { tipo: "termos_privacidade" }], error: null };

beforeEach(() => {
  // "Hoje" fixo: 27/10/2026, meio-dia em São Paulo.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-27T15:00:00Z"));
  estado.falso = criarSupabaseFalso();
  estado.falso.responder("consents", CONSENTIDA);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("triagem salva depois do cadastro", () => {
  it("sem login, pede para criar a conta (o app guarda as respostas e vai ao cadastro)", async () => {
    estado.falso.deslogar();
    expect(await salvarTriagem({ momento: "gravida", jaMae: false, fonteData: "semanas", semanas: 9 })).toEqual({ ok: false, motivo: "login" });
  });

  it("sem os dois consentimentos da versão atual, pede o consentimento antes de gravar", async () => {
    estado.falso.responder("consents", { data: [{ tipo: "dados_saude" }], error: null });
    expect(await salvarTriagem({ momento: "tentando", jaMae: false })).toEqual({ ok: false, motivo: "consentimento" });
    expect(estado.falso.consultas.consents[0].eq).toHaveBeenCalledWith("versao", VERSAO_CONSENTIMENTO);
    expect(estado.falso.consultas.profiles).toBeUndefined();
  });

  it("recusa respostas inválidas ou adulteradas", async () => {
    for (const respostas of [null, {}, { momento: "hackear", jaMae: true }, { momento: "gravida", jaMae: false }]) {
      expect(await salvarTriagem(respostas)).toMatchObject({ ok: false, motivo: "invalida" });
    }
  });

  it("recusa data de gestação impossível", async () => {
    const r = await salvarTriagem({ momento: "gravida", jaMae: false, fonteData: "dum", data: "2026-12-01" });
    expect(r).toMatchObject({ ok: false, motivo: "invalida" });
  });

  it("grava a gestante com a DUM calculada e o histórico da triagem", async () => {
    const r = await salvarTriagem({
      momento: "suspeita",
      teste: "positivo",
      fonteData: "semanas",
      semanas: 9,
      jaMae: true,
      partoAnterior: "cesarea",
      altoRisco: "nao",
      preNatal: "sus",
    });
    expect(r).toEqual({ ok: true });

    const perfil = estado.falso.consultas.profiles[0];
    expect(perfil.update).toHaveBeenCalledWith(
      expect.objectContaining({
        perfil: "gestante",
        dum: "2026-08-25",
        dum_fonte: "semanas",
        primeira_gestacao: false,
        cesarea_anterior: true,
        pre_natal: "sus",
      }),
    );
    expect(perfil.eq).toHaveBeenCalledWith("id", "usuaria-1");

    const historico = estado.falso.consultas.triage_answers[0];
    expect(historico.insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: "usuaria-1", perfil: "gestante" }));
  });

  it("não grava dados de gestação em quem não é gestante", async () => {
    await salvarTriagem({ momento: "tentando", jaMae: false, fonteData: "dum", data: "2026-09-01", teste: "positivo" });
    const atualizacao = estado.falso.consultas.profiles[0].update.mock.calls[0][0];
    expect(atualizacao).toMatchObject({ perfil: "tentante", dum: null, dum_fonte: null });

    const respostasGuardadas = estado.falso.consultas.triage_answers[0].insert.mock.calls[0][0].respostas;
    expect(respostasGuardadas).toEqual({ momento: "tentando", jaMae: false });
  });

  it("se o banco falhar, avisa para tentar de novo", async () => {
    estado.falso.responder("profiles", { error: { code: "XX000", message: "falha" } });
    expect(await salvarTriagem({ momento: "nasceu", jaMae: true })).toMatchObject({ ok: false, motivo: "erro" });
  });
});
