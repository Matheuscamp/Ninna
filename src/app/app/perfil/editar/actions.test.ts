import { beforeEach, describe, expect, it, vi } from "vitest";
import { criarSupabaseFalso, destinoDe } from "@/test/supabase-falso";

const estado = vi.hoisted(() => ({
  falso: null as unknown as ReturnType<typeof import("@/test/supabase-falso").criarSupabaseFalso>,
  storage: null as unknown as Record<string, ReturnType<typeof vi.fn>>,
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ ...estado.falso.supabase, storage: { from: () => estado.storage } }),
}));
vi.mock("next/navigation", async () => {
  const { Redirecionou } = await import("@/test/supabase-falso");
  return {
    redirect: (destino: string) => {
      throw new Redirecionou(destino);
    },
  };
});

const { salvarFicha, enviarFoto, removerFoto } = await import("./actions");

function formulario(campos: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(campos)) fd.set(k, v);
  return fd;
}

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, ...new Array(60).fill(1)]);

beforeEach(() => {
  estado.falso = criarSupabaseFalso();
  estado.falso.responder("profiles", { data: [{ id: "usuaria-1", foto_caminho: "usuaria-1/antiga.jpg" }] });
  estado.storage = {
    upload: vi.fn(async () => ({ data: {}, error: null })),
    remove: vi.fn(async () => ({ data: [], error: null })),
    createSignedUrl: vi.fn(async () => ({ data: { signedUrl: "https://foto-assinada" }, error: null })),
  };
});

describe("salvar ficha", () => {
  it("grava os campos convertidos e volta ao perfil com aviso de sucesso", async () => {
    const destino = await destinoDe(
      salvarFicha(
        undefined,
        formulario({ nome: "Raissa", peso: "68,5", altura: "165", tipoSanguineo: "O+", emergenciaNome: "Mãe", emergenciaTelefone: "(11) 98765-4321" }),
      ),
    );
    expect(destino).toBe("/app/perfil?ok=ficha");
    expect(estado.falso.consultas.profiles[0].update).toHaveBeenCalledWith(
      expect.objectContaining({ nome: "Raissa", peso_kg: 68.5, altura_cm: 165, tipo_sanguineo: "O+", emergencia_telefone: "11987654321", alergias: null }),
    );
    expect(estado.falso.consultas.profiles[0].eq).toHaveBeenCalledWith("id", "usuaria-1");
  });

  it("devolve os erros por campo sem gravar nada", async () => {
    const r = await salvarFicha(undefined, formulario({ nome: "", peso: "500" }));
    expect(r?.erros?.nome).toBeDefined();
    expect(r?.erros?.peso).toBeDefined();
    expect(r?.valores?.peso).toBe("500");
    expect(estado.falso.consultas.profiles).toBeUndefined();
  });
});

describe("foto de perfil", () => {
  // A leitura da ficha usa maybeSingle: o Supabase devolve um registro, não uma lista.
  beforeEach(() => estado.falso.responder("profiles", { data: { foto_caminho: "usuaria-1/antiga.jpg" } }));

  const comFoto = (bytes: Uint8Array) => {
    const fd = new FormData();
    fd.set("foto", new Blob([bytes as BlobPart]), "foto.jpg");
    return fd;
  };

  it("envia uma imagem de verdade para a pasta da usuária e apaga a anterior", async () => {
    const r = await enviarFoto(comFoto(JPEG));
    expect(r).toEqual({ ok: true, url: "https://foto-assinada" });
    const [caminho, , opcoes] = estado.storage.upload.mock.calls[0];
    expect(caminho).toMatch(/^usuaria-1\/\d+\.jpg$/);
    expect(opcoes).toMatchObject({ contentType: "image/jpeg", upsert: false });
    expect(estado.storage.remove).toHaveBeenCalledWith(["usuaria-1/antiga.jpg"]);
  });

  it("recusa arquivo disfarçado de imagem e PDF", async () => {
    expect(await enviarFoto(comFoto(new Uint8Array([0x4d, 0x5a, 0x90, 0, ...new Array(20).fill(0)])))).toMatchObject({ ok: false });
    expect(await enviarFoto(comFoto(new Uint8Array([0x25, 0x50, 0x44, 0x46, ...new Array(20).fill(0)])))).toMatchObject({ ok: false });
    expect(estado.storage.upload).not.toHaveBeenCalled();
  });

  it("recusa foto grande demais", async () => {
    const grande = new Uint8Array(1024 * 1024);
    grande.set([0xff, 0xd8, 0xff]);
    expect(await enviarFoto(comFoto(grande))).toMatchObject({ ok: false });
  });

  it("remove a foto do perfil e do armazenamento", async () => {
    expect(await removerFoto()).toEqual({ ok: true, url: null });
    expect(estado.storage.remove).toHaveBeenCalledWith(["usuaria-1/antiga.jpg"]);
  });
});
