// Respostas feitas antes do login ficam só neste navegador até a conta e o
// consentimento existirem. Usa localStorage (e não sessionStorage) porque o
// link de confirmação do e-mail abre uma aba nova. Expira em 24 horas e é
// apagado assim que a triagem é salva no servidor.
const CHAVE = "ninna:triagem-pendente";
const VALIDADE_MS = 24 * 60 * 60 * 1000;

export function guardarPendente(respostas: unknown) {
  localStorage.setItem(CHAVE, JSON.stringify({ respostas, em: Date.now() }));
}

export function lerPendente(): unknown | null {
  const valor = localStorage.getItem(CHAVE);
  if (!valor) return null;
  try {
    const { respostas, em } = JSON.parse(valor) as { respostas: unknown; em: number };
    if (Date.now() - em > VALIDADE_MS) {
      limparPendente();
      return null;
    }
    return respostas;
  } catch {
    limparPendente();
    return null;
  }
}

export function limparPendente() {
  localStorage.removeItem(CHAVE);
}
