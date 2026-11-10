import { lerPendente } from "@/app/triagem/pendente";
import { lerSalvas, limparRegistros, PREFIXO_CONTRACOES } from "./contracoes";

// O que o app guarda no navegador (localStorage) usa sempre o prefixo "ninna:".
// Em aparelho compartilhado, nada disso pode sobrar para a próxima pessoa.
const PREFIXO = "ninna:";
const CHAVE_ANTIGA_CONTRACOES = "ninna:contracoes"; // antes de separar por conta

function chavesDoApp() {
  return Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)).filter((chave): chave is string => chave?.startsWith(PREFIXO) ?? false);
}

// Ao sair ou excluir a conta.
export function limparDadosDoAparelho() {
  try {
    chavesDoApp().forEach((chave) => localStorage.removeItem(chave));
  } catch {
    // Armazenamento bloqueado (ex.: navegação privada): não há o que limpar.
  }
}

// Ao abrir o site: apaga o que venceu, mesmo de quem não voltou a usar a tela.
export function varrerDadosVencidos(agora = Date.now()) {
  try {
    lerPendente(); // já apaga a triagem vencida
    localStorage.removeItem(CHAVE_ANTIGA_CONTRACOES);
    for (const chave of chavesDoApp()) {
      if (!chave.startsWith(PREFIXO_CONTRACOES)) continue;
      const dados = limparRegistros(lerSalvas(localStorage.getItem(chave)), agora);
      if (dados.contracoes.length === 0 && dados.emAndamento === null) localStorage.removeItem(chave);
      else localStorage.setItem(chave, JSON.stringify(dados));
    }
  } catch {
    // Armazenamento bloqueado: não há o que varrer.
  }
}
