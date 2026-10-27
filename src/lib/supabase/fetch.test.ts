import { describe, expect, it, vi } from "vitest";
import { criarFetchResiliente } from "./fetch";

const erroDeConexao = () => Object.assign(new TypeError("fetch failed"), { cause: { code: "UND_ERR_CONNECT_TIMEOUT" } });

describe("criarFetchResiliente", () => {
  it("tenta de novo quando a conexão não abre", async () => {
    const fetchBase = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(erroDeConexao())
      .mockRejectedValueOnce(erroDeConexao())
      .mockResolvedValue(new Response("ok"));

    const resposta = await criarFetchResiliente({ fetchBase })("https://exemplo.supabase.co");

    expect(await resposta.text()).toBe("ok");
    expect(fetchBase).toHaveBeenCalledTimes(3);
  });

  it("desiste depois do número máximo de tentativas", async () => {
    const fetchBase = vi.fn<typeof fetch>().mockRejectedValue(erroDeConexao());

    await expect(criarFetchResiliente({ fetchBase, tentativas: 3 })("https://exemplo.supabase.co")).rejects.toThrow(
      "fetch failed",
    );
    expect(fetchBase).toHaveBeenCalledTimes(3);
  });

  it("não repete outros erros, que podem ter chegado ao servidor", async () => {
    const outroErro = Object.assign(new TypeError("fetch failed"), { cause: { code: "ECONNRESET" } });
    const fetchBase = vi.fn<typeof fetch>().mockRejectedValue(outroErro);

    await expect(criarFetchResiliente({ fetchBase })("https://exemplo.supabase.co", { method: "POST" })).rejects.toBe(
      outroErro,
    );
    expect(fetchBase).toHaveBeenCalledTimes(1);
  });
});
