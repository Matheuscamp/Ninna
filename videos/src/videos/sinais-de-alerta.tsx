import narracao from "../../roteiros/sinais-de-alerta.narracao.json";
import roteiro from "../../roteiros/sinais-de-alerta.json";
import { Abertura, Fim, Grade, Lista, Numero } from "../modelos";
import { criarVideo } from "../motor";
import { COR } from "../tema";

export const sinaisDeAlerta = criarVideo({
  slug: "sinais-de-alerta",
  tema: "Gestação",
  roteiro,
  narracao,
  alertas: ["barriga", "pressao", "outros", "emergencia"],
  cenas: {
    gancho: ({ dados }) => (
      <Abertura dados={dados} titulo="Sinais que pedem atenção" destaques={["atenção"]} ilustracao="coracao" fundo={COR.rosa100} batida ondas={["atenção"]} orbitas={[{ de: "reconhecer", icone: { ilustracao: "lupa" } }, { de: "bebê", icone: { ilustracao: "bebe" } }]} />
    ),
    barriga: ({ dados }) => (
      <Lista
        dados={dados}
        alerta
        titulo="Procure atendimento se tiver"
        itens={[
          { de: "sangramento", rotulo: "Sangramento pela vagina", icone: { simbolo: "alerta" }, tom: "alertaClaro" },
          { de: "perda", rotulo: "Perda de líquido", icone: { simbolo: "gotinha" }, tom: "alertaClaro" },
          { de: "dor", rotulo: "Dor forte na barriga que não passa", icone: { simbolo: "alerta" }, tom: "alertaClaro" },
        ]}
      />
    ),
    pressao: ({ dados }) => (
      <Lista
        dados={dados}
        titulo="Pode ser pressão alta"
        destaques={["pressão", "alta"]}
        itens={[
          { de: "cabeça", rotulo: "Dor de cabeça forte", icone: { simbolo: "cabeca" } },
          { de: "visão", rotulo: "Visão embaçada ou pontos de luz", icone: { simbolo: "olho" } },
          { de: "inchaço", rotulo: "Inchaço repentino no rosto, mãos ou pernas", icone: { simbolo: "pressao" } },
          { de: "espere", rotulo: "Não espere passar", icone: { simbolo: "alerta" }, tom: "alerta" },
        ]}
      />
    ),
    outros: ({ dados }) => (
      <Grade
        dados={dados}
        titulo="Também são motivo"
        destaques={["motivo"]}
        itens={[
          { de: "37,8", rotulo: "Febre de 37,8 °C ou mais", icone: { simbolo: "termometro" }, tom: "alertaClaro" },
          { de: "contrações", rotulo: "Contrações regulares antes de 37 semanas", icone: { simbolo: "relogio" }, tom: "alertaClaro" },
          { de: "mexendo", rotulo: "Bebê mexendo menos que o normal", icone: { ilustracao: "bebe" }, tom: "alertaClaro" },
        ]}
      />
    ),
    emergencia: ({ dados }) => (
      <Numero
        dados={dados}
        titulo="Emergência"
        numero="192"
        de="192"
        legenda="Ligue para o SAMU"
        tom="alerta"
        itens={[{ de: "falta", rotulo: "Falta de ar, dor forte no peito, desmaio ou convulsão", icone: { simbolo: "telefone" }, tom: "alertaClaro" }]}
      />
    ),
    encerramento: ({ dados }) => (
      <Fim dados={dados} frase="A lista completa está no Ninna" destaques={["Ninna"]} de="lista" final={{ de: "dúvida", texto: "Na dúvida, procure atendimento" }} fonte={roteiro.fonte} />
    ),
  },
});
