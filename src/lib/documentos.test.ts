import { describe, expect, it } from "vitest";
import {
  escaparBusca,
  formatarTamanho,
  lerFiltros,
  metadadosSchema,
  nomeSemExtensao,
  TAMANHO_MAXIMO,
  temFiltros,
  tipoPelosBytes,
  validarArquivo,
} from "./documentos";

describe("validarArquivo", () => {
  it("aceita imagens e PDF até 10 MB", () => {
    expect(validarArquivo({ name: "exame.pdf", type: "application/pdf", size: 2_000_000 })).toBeNull();
    expect(validarArquivo({ name: "foto.webp", type: "image/webp", size: TAMANHO_MAXIMO })).toBeNull();
  });

  it("recusa outros formatos, arquivo vazio e acima do limite", () => {
    expect(validarArquivo({ name: "a.docx", type: "application/vnd.openxmlformats", size: 10 })).toMatch(/Formato/);
    expect(validarArquivo({ name: "a.pdf", type: "application/pdf", size: 0 })).toMatch(/vazio/);
    expect(validarArquivo({ name: "a.pdf", type: "application/pdf", size: TAMANHO_MAXIMO + 1 })).toMatch(/10 MB/);
  });
});

describe("tipoPelosBytes", () => {
  const bytes = (...b: number[]) => new Uint8Array([...b, ...new Array(12).fill(0)]);

  it("reconhece PDF, JPEG, PNG e WEBP pela assinatura", () => {
    expect(tipoPelosBytes(bytes(0x25, 0x50, 0x44, 0x46, 0x2d))).toBe("application/pdf");
    expect(tipoPelosBytes(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
    expect(tipoPelosBytes(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("image/png");
    expect(tipoPelosBytes(bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50))).toBe("image/webp");
  });

  it("recusa um executável disfarçado", () => {
    expect(tipoPelosBytes(bytes(0x4d, 0x5a, 0x90, 0x00))).toBeNull();
  });
});

describe("metadadosSchema", () => {
  it("aceita só o obrigatório e descarta opcionais vazios", () => {
    const r = metadadosSchema.safeParse({ nome: "Hemograma", categoria: "exames_laboratoriais", descricao: "  ", dataDocumento: "" });
    expect(r.success && r.data).toEqual({ nome: "Hemograma", categoria: "exames_laboratoriais" });
  });

  it("recusa categoria inexistente, nome vazio e data inválida", () => {
    expect(metadadosSchema.safeParse({ nome: "x", categoria: "fotos" }).success).toBe(false);
    expect(metadadosSchema.safeParse({ nome: " ", categoria: "outros" }).success).toBe(false);
    expect(metadadosSchema.safeParse({ nome: "x", categoria: "outros", dataDocumento: "31/02/2026" }).success).toBe(false);
  });
});

describe("filtros", () => {
  it("lê filtros válidos e ignora os inválidos", () => {
    expect(lerFiltros({ q: " hemo ", categoria: "vacinas", de: "2026-01-01", ate: "x", ordem: "nome" })).toEqual({
      q: "hemo",
      categoria: "vacinas",
      de: "2026-01-01",
      ate: undefined,
      ordem: "nome",
    });
    expect(lerFiltros({ categoria: "hackers", ordem: "drop table" })).toEqual({
      q: undefined,
      categoria: undefined,
      de: undefined,
      ate: undefined,
      ordem: "recentes",
    });
  });

  it("sabe quando há filtro ativo", () => {
    expect(temFiltros(lerFiltros({ ordem: "nome" }))).toBe(false);
    expect(temFiltros(lerFiltros({ q: "raio" }))).toBe(true);
  });

  it("escapa curingas da busca", () => {
    expect(escaparBusca("100%_ok")).toBe("100\\%\\_ok");
  });
});

describe("apresentação", () => {
  it("sugere o nome a partir do arquivo e formata o tamanho", () => {
    expect(nomeSemExtensao("hemograma_completo-2026.pdf")).toBe("hemograma completo 2026");
    expect(formatarTamanho(512)).toBe("1 KB");
    expect(formatarTamanho(2.5 * 1024 * 1024)).toBe("2,5 MB");
  });
});
