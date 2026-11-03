import narracao from "../../roteiros/amamentacao-primeiros-dias.narracao.json";
import roteiro from "../../roteiros/amamentacao-primeiros-dias.json";
import { Abertura, Fim, Grade, Lista, Numero } from "../modelos";
import { criarVideo } from "../motor";
import { COR } from "../tema";

export const amamentacao = criarVideo({
  slug: "amamentacao-primeiros-dias",
  tema: "Pós-parto",
  roteiro,
  narracao,
  alertas: ["alerta"],
  cenas: {
    gancho: ({ dados }) => (
      <Abertura dados={dados} titulo="Amamentar é aprendizado" destaques={["aprendizado"]} ilustracao="bebe" fundo={COR.azul100} orbitas={[{ de: "você", icone: { ilustracao: "coracao" } }, { de: "dificuldades", icone: { ilustracao: "flor" } }]} selo={{ de: "solução", texto: "Quase sempre tem solução", icone: { simbolo: "ok" } }} />
    ),
    quando: ({ dados }) => (
      <Numero
        dados={dados}
        numero="8 a 12"
        de="8"
        legenda="mamadas por dia"
        itens={[
          { de: "mão", rotulo: "Mão na boca", icone: { numero: "1" } },
          { de: "língua", rotulo: "Língua para fora", icone: { numero: "2" } },
          { de: "virar", rotulo: "Virar a cabeça procurando", icone: { numero: "3" } },
        ]}
      />
    ),
    pega: ({ dados }) => (
      <Lista
        dados={dados}
        titulo="Pega certa"
        destaques={["certa"]}
        itens={[
          { de: "aréola", rotulo: "Boa parte da aréola, não só o bico", icone: { simbolo: "ok" }, tom: "menta" },
          { de: "esvaziar", rotulo: "Esvazie uma mama antes da outra", icone: { numero: "1º" } },
          { de: "fim", rotulo: "O leite do fim sustenta mais", icone: { simbolo: "gotinha" }, tom: "azul" },
        ]}
      />
    ),
    cuidados: ({ dados }) => (
      <Grade
        dados={dados}
        titulo="Cuidados"
        destaques={["Cuidados"]}
        itens={[
          { de: "leite", rotulo: "O próprio leite no mamilo", icone: { simbolo: "gotinha" }, tom: "menta" },
          { de: "chupeta", rotulo: "Evite chupeta", icone: { simbolo: "evitar" }, tom: "pessego" },
          { de: "mamadeira", rotulo: "Evite mamadeira", icone: { simbolo: "evitar" }, tom: "pessego" },
          { de: "protetor", rotulo: "Evite protetor de mamilo", icone: { simbolo: "evitar" }, tom: "pessego" },
        ]}
      />
    ),
    sinal: ({ dados }) => (
      <Abertura dados={dados} titulo="Fralda com bastante xixi" destaques={["xixi"]} ilustracao="bebe" fundo={COR.menta} selo={{ de: "mamando", texto: "Está mamando bem!", icone: { simbolo: "ok" } }} />
    ),
    alerta: ({ dados }) => (
      <Lista
        dados={dados}
        alerta
        titulo="Fique atenta"
        itens={[
          { de: "mama", rotulo: "Mama vermelha, quente e dolorida, com febre", icone: { simbolo: "termometro" }, tom: "alertaClaro" },
          { de: "mastite", rotulo: "Pode ser mastite: procure a UBS", icone: { ilustracao: "casa" }, tom: "alertaClaro" },
          { de: "pare", rotulo: "Não pare de amamentar", icone: { simbolo: "ok" }, tom: "menta" },
          { de: "hiv", rotulo: "HIV ou HTLV: não amamente; fórmula de graça", icone: { simbolo: "alerta" }, tom: "lilas" },
        ]}
      />
    ),
    encerramento: ({ dados }) => (
      <Fim dados={dados} frase="Leite materno exclusivo até 6 meses" destaques={["6"]} de="leite" final={{ de: "apoio", texto: "Mais apoio no Ninna" }} fonte={roteiro.fonte} />
    ),
  },
});
