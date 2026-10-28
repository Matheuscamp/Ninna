import { Logo } from "@/components/ui";
import { DECLARACAO_PLANO } from "@/content/plano-parto";
import { formatarDiaDoInstante } from "@/lib/datas";
import type { documentoDoPlano } from "@/lib/plano-parto";

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[11px] font-bold uppercase tracking-wide text-suave">{rotulo}</dt>
      <dd className="text-[15px] font-semibold">{valor}</dd>
    </div>
  );
}

// A folha do plano de parto: o que sai no PDF. Separada da leitura de dados para
// poder ser conferida sem login.
export function FolhaPlanoParto({
  nome,
  dados,
  secoes,
  atualizadoEm,
}: {
  nome: string | null;
  dados: { rotulo: string; valor: string }[];
  secoes: ReturnType<typeof documentoDoPlano>;
  atualizadoEm: string;
}) {
  return (
    <article className="flex flex-col gap-5 rounded-3xl bg-white/90 shadow-suave p-6 print:rounded-none print:bg-white print:p-0 print:shadow-none print:text-[12px]">
      <header className="flex items-start justify-between gap-4 border-b-2 border-rosa-100 pb-4">
        <div className="flex flex-col gap-1">
          <p className="text-[12px] font-bold uppercase tracking-widest text-rosa-600">Plano de parto</p>
          <h2 className="text-[28px] font-bold leading-tight tracking-tight print:text-[22px]">{nome ?? "____________________________"}</h2>
        </div>
        <Logo tamanho={44} />
      </header>

      {dados.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl bg-azul-50 p-4 print:bg-transparent print:p-0">
          {dados.map((d) => (
            <Dado key={d.rotulo} {...d} />
          ))}
        </dl>
      )}

      {secoes.length === 0 ? (
        <p className="text-suave">Nenhuma preferência marcada ainda.</p>
      ) : (
        secoes.map((secao) => (
          <section key={secao.id} className="flex break-inside-avoid flex-col gap-2.5">
            <h3 className="text-[17px] font-bold text-rosa-700 print:text-[14px]">{secao.titulo}</h3>
            <dl className="flex flex-col gap-2.5">
              {secao.itens.map((item) => (
                <div key={item.titulo} className="flex flex-col gap-1">
                  <dt className="text-[13px] font-bold text-suave print:text-[11px]">{item.titulo}</dt>
                  {item.valores.map((v) => (
                    <dd key={v} className="flex gap-2 leading-snug">
                      <span aria-hidden="true" className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-rosa-600" />
                      <span className="whitespace-pre-line">{v}</span>
                    </dd>
                  ))}
                </div>
              ))}
            </dl>
          </section>
        ))
      )}

      <footer className="flex break-inside-avoid flex-col gap-6 border-t-2 border-rosa-100 pt-4">
        <p className="text-[13px] leading-relaxed text-suave print:text-[11px]">{DECLARACAO_PLANO}</p>
        <div className="grid grid-cols-2 gap-6 text-[12px] text-suave">
          <div className="flex flex-col gap-1 border-t border-tinta pt-1">Assinatura</div>
          <div className="flex flex-col gap-1 border-t border-tinta pt-1">Data</div>
        </div>
        <p className="text-[11px] text-suave">Feito no Ninna · atualizado em {formatarDiaDoInstante(atualizadoEm)}</p>
      </footer>
    </article>
  );
}
