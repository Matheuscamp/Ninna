import type { Perfil } from "@/lib/triagem";

// Conteúdo de saúde dos guias. Baseado na Caderneta Brasileira da Gestante
// (Ministério da Saúde, 2026), reescrito em linguagem do app: precisa ser revisado
// por obstetra ou enfermeira obstétrica antes do lançamento, e depois migrar para o CMS (RNF10).
// Os ids de tarefa ficam gravados no banco (task_progress): ao mudar um texto, mantenha o id.

export type Exame = { nome: string; quando: string; oque: string; preparo: string };

export const EXAMES = {
  hemograma: { nome: "Hemograma", quando: "1º e 3º trimestres", oque: "Avalia anemia e sinais de infecção. A anemia é comum na gestação e tem tratamento.", preparo: "Coleta de sangue, geralmente sem preparo." },
  tipagem: { nome: "Tipagem sanguínea e fator Rh", quando: "Primeira consulta", oque: "Descobre seu tipo de sangue. Se você for Rh negativo, a equipe acompanha a compatibilidade com o bebê pelo exame de Coombs.", preparo: "Coleta de sangue, sem preparo." },
  eletroforese: { nome: "Eletroforese de hemoglobina", quando: "Primeira consulta", oque: "Identifica doença falciforme ou traço falciforme, mais frequentes na população negra. Saber disso ajuda a equipe a cuidar melhor de você e do bebê.", preparo: "Coleta de sangue, sem preparo." },
  glicemia: { nome: "Glicemia de jejum", quando: "1º e 3º trimestres", oque: "Mede o açúcar no sangue para rastrear diabetes.", preparo: "Jejum de 8 horas (água pode)." },
  sorologias: {
    nome: "Testes de infecções (HIV, sífilis, hepatites B e C, toxoplasmose, HTLV)",
    quando: "1º e 3º trimestres (HIV e sífilis também no parto)",
    oque: "Detectam infecções que podem passar para o bebê. Muitos são testes rápidos, feitos na própria UBS. Descobertas cedo, todas têm tratamento ou prevenção.",
    preparo: "Coleta de sangue ou furinho no dedo, sem preparo.",
  },
  urina: { nome: "Urina tipo 1 e urocultura", quando: "1º e 3º trimestres", oque: "Procura infecção urinária, comum na gestação e muitas vezes sem sintomas. Sem tratamento, ela pode levar a parto prematuro.", preparo: "Colete o jato do meio da primeira urina da manhã." },
  ultra1: { nome: "Ultrassom obstétrico", quando: "Idealmente entre 7 e 12 semanas", oque: "Confirma a idade gestacional, a data provável do parto e o número de bebês. Algumas equipes pedem também o ultrassom entre 11 e 14 semanas, que mede a translucência nucal.", preparo: "Siga a orientação da clínica; algumas pedem bexiga cheia." },
  morfo: { nome: "Ultrassom morfológico", quando: "Entre 20 e 24 semanas, se indicado", oque: "Avalia em detalhe a formação dos órgãos do bebê. Não é feito de rotina em todos os serviços: pergunte à sua equipe.", preparo: "Sem preparo especial." },
  dtpa: { nome: "Vacina dTpa (difteria, tétano e coqueluche)", quando: "A partir da 20ª semana, em toda gestação", oque: "Os anticorpos passam para o bebê e o protegem contra a coqueluche nos primeiros meses de vida. Precisa ser repetida a cada gravidez, mesmo que você já tenha tomado antes. Grátis no SUS.", preparo: "Leve sua caderneta de vacinação." },
  vsr: { nome: "Vacina contra o VSR (vírus sincicial respiratório)", quando: "A partir da 28ª semana, dose única por gestação", oque: "Protege o bebê contra bronquiolite e pneumonia nos primeiros meses, quando o VSR é a principal causa de internação. Grátis no SUS.", preparo: "Leve sua caderneta de vacinação." },
  influenza: { nome: "Vacina da gripe", quando: "Qualquer fase da gestação, uma dose por temporada", oque: "Previne casos graves de gripe na gestação. Se não tomar na gravidez, ainda pode tomar até 45 dias depois do parto.", preparo: "Leve sua caderneta de vacinação." },
  hepatiteB: { nome: "Vacina da hepatite B", quando: "Se o esquema estiver incompleto", oque: "São 3 doses. Se você não tem todas, a equipe inicia ou completa durante a gestação.", preparo: "Leve sua caderneta de vacinação para conferir as doses." },
  covid: { nome: "Vacina da Covid-19", quando: "1 dose por gestação, 6 meses após a última dose", oque: "Reduz o risco de Covid grave para você e para o bebê.", preparo: "Leve sua caderneta de vacinação." },
  totg: { nome: "Teste de tolerância à glicose (TOTG)", quando: "Entre 24 e 28 semanas", oque: "Rastreia o diabetes gestacional, que costuma não dar sintomas. Você toma um líquido doce e colhe sangue em jejum, depois de 1 hora e depois de 2 horas.", preparo: "Jejum de 8 horas; reserve cerca de 2h30 no laboratório." },
  coombs: { nome: "Coombs indireto", quando: "Para quem é Rh negativo (1º, 2º e 3º trimestres)", oque: "Verifica se seu corpo produziu anticorpos contra o sangue do bebê. Se preciso, existe uma vacina preventiva.", preparo: "Coleta de sangue, sem preparo." },
  strepto: { nome: "Pesquisa de estreptococo B", quando: "Entre 35 e 37 semanas, se a equipe pedir", oque: "Bactéria comum e inofensiva para você, mas que pode afetar o bebê no parto. Se der positivo, você recebe antibiótico durante o parto.", preparo: "Coleta rápida com cotonete na vagina e no ânus." },
  ctg: { nome: "Cardiotocografia", quando: "Fim da gestação, se a equipe pedir", oque: "Registra os batimentos do bebê e as contrações por 20 a 30 minutos para checar se ele está bem.", preparo: "Faça uma refeição leve antes." },
} satisfies Record<string, Exame>;

