import { beforeEach, describe, expect, it, vi } from "vitest";
import { VERSAO_CONSENTIMENTO } from "@/lib/consentimento";
import { criarSupabaseFalso, destinoDe } from "@/test/supabase-falso";

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

const { aceitarConsentimento } = await import("./actions");

function formulario(marcados: string[]) {
  const fd = new FormData();
  for (const m of marcados) fd.set(m, "on");
  return fd;
}

beforeEach(() => {
  estado.falso = criarSupabaseFalso();
});

describe("consentimento LGPD", () => {
  it("sem login, manda para entrar", async () => {
    estado.falso.deslogar();
    expect(await destinoDe(aceitarConsentimento(undefined, formulario(["dados_saude", "termos_privacidade"])))).toBe(
      "/entrar?next=/consentimento",
    );
  });

  it("exige os dois aceites", async () => {
    for (const marcados of [[], ["dados_saude"], ["termos_privacidade"]]) {
      const r = await aceitarConsentimento(undefined, formulario(marcados));
      expect(r?.erro).toMatch(/aceitar os dois itens/);
    }
    expect(estado.falso.supabase.from).not.toHaveBeenCalled();
  });

  it("registra os dois aceites com a versão do texto e segue para salvar a triagem", async () => {
    const destino = await destinoDe(aceitarConsentimento(undefined, formulario(["dados_saude", "termos_privacidade"])));
    expect(destino).toBe("/triagem/concluir");

    const [consulta] = estado.falso.consultas.consents;
    expect(consulta.upsert).toHaveBeenCalledWith(
      [
        { user_id: "usuaria-1", tipo: "dados_saude", versao: VERSAO_CONSENTIMENTO },
        { user_id: "usuaria-1", tipo: "termos_privacidade", versao: VERSAO_CONSENTIMENTO },
      ],
      { onConflict: "user_id,tipo,versao", ignoreDuplicates: true },
    );
  });

  it("se o banco falhar, avisa e não segue adiante", async () => {
    estado.falso.responder("consents", { error: { code: "XX000", message: "falha" } });
    const r = await aceitarConsentimento(undefined, formulario(["dados_saude", "termos_privacidade"]));
    expect(r?.erro).toMatch(/Não foi possível registrar/);
  });
});
