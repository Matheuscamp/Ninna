import Image from "next/image";
import Link from "next/link";
import { duracaoDoVideo, type Video } from "@/content/videos";
import { PlayerVideo } from "./player-video";

// Player nativo: só baixa o vídeo quando ela der o play (preload="none") e mostra a capa até lá.
// As legendas já vêm no próprio vídeo.
export function VideoCurto({ video }: { video: Video }) {
  return (
    <figure id="video" className="flex scroll-mt-6 flex-col items-center gap-2">
      <PlayerVideo
        controls
        playsInline
        preload="none"
        poster={`/videos/${video.slug}.jpg`}
        aria-label={`Vídeo: ${video.titulo}`}
        className="aspect-[9/16] w-full max-w-[17rem] rounded-3xl bg-white/90 object-cover shadow-suave"
      >
        <source src={`/videos/${video.slug}.mp4`} type="video/mp4" />
        Seu navegador não consegue tocar este vídeo.
      </PlayerVideo>
      <figcaption className="text-center text-[13px] leading-snug text-suave">
        Vídeo de {duracaoDoVideo(video.segundos)}, com legendas. Narração gerada por computador.
      </figcaption>
    </figure>
  );
}

// Card do vídeo na lista de conteúdo: a capa em pé, com o botão de play e a duração.
export function CartaoVideo({ video }: { video: Video }) {
  return (
    <Link
      href={`${video.href}#video`}
      className="group flex w-36 shrink-0 snap-start flex-col gap-2 rounded-3xl focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rosa-600 sm:w-40"
    >
      <span className="relative block aspect-[9/16] overflow-hidden rounded-3xl bg-white/90 shadow-suave transition duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-flutuante motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
        <Image src={`/videos/${video.slug}.jpg`} alt="" width={540} height={960} sizes="160px" className="size-full object-cover" />
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-rosa-600 shadow-rosa">
            <svg viewBox="0 0 24 24" className="ml-0.5 size-5 fill-white">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
            </svg>
          </span>
        </span>
        <span className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-tinta">
          {duracaoDoVideo(video.segundos)}
        </span>
      </span>
      <span className="px-1 text-sm font-bold leading-snug text-tinta">{video.titulo}</span>
    </Link>
  );
}
