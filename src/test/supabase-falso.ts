import { vi } from "vitest";

// Supabase simulado para testar as ações do servidor sem rede e sem contas reais.
// Cada tabela devolve o resultado configurado em `resultados`; as chamadas ficam registradas.

type Resultado = { data?: unknown; error?: unknown; count?: number };

export function criarConsulta(resultado: Resultado = { data: [], error: null }) {
  const consulta: Record<string, unknown> = {};
  for (const metodo of ["select", "eq", "is", "neq", "gt", "gte", "lte", "ilike", "order", "limit", "maybeSingle", "single", "insert", "update", "upsert", "delete"]) {
    consulta[metodo] = vi.fn(() => consulta);
  }
  // `await supabase.from(...)...` resolve para o resultado configurado.
  consulta.then = (resolver: (v: Resultado) => unknown, rejeitar: (e: unknown) => unknown) =>
    Promise.resolve({ error: null, ...resultado }).then(resolver, rejeitar);
  return consulta as Record<string, ReturnType<typeof vi.fn>> & PromiseLike<Resultado>;
}

export function criarSupabaseFalso() {
  const consultas: Record<string, ReturnType<typeof criarConsulta>[]> = {};
  const resultados: Record<string, Resultado> = {};

  const supabase = {
    auth: {
      getClaims: vi.fn(async () => ({ data: { claims: { sub: "usuaria-1", email: "teste@exemplo.com" } }, error: null })),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(async () => ({ error: null })),
    },
    from: vi.fn((tabela: string) => {
      const consulta = criarConsulta(resultados[tabela]);
      (consultas[tabela] ??= []).push(consulta);
      return consulta;
    }),
    rpc: vi.fn(async () => ({ data: null, error: null })),
  };

  return {
    supabase,
    consultas,
    // Define o que a próxima consulta a uma tabela devolve.
    responder(tabela: string, resultado: Resultado) {
      resultados[tabela] = resultado;
    },
    deslogar() {
      supabase.auth.getClaims.mockResolvedValue({ data: null as never, error: null });
    },
  };
}

// redirect() do Next lança um erro especial; aqui ele carrega o destino para os testes lerem.
export class Redirecionou extends Error {
  constructor(public destino: string) {
    super(`redirect ${destino}`);
  }
}

export async function destinoDe(promessa: Promise<unknown>) {
  try {
    await promessa;
  } catch (e) {
    if (e instanceof Redirecionou) return e.destino;
    throw e;
  }
  return null;
}
