import { formatarDiaDoInstante } from "@/lib/datas";
import { LIMITES_GRATUITOS, type Plano } from "@/lib/planos";
import { FormPremium, VerificarPagamento } from "./form";

// Resultado da volta do checkout (/app/premium/retorno).
const MENSAGENS: Record<string, { texto: string; erro?: boolean }> = {
  aprovado: { texto: "Pagamento aprovado. Seu Premium já está ativo!" },
  pendente: { texto: "Pagamento em processamento. Pix costuma confirmar em minutos e boleto em até 3 dias úteis; o Premium é ativado assim que confirmar." },
  confirmando: { texto: "Estamos confirmando seu pagamento. Em alguns minutos o Premium aparece aqui." },
  recusado: { texto: "O pagamento não foi aprovado e nada foi cobrado. Você pode tentar de novo com outra forma de pagamento.", erro: true },
  estornado: { texto: "Este pagamento foi estornado.", erro: true },
};

const BENEFICIOS = [
  { titulo: "Agenda sem limite", descricao: `Todas as consultas e exames futuros (no gratuito, até ${LIMITES_GRATUITOS.consultasFuturas}).` },
  { titulo: "Documentos sem limite", descricao: `Guarde todos os exames e laudos (no gratuito, até ${LIMITES_GRATUITOS.documentos}).` },
  { titulo: "Conteúdos Premium", descricao: "Exames do pré-natal, alimentação, sono, período fértil e mais." },
];

function Check() {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-rosa-600 text-white">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l5 5 9-10" />
      </svg>
    </span>
  );
}

// Parte visual da página Premium, separada da leitura de dados para poder ser conferida sem login.
export function PremiumVisual({ plano, validoAte, pagamento }: { plano: Plano; validoAte: string | null; pagamento?: string }) {
  const mensagem = pagamento ? MENSAGENS[pagamento] : undefined;
  const premium = plano === "premium";

  return (
    <>
      {mensagem && (
        <p role="status" className={`rounded-2xl px-4 py-3 text-[15px] font-semibold ${mensagem.erro ? "bg-rosa-50 text-rosa-700" : "bg-azul-100 text-azul-900"}`}>
          {mensagem.texto}
        </p>
      )}

      {premium ? (
        <section className="flex flex-col gap-1 rounded-3xl bg-rosa-600 p-5 text-white">
          <p className="text-[13px] font-bold uppercase tracking-wide text-white/80">Seu plano</p>
          <p className="text-xl font-bold">Premium ativo</p>
          <p className="text-[15px]">{validoAte ? `Válido até ${formatarDiaDoInstante(validoAte)}.` : "Sem data para acabar."}</p>
        </section>
      ) : (
        <p className="-mt-2 text-[17px] leading-relaxed text-suave">Mais espaço para organizar o pré-natal, com tudo num lugar só.</p>
      )}

      <ul className="flex flex-col gap-4 rounded-3xl bg-white p-5">
        {BENEFICIOS.map((b) => (
          <li key={b.titulo} className="flex gap-3">
            <Check />
            <span className="flex flex-col">
              <span className="font-bold">{b.titulo}</span>
              <span className="text-[15px] leading-relaxed text-suave">{b.descricao}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[13px] leading-relaxed text-suave">
        Sinais de alerta e orientações de segurança são sempre gratuitos. Quando o Premium termina, você volta ao plano gratuito sem perder nada do
        que guardou.
      </p>

      {!(premium && validoAte === null) && (
        <>
          <FormPremium renovar={premium} />
          <VerificarPagamento />
        </>
      )}
    </>
  );
}
