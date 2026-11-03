import narracao from "../../roteiros/vacinas-gestacao.narracao.json";
import roteiro from "../../roteiros/vacinas-gestacao.json";
import { Abertura, Fim, Grade, Linha, Lista } from "../modelos";
import { criarVideo } from "../motor";
import { COR } from "../tema";

export const vacinasGestacao = criarVideo({
  slug: "vacinas-gestacao",
  tema: "Gestação",
  roteiro,
  narracao,
  cenas: {
    gancho: ({ dados }) => (
      <Abertura
        dados={dados}
        titulo="Vacina protege vocês dois"
        destaques={["dois"]}
        ilustracao="bebe"
        fundo={COR.azul100}
        ondas={["protegem"]}
        orbitas={[
          { de: "protegem", icone: { simbolo: "escudo" } },
          { de: "leite", icone: { ilustracao: "coracao" } },
        ]}
        selo={{ de: "graça", texto: "De graça no SUS", icone: { simbolo: "seringa" } }}
      />
    ),
    dtpa: ({ dados }) => (
      <Linha
        dados={dados}
        titulo="dTpa"
        destaques={["dTpa"]}
        marcos={[{ de: "20ª", semana: 20, rotulo: "a partir de 20 semanas", ilustracao: "bebe" }]}
        itens={[
          { de: "difteria", rotulo: "Difteria, tétano e coqueluche", icone: { simbolo: "seringa" } },
          { de: "toda", rotulo: "Em toda gestação, mesmo se já tomou", icone: { simbolo: "ok" }, tom: "menta" },
        ]}
      />
    ),
    vsr: ({ dados }) => (
      <Linha dados={dados} titulo="Vacina contra o VSR" destaques={["VSR"]} faixas={[{ de: "28ª", inicio: 28, fim: 36, rotulo: "28 a 36 semanas" }]} itens={[{ de: "bronquiolite", rotulo: "Protege o bebê da bronquiolite", icone: { simbolo: "escudo" }, tom: "azul" }]} />
    ),
    gripe: ({ dados }) => (
      <Grade
        dados={dados}
        titulo="Em qualquer fase"
        destaques={["qualquer"]}
        itens={[
          { de: "gripe", rotulo: "Gripe: 1 dose por temporada", icone: { simbolo: "seringa" } },
          { de: "covid", rotulo: "Covid: 1 dose por ano", icone: { simbolo: "seringa" } },
          { de: "hepatite", rotulo: "Hepatite B: completa sem recomeçar", icone: { simbolo: "ok" }, tom: "menta" },
        ]}
      />
    ),
    depois: ({ dados }) => (
      <Lista
        dados={dados}
        titulo="Depois do parto"
        destaques={["Depois"]}
        itens={[
          { de: "tríplice", rotulo: "Tríplice viral, catapora e HPV", icone: { ilustracao: "calendario" }, tom: "lilas" },
          { de: "caderneta", rotulo: "Leve a caderneta em toda consulta", icone: { ilustracao: "prancheta" } },
        ]}
      />
    ),
    encerramento: ({ dados }) => <Fim dados={dados} frase="Calendário completo de vacinas no Ninna" destaques={["Ninna"]} de="calendário" fonte={roteiro.fonte} />,
  },
});
