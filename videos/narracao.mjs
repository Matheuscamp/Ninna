// Gera a narração de um roteiro com uma voz neural da Azure (Microsoft), com o
// momento exato de cada palavra (para as legendas palavra a palavra e para as
// animações entrarem junto com a fala).
// Uso: npm run narracao -- movimentos-do-bebe [voz]
// Precisa de AZURE_SPEECH_KEY e AZURE_SPEECH_REGION no arquivo .env desta pasta.
// Saída: public/audio/<video>/<cena>.wav e roteiros/<video>.narracao.json
import { mkdir, readFile, writeFile } from "node:fs/promises";
import sdk from "microsoft-cognitiveservices-speech-sdk";

const video = process.argv[2] ?? "movimentos-do-bebe";
const voz = process.argv[3] ?? "pt-BR-FranciscaNeural";
// Um pouco mais devagar que o normal: o conteúdo é de saúde e tem números importantes.
const VELOCIDADE = "-4%";
// Na legenda, números e siglas aparecem escritos (a fala os diz por extenso).
// As expressões mais longas vêm primeiro, para "trinta e sete vírgula oito" não virar "37 vírgula 8".
const EXPRESSOES = [
  ["trinta e sete vírgula oito", "37,8"],
  ["dê tê pê á", "dTpa"],
  ["um nove dois", "192"],
  ["vinte e oito", "28"],
  ["trinta e seis", "36"],
  ["trinta e sete", "37"],
  ["décima segunda", "12ª"],
  ["vigésima oitava", "28ª"],
  ["trigésima sexta", "36ª"],
  ["vigésima", "20ª"],
  ["dois", "2"],
  ["três", "3"],
  ["cinco", "5"],
  ["seis", "6"],
  ["sete", "7"],
  ["oito", "8"],
  ["doze", "12"],
  ["quinze", "15"],
].map(([frase, escrita]) => [frase.split(" "), escrita]);

const { AZURE_SPEECH_KEY: chave, AZURE_SPEECH_REGION: regiao } = process.env;
if (!chave || !regiao) {
  console.error("Faltam AZURE_SPEECH_KEY e AZURE_SPEECH_REGION no arquivo videos/.env");
  process.exit(1);
}

const config = sdk.SpeechConfig.fromSubscription(chave, regiao);
config.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm;

const escapar = (texto) => texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const TICKS_POR_MS = 10_000;

// Duração em segundos, lida dos blocos "fmt " e "data" do WAV.
function duracaoDoWav(wav) {
  let bytesPorSegundo = 0;
  for (let i = 12; i + 8 <= wav.length; ) {
    const bloco = wav.toString("ascii", i, i + 4);
    const tamanho = wav.readUInt32LE(i + 4);
    if (bloco === "fmt ") bytesPorSegundo = wav.readUInt32LE(i + 16);
    if (bloco === "data") return Math.min(tamanho, wav.length - i - 8) / bytesPorSegundo;
    i += 8 + tamanho + (tamanho % 2);
  }
  throw new Error("WAV sem bloco de áudio");
}

// Junta as palavras de cada expressão da lista numa só, com o início da primeira e o fim da última.
function escreverNumeros(palavras) {
  const limpa = (p) => p.text.trim().toLowerCase().replace(/[.,!?:;]/g, "");
  const saida = [];
  for (let i = 0; i < palavras.length; ) {
    const achada = EXPRESSOES.find(([frase]) => frase.every((w, j) => palavras[i + j] && limpa(palavras[i + j]) === w));
    if (!achada) {
      saida.push(palavras[i++]);
      continue;
    }
    const [frase, escrita] = achada;
    const ultima = palavras[i + frase.length - 1];
    const pontuacao = ultima.text.trim().match(/[.,!?:;]+$/)?.[0] ?? "";
    saida.push({ ...palavras[i], text: ` ${escrita}${pontuacao}`, endMs: ultima.endMs });
    i += frase.length;
  }
  return saida;
}

// Fala o texto e devolve o áudio e as palavras no formato Caption do @remotion/captions.
function falar(texto) {
  return new Promise((resolver, rejeitar) => {
    const sintetizador = new sdk.SpeechSynthesizer(config, null);
    const palavras = [];
    sintetizador.wordBoundary = (_s, e) => {
      const inicio = e.audioOffset / TICKS_POR_MS;
      const fim = inicio + e.duration / TICKS_POR_MS;
      if (e.boundaryType === sdk.SpeechSynthesisBoundaryType.Punctuation) {
        // A pontuação gruda na palavra anterior.
        if (palavras.length) palavras[palavras.length - 1].text += e.text;
        return;
      }
      if (e.boundaryType !== sdk.SpeechSynthesisBoundaryType.Word) return;
      palavras.push({ text: ` ${e.text}`, startMs: Math.round(inicio), endMs: Math.round(fim), timestampMs: Math.round(inicio), confidence: null });
    };
    const ssml = `<speak version="1.0" xml:lang="pt-BR"><voice name="${voz}"><prosody rate="${VELOCIDADE}">${escapar(texto)}</prosody></voice></speak>`;
    sintetizador.speakSsmlAsync(
      ssml,
      (resultado) => {
        sintetizador.close();
        if (resultado.reason !== sdk.ResultReason.SynthesizingAudioCompleted) {
          const detalhe = sdk.CancellationDetails.fromResult(resultado).errorDetails;
          return rejeitar(new Error(`Azure recusou a fala: ${detalhe} (confira a chave e a região no .env)`));
        }
        resolver({ wav: Buffer.from(resultado.audioData), palavras: escreverNumeros(palavras) });
      },
      (erro) => {
        sintetizador.close();
        rejeitar(new Error(erro));
      },
    );
  });
}

const roteiro = JSON.parse(await readFile(`roteiros/${video}.json`, "utf8"));
const pasta = `public/audio/${video}`;
await mkdir(pasta, { recursive: true });

const narracao = { voz, cenas: {} };
for (const cena of roteiro.cenas) {
  const { wav, palavras } = await falar(cena.fala);
  await writeFile(`${pasta}/${cena.id}.wav`, wav);
  const duracao = Math.round(duracaoDoWav(wav) * 1000) / 1000;
  narracao.cenas[cena.id] = { duracao, palavras };
  console.log(`${cena.id}: ${duracao}s, ${palavras.length} palavras`);
}
await writeFile(`roteiros/${video}.narracao.json`, JSON.stringify(narracao, null, 2) + "\n");
const total = Object.values(narracao.cenas).reduce((soma, c) => soma + c.duracao, 0);
console.log(`Voz ${voz}: ${total.toFixed(1)}s de fala`);
