import type { Perfil } from "@/lib/triagem";

// Conteúdo de saúde dos guias. Versão inicial baseada no roteiro do pré-natal:
// precisa ser revisada por obstetra ou enfermeira obstétrica antes do lançamento,
// e depois migrar para o CMS (RNF10).

export type Exame = { nome: string; quando: string; oque: string; preparo: string };

export const EXAMES = {
  hemograma: { nome: "Hemograma", quando: "1º e 3º trimestres", oque: "Avalia anemia e sinais de infecção. A anemia é comum na gestação e tem tratamento.", preparo: "Coleta de sangue, geralmente sem preparo." },
  tipagem: { nome: "Tipagem sanguínea e fator Rh", quando: "Primeira consulta", oque: "Descobre seu tipo de sangue. Se você for Rh negativo, o médico acompanha a compatibilidade com o bebê.", preparo: "Coleta de sangue, sem preparo." },
  glicemia: { nome: "Glicemia de jejum", quando: "Primeira consulta", oque: "Mede o açúcar no sangue para rastrear diabetes.", preparo: "Jejum de 8 horas (água pode)." },
  sorologias: { nome: "Sorologias (HIV, sífilis, hepatites, toxoplasmose)", quando: "1º e 3º trimestres", oque: "Detectam infecções que podem passar para o bebê. Descobertas cedo, todas têm tratamento ou prevenção.", preparo: "Coleta de sangue, sem preparo." },
  urina: { nome: "Urina tipo 1 e urocultura", quando: "1º e 3º trimestres", oque: "Procura infecção urinária, comum na gestação e às vezes sem sintomas.", preparo: "Colete o jato do meio da primeira urina da manhã." },
  ultra1: { nome: "Ultrassom do 1º trimestre", quando: "Entre 11 e 14 semanas", oque: "Confirma a idade gestacional e o número de bebês. Mede a translucência nucal, que ajuda a rastrear alterações genéticas.", preparo: "Siga a orientação da clínica; algumas pedem bexiga cheia." },
  morfo: { nome: "Ultrassom morfológico", quando: "Entre 20 e 24 semanas", oque: "Avalia em detalhe a formação dos órgãos do bebê. Muitas vezes dá para ver o sexo.", preparo: "Sem preparo especial." },
  dtpa: { nome: "Vacina dTpa", quando: "A partir da 20ª semana", oque: "Protege o bebê contra a coqueluche nos primeiros meses de vida. Disponível de graça no SUS.", preparo: "Leve sua caderneta de vacinação." },
  totg: { nome: "Teste de tolerância à glicose (TOTG)", quando: "Entre 24 e 28 semanas", oque: "Rastreia o diabetes gestacional. Você toma um líquido doce e colhe sangue em jejum, depois de 1 hora e depois de 2 horas.", preparo: "Jejum de 8 horas; reserve cerca de 2h30 no laboratório." },
  coombs: { nome: "Coombs indireto", quando: "Para quem é Rh negativo", oque: "Verifica se seu corpo produziu anticorpos contra o sangue do bebê. Se preciso, existe uma vacina preventiva.", preparo: "Coleta de sangue, sem preparo." },
  strepto: { nome: "Pesquisa de estreptococo B", quando: "Entre 35 e 37 semanas", oque: "Bactéria comum e inofensiva para você, mas que pode afetar o bebê no parto. Se der positivo, você recebe antibiótico durante o parto.", preparo: "Coleta rápida com cotonete na vagina e no ânus." },
  ctg: { nome: "Cardiotocografia", quando: "Fim da gestação, se o médico pedir", oque: "Registra os batimentos do bebê e as contrações por 20 a 30 minutos para checar se ele está bem.", preparo: "Faça uma refeição leve antes." },
} satisfies Record<string, Exame>;

export type IdExame = keyof typeof EXAMES;

export type Fase = {
  id: string;
  de: number;
  ate: number;
  titulo: string;
  resumo: string;
  tarefas: { id: string; texto: string }[];
  exames: IdExame[];
};

