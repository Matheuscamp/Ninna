import type { MetadataRoute } from "next";

// Durante o teste fechado, nenhum buscador deve indexar o site.
// No lançamento, troque por regras que liberem as páginas públicas.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
