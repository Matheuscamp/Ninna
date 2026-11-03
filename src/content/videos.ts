import type { Perfil } from "@/lib/triagem";

// Vídeos curtos (9:16, com legendas e narração gerada por computador). São feitos
// no projeto videos/ e publicados em public/videos/<slug>.mp4 e .jpg (capa) com
// `npm run publicar`. Seguem o artigo de mesmo slug e passam pela mesma revisão profissional.
export type Video = {
  slug: string;
  perfil: Perfil;
  titulo: string;
  segundos: number;
  // Onde o vídeo aparece: o artigo de mesmo slug ou outra tela.
  href: string;
};

const noArtigo = (slug: string) => `/app/conteudo/${slug}`;

export const VIDEOS: Video[] = [
  { slug: "movimentos-do-bebe", perfil: "gestante", titulo: "Como contar os movimentos do bebê", segundos: 78, href: noArtigo("movimentos-do-bebe") },
  { slug: "sinais-de-alerta", perfil: "gestante", titulo: "Sinais de alerta na gestação", segundos: 62, href: "/app/alertas" },
  { slug: "sinais-parto-chegando", perfil: "gestante", titulo: "Como saber se o parto está chegando", segundos: 60, href: noArtigo("sinais-parto-chegando") },
  { slug: "primeira-consulta-pre-natal", perfil: "gestante", titulo: "Primeira consulta de pré-natal", segundos: 67, href: noArtigo("primeira-consulta-pre-natal") },
  { slug: "vacinas-gestacao", perfil: "gestante", titulo: "Vacinas na gestação", segundos: 65, href: noArtigo("vacinas-gestacao") },
  { slug: "enjoo-gestacao", perfil: "gestante", titulo: "Enjoo na gravidez", segundos: 57, href: noArtigo("enjoo-gestacao") },
  { slug: "deu-positivo", perfil: "suspeita", titulo: "Deu positivo: e agora?", segundos: 44, href: noArtigo("deu-positivo") },
  { slug: "amamentacao-primeiros-dias", perfil: "puerpera", titulo: "Amamentação nos primeiros dias", segundos: 74, href: noArtigo("amamentacao-primeiros-dias") },
];

export function videosDoPerfil(perfil: Perfil) {
  return VIDEOS.filter((v) => v.perfil === perfil);
}

export function videoPorSlug(slug: string) {
  return VIDEOS.find((v) => v.slug === slug);
}

// "1min18", "44s".
export function duracaoDoVideo(segundos: number) {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  if (!min) return `${seg}s`;
  return `${min}min${String(seg).padStart(2, "0")}`;
}
