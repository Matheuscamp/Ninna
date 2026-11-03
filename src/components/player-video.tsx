"use client";

import { useEffect, useRef, type ComponentProps } from "react";

// Com Cache Components, o Next esconde a página anterior em vez de desmontá-la
// (<Activity mode="hidden">), e um vídeo tocando continuaria com som fora da tela.
// A limpeza do efeito roda quando a página é escondida: é ali que o vídeo pausa.
export function PlayerVideo(props: ComponentProps<"video">) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    return () => video?.pause();
  }, []);
  return <video ref={ref} {...props} />;
}
