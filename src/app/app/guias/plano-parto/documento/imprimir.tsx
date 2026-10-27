"use client";

// Abre a impressão do navegador. Ali dá para imprimir ou escolher "Salvar como PDF".
export function BotaoImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="h-13 w-full rounded-2xl bg-rosa-600 px-5 text-[17px] font-semibold text-white transition hover:bg-rosa-700"
    >
      Baixar PDF ou imprimir
    </button>
  );
}
