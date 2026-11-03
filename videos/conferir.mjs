// Gera um quadro do fim de cada cena (com tudo já na tela), para conferir o visual
// sem renderizar o vídeo inteiro.
// Uso: npm run conferir -- [video ...]   →  out/conferir/<video>-<n>.jpg
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const ANTES = 12;
const DEPOIS = 22;
const TRANSICAO = 16;
const FPS = 30;

const videos = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
await mkdir("out/conferir", { recursive: true });

for (const video of videos) {
  const composition = await selectComposition({ serveUrl, id: video });
  const narracao = JSON.parse(await readFile(`roteiros/${video}.narracao.json`, "utf8"));
  const ids = Object.keys(narracao.cenas);
  let inicio = 0;
  for (const [i, id] of ids.entries()) {
    const ultima = i === ids.length - 1;
    const duracao = ANTES + Math.ceil(narracao.cenas[id].duracao * FPS) + DEPOIS + (ultima ? 2 * FPS : 0);
    const frame = Math.min(composition.durationInFrames - 1, inicio + duracao - (ultima ? 10 : TRANSICAO + 4));
    const output = `out/conferir/${video}-${i + 1}-${id}.jpg`;
    await renderStill({ composition, serveUrl, output, frame, imageFormat: "jpeg", scale: 0.3 });
    console.log(output);
    inicio += duracao - TRANSICAO;
  }
}
