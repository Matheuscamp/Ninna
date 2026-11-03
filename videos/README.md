# Vídeos do Ninna

Vídeos curtos (vertical, 9:16) feitos com [Remotion](https://www.remotion.dev): as animações são código React com as ilustrações e cores do app (`../src/components/ilustracoes.tsx` e os tokens de `../src/app/globals.css`). Projeto separado do site, com dependências próprias; o Next não o compila.

## Como gerar um vídeo
Dentro desta pasta:

```bash
npm install
npm run sons
npm run narracao -- movimentos-do-bebe
npm run render -- movimentos-do-bebe out/movimentos-do-bebe.mp4 --crf=20
```

- `roteiros/<video>.json`: a fala de cada cena, com números por extenso para a voz ler certo (na legenda eles viram algarismos; a lista fica em `EXPRESSOES`, no `narracao.mjs`). O campo `tela` é só a ideia visual, para quem lê o roteiro.
- `roteiros/REVISAO.md`: todos os roteiros num documento para a revisão profissional.
- `npm run sons` sintetiza os efeitos sonoros e a música de fundo em `public/sons/` (feitos aqui, sem licença de terceiros; não vão para o Git).
- `npm run narracao` gera os áudios em `public/audio/<video>/` e `roteiros/<video>.narracao.json`, com a duração de cada cena e o momento de cada palavra. O vídeo se ajusta sozinho à fala: as legendas acendem palavra por palavra e as animações entram junto com a palavra.
- `npm run conferir -- <video>` gera um quadro do fim de cada cena em `out/conferir/`, para revisar o visual sem renderizar o vídeo inteiro.
- `npm run publicar [-- <video>]` grava em `../public/videos/` a versão para o site (720x1280, 2 a 4 MB) e a capa (`.jpg`). Depois de gerar um vídeo novo, registre-o em `../src/content/videos.ts`.
- `npm run studio` abre o editor no navegador para ver o vídeo quadro a quadro.

## Como o código está organizado
- `src/motor.tsx`: o que todo vídeo tem (fundo, cabeçalho, música, narração, transições, legendas e sons de transição).
- `src/modelos.tsx`: modelos de cena (`Abertura`, `Lista`, `Grade`, `Linha` da gestação em semanas, `Numero`, `Contracoes`, `Fim`) e os símbolos que as ilustrações do app não cobrem.
- `src/videos/<video>.tsx`: cada vídeo escolhe um modelo por cena e diz em que palavra da fala cada elemento entra (`de: "maternidade"`). Se a palavra não estiver na fala, a renderização para com um erro dizendo qual.
- `src/raiz.tsx`: lista dos vídeos.

Para um vídeo novo: escreva `roteiros/<video>.json`, rode `npm run narracao -- <video>`, crie `src/videos/<video>.tsx`, registre em `src/raiz.tsx`, confira com `npm run conferir -- <video>`, renderize e rode `npm run publicar -- <video>`.

## Voz
A narração usa uma voz neural da Azure (padrão: `pt-BR-FranciscaNeural`, um pouco mais devagar que o normal), no plano gratuito F0 (500 mil caracteres por mês; um vídeo de 1 minuto usa cerca de 900). A chave fica em `videos/.env`, que não vai para o Git:

```
AZURE_SPEECH_KEY=...
AZURE_SPEECH_REGION=brazilsouth
```

Para outra voz: `npm run narracao -- movimentos-do-bebe pt-BR-ThalitaNeural` (vozes na Voice Gallery do Speech Studio). O vídeo termina com o aviso de narração gerada por computador.

O conteúdo segue o artigo do app e precisa da mesma revisão profissional (ver `src/content/` no CLAUDE.md).
