// Dados de quem responde pelo Ninna, usados nos Termos de Uso e na Política de Privacidade.
// PREENCHER antes do lançamento (o que estiver entre colchetes aparece assim na página).
// Os textos jurídicos são uma primeira versão e precisam de revisão de advogado.

export const RESPONSAVEL = {
  // Nome empresarial (ou nome completo, se for pessoa física/MEI).
  nome: "[NOME OU RAZÃO SOCIAL]",
  // CNPJ (ou CPF).
  documento: "[CNPJ]",
  endereco: "[ENDEREÇO COMPLETO]",
  // E-mail para dúvidas, pedidos sobre dados pessoais e reclamações.
  email: "[E-MAIL DE CONTATO]",
  // Encarregado pelo tratamento de dados pessoais (LGPD, art. 41).
  encarregado: "[NOME DO ENCARREGADO]",
} as const;

// Data da versão atual dos textos. Ao mudar algo importante, atualize aqui e
// suba VERSAO_CONSENTIMENTO (src/lib/consentimento.ts) para pedir novo aceite.
export const VERSAO_TEXTOS_JURIDICOS = "27 de outubro de 2026";
