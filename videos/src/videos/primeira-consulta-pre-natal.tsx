import narracao from "../../roteiros/primeira-consulta-pre-natal.narracao.json";
import roteiro from "../../roteiros/primeira-consulta-pre-natal.json";
import { Abertura, Fim, Grade, Linha, Lista } from "../modelos";
import { criarVideo } from "../motor";
import { COR } from "../tema";

export const primeiraConsulta = criarVideo({
  slug: "primeira-consulta-pre-natal",
  tema: "Gestação",
  roteiro,
  narracao,
  cenas: {
    gancho: ({ dados }) => (
      <Abertura dados={dados} titulo="Hora do pré-natal!" destaques={["pré-natal!"]} ilustracao="prancheta" fundo={COR.azul100} orbitas={[{ de: "bom", icone: { ilustracao: "coracao" } }, { de: "ubs", icone: { ilustracao: "casa" } }]} selo={{ de: "12ª", texto: "Até a 12ª semana, de graça na UBS" }} />
    ),
    ritmo: ({ dados }) => (
      <Linha
        dados={dados}
        titulo="Pelo menos 7 consultas"
        destaques={["7"]}
        grupos={[
          { de: "mensais", ate: "28", semanas: [12, 16, 20, 24, 28], rotulo: "mensais" },
          { de: "15", ate: "36", semanas: [30, 32, 34, 36], rotulo: "a cada 15 dias" },
          { de: "semanais", ate: "parto", semanas: [37, 38, 39, 40], rotulo: "semanais" },
        ]}
        itens={[{ de: "alternando", rotulo: "Alternando médica e enfermeira", icone: { ilustracao: "conversa" } }]}
      />
    ),
    consulta: ({ dados }) => (
      <Grade
        dados={dados}
        titulo="Em toda consulta"
        destaques={["toda"]}
        itens={[
          { de: "pressão", rotulo: "Pressão", icone: { simbolo: "pressao" } },
          { de: "peso", rotulo: "Peso", icone: { simbolo: "balanca" } },
          { de: "coração", rotulo: "Coração do bebê", icone: { ilustracao: "coracao" } },
          { de: "vacinas", rotulo: "Vacinas e exames", icone: { simbolo: "seringa" } },
        ]}
      />
    ),
    contar: ({ dados }) => (
      <Lista
        dados={dados}
        titulo="Conte tudo"
        destaques={["tudo"]}
        itens={[
          { de: "remédios", rotulo: "Remédios e alergias", icone: { ilustracao: "gota" } },
          { de: "gestações", rotulo: "Gestações anteriores", icone: { ilustracao: "bebe" } },
          { de: "doenças", rotulo: "Doenças na família", icone: { ilustracao: "prancheta" } },
          { de: "segura", rotulo: "Se você se sente segura em casa", icone: { ilustracao: "casa" }, tom: "rosa" },
        ]}
      />
    ),
    levar: ({ dados }) => (
      <Grade
        dados={dados}
        titulo="O que levar"
        destaques={["levar"]}
        itens={[
          { de: "documento", rotulo: "Documento e cartão do SUS", icone: { ilustracao: "prancheta" } },
          { de: "caderneta", rotulo: "Caderneta da gestante", icone: { ilustracao: "calendario" } },
          { de: "lista", rotulo: "Lista de dúvidas", icone: { ilustracao: "lupa" } },
          { de: "acompanhante", rotulo: "Acompanhante, se quiser", icone: { ilustracao: "coracao" } },
        ]}
      />
    ),
    encerramento: ({ dados }) => (
      <Fim dados={dados} frase="O pré-natal não tem alta" destaques={["alta"]} de="lembre" final={{ de: "agenda", texto: "Organize na agenda do Ninna" }} fonte={roteiro.fonte} />
    ),
  },
});
