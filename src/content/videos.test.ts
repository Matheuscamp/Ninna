import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { artigoPorSlug } from "./artigos";
import { duracaoDoVideo, VIDEOS } from "./videos";

describe("vídeos curtos", () => {
  it("têm o vídeo e a capa publicados em public/videos", () => {
    for (const v of VIDEOS) {
      expect(existsSync(path.join("public/videos", `${v.slug}.mp4`)), v.slug).toBe(true);
      expect(existsSync(path.join("public/videos", `${v.slug}.jpg`)), v.slug).toBe(true);
    }
  });

  it("aparecem num artigo gratuito do mesmo perfil", () => {
    for (const v of VIDEOS.filter((v) => v.href.startsWith("/app/conteudo/"))) {
      const artigo = artigoPorSlug(v.slug);
      expect(artigo, v.slug).toBeDefined();
      expect(artigo?.perfil).toBe(v.perfil);
      expect(artigo?.premium).toBe(false);
    }
  });

  it("mostram a duração por extenso curto", () => {
    expect(duracaoDoVideo(44)).toBe("44s");
    expect(duracaoDoVideo(78)).toBe("1min18");
    expect(duracaoDoVideo(65)).toBe("1min05");
  });
});
