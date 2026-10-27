// Perguntas do plano de parto. Primeira versão: precisa de revisão de obstetra ou
// enfermeira obstétrica antes do lançamento (como todo src/content/).
// Os ids ficam gravados no banco: ao mudar um texto, mantenha o id; ao remover
// uma opção, as respostas antigas com ela são ignoradas.

export type Opcao = { id: string; rotulo: string };

export type Pergunta =
  | { id: string; titulo: string; tipo: "texto"; ajuda?: string; max: number }
  | { id: string; titulo: string; tipo: "unica" | "varias"; ajuda?: string; opcoes: readonly Opcao[] };

export type SecaoPlano = { id: string; titulo: string; descricao?: string; perguntas: readonly Pergunta[] };

export const SECOES_PLANO: readonly SecaoPlano[] = [
  {
    id: "sobre",
    titulo: "Sobre mim",
    perguntas: [
      { id: "maternidade", titulo: "Maternidade ou hospital escolhido", tipo: "texto", max: 120 },
      { id: "equipe", titulo: "Médico, enfermeira obstétrica ou equipe", tipo: "texto", max: 120 },
      {
        id: "acompanhante",
        titulo: "Acompanhante",
        tipo: "texto",
        max: 120,
        ajuda: "Nome e parentesco. A lei garante um acompanhante de sua escolha no pré-parto, parto e pós-parto (Lei 11.108/2005).",
      },
      { id: "doula", titulo: "Doula", tipo: "texto", max: 120, ajuda: "Se tiver, o nome dela." },
    ],
  },
  {
    id: "trabalho",
    titulo: "Durante o trabalho de parto",
    perguntas: [
      {
        id: "ambiente",
        titulo: "Ambiente",
        tipo: "varias",
        opcoes: [
          { id: "luz_baixa", rotulo: "Luz baixa" },
          { id: "musica", rotulo: "Poder ouvir minhas músicas" },
          { id: "silencio", rotulo: "Silêncio e poucas pessoas no quarto" },
          { id: "fotos", rotulo: "Poder tirar fotos ou filmar" },
        ],
      },
      {
        id: "movimento",
        titulo: "Movimento e alimentação",
        tipo: "varias",
        opcoes: [
          { id: "andar", rotulo: "Andar e mudar de posição à vontade" },
          { id: "liquidos", rotulo: "Beber água e líquidos leves, se a equipe permitir" },
          { id: "sem_soro_rotina", rotulo: "Evitar soro de rotina, se não for necessário" },
        ],
      },
      {
        id: "alivio",
        titulo: "Alívio da dor sem remédio",
        tipo: "varias",
        opcoes: [
          { id: "banho", rotulo: "Banho quente" },
          { id: "bola", rotulo: "Bola de pilates" },
          { id: "massagem", rotulo: "Massagem" },
          { id: "respiracao", rotulo: "Exercícios de respiração" },
          { id: "banheira", rotulo: "Banheira, se houver" },
        ],
      },
      {
        id: "analgesia",
        titulo: "Analgesia (anestesia para a dor)",
        tipo: "unica",
        opcoes: [
          { id: "quero", rotulo: "Quero analgesia assim que for possível" },
          { id: "se_pedir", rotulo: "Prefiro tentar sem, mas quero receber se eu pedir" },
          { id: "evitar", rotulo: "Prefiro evitar, a não ser que seja necessário" },
          { id: "decidir", rotulo: "Vou decidir na hora" },
        ],
      },
      {
        id: "intervencoes",
        titulo: "Intervenções",
        tipo: "varias",
        ajuda: "Ocitocina, romper a bolsa, episiotomia (corte no períneo) e outros procedimentos.",
        opcoes: [
          { id: "consultar", rotulo: "Quero ser consultada e entender o motivo antes de qualquer intervenção" },
          { id: "sem_episiotomia", rotulo: "Prefiro evitar episiotomia, a não ser que seja necessária" },
          { id: "sem_kristeller", rotulo: "Não aceito que empurrem minha barriga (manobra de Kristeller)" },
        ],
      },
    ],
  },
  {
    id: "nascimento",
    titulo: "No nascimento",
    perguntas: [
      {
        id: "posicao",
        titulo: "Posição para o bebê nascer",
        tipo: "unica",
        opcoes: [
          { id: "livre", rotulo: "A que eu achar melhor na hora" },
          { id: "cocoras", rotulo: "De cócoras ou na banqueta" },
          { id: "lado", rotulo: "De lado" },
          { id: "semi_sentada", rotulo: "Semi-sentada" },
          { id: "quatro_apoios", rotulo: "De quatro apoios" },
        ],
      },
      {
        id: "cordao",
        titulo: "Cordão umbilical",
        tipo: "varias",
        opcoes: [
          { id: "clampeamento_tardio", rotulo: "Esperar o cordão parar de pulsar antes de cortar, se o bebê estiver bem" },
          { id: "acompanhante_corta", rotulo: "Meu acompanhante corta o cordão" },
        ],
      },
    ],
  },
  {
    id: "bebe",
    titulo: "Depois que o bebê nascer",
    perguntas: [
      {
        id: "primeira_hora",
        titulo: "Primeira hora",
        tipo: "varias",
        opcoes: [
          { id: "pele_a_pele", rotulo: "Bebê no meu colo, pele a pele, logo ao nascer" },
          { id: "mamar", rotulo: "Amamentar ainda na primeira hora" },
          { id: "exames_depois", rotulo: "Banho e exames de rotina depois da primeira hora, se o bebê estiver bem" },
          { id: "acompanhante_junto", rotulo: "Meu acompanhante junto do bebê em todos os procedimentos" },
        ],
      },
      {
        id: "alimentacao",
        titulo: "Alimentação do bebê",
        tipo: "unica",
        opcoes: [
          { id: "exclusivo", rotulo: "Só leite materno; nada de fórmula ou chupeta sem a minha autorização" },
          { id: "conversar", rotulo: "Quero conversar com a equipe antes de qualquer complemento" },
          { id: "formula", rotulo: "Vou usar fórmula" },
        ],
      },
      {
        id: "alojamento",
        titulo: "No quarto",
        tipo: "varias",
        opcoes: [{ id: "alojamento_conjunto", rotulo: "Ficar com o bebê no quarto o tempo todo (alojamento conjunto)" }],
      },
    ],
  },
  {
    id: "cesarea",
    titulo: "Se for preciso uma cesárea",
    perguntas: [
      {
        id: "cesarea",
        titulo: "Preferências",
        tipo: "varias",
        opcoes: [
          { id: "acompanhante_sala", rotulo: "Acompanhante comigo na sala" },
          { id: "explicar", rotulo: "Que me expliquem o motivo antes" },
          { id: "ver_nascer", rotulo: "Baixar o pano para ver o bebê nascer" },
          { id: "pele_a_pele_cc", rotulo: "Contato pele a pele ainda na sala, se o bebê estiver bem" },
          { id: "mamar_cc", rotulo: "Amamentar o quanto antes" },
        ],
      },
    ],
  },
  {
    id: "outros",
    titulo: "Mais alguma coisa?",
    perguntas: [
      {
        id: "observacoes",
        titulo: "Observações",
        tipo: "texto",
        max: 600,
        ajuda: "Medos, necessidades especiais, religião, o que for importante para a equipe saber.",
      },
    ],
  },
];

// Texto fixo no fim do documento impresso.
export const DECLARACAO_PLANO =
  "Este plano expressa minhas preferências para o parto. Sei que, se for necessário para a minha segurança ou a do bebê, a equipe pode precisar mudar a conduta. Nesse caso, peço que me expliquem e me consultem sempre que possível.";
