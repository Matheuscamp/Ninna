import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Cabeçalhos de segurança em todas as páginas.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Não deixa outro site abrir o Ninna dentro de um frame (proteção contra clickjacking).
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Recursos do aparelho que o app não usa ficam bloqueados.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
