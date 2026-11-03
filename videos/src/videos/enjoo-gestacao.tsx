import narracao from "../../roteiros/enjoo-gestacao.narracao.json";
import roteiro from "../../roteiros/enjoo-gestacao.json";
import { Abertura, Fim, Grade, Lista, Numero } from "../modelos";
import { criarVideo } from "../motor";
import { COR } from "../tema";

export const enjooGestacao = criarVideo({
  slug: "enjoo-gestacao",
  tema: "Gestação",
  roteiro,
  narracao,
  alertas: ["alerta"],
  cenas: {
    gancho: ({ dados }) => (
      <Abertura dados={dados} titulo="Enjoo na gravidez?" destaques={["Enjoo"]} ilustracao="folha" fundo={COR.menta} orbitas={[{ de: "sozinha", icone: { ilustracao: "coracao" } }]} selo={{ de: "segundo", texto: "Costuma melhorar no 2º trimestre", icone: { simbolo: "ok" } }} />
    ),
    refeicoes: ({ dados }) => (
      <Numero dados={dados} numero="5 a 6" de="5" legenda="refeições pequenas por dia" itens={[{ de: "estômago", rotulo: "Nem vazio, nem cheio demais", icone: { ilustracao: "maca" }, tom: "pessego" }]} />
    ),
    manha: ({ dados }) => (
      <Lista
        dados={dados}
        titulo="Comece o dia com algo seco"
        destaques={["seco"]}
        itens={[
          { de: "biscoito", rotulo: "Biscoito de água e sal ou torrada", icone: { simbolo: "ok" }, tom: "menta" },
          { de: "frituras", rotulo: "Evite frituras e comida gordurosa", icone: { simbolo: "evitar" }, tom: "pessego" },
          { de: "cheiros", rotulo: "Evite cheiros fortes", icone: { simbolo: "evitar" }, tom: "pessego" },
        ]}
      />
    ),
    liquidos: ({ dados }) => (
      <Grade
        dados={dados}
        titulo="E os líquidos?"
        destaques={["líquidos?"]}
        itens={[
          { de: "entre", rotulo: "Entre as refeições", icone: { simbolo: "ok" }, tom: "menta" },
          { de: "geladas", rotulo: "Gelados caem melhor", icone: { simbolo: "copo" }, tom: "azul" },
          { de: "gás", rotulo: "Evite gás e cafeína", icone: { simbolo: "evitar" }, tom: "pessego" },
          { de: "deite", rotulo: "Não deite logo após comer", icone: { ilustracao: "lua" }, tom: "baunilha" },
        ]}
      />
    ),
    alerta: ({ dados }) => (
      <Lista
        dados={dados}
        alerta
        titulo="Procure atendimento se"
        itens={[
          { de: "vômitos", rotulo: "Os vômitos não deixam comer nem beber", tom: "alertaClaro", icone: { simbolo: "alerta" } },
          { de: "urina", rotulo: "A urina diminuir", tom: "alertaClaro", icone: { simbolo: "gotinha" } },
          { de: "peso", rotulo: "Você perder peso", tom: "alertaClaro", icone: { simbolo: "balanca" } },
          { de: "hiperêmese", rotulo: "Pode ser hiperêmese: precisa de tratamento", tom: "alerta" },
        ]}
      />
    ),
    encerramento: ({ dados }) => <Fim dados={dados} frase="Mais dicas para cada fase no Ninna" destaques={["Ninna"]} de="dicas" fonte={roteiro.fonte} />,
  },
});
