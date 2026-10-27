import { beforeEach, describe, expect, it, vi } from "vitest";
import { criarSupabaseFalso } from "@/test/supabase-falso";

const estado = vi.hoisted(() => ({
  falso: null as unknown as ReturnType<typeof import("@/test/supabase-falso").criarSupabaseFalso>,
  storage: null as unknown as { createSignedUploadUrl: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> },
}));

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ ...estado.falso.supabase, storage: { from: () => estado.storage } }),
}));

const { prepararEnvio } = await import("./actions");

const PDF = { nome: "exame.pdf", tipo: "application/pdf", tamanho: 200_000 };

beforeEach(() => {
  estado.falso = criarSupabaseFalso();
  estado.storage = {
    createSignedUploadUrl: vi.fn(async (caminho: string) => ({ data: { signedUrl: "https://upload", token: "t", path: caminho }, error: null })),
    remove: vi.fn(async () => ({ data: [], error: null })),
  };
  estado.falso.responder("assinaturas", { data: null });
});

describe("limite de documentos por plano", () => {
  it("gratuito com 9 documentos ainda envia o 10º", async () => {
    estado.falso.responder("health_documents", { count: 9 });
    const r = await prepararEnvio(PDF);
    expect(r.ok).toBe(true);
    expect(estado.storage.createSignedUploadUrl).toHaveBeenCalledOnce();
  });

  it("gratuito com 10 documentos é barrado antes de o arquivo subir", async () => {
    estado.falso.responder("health_documents", { count: 10 });
    const r = await prepararEnvio(PDF);
    expect(r).toMatchObject({ ok: false, limite: true });
    expect(!r.ok && r.erro).toMatch(/limite de 10 documentos do plano gratuito/);
    expect(estado.storage.createSignedUploadUrl).not.toHaveBeenCalled();
  });

  it("premium não tem limite", async () => {
    estado.falso.responder("assinaturas", { data: { plano: "premium", valido_ate: null } });
    estado.falso.responder("health_documents", { count: 250 });
    expect((await prepararEnvio(PDF)).ok).toBe(true);
  });

  it("premium vencido volta a ter o limite do gratuito", async () => {
    estado.falso.responder("assinaturas", { data: { plano: "premium", valido_ate: "2020-01-01T00:00:00Z" } });
    estado.falso.responder("health_documents", { count: 10 });
    expect(await prepararEnvio(PDF)).toMatchObject({ ok: false, limite: true });
  });

  it("antes da migração de planos (tabela inexistente), trata como gratuito", async () => {
    estado.falso.responder("assinaturas", { error: { code: "PGRST205", message: "tabela não encontrada" } });
    estado.falso.responder("health_documents", { count: 10 });
    expect(await prepararEnvio(PDF)).toMatchObject({ ok: false, limite: true });
  });

  it("formato inválido é recusado antes de olhar o plano", async () => {
    const r = await prepararEnvio({ nome: "a.exe", tipo: "application/x-msdownload", tamanho: 10 });
    expect(r).toMatchObject({ ok: false });
    expect(estado.falso.supabase.from).not.toHaveBeenCalled();
  });
});
