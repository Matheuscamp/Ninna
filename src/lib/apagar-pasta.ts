// O mínimo do Storage do Supabase que a exclusão usa. Pastas vêm na listagem com id nulo.
type Armazenamento = {
  list(pasta: string, opcoes: { limit: number }): PromiseLike<{ data: { id: string | null; name: string }[] | null; error: { message: string } | null }>;
  remove(caminhos: string[]): PromiseLike<{ data: unknown[] | null; error: unknown }>;
};

// Apaga tudo o que há numa pasta, inclusive subpastas. Devolve false se algo não
// pôde ser conferido ou apagado: quem chama não pode dar a exclusão como feita.
export async function apagarPasta(armazenamento: Armazenamento, pasta: string): Promise<boolean> {
  for (;;) {
    const { data: itens, error } = await armazenamento.list(pasta, { limit: 100 });
    if (error) return /bucket not found/i.test(error.message); // bucket ainda não criado: não há o que apagar
    if (!itens || itens.length === 0) return true;

    for (const item of itens) {
      if (!item.id && !(await apagarPasta(armazenamento, `${pasta}/${item.name}`))) return false;
    }

    const arquivos = itens.filter((item) => item.id).map((item) => `${pasta}/${item.name}`);
    if (arquivos.length === 0) return true;
    const { data: removidos, error: erroRemover } = await armazenamento.remove(arquivos);
    // Nada removido e nenhum erro: repetir só voltaria a listar os mesmos arquivos.
    if (erroRemover || !removidos || removidos.length === 0) return false;
  }
}