export const FASES: Fase[] = [
  {
    id: "f1", de: 4, ate: 10, titulo: "Confirmação e início do pré-natal",
    resumo: "O bebê está se formando e os enjoos podem aparecer. É hora de começar o pré-natal e fazer os exames iniciais.",
    tarefas: [
      { id: "f1-consulta", texto: "Agendar a primeira consulta de pré-natal" },
      { id: "f1-acido-folico", texto: "Tomar o ácido fólico indicado pelo médico" },
      { id: "f1-habitos", texto: "Evitar álcool, cigarro e remédios sem orientação" },
    ],
    exames: ["hemograma", "tipagem", "glicemia", "sorologias", "urina"],
  },
  {
    id: "f2", de: 11, ate: 14, titulo: "Fim do 1º trimestre",
    resumo: "O risco de perda diminui e muitas mulheres contam a novidade. Fase do primeiro ultrassom detalhado.",
    tarefas: [
      { id: "f2-ultrassom", texto: "Fazer o ultrassom entre 11 e 14 semanas" },
      { id: "f2-resultados", texto: "Levar os resultados dos exames à consulta" },
      { id: "f2-duvidas", texto: "Anotar suas dúvidas para o médico" },
    ],
    exames: ["ultra1"],
  },
  {
    id: "f3", de: 15, ate: 19, titulo: "Início do 2º trimestre",
    resumo: "Os enjoos costumam diminuir e a barriga começa a aparecer.",
    tarefas: [
      { id: "f3-consultas", texto: "Manter as consultas mensais" },
      { id: "f3-dentista", texto: "Ir ao dentista (pré-natal odontológico)" },
      { id: "f3-enxoval", texto: "Começar a pensar no enxoval com calma" },
    ],
    exames: [],
  },
  {
    id: "f4", de: 20, ate: 23, titulo: "Fase do morfológico",
    resumo: "Você pode começar a sentir o bebê mexer. Fase do ultrassom que avalia os órgãos dele.",
    tarefas: [
      { id: "f4-morfologico", texto: "Agendar o ultrassom morfológico" },
      { id: "f4-dtpa", texto: "Tomar a vacina dTpa" },
      { id: "f4-parto", texto: "Conhecer os tipos de parto" },
    ],
    exames: ["morfo", "dtpa"],
  },
  {
    id: "f5", de: 24, ate: 28, titulo: "Rastreio do diabetes gestacional",
    resumo: "O bebê já reage a sons. Fase do teste de tolerância à glicose.",
    tarefas: [
      { id: "f5-totg", texto: "Fazer o teste de tolerância à glicose" },
      { id: "f5-coombs", texto: "Se for Rh negativo, conversar sobre o Coombs" },
      { id: "f5-maternidade", texto: "Visitar a maternidade, se possível" },
    ],
    exames: ["totg", "coombs"],
  },
  {
    id: "f6", de: 29, ate: 34, titulo: "Início do 3º trimestre",
    resumo: "As consultas ficam mais frequentes e os exames de sangue são repetidos.",
    tarefas: [
      { id: "f6-exames", texto: "Repetir os exames do 3º trimestre" },
      { id: "f6-plano-parto", texto: "Começar o plano de parto" },
      { id: "f6-curso", texto: "Fazer um curso de gestante, se houver" },
    ],
    exames: ["hemograma", "sorologias", "urina"],
  },
  {
    id: "f7", de: 35, ate: 37, titulo: "Reta final",
    resumo: "O bebê está ganhando peso e se posicionando para nascer.",
    tarefas: [
      { id: "f7-strepto", texto: "Fazer o exame de estreptococo B" },
      { id: "f7-mala", texto: "Deixar a mala da maternidade pronta" },
      { id: "f7-acompanhante", texto: "Combinar quem vai te acompanhar no parto" },
    ],
    exames: ["strepto"],
  },
  {
    id: "f8", de: 38, ate: 42, titulo: "O bebê pode chegar a qualquer momento",
    resumo: "Consultas semanais até o parto. Fique atenta aos sinais de trabalho de parto.",
    tarefas: [
      { id: "f8-sinais", texto: "Reconhecer os sinais de trabalho de parto" },
      { id: "f8-cartao", texto: "Ter o cartão da gestante sempre com você" },
      { id: "f8-consultas", texto: "Ir às consultas semanais" },
    ],
    exames: ["ctg"],
  },
];

export const SEMANA_MIN = FASES[0].de;
export const SEMANA_MAX = FASES[FASES.length - 1].ate;

export function faseDaSemana(semana: number): Fase {
  return [...FASES].reverse().find((f) => semana >= f.de) ?? FASES[0];
}

