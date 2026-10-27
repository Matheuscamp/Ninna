// Versão atual dos textos de consentimento. Ao mudar o texto, suba a versão:
// quem aceitou a versão anterior precisa aceitar de novo.
export const VERSAO_CONSENTIMENTO = "2026-10-v2";

export const TIPOS_CONSENTIMENTO = ["dados_saude", "termos_privacidade"] as const;
export type TipoConsentimento = (typeof TIPOS_CONSENTIMENTO)[number];
