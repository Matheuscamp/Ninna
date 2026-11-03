import narracao from "../../roteiros/deu-positivo.narracao.json";
import roteiro from "../../roteiros/deu-positivo.json";
import { Abertura, Fim, Linha, Lista } from "../modelos";
import { criarVideo } from "../motor";
import { COR } from "../tema";

export const deuPositivo = criarVideo({
  slug: "deu-positivo",
  tema: "Deu positivo",
  roteiro,
  narracao,
  cenas: {
    gancho: ({ dados }) => (
      <Abertura
        dados={dados}
        titulo="Deu positivo! E agora?"
        destaques={["positivo!"]}
        ilustracao="teste"
        fundo={COR.lilas}
        ondas={["positivo"]}
        orbitas={[
          { de: "alegria", icone: { ilustracao: "coracao" } },
          { de: "surpresa", icone: { ilustracao: "flor" } },
          { de: "medo", icone: { ilustracao: "conversa" } },
        ]}
        selo={{ de: "existe", texto: "Não existe jeito certo de se sentir" }}
      />
    ),
    consulta: ({ dados }) => (
      <Linha dados={dados} titulo="Primeiro passo: pré-natal" destaques={["pré-natal"]} faixas={[{ de: "consulta", inicio: 0, fim: 12, rotulo: "" }]} marcos={[{ de: "preferência", semana: 12, rotulo: "até a 12ª semana", ilustracao: "calendario" }]} itens={[{ de: "marcar", rotulo: "Marque a primeira consulta", icone: { ilustracao: "calendario" } }]} />
    ),
    ubs: ({ dados }) => (
      <Lista
        dados={dados}
        titulo="De graça na UBS"
        destaques={["graça"]}
        entrada="pop"
        itens={[
          { de: "graça", rotulo: "Pré-natal", icone: { ilustracao: "casa" }, tom: "azul" },
          { de: "teste", rotulo: "Teste rápido", icone: { ilustracao: "teste" }, tom: "lilas" },
          { de: "exames", rotulo: "Primeiros exames", icone: { ilustracao: "prancheta" }, tom: "menta" },
        ]}
      />
    ),
    sentimento: ({ dados }) => (
      <Abertura dados={dados} titulo="Seu tempo será respeitado" destaques={["respeitado"]} ilustracao="conversa" fundo={COR.baunilha} selo={{ de: "converse", texto: "Converse com a equipe", icone: { ilustracao: "coracao" } }} />
    ),
    encerramento: ({ dados }) => (
      <Fim dados={dados} frase="Refaça a triagem como gestante" destaques={["gestante"]} de="triagem" final={{ de: "gente", texto: "A gente acompanha você" }} fonte={roteiro.fonte} />
    ),
  },
});