export type IdExame = keyof typeof EXAMES;

export type Fase = {
  id: string;
  de: number;
  ate: number;
  titulo: string;
  resumo: string;
  // Como está o bebê nesta fase, com comparação de tamanho.
  bebe: string;
  // Frequência mínima de consultas recomendada pelo Ministério da Saúde.
  consultas: string;
  tarefas: { id: string; texto: string }[];
  exames: IdExame[];
};

const MENSAIS = "Consultas mensais (no mínimo 7 em toda a gestação, alternando médica e enfermeira)";
const QUINZENAIS = "Consultas a cada 15 dias, da 28ª à 36ª semana";
const SEMANAIS = "Consultas toda semana, a partir da 36ª semana, até o parto";

export const FASES: Fase[] = [
  {
    id: "f1", de: 4, ate: 10, titulo: "Confirmação e início do pré-natal",
    resumo: "Enjoo, sono, cansaço e mudanças nos seios e no humor são comuns. É hora de começar o pré-natal, de preferência até a 12ª semana, e fazer os exames iniciais.",
    bebe: "Estão se formando braços, pernas, rosto e órgãos. Com 4 semanas, o bebê tem o tamanho de um grão de arroz.",
    consultas: MENSAIS,
    tarefas: [
      { id: "f1-consulta", texto: "Agendar a primeira consulta de pré-natal (até a 12ª semana)" },
      { id: "f1-acido-folico", texto: "Tomar o ácido fólico indicado pela equipe" },
      { id: "f1-habitos", texto: "Evitar álcool, cigarro e remédios sem orientação" },
      { id: "f1-vacinas", texto: "Levar a caderneta de vacinação para conferir gripe, hepatite B e Covid-19" },
      { id: "f1-parceria", texto: "Convidar a parceria para o pré-natal do parceiro, com consultas e exames dele" },
    ],
    exames: ["hemograma", "tipagem", "eletroforese", "glicemia", "sorologias", "urina", "ultra1", "influenza", "hepatiteB", "covid"],
  },
  {
    id: "f2", de: 11, ate: 14, titulo: "Fim do 1º trimestre",
    resumo: "O risco de perda diminui e muitas pessoas contam a novidade. Se o primeiro ultrassom ainda não foi feito, é a hora.",
    bebe: "O bebê já se mexe, o cordão umbilical está formado e o coração pode ser ouvido na consulta. Tem o tamanho de um limão.",
    consultas: MENSAIS,
    tarefas: [
      { id: "f2-ultrassom", texto: "Fazer o ultrassom obstétrico, se ainda não fez" },
      { id: "f2-resultados", texto: "Levar os resultados dos exames à consulta" },
      { id: "f2-duvidas", texto: "Anotar suas dúvidas para a consulta" },
      { id: "f2-grupo", texto: "Perguntar na UBS os dias do grupo de gestantes" },
    ],
    exames: ["ultra1"],
  },
  {
    id: "f3", de: 15, ate: 19, titulo: "Início do 2º trimestre",
    resumo: "Os enjoos costumam diminuir, a disposição volta e a barriga, as mamas e os quadris crescem.",
    bebe: "Já dá para ver os movimentos do bebê no ultrassom. Com 17 a 18 semanas, ele mede de 17 a 20 cm e pesa cerca de 200 a 250 g, como uma manga.",
    consultas: MENSAIS,
    tarefas: [
      { id: "f3-consultas", texto: "Manter as consultas mensais" },
      { id: "f3-dentista", texto: "Ir ao dentista na UBS (pré-natal odontológico, um direito seu)" },
      { id: "f3-atividade", texto: "Manter-se ativa: 30 a 60 minutos de atividade leve por dia, se a equipe liberar" },
      { id: "f3-enxoval", texto: "Começar a pensar no enxoval com calma (o bebê precisa de pouca coisa)" },
    ],
    exames: [],
  },
  {
    id: "f4", de: 20, ate: 23, titulo: "Vacina dTpa e movimentos do bebê",
    resumo: "Você começa a sentir o bebê mexer, cada vez mais. É a fase de tomar a vacina dTpa.",
    bebe: "O bebê mede cerca de 26 cm e pesa em média 500 g, como um mamão pequeno. Ele tem períodos de atividade e de descanso.",
    consultas: MENSAIS,
    tarefas: [
      { id: "f4-dtpa", texto: "Tomar a vacina dTpa (a partir da 20ª semana)" },
      { id: "f4-movimentos", texto: "Observar os movimentos: se o bebê ficar mais de 4 horas sem mexer, procure atendimento" },
      { id: "f4-morfologico", texto: "Perguntar à equipe sobre o ultrassom morfológico" },
      { id: "f4-parto", texto: "Conhecer os tipos de parto" },
    ],
    exames: ["dtpa", "morfo"],
  },
  {
    id: "f5", de: 24, ate: 28, titulo: "Rastreio do diabetes gestacional",
    resumo: "O bebê já reage a sons. Fase do teste de tolerância à glicose, que identifica o diabetes gestacional.",
    bebe: "O bebê cresce bastante e o cérebro e os pulmões se desenvolvem. Nesta fase, ele passa de 1 kg.",
    consultas: MENSAIS,
    tarefas: [
      { id: "f5-totg", texto: "Fazer o teste de tolerância à glicose" },
      { id: "f5-coombs", texto: "Se for Rh negativo, repetir o Coombs" },
      { id: "f5-maternidade", texto: "Saber qual é sua maternidade de referência e como chegar lá" },
    ],
    exames: ["totg", "coombs"],
  },
  {
    id: "f6", de: 29, ate: 34, titulo: "Início do 3º trimestre",
    resumo: "As consultas passam a ser a cada 15 dias e os exames de sangue são repetidos. É a hora da vacina contra o VSR.",
    bebe: "O bebê ganha peso e gordura, que vai ajudar a manter a temperatura depois de nascer. Mede de 34 a 43 cm e pesa entre 1 e 2 kg, como um abacaxi.",
    consultas: QUINZENAIS,
    tarefas: [
      { id: "f6-vsr", texto: "Tomar a vacina contra o VSR (a partir da 28ª semana)" },
      { id: "f6-exames", texto: "Repetir os exames do 3º trimestre" },
      { id: "f6-plano-parto", texto: "Começar o plano de parto e conversar sobre ele na consulta" },
      { id: "f6-contracepcao", texto: "Decidir sobre a contracepção pós-parto (se quiser laqueadura no parto, o pedido precisa ser assinado 60 dias antes)" },
      { id: "f6-curso", texto: "Participar do grupo de gestantes ou de um curso, se houver" },
    ],
    exames: ["vsr", "hemograma", "glicemia", "sorologias", "urina", "coombs"],
  },
  {
    id: "f7", de: 35, ate: 37, titulo: "Reta final",
    resumo: "Peso, desconforto, vontade de urinar toda hora e dificuldade para dormir são comuns. A barriga pode endurecer às vezes, sem dor.",
    bebe: "Os órgãos estão quase prontos, principalmente os pulmões, e o bebê costuma ficar de cabeça para baixo. Mede de 44 a 48 cm e pesa entre 2,3 e 2,8 kg, como um melão.",
    consultas: QUINZENAIS,
    tarefas: [
      { id: "f7-mala", texto: "Deixar a mala pronta: documento, CPF, caderneta, plano de parto, roupas, absorventes e fraldas" },
      { id: "f7-acompanhante", texto: "Combinar quem vai te acompanhar no parto (e quem fica com outros filhos)" },
      { id: "f7-pos-parto", texto: "Organizar quem ajuda em casa nos primeiros dias depois do parto" },
      { id: "f7-trabalho", texto: "Organizar licença-maternidade ou afastamento da escola" },
      { id: "f7-strepto", texto: "Fazer o exame de estreptococo B, se a equipe pedir" },
    ],
    exames: ["strepto"],
  },
  {
    id: "f8", de: 38, ate: 42, titulo: "O bebê pode chegar a qualquer momento",
    resumo: "Consultas toda semana até o parto. Contrações irregulares e a saída do tampão mucoso são comuns e ainda não significam que o parto começou.",
    bebe: "O bebê está pronto para nascer. Mede de 48 a 52 cm e pesa entre 3 e 4 kg, como uma melancia.",
    consultas: SEMANAIS,
    tarefas: [
      { id: "f8-sinais", texto: "Reconhecer os sinais de trabalho de parto (use o contador de contrações)" },
      { id: "f8-cartao", texto: "Levar a caderneta da gestante sempre com você" },
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

// Sinais de alerta da Caderneta Brasileira da Gestante (2026). Sempre gratuitos.
const ALERTAS_GESTACAO = [
  "Sangramento vaginal",
  "Perda de líquido pela vagina",
  "Dor forte ou que não passa na barriga",
  "Pressão mais alta que o seu normal, ou de 14 por 9 (140 x 90) ou mais",
  "Dor de cabeça forte ou que não melhora",
  "Visão embaçada, pontos de luz, flashes ou sensibilidade à luz",
  "Dor forte no estômago, logo abaixo das mamas",
  "Inchaço repentino no rosto, nas mãos ou nas pernas",
  "Bebê mexendo menos, ou mais de 4 horas sem mexer depois de 20 semanas",
  "Febre de 37,8 °C ou mais",
  "Dor ou ardência para urinar",
  "Manchas vermelhas na pele ou olhos vermelhos",
  "Dor forte no peito ou falta de ar",
  "Desmaio, convulsão ou mal-estar muito forte",
];

const ALERTAS_POS_PARTO = [
  "Sangramento que encharca o absorvente rapidamente, ou com mau cheiro",
  "Febre de 37,8 °C ou mais",
  "Dor forte e persistente na barriga, nos pontos ou na cicatriz da cesárea",
  "Vermelhidão, inchaço, secreção ou mau cheiro nos pontos ou na cicatriz",
  "Mama com dor forte, vermelha ou com área endurecida e dolorida",
  "Dor de cabeça forte, visão embaçada ou pontos de luz",
  "Inchaço repentino no rosto, nas mãos ou nas pernas",
  "Dor, calor ou inchaço em uma das pernas, principalmente na panturrilha",
  "Dor no peito, falta de ar, palpitação ou sensação de desmaio",
  "Convulsão, tontura forte ou urinar muito pouco",
  "Tristeza intensa, confusão ou pensamentos de machucar a si mesma ou o bebê",
];

// Sinais de alerta no recém-nascido (para o perfil pós-parto).
export const ALERTAS_BEBE = [
  "Dificuldade para mamar",
  "Respiração rápida ou com esforço",
  "Febre ou temperatura muito baixa",
  "Pele muito amarelada",
  "Sono demais ou choro que não passa",
  "Umbigo com mau cheiro, secreção ou muito vermelho",
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
