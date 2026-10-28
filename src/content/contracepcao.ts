// Guia de métodos contraceptivos. Fontes: Ministério da Saúde (páginas de
// contracepção, DIU de cobre e implante) e OMS, Planejamento Familiar: Manual
// Global para Profissionais e Serviços de Saúde (2022), de onde vêm os números
// de eficácia. Primeira versão: precisa de revisão de profissional de saúde.

export type Metodo = {
  id: string;
  nome: string;
  comoFunciona: string;
  // Gestações a cada 100 mulheres no primeiro ano de uso (null = sem dados).
  usoCorreto: number | null;
  usoComum: number | null;
  hormonal: boolean;
  duracao?: string;
  // Oferecido de graça no SUS (atenção primária ou serviço especializado).
  sus: boolean;
  // Pode ser usado durante a amamentação.
  amamentacao: "sim" | "depois de 6 semanas" | "depois de 6 meses" | "não se aplica";
  protegeIst?: boolean;
};

export const METODOS: Metodo[] = [
  { id: "implante", nome: "Implante no braço", comoFunciona: "Bastão de 3 cm colocado sob a pele do braço, com anestesia local. Libera hormônio que impede a ovulação.", usoCorreto: 0.1, usoComum: 0.1, hormonal: true, duracao: "até 3 anos", sus: true, amamentacao: "sim" },
  { id: "vasectomia", nome: "Vasectomia", comoFunciona: "Cirurgia simples no homem: os espermatozoides deixam de sair no sêmen.", usoCorreto: 0.1, usoComum: 0.15, hormonal: false, duracao: "definitivo", sus: true, amamentacao: "não se aplica" },
  { id: "laqueadura", nome: "Laqueadura", comoFunciona: "Cirurgia nas trompas: o óvulo não encontra o espermatozoide.", usoCorreto: 0.5, usoComum: 0.5, hormonal: false, duracao: "definitivo", sus: true, amamentacao: "sim" },
  { id: "diu-hormonal", nome: "DIU hormonal", comoFunciona: "Dispositivo colocado no útero que libera hormônio e engrossa o muco do colo do útero, bloqueando os espermatozoides.", usoCorreto: 0.5, usoComum: 0.7, hormonal: true, duracao: "vários anos", sus: false, amamentacao: "sim" },
  { id: "diu-cobre", nome: "DIU de cobre", comoFunciona: "Dispositivo colocado no útero. O cobre impede os espermatozoides de chegarem ao óvulo, antes da fecundação.", usoCorreto: 0.6, usoComum: 0.8, hormonal: false, duracao: "até 10 anos", sus: true, amamentacao: "sim" },
  { id: "amenorreia", nome: "Amamentação exclusiva (LAM)", comoFunciona: "Amamentar só no peito, dia e noite, sem a menstruação ter voltado, impede a ovulação. Vale só até 6 meses depois do parto.", usoCorreto: 0.9, usoComum: 2, hormonal: false, duracao: "até 6 meses após o parto", sus: true, amamentacao: "sim" },
  { id: "injetavel-mensal", nome: "Injeção mensal", comoFunciona: "Injeção com dois hormônios, uma vez por mês, que impede a ovulação.", usoCorreto: 0.05, usoComum: 3, hormonal: true, duracao: "1 mês por dose", sus: true, amamentacao: "depois de 6 meses" },
  { id: "injetavel-trimestral", nome: "Injeção trimestral", comoFunciona: "Injeção só de progestágeno, a cada 3 meses. Impede a ovulação e engrossa o muco do colo do útero.", usoCorreto: 0.2, usoComum: 4, hormonal: true, duracao: "3 meses por dose", sus: true, amamentacao: "depois de 6 semanas" },
  { id: "pilula-combinada", nome: "Pílula combinada", comoFunciona: "Comprimido diário com dois hormônios que impede a ovulação.", usoCorreto: 0.3, usoComum: 7, hormonal: true, sus: true, amamentacao: "depois de 6 meses" },
  { id: "minipilula", nome: "Minipílula", comoFunciona: "Comprimido diário só de progestágeno. Impede a ovulação e engrossa o muco do colo do útero.", usoCorreto: 0.3, usoComum: 7, hormonal: true, sus: true, amamentacao: "depois de 6 semanas" },
  { id: "camisinha", nome: "Camisinha externa", comoFunciona: "Barreira no pênis que impede o encontro do espermatozoide com o óvulo.", usoCorreto: 2, usoComum: 13, hormonal: false, sus: true, amamentacao: "sim", protegeIst: true },
  { id: "tabelinha", nome: "Tabelinha", comoFunciona: "Evitar relações, ou usar camisinha, nos dias férteis do ciclo.", usoCorreto: null, usoComum: 15, hormonal: false, sus: false, amamentacao: "sim" },
  { id: "coito-interrompido", nome: "Coito interrompido", comoFunciona: "Retirar o pênis antes de ejacular.", usoCorreto: 4, usoComum: 20, hormonal: false, sus: false, amamentacao: "sim" },
  { id: "camisinha-interna", nome: "Camisinha interna", comoFunciona: "Barreira colocada na vagina que impede o encontro do espermatozoide com o óvulo.", usoCorreto: 5, usoComum: 21, hormonal: false, sus: true, amamentacao: "sim", protegeIst: true },
];

