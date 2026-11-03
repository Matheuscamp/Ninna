// Efeitos sonoros e música de fundo dos vídeos, sintetizados aqui mesmo
// (nada baixado de terceiros, então não há licença a respeitar).
// Uso: npm run sons  →  public/sons/*.wav
import { mkdir, writeFile } from "node:fs/promises";

const TAXA = 44100;
const TAU = 2 * Math.PI;

// Pseudoaleatório com semente, para o ruído sair igual toda vez.
function aleatorio(semente) {
  let s = semente;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296) * 2 - 1;
}

function wav(amostras) {
  const dados = Buffer.alloc(amostras.length * 2);
  amostras.forEach((v, i) => dados.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 2));
  const cabecalho = Buffer.alloc(44);
  cabecalho.write("RIFF", 0);
  cabecalho.writeUInt32LE(36 + dados.length, 4);
  cabecalho.write("WAVEfmt ", 8);
  cabecalho.writeUInt32LE(16, 16);
  cabecalho.writeUInt16LE(1, 20);
  cabecalho.writeUInt16LE(1, 22);
  cabecalho.writeUInt32LE(TAXA, 24);
  cabecalho.writeUInt32LE(TAXA * 2, 28);
  cabecalho.writeUInt16LE(2, 32);
  cabecalho.writeUInt16LE(16, 34);
  cabecalho.write("data", 36);
  cabecalho.writeUInt32LE(dados.length, 40);
  return Buffer.concat([cabecalho, dados]);
}

const gerar = (segundos, f) => Array.from({ length: Math.round(segundos * TAXA) }, (_, i) => f(i / TAXA));

// Bolha que estoura: tom que desce rápido.
const pop = gerar(0.12, (t) => Math.sin(TAU * (700 * t - 1800 * t * t)) * Math.exp(-t * 38) * 0.8);

// Sopro de transição: ruído filtrado que sobe e desce.
const ruido = aleatorio(7);
let filtrado = 0;
const whoosh = gerar(0.5, (t) => {
  const corte = 0.02 + 0.25 * Math.sin(Math.PI * (t / 0.5));
  filtrado += corte * (ruido() - filtrado);
  return filtrado * Math.sin(Math.PI * (t / 0.5)) ** 2 * 1.6;
});

// Sininho de "tudo certo": duas notas com harmônicos.
const sino = (f, t) => (Math.sin(TAU * f * t) + 0.35 * Math.sin(TAU * f * 2.01 * t) + 0.15 * Math.sin(TAU * f * 3.02 * t)) * Math.exp(-t * 3.2);
const ding = gerar(1.6, (t) => 0.4 * (sino(1046.5, t) + (t > 0.12 ? sino(1568, t - 0.12) : 0)));

// Batida de coração (tum-tum).
const tum = (t) => (t < 0 ? 0 : Math.sin(TAU * 55 * t) * Math.exp(-t * 22) + 0.4 * Math.sin(TAU * 110 * t) * Math.exp(-t * 40));
const coracao = gerar(0.6, (t) => 0.9 * (tum(t) + 0.7 * tum(t - 0.22)));

// Aviso suave (duas notas subindo), sem ser assustador.
const nota = (f, t, dur) => (t < 0 || t > dur ? 0 : Math.sin(TAU * f * t) * Math.sin(Math.PI * (t / dur)));
const aviso = gerar(0.5, (t) => 0.35 * (nota(659.3, t, 0.18) + nota(880, t - 0.2, 0.25)));

// Música de fundo: base suave de acordes e um dedilhado de caixinha de música, 72 bpm, em ciclo de 16 compassos.
const BPM = 72;
const batida = 60 / BPM;
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const ACORDES = [
  [60, 64, 67, 71], // Dó maj7
  [57, 60, 64, 67], // Lá m7
  [53, 57, 60, 64], // Fá maj7
  [55, 59, 62, 65], // Sol 7
];
const compasso = 4 * batida;
const duracaoMusica = 96;
const musica = gerar(duracaoMusica, (t) => {
  const c = Math.floor(t / compasso) % ACORDES.length;
  const noCompasso = t % compasso;
  const envelope = Math.min(1, noCompasso / 0.8) * Math.min(1, (compasso - noCompasso) / 0.8);
  let base = 0;
  for (const m of ACORDES[c]) base += Math.sin(TAU * hz(m - 12) * t) + 0.5 * Math.sin(TAU * hz(m - 12) * 1.003 * t);
  base *= 0.05 * (0.6 + 0.4 * envelope);
  // Dedilhado em colcheias pelas notas do acorde, uma oitava acima.
  const colcheia = batida / 2;
  const passo = Math.floor(t / colcheia);
  const notaDoPasso = ACORDES[c][[0, 2, 1, 3, 2, 1, 3, 2][passo % 8]] + 12;
  const tn = t % colcheia;
  const caixinha = (Math.sin(TAU * hz(notaDoPasso) * t) + 0.25 * Math.sin(TAU * hz(notaDoPasso) * 3 * t)) * Math.exp(-tn * 6) * 0.09;
  const entradaESaida = Math.min(1, t / 2) * Math.min(1, (duracaoMusica - t) / 3);
  return (base + caixinha) * entradaESaida;
});

await mkdir("public/sons", { recursive: true });
for (const [nome, amostras] of Object.entries({ pop, whoosh, ding, coracao, aviso, musica })) {
  await writeFile(`public/sons/${nome}.wav`, wav(amostras));
  console.log(`public/sons/${nome}.wav`);
}
