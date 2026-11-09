import { beforeEach, describe, expect, it, vi } from "vitest";
import { criarSupabaseFalso, destinoDe } from "@/test/supabase-falso";

const estado = vi.hoisted(() => ({
  falso: null as unknown as ReturnType<typeof import("@/test/supabase-falso").criarSupabaseFalso>,
  storage: null as unknown as { list: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> },
}));

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", async () => {
  const { Redirecionou } = await import("@/test/supabase-falso");
  return {
    redirect: (destino: string) => {
      throw new Redirecionou(destino);
    },
  };
});
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ ...estado.falso.supabase, storage: { from: () => estado.storage } }),
}));

const { excluirConta } = await import("./actions");

function confirmado() {
  const dados = new FormData();
  dados.set("confirmo", "on");
  return dados;
}

beforeEach(() => {
  estado.falso = criarSupabaseFalso();
  estado.storage = { list: vi.fn(async () => ({ data: [], error: null })), remove: vi.fn(async () => ({ data: [], error: null })) };
});

describe("exclusão da conta", () => {
  it("sem arquivos pendentes, exclui e leva à tela de confirmação", async () => {
    expect(await destinoDe(excluirConta(undefined, confirmado()))).toBe("/conta-excluida");
    expect(estado.falso.supabase.rpc).toHaveBeenCalledWith("excluir_minha_conta");
  });

  it("se a listagem dos arquivos falhar, a conta não é excluída", async () => {
    estado.storage.list.mockResolvedValue({ data: null, error: { message: "Internal Server Error" } });
    expect(await excluirConta(undefined, confirmado())).toEqual({ erro: expect.stringMatching(/apagar seus arquivos/) });
    expect(estado.falso.supabase.rpc).not.toHaveBeenCalled();
  });

  it("sem a confirmação marcada, nada acontece", async () => {
    expect(await excluirConta(undefined, new FormData())).toEqual({ erro: expect.stringMatching(/Marque/) });
    expect(estado.storage.list).not.toHaveBeenCalled();
  });
});
