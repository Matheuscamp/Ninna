import { createTikTokStyleCaptions, type Caption, type TikTokPage } from "@remotion/captions";
import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { COR, FPS, SOMBRA_SUAVE } from "./tema";
import { ANTES, type Cena } from "./tempo";

// Quantas palavras aparecem juntas: uma nova "página" a cada ~1,3 s de fala.
const TROCA_MS = 1300;

// Legendas palavra a palavra (estilo TikTok): a palavra falada fica rosa e dá um pulinho.
export function Legendas({ cenas }: { cenas: Cena[] }) {
  const paginas = useMemo(
    () =>
      cenas.flatMap((cena) =>
        createTikTokStyleCaptions({ captions: cena.palavras, combineTokensWithinMilliseconds: TROCA_MS }).pages.map((pagina) => ({
          pagina,
          // Em quadros do vídeo inteiro.
          de: cena.inicio + ANTES + Math.round((pagina.startMs / 1000) * FPS),
          ate: cena.inicio + ANTES + Math.round(((pagina.startMs + pagina.durationMs) / 1000) * FPS) + 6,
        })),
      ),
    [cenas],
  );

  return (
    <AbsoluteFill>
      {paginas.map(({ pagina, de, ate }, i) => {
        const proxima = paginas[i + 1]?.de ?? Infinity;
        const fim = Math.min(ate, proxima);
        if (fim <= de) return null;
        return (
          <Sequence key={i} from={de} durationInFrames={fim - de} layout="none">
            <Pagina pagina={pagina} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

function Pagina({ pagina }: { pagina: TikTokPage }) {
  const frame = useCurrentFrame();
  const agoraMs = pagina.startMs + (frame / FPS) * 1000;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 230, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          background: "rgba(255,255,255,0.96)",
          boxShadow: SOMBRA_SUAVE,
          borderRadius: 36,
          padding: "24px 36px",
          fontSize: 58,
          fontWeight: 800,
          lineHeight: 1.25,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: "0.27em",
          scale: interpolate(frame, [0, 6], [0.92, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          opacity: interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        {pagina.tokens.map((token) => {
          const falando = agoraMs >= token.fromMs && agoraMs < token.toMs;
          const dito = agoraMs >= token.fromMs;
          const desde = ((agoraMs - token.fromMs) / 1000) * FPS;
          return (
            <span
              key={token.fromMs}
              style={{
                display: "inline-block",
                color: falando ? COR.rosa600 : dito ? COR.tinta : COR.suave,
                opacity: dito ? 1 : 0.45,
                scale: falando ? interpolate(desde, [0, 3, 7], [1, 1.12, 1.06], { extrapolateRight: "clamp" }) : 1,
              }}
            >
              {token.text.trim()}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export type { Caption };
