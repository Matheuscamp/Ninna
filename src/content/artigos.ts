import type { Perfil } from "@/lib/triagem";

// Artigos por perfil. Os textos são resumos iniciais; a versão final será
// escrita e revisada por profissional de saúde e servida pelo CMS.
export type Artigo = {
  slug: string;
  perfil: Perfil;
  titulo: string;
  resumo: string;
  premium: boolean;
};

export const ARTIGOS: Artigo[] = [
  { slug: "primeira-consulta-pre-natal", perfil: "gestante", premium: false, titulo: "Primeira consulta de pré-natal: o que esperar", resumo: "Na primeira consulta, o médico ou a enfermeira faz perguntas sobre sua saúde e histórico, mede pressão e peso e pede os exames iniciais. Leve documentos, o cartão do SUS ou do convênio e uma lista de dúvidas." },
  { slug: "exames-pre-natal", perfil: "gestante", premium: true, titulo: "Exames do pré-natal explicados", resumo: "Cada fase da gestação tem exames próprios, do hemograma do início ao exame de estreptococo da reta final. O guia da semana mostra quais são da sua fase e como se preparar para cada um." },
  { slug: "direitos-gestante-trabalho", perfil: "gestante", premium: false, titulo: "Direitos da gestante no trabalho", resumo: "Com carteira assinada, você tem estabilidade desde a confirmação da gravidez até 5 meses após o parto, dispensa para consultas e exames e licença-maternidade de 120 dias." },
  { slug: "alimentacao-gestacao", perfil: "gestante", premium: true, titulo: "Alimentação e suplementos na gestação", resumo: "Uma alimentação variada, com frutas, verduras, proteínas e boa hidratação, é a base. Suplementos como ácido fólico e ferro só devem ser usados com orientação do pré-natal." },

  { slug: "quando-fazer-teste", perfil: "suspeita", premium: false, titulo: "Quando fazer o teste de farmácia", resumo: "O teste de farmácia é mais confiável a partir do primeiro dia de atraso da menstruação. Use a primeira urina da manhã e siga o tempo de leitura indicado na embalagem." },
  { slug: "teste-gratuito-ubs", perfil: "suspeita", premium: false, titulo: "Teste gratuito na UBS: como funciona", resumo: "As Unidades Básicas de Saúde oferecem teste de gravidez sem custo. Leve um documento e o cartão do SUS. Se der positivo, a própria UBS já pode iniciar o pré-natal." },
  { slug: "sinais-iniciais", perfil: "suspeita", premium: false, titulo: "Sinais iniciais de gravidez", resumo: "Atraso menstrual, enjoo, seios sensíveis e cansaço são comuns no início, mas também aparecem por outros motivos. Só o teste confirma a gravidez." },
  { slug: "deu-positivo", perfil: "suspeita", premium: false, titulo: "Deu positivo: próximos passos", resumo: "Agende a primeira consulta de pré-natal, de preferência antes da 12ª semana, e refaça a triagem do Ninna como gestante para receber o acompanhamento semana a semana." },

  { slug: "acido-folico", perfil: "tentante", premium: false, titulo: "Ácido fólico antes de engravidar", resumo: "O ácido fólico ajuda a prevenir malformações no início da gestação, quando muitas mulheres ainda nem sabem que estão grávidas. Converse com seu médico sobre começar antes de engravidar." },
  { slug: "consulta-pre-concepcional", perfil: "tentante", premium: false, titulo: "Consulta pré-concepcional", resumo: "Uma consulta antes de engravidar revisa vacinas, exames, remédios em uso e condições de saúde, para que a gestação comece da melhor forma possível." },
  { slug: "periodo-fertil", perfil: "tentante", premium: true, titulo: "Entendendo seu período fértil", resumo: "O período fértil acontece em torno da ovulação, que em ciclos regulares costuma ocorrer cerca de 14 dias antes da próxima menstruação." },
  { slug: "habitos-engravidar", perfil: "tentante", premium: true, titulo: "Hábitos que ajudam a engravidar", resumo: "Sono, alimentação equilibrada, atividade física e evitar álcool e cigarro fazem diferença para você e para o parceiro." },

  { slug: "recuperacao-pos-parto", perfil: "puerpera", premium: false, titulo: "Recuperação no pós-parto", resumo: "O corpo leva semanas para se recuperar. Sangramento por alguns dias, cólicas e cansaço são esperados. Faça a consulta de pós-parto e procure ajuda se algo fugir do esperado." },
  { slug: "amamentacao-primeiros-dias", perfil: "puerpera", premium: false, titulo: "Amamentação: primeiros dias", resumo: "A pega correta evita dor e rachaduras. Nos primeiros dias o bebê mama com frequência, e isso ajuda o leite a descer. Bancos de leite e UBS oferecem apoio gratuito." },
  { slug: "tristeza-depressao-pos-parto", perfil: "puerpera", premium: false, titulo: "Tristeza pós-parto ou depressão?", resumo: "Choro fácil e oscilação de humor nas primeiras semanas são comuns. Se a tristeza durar mais de duas semanas ou atrapalhar o dia a dia, procure ajuda: depressão pós-parto tem tratamento." },
  { slug: "sono-bebe-mae", perfil: "puerpera", premium: true, titulo: "Sono do bebê e da mãe", resumo: "Recém-nascidos dormem em períodos curtos. Descansar quando o bebê dorme e dividir as tarefas com quem está por perto ajuda a atravessar essa fase." },

  { slug: "luto-gestacional", perfil: "acolhimento", premium: false, titulo: "O luto pela perda gestacional", resumo: "A perda de uma gestação é um luto real, em qualquer semana. Cada pessoa sente de um jeito e no seu tempo. Falar sobre o que aconteceu, com quem você confia, pode ajudar." },
  { slug: "corpo-depois-da-perda", perfil: "acolhimento", premium: false, titulo: "Cuidando do corpo depois da perda", resumo: "Sangramento e cólicas podem continuar por alguns dias. Faça a consulta de retorno e procure atendimento se houver febre, dor forte ou sangramento intenso." },
  { slug: "grupos-de-apoio", perfil: "acolhimento", premium: false, titulo: "Onde buscar apoio", resumo: "Grupos de apoio ao luto gestacional, acompanhamento psicológico e o CVV (188, de graça e 24 horas) estão disponíveis para você." },
  { slug: "tentar-de-novo", perfil: "acolhimento", premium: false, titulo: "Quando tentar de novo, se quiser", resumo: "Não existe prazo certo. A decisão é sua e pode ser conversada com seu médico quando você se sentir pronta." },
];

export function artigosDoPerfil(perfil: Perfil) {
  return ARTIGOS.filter((a) => a.perfil === perfil);
}

export function artigoPorSlug(slug: string) {
  return ARTIGOS.find((a) => a.slug === slug);
}
