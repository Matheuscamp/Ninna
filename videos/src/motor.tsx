import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries, type TransitionPresentation } from "@remotion/transitions";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import type { Caption } from "@remotion/captions";
import { Fragment, type ReactNode } from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Legendas } from "./legendas";
import { Cabecalho, Fundo } from "./pecas";
import { COR, FPS } from "./tema";
import { ANTES, duracaoTotal, montarCenas, TRANSICAO, type Cena } from "./tempo";

// O que todo vídeo tem em comum: fundo, cabeçalho, música, narração por cena,
// transições, legendas palavra a palavra e efeitos sonoros nas trocas de cena.
// Cada vídeo só define o visual das cenas (ver src/videos/).

export type CenaVisual = (props: { dados: Cena }) => ReactNode;

export type DefinicaoVideo = {
  slug: string;
  tema: string;
  roteiro: { cenas: { id: string }[] };
  narracao: { cenas: Record<string, { duracao: number; palavras: Caption[] }> };
  cenas: Record<string, CenaVisual>;
  // Cenas de alerta: o fundo "esquenta".
  alertas?: string[];
};

const preso = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Efeito sonoro a partir de um quadro.
export function Som({ nome, de, volume = 0.5 }: { nome: string; de: number; volume?: number }) {
  return (
    <Sequence from={Math.max(0, Math.round(de))} layout="none">
      <Audio src={staticFile(`sons/${nome}.wav`)} volume={volume} />
    </Sequence>
  );
}

// Palco: a narração da cena e a área entre o cabeçalho e a legenda, com uma aproximação lenta de câmera.
function Palco({ slug, dados, alerta, children }: { slug: string; dados: Cena; alerta: boolean; children: ReactNode }) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {alerta && <AbsoluteFill style={{ background: COR.alerta50, opacity: interpolate(frame, [0, 20], [0, 0.7], preso) }} />}
      <Sequence from={ANTES} layout="none">
        <Audio src={staticFile(`audio/${slug}/${dados.id}.wav`)} />
      </Sequence>
      <div
        style={{
          position: "absolute",
          top: 250,
          left: 72,
          right: 72,
          bottom: 480,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          scale: interpolate(frame, [0, dados.duracao], [1, 1.04]),
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
}

// As transições se alternam ao longo do vídeo; a última é sempre o giro de relógio.
const TRANSICOES = [
  () => slide({ direction: "from-right" }),
  () => wipe({ direction: "from-bottom-left" }),
  () => slide({ direction: "from-bottom" }),
  () => fade(),
  () => wipe({ direction: "from-top" }),
];

export function criarVideo(def: DefinicaoVideo) {
  const cenas = montarCenas(
    def.roteiro.cenas.map((c) => c.id),
    def.narracao,
    2 * FPS,
  );

  function Video() {
    const { width, height, durationInFrames } = useVideoConfig();
    const frame = useCurrentFrame();
    return (
      <Fundo>
        <Audio src={staticFile("sons/musica.wav")} volume={interpolate(frame, [0, 30, durationInFrames - 60, durationInFrames], [0, 0.16, 0.16, 0], preso)} />
        {cenas.slice(1).map((c) => (
          <Som key={c.id} nome="whoosh" de={c.inicio} volume={0.3} />
        ))}
        <TransitionSeries>
          {cenas.map((dados, i) => {
            const Visual = def.cenas[dados.id];
            const ultima = i === cenas.length - 1;
            const apresentacao = () => (ultima ? clockWipe({ width, height }) : TRANSICOES[(i - 1) % TRANSICOES.length]()) as TransitionPresentation<Record<string, unknown>>;
            return (
              <Fragment key={dados.id}>
                {i > 0 && <TransitionSeries.Transition presentation={apresentacao()} timing={linearTiming({ durationInFrames: TRANSICAO })} />}
                <TransitionSeries.Sequence durationInFrames={dados.duracao}>
                  <Palco slug={def.slug} dados={dados} alerta={def.alertas?.includes(dados.id) ?? false}>
                    <Visual dados={dados} />
                  </Palco>
                </TransitionSeries.Sequence>
              </Fragment>
            );
          })}
        </TransitionSeries>
        <Cabecalho tema={def.tema} />
        <Legendas cenas={cenas} />
      </Fundo>
    );
  }

  return { Video, duracao: duracaoTotal(cenas) };
}
