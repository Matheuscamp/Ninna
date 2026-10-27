import { Agent, fetch as fetchUndici } from "undici";

// Conexões com o Supabase às vezes não abrem (rede instável). O padrão do Node
// espera 10 s para desistir; aqui desiste em 2 s (uma conexão normal abre em
// menos de 100 ms) e tenta de novo, até 3 vezes.
// Só repete falhas de *abertura* da conexão: nesses casos nada foi enviado,
// então não há risco de, por exemplo, criar a mesma conta duas vezes.
const ERROS_DE_CONEXAO = new Set(["UND_ERR_CONNECT_TIMEOUT", "ECONNREFUSED", "EAI_AGAIN"]);

type Fetch = typeof fetch;

export function falhaDeConexao(erro: unknown) {
  const codigo = (erro as { cause?: { code?: string } })?.cause?.code;
  return codigo !== undefined && ERROS_DE_CONEXAO.has(codigo);
}

export function criarFetchResiliente({ fetchBase, tentativas = 3 }: { fetchBase: Fetch; tentativas?: number }): Fetch {
  return async (entrada, opcoes) => {
    for (let tentativa = 1; ; tentativa++) {
      try {
        return await fetchBase(entrada, opcoes);
      } catch (erro) {
        if (tentativa >= tentativas || !falhaDeConexao(erro)) throw erro;
      }
    }
  };
}

const agente = new Agent({ connect: { timeout: 2_000 } });

const fetchComAgente: Fetch = (entrada, opcoes) => {
  // O Supabase chama fetch com URL em texto; um Request completo não é usado.
  const url = entrada instanceof Request ? entrada.url : entrada;
  return fetchUndici(url, { ...(opcoes as object), dispatcher: agente }) as unknown as Promise<Response>;
};

export const fetchSupabase = criarFetchResiliente({ fetchBase: fetchComAgente });