// Sem nenhum método, 85 em cada 100 mulheres engravidam em um ano.
export const SEM_METODO = 85;

// Faixas de eficácia pelo uso comum (como as pessoas usam no dia a dia), no estilo da OMS.
export type Faixa = "muito-eficaz" | "eficaz" | "menos-eficaz";

export const FAIXAS: Record<Faixa, { titulo: string; descricao: string }> = {
  "muito-eficaz": { titulo: "Muito eficazes", descricao: "Menos de 1 gravidez em cada 100 mulheres por ano. Depois de colocados, não dependem de você lembrar." },
  eficaz: { titulo: "Eficazes", descricao: "De 1 a 9 gestações em cada 100 mulheres por ano. Dependem de usar sempre no dia ou no prazo certo." },
  "menos-eficaz": { titulo: "Menos eficazes", descricao: "10 ou mais gestações em cada 100 mulheres por ano. A camisinha é a única que também protege contra infecções." },
};

export function faixaDoMetodo(m: Metodo): Faixa {
  const valor = m.usoComum ?? m.usoCorreto ?? SEM_METODO;
  if (valor < 1) return "muito-eficaz";
  if (valor < 10) return "eficaz";
  return "menos-eficaz";
}

// Métodos de cada faixa, do mais ao menos eficaz no uso comum.
export function metodosPorFaixa(): { faixa: Faixa; metodos: Metodo[] }[] {
  const ordem: Faixa[] = ["muito-eficaz", "eficaz", "menos-eficaz"];
  return ordem.map((faixa) => ({
    faixa,
    metodos: METODOS.filter((m) => faixaDoMetodo(m) === faixa).sort((a, b) => (a.usoComum ?? SEM_METODO) - (b.usoComum ?? SEM_METODO)),
  }));
}

export function formatarTaxa(valor: number | null) {
  return valor === null ? "sem dados" : String(valor).replace(".", ",");
}

export const TEXTOS_CONTRACEPCAO = {
  intro:
    "Decidir se e quando ter filhos é um direito seu. O SUS oferece de graça vários métodos e uma consulta de planejamento reprodutivo, para você conhecer todos e escolher com informação, sem precisar da autorização de ninguém.",
  duplaProtecao:
    "A forma mais segura de evitar uma gravidez não planejada é a dupla proteção: um método contraceptivo junto com a camisinha, que é a única que também protege contra infecções sexualmente transmissíveis.",
  falhas: "Todo método, até os definitivos, pode falhar. Converse com a equipe de saúde para escolher o melhor para o seu corpo, sua saúde e sua rotina.",
  diuCobre: {
    resumo: "Mais de 99% de eficácia, sem hormônio, por até 10 anos. Pode ser colocado em quem nunca teve filhos, inclusive adolescentes, e retirado quando você quiser: a fertilidade volta logo.",
    vantagens: [
      "Não depende de você lembrar de nada",
      "Remédios não diminuem a eficácia",
      "Não é abortivo e não causa infertilidade",
      "Pode ser colocado logo após o parto (até 48 horas) ou depois de um aborto",
      "Também serve como contracepção de emergência, até 5 dias depois da relação",
    ],
    desvantagens: [
      "A menstruação pode ficar mais intensa e com mais cólica, principalmente nos 3 primeiros meses",
      "Pode sair do lugar, o que é mais comum no primeiro ano",
    ],
    quemNaoPode:
      "Não é indicado na gravidez, entre 48 horas e 1 mês depois do parto, com infecção no útero ou no colo ainda sem tratamento, sangramento sem causa conhecida, alguns cânceres ginecológicos ou alergia ao cobre. A equipe avalia cada caso.",
  },
  implante: {
    resumo: "O método mais eficaz que existe. Um bastão do tamanho de um palito de fósforo, colocado no braço com anestesia local, que protege por até 3 anos e começa a funcionar em poucos dias.",
    pontos: [
      "No SUS, para meninas e mulheres de 14 a 49 anos",
      "Boa opção para quem não pode usar estrogênio e para quem amamenta",
      "A menstruação pode ficar irregular, diminuir ou parar",
      "Fácil de colocar e de retirar",
    ],
  },
  cirurgia: [
    "Laqueadura (mulher) e vasectomia (homem) são definitivas e oferecidas no SUS.",
    "Podem fazer quem tem mais de 21 anos ou pelo menos 2 filhos vivos (Lei 14.443/2022).",
    "Não é preciso autorização do cônjuge ou parceiro.",
    "É preciso assinar o pedido e esperar pelo menos 60 dias até a cirurgia, um tempo para ter certeza.",
    "Para fazer a laqueadura no parto, o pedido precisa ser assinado 60 dias antes da data provável do parto.",
  ],
  emergencia: [
    "A pílula do dia seguinte evita ou atrasa a ovulação. Quanto antes tomar depois da relação desprotegida, melhor. Ela está disponível no SUS.",
    "O DIU de cobre colocado até 5 dias depois da relação também funciona como contracepção de emergência.",
    "Não é um método para usar sempre: depois, escolha um método regular com a equipe.",
  ],
  fonte: "Ministério da Saúde e OMS, Manual de Planejamento Familiar (2022)",
} as const;
