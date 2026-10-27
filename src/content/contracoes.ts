// Orientação do contador de contrações. Primeira versão: precisa de revisão de
// obstetra ou enfermeira obstétrica antes do lançamento (como todo src/content/).

// Regra "5-1-1": contrações de pelo menos 1 minuto, a cada 5 minutos ou menos,
// mantendo esse ritmo por 1 hora. É comum para a primeira gestação; o obstetra
// pode indicar outra (ex.: ir antes em quem já teve parto normal ou mora longe).
export const REGRA_IR_PARA_MATERNIDADE = {
  duracaoMinimaSeg: 60,
  intervaloMaximoMin: 5,
  periodoMin: 60,
} as const;

// Antes desta semana, contrações regulares são sinal de alerta (parto prematuro).
export const SEMANA_A_TERMO = 37;

export const TEXTOS_CONTRACOES = {
  como: "Toque em Começou quando a barriga endurecer e em Parou quando relaxar. O intervalo é contado do começo de uma contração ao começo da próxima.",
  padrao: {
    titulo: "Hora de ligar para a maternidade",
    texto:
      "Suas contrações estão no ritmo de parto ativo: cerca de 1 minuto cada, a cada 5 minutos ou menos, há 1 hora. Ligue para a maternidade ou para quem acompanha seu pré-natal e combine a ida.",
  },
  prematuro:
    "Você ainda não chegou a 37 semanas. Contrações regulares agora podem ser sinal de parto prematuro: procure atendimento já, sem esperar o ritmo do contador.",
  orientacaoMedica: "Se o seu médico ou a sua enfermeira passaram outra orientação, siga a deles.",
  irAgora: [
    "A bolsa estourou ou está saindo líquido",
    "Sangramento",
    "O bebê está se mexendo menos que o normal",
    "Dor forte que não passa entre as contrações",
    "Febre, dor de cabeça forte ou visão embaçada",
  ],
} as const;
