// Prepara os vídeos para o site: versão leve (720x1280) e a capa de cada um,
// em ../public/videos/. Usa o ffmpeg que vem com o Remotion.
// Uso: npm run publicar [-- <video> ...]   (sem nomes, publica todos os de out/)
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const destino = path.resolve("../public/videos");
mkdirSync(destino, { recursive: true });

const pedidos = process.argv.slice(2);
const videos = pedidos.length
  ? pedidos
  : readdirSync("out").filter((f) => f.endsWith(".mp4")).map((f) => f.replace(/\.mp4$/, ""));

const remotion = path.resolve("node_modules/@remotion/cli/remotion-cli.js");
const ffmpeg = (...args) => execFileSync(process.execPath, [remotion, "ffmpeg", "-y", "-loglevel", "error", ...args], { stdio: "inherit" });

for (const video of videos) {
  const origem = `out/${video}.mp4`;
  if (!existsSync(origem)) throw new Error(`Falta ${origem}: renderize antes com npm run render`);

  const mp4 = path.join(destino, `${video}.mp4`);
  ffmpeg("-i", origem, "-vf", "scale=720:1280", "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", mp4);

  // Capa: o fim da primeira fala, com a abertura já toda na tela.
  const narracao = JSON.parse(readFileSync(`roteiros/${video}.narracao.json`, "utf8"));
  const primeira = Object.values(narracao.cenas)[0];
  const capa = path.join(destino, `${video}.jpg`);
  ffmpeg("-ss", String(primeira.duracao + 0.4), "-i", mp4, "-frames:v", "1", "-vf", "scale=540:960", "-q:v", "5", capa);

  const mb = (statSync(mp4).size / 1024 / 1024).toFixed(1);
  console.log(`${video}: ${mb} MB`);
}
