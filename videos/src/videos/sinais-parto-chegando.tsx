import narracao from "../../roteiros/sinais-parto-chegando.narracao.json";
import roteiro from "../../roteiros/sinais-parto-chegando.json";
import { Abertura, Contracoes, Fim, Grade, Lista } from "../modelos";
import { criarVideo } from "../motor";
import { COR } from "../tema";

export const sinaisPartoChegando = criarVideo({
  slug: "sinais-parto-chegando",
  tema: "Gestação",
  roteiro,
  narracao,
  cenas: {
    gancho: ({ dados }) => (
      <Abertura dados={dados} titulo="Chegou a hora?" destaques={["hora?"]} ilustracao="calendario" fundo={COR.baunilha} orbitas={[{ de: "parto", icone: { ilustracao: "bebe" } }]} selo={{ de: "37", texto: "A partir de 37 semanas", icone: { ilustracao: "calendario" } }} />
    ),
    treino: ({ dados }) => (
      <Contracoes
        dados={dados}
        tipo="treino"
        titulo="Contrações de treinamento"
        destaques={["treinamento"]}
        itens={[
          { de: "irregulares", rotulo: "Irregulares, parecidas com cólica" },
          { de: "curtas", rotulo: "Curtas, com intervalos longos" },
          { de: "durar", rotulo: "Podem durar horas ou dias", icone: { simbolo: "relogio" } },
        ]}
      />
    ),
    latente: ({ dados }) => (
      <Grade
        dados={dados}
        titulo="Fase latente: dá para ficar em casa"
        destaques={["casa"]}
        itens={[
          { de: "descanse", rotulo: "Descanse", icone: { ilustracao: "lua" } },
          { de: "coma", rotulo: "Coma algo leve", icone: { ilustracao: "maca" } },
          { de: "banho", rotulo: "Banho morno", icone: { simbolo: "gotinha" } },
          { de: "massagem", rotulo: "Massagem", icone: { ilustracao: "coracao" } },
        ]}
      />
    ),
    ativa: ({ dados }) => (
      <Contracoes
        dados={dados}
        tipo="ativa"
        titulo="Fase ativa"
        destaques={["ativa"]}
        itens={[
          { de: "fortes", rotulo: "Fortes e regulares, a cada 2 ou 3 minutos", icone: { simbolo: "relogio" } },
          { de: "maternidade", rotulo: "Hora de ir para a maternidade", icone: { ilustracao: "casa" }, tom: "rosa" },
        ]}
      />
    ),
    bolsa: ({ dados }) => (
      <Lista
        dados={dados}
        titulo="Se a bolsa romper"
        destaques={["bolsa"]}
        itens={[
          { de: "observe", rotulo: "Observe a cor do líquido", icone: { simbolo: "gotinha" } },
          { de: "verde", rotulo: "Verde ou amarelo: avaliação rápida", icone: { simbolo: "alerta" }, tom: "alertaClaro" },
          { de: "dúvida", rotulo: "Na dúvida se rompeu, vá ser avaliada", icone: { ilustracao: "casa" } },
        ]}
      />
    ),
    encerramento: ({ dados }) => (
      <Fim dados={dados} frase="Use o contador de contrações do Ninna" destaques={["contador", "Ninna"]} de="contador" final={{ de: "boa", texto: "Boa hora!" }} fonte={roteiro.fonte} />
    ),
  },
});
