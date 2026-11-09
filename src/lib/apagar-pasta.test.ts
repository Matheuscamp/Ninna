import { describe, expect, it, vi } from "vitest";
import { apagarPasta } from "./apagar-pasta";

// Storage simulado: `arquivos` guarda os caminhos completos; pastas são deduzidas deles.
function storage(arquivos: string[]) {
  const guardados = new Set(arquivos);
  return {
    guardados,
    list: vi.fn(async (pasta: string, { limit }: { limit: number }) => {
      const nomes = new Map<string, string | null>();
      for (const caminho of guardados) {
        if (!caminho.startsWith(`${pasta}/`)) continue;
        const [nome, ...resto] = caminho.slice(pasta.length + 1).split("/");
        nomes.set(nome, resto.length > 0 ? null : "id");
      }
      return { data: [...nomes].slice(0, limit).map(([name, id]) => ({ name, id })), error: null as { message: string } | null };
    }),
    remove: vi.fn(async (caminhos: string[]) => {
      caminhos.forEach((c) => guardados.delete(c));
      return { data: caminhos as unknown[] | null, error: null as unknown };
    }),
  };
}

describe("apagar os arquivos de uma pasta", () => {
  it("apaga tudo, em várias páginas e em subpastas", async () => {
    const s = storage([...Array.from({ length: 250 }, (_, i) => `u/${i}.pdf`), "u/a/b/c.pdf"]);
    expect(await apagarPasta(s, "u")).toBe(true);
    expect(s.guardados.size).toBe(0);
  });

  it("pasta vazia não dá erro", async () => {
    expect(await apagarPasta(storage([]), "u")).toBe(true);
  });

  it("erro ao listar não conta como pasta vazia", async () => {
    const s = storage(["u/1.pdf"]);
    s.list.mockResolvedValue({ data: null as never, error: { message: "Internal Server Error" } });
    expect(await apagarPasta(s, "u")).toBe(false);
  });

  it("bucket que ainda não existe não tem o que apagar", async () => {
    const s = storage([]);
    s.list.mockResolvedValue({ data: null as never, error: { message: "Bucket not found" } });
    expect(await apagarPasta(s, "u")).toBe(true);
  });

  it("erro ao remover impede de seguir", async () => {
    const s = storage(["u/1.pdf"]);
    s.remove.mockResolvedValue({ data: null, error: new Error("falhou") });
    expect(await apagarPasta(s, "u")).toBe(false);
  });

  it("não fica em laço quando nada é removido", async () => {
    const s = storage(["u/1.pdf"]);
    s.remove.mockResolvedValue({ data: [], error: null });
    expect(await apagarPasta(s, "u")).toBe(false);
    expect(s.list).toHaveBeenCalledOnce();
  });
});
