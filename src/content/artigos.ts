import type { Perfil } from "@/lib/triagem";

// Artigos por perfil. Os textos são resumos iniciais; a versão final será
// escrita e revisada por profissional de saúde e servida pelo CMS.
// Os marcados com `fonte` foram reescritos a partir da Caderneta Brasileira da Gestante.
export type Artigo = {
  slug: string;
  perfil: Perfil;
  titulo: string;
  resumo: string;
  // Pontos principais, mostrados em lista abaixo do resumo.
  pontos?: readonly string[];
  fonte?: string;
  premium: boolean;
};

const CADERNETA = "Caderneta Brasileira da Gestante, Ministério da Saúde, 2026";

export const ARTIGOS: Artigo[] = [
  {
    slug: "primeira-consulta-pre-natal", perfil: "gestante", premium: false, fonte: CADERNETA,
    titulo: "Primeira consulta de pré-natal: o que esperar",
    resumo: "Comece o pré-natal o quanto antes, de preferência até a 12ª semana. Ele é feito de graça na UBS, alternando consultas com médica e enfermeira, e não tem alta: segue até depois do parto.",
    pontos: [
      "São no mínimo 7 consultas: mensais até 28 semanas, a cada 15 dias até 36 semanas e semanais depois disso.",
      "Em toda consulta a equipe mede pressão e peso, acompanha o crescimento do bebê, confere as vacinas e pede ou explica exames.",
      "Pergunte qual será sua maternidade de referência e converse sobre o plano de parto ao longo do pré-natal.",
      "Faça também ao menos uma consulta com o dentista. Ela faz parte do pré-natal.",
      "Leve documento, cartão do SUS ou do convênio, a caderneta da gestante e uma lista de dúvidas.",
    ],
  },
  {
    slug: "exames-pre-natal", perfil: "gestante", premium: true, fonte: CADERNETA,
    titulo: "Exames do pré-natal explicados",
    resumo: "Cada trimestre tem exames próprios. Você tem direito de entender para que serve cada um e de receber o resultado a tempo. O guia da semana mostra os da sua fase e como se preparar.",
    pontos: [
      "1º trimestre: hemograma, tipo de sangue e fator Rh, eletroforese de hemoglobina, glicemia, testes de HIV, sífilis, hepatites B e C, toxoplasmose e HTLV, urina e urocultura e o primeiro ultrassom (idealmente entre 7 e 12 semanas).",
      "2º trimestre: teste de tolerância à glicose entre 24 e 28 semanas e Coombs para quem é Rh negativo.",
      "3º trimestre: repetição de hemograma, glicemia, testes de HIV e sífilis, toxoplasmose (se você não tiver imunidade) e urina.",
      "No parto: testes rápidos de HIV e sífilis, e de hepatites se não tiverem sido feitos antes.",
      "Outros exames, como tireoide, Papanicolau ou exame de fezes, são pedidos conforme a sua situação.",
    ],
  },
  {
    slug: "vacinas-gestacao", perfil: "gestante", premium: false, fonte: CADERNETA,
    titulo: "Vacinas na gestação",
    resumo: "Os anticorpos das vacinas tomadas na gravidez passam para o bebê pela placenta e pelo leite e o protegem nos primeiros meses. Todas estas são de graça no SUS.",
    pontos: [
      "dTpa (difteria, tétano e coqueluche): a partir da 20ª semana, em toda gestação, mesmo que você já tenha tomado antes.",
      "VSR (vírus sincicial respiratório): a partir da 28ª semana. Protege o bebê da bronquiolite, principal causa de internação de bebês pequenos.",
      "Gripe: uma dose por temporada, em qualquer fase da gestação.",
      "Hepatite B: se as 3 doses não estiverem completas, a equipe inicia ou completa.",
      "Covid-19: uma dose por gestação.",
      "Se alguma vacina não puder ser aplicada na gestação, ela é oferecida depois do parto.",
    ],
  },
  {
    slug: "direitos-gestante-sus", perfil: "gestante", premium: false, fonte: CADERNETA,
    titulo: "Seus direitos na gestação e no parto",
    resumo: "Você tem direito a um cuidado respeitoso, seguro e sem discriminação no pré-natal, no parto e no pós-parto, com participação nas decisões sobre o seu corpo.",
    pontos: [
      "Acompanhante de sua escolha nas consultas, no trabalho de parto, no parto (normal ou cesárea) e no pós-parto (Lei 11.108/2005).",
      "Doula, se você quiser, em maternidades públicas e privadas, sem substituir o acompanhante (Lei 15.381/2026).",
      "Conhecer antes a maternidade onde vai ter o bebê e ser informada sobre qualquer procedimento.",
      "Usar o nome de sua preferência, saber o nome de quem te atende e ter acesso ao seu prontuário.",
      "Atendimento sem racismo: queixas e dor não podem ser diminuídas por causa da sua cor.",
      "Prioridade em filas, caixas e assentos de transporte público.",
    ],
  },
  {
    slug: "direitos-gestante-trabalho", perfil: "gestante", premium: false, fonte: CADERNETA,
    titulo: "Direitos da gestante no trabalho e nos estudos",
    resumo: "A lei protege a sua saúde e o seu emprego durante a gestação e depois do parto. Dúvidas podem ser tiradas no Alô Trabalho, pelo 158.",
    pontos: [
      "Estabilidade: você não pode ser demitida sem justa causa desde a confirmação da gravidez até 5 meses após o parto.",
      "Dispensa do trabalho para consultas e exames do pré-natal, e mudança de função sem perder salário quando houver indicação médica.",
      "Licença-maternidade de no mínimo 120 dias, que pode chegar a 180 em empresas do programa Empresa Cidadã.",
      "Se você ou o bebê ficarem internados mais de 14 dias, a licença é prorrogada.",
      "Até o bebê fazer 6 meses, você tem direito a duas pausas de meia hora por dia para amamentar.",
      "Estudante pode fazer as atividades em casa a partir do 8º mês, quando necessário, sem prejuízo nas avaliações.",
    ],
  },
  {
    slug: "pressao-pre-eclampsia", perfil: "gestante", premium: false, fonte: CADERNETA,
    titulo: "Pressão alta e pré-eclâmpsia",
    resumo: "A pressão alta pode surgir na gestação sem nenhum sintoma no começo. Por isso ela é medida em toda consulta, mesmo quando você se sente bem.",
    pontos: [
      "Normal: abaixo de 12 por 8. Alta: 14 por 9 ou mais, em duas medidas. Muito alta (16 por 11 ou mais): procure atendimento na hora.",
      "Pré-eclâmpsia é a pressão alta da gestação junto com outros sinais, como inchaço repentino, dor de cabeça forte e proteína na urina. Pode aparecer em quem nunca teve pressão alta.",
      "Procure atendimento já se tiver dor de cabeça forte ou diferente, visão embaçada ou com pontos de luz, inchaço repentino ou dor forte abaixo das costelas.",
      "Eclâmpsia, com convulsões, é uma emergência: ligue 192.",
    ],
  },
  {
    slug: "infeccao-urinaria", perfil: "gestante", premium: false, fonte: CADERNETA,
    titulo: "Infecção urinária na gestação",
    resumo: "É comum na gravidez e muitas vezes não dá sintomas no início. Sem tratamento, pode levar a parto prematuro e a infecção nos rins, por isso o exame de urina faz parte do pré-natal.",
    pontos: [
      "Para prevenir: beba bastante água, não segure o xixi, urine depois das relações e cuide da higiene íntima.",
      "Procure a UBS se tiver ardência ou dor ao urinar, vontade de urinar toda hora, dor no pé da barriga ou nas costas, urina turva, com cheiro forte ou sangue, ou febre.",
    ],
  },
  {
    slug: "diabetes-gestacional", perfil: "gestante", premium: true, fonte: CADERNETA,
    titulo: "Diabetes gestacional",
    resumo: "É o aumento do açúcar no sangue que pode surgir na gravidez. Quase nunca dá sintomas e é descoberto pelo teste de tolerância à glicose, entre 24 e 28 semanas.",
    pontos: [
      "Sem acompanhamento, pode fazer o bebê crescer além do esperado, aumentar a pressão e causar queda de açúcar no bebê ao nascer.",
      "Com acompanhamento, a gestação costuma seguir bem: alimentação orientada, atividade física, controle da glicose e, se preciso, remédio.",
      "Na maioria dos casos some depois do parto, mas continue fazendo o acompanhamento.",
    ],
  },
  {
    slug: "alimentacao-gestacao", perfil: "gestante", premium: true, fonte: CADERNETA,
    titulo: "Alimentação e suplementos na gestação",
    resumo: "Comer bem na gravidez não é comer perfeito nem fazer dieta difícil: é escolher melhor dentro da sua realidade, com comida de verdade. Suplementos como ácido fólico e ferro só com orientação do pré-natal.",
    pontos: [
      "Prefira arroz, feijão, mandioca, milho, legumes, verduras, frutas inteiras, ovos, carnes e leite. Comida feita em casa, sempre que der.",
      "Evite ultraprocessados: refrigerante, suco de caixinha, salgadinho, biscoito recheado, macarrão instantâneo e embutidos.",
      "Beba água filtrada ao longo do dia, lave bem frutas e verduras e evite alimentos crus ou malpassados.",
      "Com enjoo, faça refeições pequenas e frequentes e prefira alimentos leves ou frios. Se o enjoo for forte ou não passar, fale com a equipe.",
      "Se estiver faltando comida em casa, avise a equipe e procure o Cras: alimentação é um direito.",
    ],
  },
  {
    slug: "ganho-de-peso", perfil: "gestante", premium: true, fonte: CADERNETA,
    titulo: "Ganho de peso na gestação",
    resumo: "O ganho de peso adequado reduz riscos como pressão alta, diabetes e complicações no parto. A faixa ideal depende do seu peso antes de engravidar (IMC).",
    pontos: [
      "Abaixo do peso (IMC menor que 18,5): ganho de 9,7 a 12,2 kg até 40 semanas.",
      "Peso adequado (IMC de 18,5 a 24,9): de 8 a 12 kg.",
      "Sobrepeso (IMC de 25 a 29,9): de 7 a 9 kg.",
      "Obesidade (IMC 30 ou mais): de 5 a 7,2 kg.",
      "A equipe pesa você em toda consulta e marca no gráfico da caderneta. Gestação múltipla e na adolescência têm orientação própria.",
    ],
  },
  {
    slug: "atividade-fisica-gestacao", perfil: "gestante", premium: true, fonte: CADERNETA,
    titulo: "Atividade física na gestação",
    resumo: "Sem contraindicação da equipe, manter-se ativa faz bem para o corpo e para as emoções: ajuda na circulação, na postura, no peso, no sono e na ansiedade.",
    pontos: [
      "De 30 a 60 minutos por dia, em ritmo leve a moderado: se não conseguir conversar enquanto se exercita, diminua.",
      "Caminhada, alongamento, respiração, hidroginástica e natação são boas opções. Fortalecimento, só com orientação.",
      "Evite o sol forte entre 11h e 14h e use calçado confortável.",
      "Pare e procure a equipe se houver sangramento, perda de líquido ou contrações antes da hora.",
      "Pergunte na UBS pelo programa Academia da Saúde e pelas práticas integrativas, como yoga e meditação.",
    ],
  },
  {
    slug: "saude-bucal-gestacao", perfil: "gestante", premium: false, fonte: CADERNETA,
    titulo: "Dentista no pré-natal",
    resumo: "O pré-natal odontológico é um direito no SUS. Os hormônios da gravidez deixam a gengiva mais sensível, e vômitos e refluxo podem desgastar os dentes.",
    pontos: [
      "Limpeza, restauração, extração, radiografia e atendimento de urgência podem ser feitos com segurança na gestação.",
      "Procure a UBS se tiver dor de dente, gengiva sangrando muito, inchaço no rosto ou na boca, ou feridas que não cicatrizam.",
      "Na consulta, a equipe também orienta sobre a saúde da boca do bebê: amamentação ajuda, chupeta e açúcar atrapalham.",
    ],
  },
  {
    slug: "pre-natal-parceiro", perfil: "gestante", premium: false, fonte: CADERNETA,
    titulo: "Pré-natal do parceiro",
    resumo: "A parceria também faz pré-natal: consultas, exames e vacinas. Algumas infecções do parceiro podem afetar você e o bebê, e são investigadas e tratadas nessa hora.",
    pontos: [
      "A parceria pode ir às consultas e aos grupos, aprender sobre parto, amamentação e cuidados com o bebê.",
      "Dividir as tarefas da casa e do cuidado protege a saúde de quem está grávida.",
      "O apoio é ainda mais importante na reta final e no parto.",
    ],
  },
  {
    slug: "sinais-parto-chegando", perfil: "gestante", premium: false, fonte: CADERNETA,
    titulo: "Como saber se o parto está chegando",
    resumo: "A partir de 37 semanas o corpo dá sinais de preparação. Contrações irregulares e a saída do tampão mucoso são comuns e, na maioria das vezes, ainda não são o trabalho de parto ativo.",
    pontos: [
      "Contrações de treinamento: irregulares, parecidas com cólica, curtas e com intervalos longos. Podem durar horas ou dias.",
      "Fase latente: contrações que não somem mais, ainda sem ritmo. Pode ser vivida em casa, com descanso, comida leve, banho morno e massagem.",
      "Fase ativa: contrações fortes e regulares, a cada 2 a 3 minutos. É a hora de ir para a maternidade.",
      "Se a bolsa romper, observe a cor do líquido: verde ou amarelo precisa de avaliação rápida. Na dúvida se rompeu, vá ser avaliada.",
      "Use o contador de contrações do Ninna para acompanhar o ritmo.",
    ],
  },
  {
    slug: "cuidados-no-parto", perfil: "gestante", premium: false, fonte: CADERNETA,
    titulo: "No parto: o que é rotina e o que não deveria ser",
    resumo: "Nem tudo precisa ser feito de rotina. Você tem direito a explicação clara e a participar das decisões, em qualquer tipo de parto.",
    pontos: [
      "Só em situações específicas, com explicação e consentimento: romper a bolsa, soro com ocitocina e episiotomia.",
      "Não devem ser feitos: lavagem intestinal, raspagem dos pelos, empurrar a barriga (manobra de Kristeller) e mandar fazer força fora do seu ritmo.",
      "Movimentar-se ajuda: andar, ficar de cócoras, de quatro apoios, de lado, na bola ou na banqueta. Não existe posição certa.",
      "Toques vaginais só quando necessários. Analgesia ou outras formas de alívio da dor não podem ser negadas sem motivo.",
      "Logo ao nascer, o bebê pode ficar no seu colo, pele a pele, na hora dourada. Se você não puder, o acompanhante pode fazer o contato.",
    ],
  },
  {
    slug: "saude-emocional-gestacao", perfil: "gestante", premium: false, fonte: CADERNETA,
    titulo: "Emoções na gestação",
    resumo: "Na gravidez não é só o corpo que muda. Sentir alegria e medo ao mesmo tempo é comum, e pedir ajuda faz parte do cuidado com você e com o bebê.",
    pontos: [
      "Fale com a equipe se sentir tristeza que não passa, ansiedade ou medo constantes, irritação muito acima do normal ou vontade de se isolar.",
      "Pensamentos de se machucar precisam de ajuda logo: procure a UBS ou ligue para o CVV, 188.",
      "Se você já usava remédio ou fazia acompanhamento de saúde mental, não pare por conta própria: converse com a equipe.",
      "Grupos de gestantes e rodas de conversa da UBS ajudam a dividir o que você está vivendo.",
    ],
  },
  {
    slug: "violencia-onde-buscar-ajuda", perfil: "gestante", premium: false, fonte: CADERNETA,
    titulo: "Violência: onde buscar ajuda",
    resumo: "A violência nunca é culpa de quem sofre. Ela pode ser física, psicológica, sexual, patrimonial ou moral, e também pode acontecer no atendimento de saúde, no pré-natal ou no parto.",
    pontos: [
      "Disque 180: orientação e denúncia, de graça e a qualquer hora.",
      "Você pode procurar a UBS, o Caps, o Cras ou o Creas, o Centro de Referência da Mulher, a Casa da Mulher Brasileira ou a delegacia.",
      "Nos serviços de saúde, você tem direito a acolhimento sem julgamento e atendimento em sigilo.",
      "Em perigo imediato, ligue 190.",
    ],
  },

  { slug: "quando-fazer-teste", perfil: "suspeita", premium: false, titulo: "Quando fazer o teste de farmácia", resumo: "O teste de farmácia é mais confiável a partir do primeiro dia de atraso da menstruação. Use a primeira urina da manhã e siga o tempo de leitura indicado na embalagem." },
  { slug: "teste-gratuito-ubs", perfil: "suspeita", premium: false, titulo: "Teste gratuito na UBS: como funciona", resumo: "As Unidades Básicas de Saúde oferecem teste de gravidez sem custo. Leve um documento e o cartão do SUS. Se der positivo, a própria UBS já pode iniciar o pré-natal." },
  { slug: "sinais-iniciais", perfil: "suspeita", premium: false, titulo: "Sinais iniciais de gravidez", resumo: "Atraso menstrual, enjoo, seios sensíveis e cansaço são comuns no início, mas também aparecem por outros motivos. Só o teste confirma a gravidez." },
  {
    slug: "deu-positivo", perfil: "suspeita", premium: false, fonte: CADERNETA,
    titulo: "Deu positivo: próximos passos",
    resumo: "Descobrir uma gravidez pode trazer alegria, surpresa, medo ou tudo isso junto. Não existe jeito certo de se sentir. Agende a primeira consulta de pré-natal, de preferência antes da 12ª semana, e refaça a triagem do Ninna como gestante.",
    pontos: [
      "O pré-natal é de graça na UBS mais perto de você, que também faz o teste rápido e os primeiros exames.",
      "Se a gravidez não foi planejada, converse com a equipe sobre como está se sentindo. Seu tempo será respeitado.",
    ],
  },

  { slug: "acido-folico", perfil: "tentante", premium: false, titulo: "Ácido fólico antes de engravidar", resumo: "O ácido fólico ajuda a prevenir malformações no início da gestação, quando muitas mulheres ainda nem sabem que estão grávidas. Converse com seu médico sobre começar antes de engravidar." },
  { slug: "consulta-pre-concepcional", perfil: "tentante", premium: false, titulo: "Consulta pré-concepcional", resumo: "Uma consulta antes de engravidar revisa vacinas, exames, remédios em uso e condições de saúde, para que a gestação comece da melhor forma possível." },
  { slug: "periodo-fertil", perfil: "tentante", premium: true, titulo: "Entendendo seu período fértil", resumo: "O período fértil acontece em torno da ovulação, que em ciclos regulares costuma ocorrer cerca de 14 dias antes da próxima menstruação." },
  { slug: "habitos-engravidar", perfil: "tentante", premium: true, titulo: "Hábitos que ajudam a engravidar", resumo: "Sono, alimentação equilibrada, atividade física e evitar álcool e cigarro fazem diferença para você e para o parceiro." },

  {
    slug: "recuperacao-pos-parto", perfil: "puerpera", premium: false, fonte: CADERNETA,
    titulo: "Recuperação no pós-parto",
    resumo: "O corpo leva cerca de 45 dias para se recuperar, e a adaptação emocional pode levar bem mais. Muitas mudanças são esperadas, outras pedem atenção.",
    pontos: [
      "Sangramento (lóquios) que vai diminuindo e pode durar até cerca de 42 dias, e cólicas leves enquanto o útero volta ao tamanho.",
      "Mamas cheias, quentes e doloridas quando o leite desce, e dor nos pontos ou na cicatriz, que melhora aos poucos.",
      "Cansaço, sono bagunçado, medo de evacuar e ardência ao urinar nos primeiros dias são comuns.",
      "Faça pelo menos duas consultas: uma na primeira semana depois da alta e outra perto de 30 dias após o parto.",
      "Descanse, coma bem, beba água e aceite ajuda.",
    ],
  },
  {
    slug: "amamentacao-primeiros-dias", perfil: "puerpera", premium: false, fonte: CADERNETA,
    titulo: "Amamentação: primeiros dias",
    resumo: "O leite materno é recomendado de forma exclusiva até os 6 meses e, se possível, até os 2 anos ou mais. Dificuldades no começo são comuns e quase sempre têm solução.",
    pontos: [
      "Dor, rachaduras, mamas muito cheias e insegurança sobre a quantidade de leite costumam melhorar com ajuste na pega e na posição.",
      "Monte um cantinho para amamentar com água, lanche, almofada e o celular por perto.",
      "Procure a UBS, a maternidade ou um Banco de Leite Humano se tiver dor forte, ferida, mama vermelha ou endurecida, ou febre.",
      "Nem todas conseguem ou desejam amamentar. Pedir ajuda não é fracasso.",
    ],
  },
  {
    slug: "cuidados-recem-nascido", perfil: "puerpera", premium: false, fonte: CADERNETA,
    titulo: "Primeiros cuidados com o bebê",
    resumo: "Depois da alta, o cuidado com o bebê continua na UBS. A primeira consulta deve acontecer o quanto antes, ainda na primeira semana.",
    pontos: [
      "Na maternidade, o bebê recebe vitamina K, colírio, vacinas BCG e hepatite B e faz os testes do pezinho, coraçãozinho, olhinho e orelhinha.",
      "Umbigo: mantenha limpo e seco e lave com água e sabão. Procure a UBS se tiver mau cheiro, secreção ou vermelhidão.",
      "Procure atendimento se o bebê tiver dificuldade para mamar, respiração rápida ou com esforço, febre, pele muito amarelada, sono demais ou choro que não passa.",
      "Registre o nascimento e use a Caderneta da Criança em todas as consultas.",
    ],
  },
  {
    slug: "contracepcao-pos-parto", perfil: "puerpera", premium: false, fonte: CADERNETA,
    titulo: "Contracepção depois do parto",
    resumo: "Você pode começar um método para evitar nova gravidez ainda na maternidade, com opções seguras para quem amamenta. Todas abaixo são oferecidas no SUS.",
    pontos: [
      "DIU de cobre: até 48 horas após o parto ou de 4 a 6 semanas depois. Dura até 10 anos.",
      "Implante: logo após o parto. Dura 3 anos e é oferecido para quem tem de 14 a 49 anos.",
      "Minipílula ou injeção trimestral: a partir de 4 a 6 semanas, sem atrapalhar a amamentação.",
      "Pílula combinada atrapalha o leite: só depois de 6 meses para quem amamenta.",
      "Laqueadura no parto: o pedido precisa ser assinado pelo menos 60 dias antes da data provável do parto.",
      "Só a camisinha protege contra infecções sexualmente transmissíveis.",
    ],
  },
  {
    slug: "tristeza-depressao-pos-parto", perfil: "puerpera", premium: false, fonte: CADERNETA,
    titulo: "Tristeza pós-parto ou depressão?",
    resumo: "Choro fácil e sensibilidade nos primeiros dias são comuns (baby blues) e costumam passar sozinhos. Tristeza intensa e que não passa pode ser depressão pós-parto, que tem tratamento.",
    pontos: [
      "O vínculo com o bebê pode vir aos poucos, com a convivência. Sentir cansaço ou saudade da vida de antes não é fracasso.",
      "Procure a equipe se sentir tristeza que não melhora, ansiedade forte, culpa intensa, dificuldade de cuidar de si ou do bebê, ou vontade de se isolar.",
      "Pensamentos de se machucar ou machucar o bebê precisam de ajuda logo: procure a UBS ou ligue para o CVV, 188.",
    ],
  },
  {
    slug: "plano-pos-parto", perfil: "puerpera", premium: true, fonte: CADERNETA,
    titulo: "Plano de pós-parto: organizando a rotina",
    resumo: "Combinar antes quem ajuda em quê ajuda na recuperação, na amamentação e no humor. Pode ser feito ainda na gestação e revisto depois.",
    pontos: [
      "Visitas: quer receber nos primeiros dias? A partir de quando, e com quais combinados?",
      "Quem pode ajudar com o bebê, e em quais horários? Se não houver apoio fixo, família ampliada, vizinhança e a UBS podem ajudar.",
      "Casa: divida limpeza, refeições e compras e adie o que não for urgente.",
      "Outros filhos: horários de escola e quem leva e busca.",
      "Anote a data de fim da licença-maternidade e quem chamar numa emergência.",
    ],
  },
  { slug: "sono-bebe-mae", perfil: "puerpera", premium: true, titulo: "Sono do bebê e da mãe", resumo: "Recém-nascidos dormem em períodos curtos. Descansar quando o bebê dorme e dividir as tarefas com quem está por perto ajuda a atravessar essa fase." },
  {
    slug: "sexualidade-pos-parto", perfil: "puerpera", premium: true, fonte: CADERNETA,
    titulo: "Sexualidade depois do parto",
    resumo: "Não existe tempo certo para voltar a ter relações: cada pessoa tem seu ritmo. Cansaço, hormônios e mudanças no corpo influenciam o desejo.",
    pontos: [
      "Secura vaginal, desconforto e insegurança com o corpo são comuns. Dor persistente não deve ser normalizada: fale com a equipe.",
      "Carinho e intimidade não se resumem à relação sexual.",
      "Sexo sem consentimento é violência, mesmo dentro de um relacionamento.",
      "Pense na contracepção antes de retomar as relações.",
    ],
  },

  { slug: "luto-gestacional", perfil: "acolhimento", premium: false, titulo: "O luto pela perda gestacional", resumo: "A perda de uma gestação é um luto real, em qualquer semana. Cada pessoa sente de um jeito e no seu tempo. Falar sobre o que aconteceu, com quem você confia, pode ajudar." },
  {
    slug: "direitos-perda-gestacional", perfil: "acolhimento", premium: false, fonte: CADERNETA,
    titulo: "Seus direitos depois de uma perda",
    resumo: "Em uma perda gestacional, óbito fetal ou neonatal, o SUS garante acolhimento sem julgamento e respeito às suas decisões e ao seu tempo (Lei 15.139/2025).",
    pontos: [
      "Ficar, sempre que possível, em um espaço separado das outras gestantes.",
      "Receber explicações claras sobre o que aconteceu e participar das decisões sobre cada etapa.",
      "Despedir-se com o tempo que precisar, guardar lembranças e decidir sobre rituais, se quiser.",
      "Apoio psicológico e acompanhamento na UBS.",
      "No trabalho: 2 semanas de repouso remunerado após a perda. Em caso de bebê nascido sem vida, licença-maternidade completa de 120 dias.",
    ],
  },
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