export const PARTOS = [
  {
    id: "normal", aba: "Normal", nome: "Parto normal",
    desc: "O bebê nasce pela vagina, com o trabalho de parto acontecendo no tempo do corpo.",
    pros: ["Recuperação mais rápida: em geral você anda em poucas horas", "Menor risco de infecção e hemorragia que na cesárea", "Contato pele a pele e amamentação costumam começar logo", "A passagem pelo canal de parto ajuda a respiração do bebê"],
    contras: ["Duração imprevisível: pode levar muitas horas", "Dor das contrações (há alívio com e sem remédios)", "Possibilidade de laceração no períneo"],
    recuperacao: "A alta costuma acontecer em 1 a 2 dias.",
  },
  {
    id: "analgesia", aba: "Com analgesia", nome: "Parto normal com analgesia",
    desc: "Parto normal com anestesia (peridural ou raqui) para aliviar a dor, mantendo você acordada.",
    pros: ["Alívio importante da dor das contrações", "Permite descansar em trabalhos de parto longos", "Você continua consciente e participa do nascimento"],
    contras: ["Pode limitar a movimentação durante o trabalho de parto", "Pode baixar a pressão ou causar coceira", "Nem toda maternidade oferece a qualquer hora"],
    recuperacao: "Parecida com a do parto normal.",
  },
  {
    id: "cesarea", aba: "Cesárea", nome: "Cesárea",
    desc: "Cirurgia em que o bebê nasce por um corte na barriga e no útero.",
    pros: ["Salva vidas quando há indicação médica (bebê sentado, placenta prévia, sofrimento do bebê)", "Pode ser programada quando há indicação", "Duração previsível do procedimento"],
    contras: ["É uma cirurgia: recuperação mais longa e dor no pós-operatório", "Maior risco de infecção, hemorragia e trombose", "Pode aumentar riscos em gestações futuras", "Sem trabalho de parto, o bebê tem mais chance de desconforto respiratório"],
    recuperacao: "A alta costuma acontecer em 2 a 3 dias; evite esforço por cerca de 6 semanas.",
  },
] as const;

export const SINTOMAS = [
  { id: "atraso", texto: "Menstruação atrasada" },
  { id: "enjoo", texto: "Enjoo ou vômito" },
  { id: "seios", texto: "Seios sensíveis ou inchados" },
  { id: "cansaco", texto: "Cansaço fora do comum" },
  { id: "urina", texto: "Vontade de urinar toda hora" },
  { id: "sangramento", texto: "Pequeno sangramento ou cólica leve" },
  { id: "olfato", texto: "Olfato ou apetite diferentes" },
] as const;

export function resultadoSintomas(marcados: ReadonlySet<string>) {
  let resultado =
    marcados.size === 0
      ? { titulo: "Marque o que você sente", texto: "Vamos te mostrar qual é o próximo passo." }
      : marcados.has("atraso")
        ? { titulo: "Hora de fazer o teste", texto: "O atraso é o sinal mais importante. O teste de farmácia já pode dar positivo a partir do 1º dia de atraso." }
        : { titulo: "Ainda é cedo para saber", texto: "Esses sinais aparecem na gravidez, mas também na TPM, no estresse e em outras situações. Se a menstruação atrasar, faça o teste." };
  if (marcados.has("sangramento")) {
    resultado = { ...resultado, texto: resultado.texto + " Sangramento intenso ou com dor forte: procure atendimento." };
  }
  return resultado;
}

export const PASSOS_CONFIRMAR = [
  { titulo: "Teste de farmácia", texto: "A partir do 1º dia de atraso. Use a primeira urina da manhã para mais precisão." },
  { titulo: "Exame de sangue (Beta-hCG)", texto: "Mais sensível e confiável. É feito de graça na UBS do seu bairro." },
  { titulo: "Deu positivo?", texto: "Agende a primeira consulta de pré-natal, de preferência antes da 12ª semana." },
  { titulo: "Deu negativo e a menstruação não veio?", texto: "Repita o teste em uma semana ou procure um médico." },
];

const ALERTAS_GESTACAO = [
  "Sangramento vaginal",
  "Dor forte na barriga",
  "Perda de líquido pela vagina",
  "Febre, dor de cabeça forte ou visão embaçada",
  "Bebê parou de mexer ou está mexendo bem menos",
];

const ALERTAS_POS_PARTO = [
  "Sangramento intenso (encharca mais de um absorvente por hora)",
  "Febre ou dor forte na barriga ou nos pontos",
  "Dor de cabeça forte, visão embaçada ou falta de ar",
  "Dor, calor e inchaço em uma das pernas",
  "Pensamentos de se machucar ou machucar o bebê",
];

const ALERTAS_GERAIS = [
  "Sangramento vaginal intenso",
  "Dor forte na barriga",
  "Febre alta",
  "Desmaio ou falta de ar",
];

export function alertasDoPerfil(perfil: Perfil) {
  if (perfil === "gestante") return ALERTAS_GESTACAO;
  if (perfil === "puerpera") return ALERTAS_POS_PARTO;
  return ALERTAS_GERAIS;
}
