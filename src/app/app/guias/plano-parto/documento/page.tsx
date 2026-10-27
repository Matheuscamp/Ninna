import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Carregando, Voltar } from "@/components/ui";
import { exigirUsuariaPronta, getFicha, getPlano, getPlanoDeParto } from "@/lib/dal";
import { formatarDataLonga } from "@/lib/datas";
import { documentoDoPlano } from "@/lib/plano-parto";
import { dataProvavelDoParto } from "@/lib/triagem";
import { FolhaPlanoParto } from "./folha";
import { BotaoImprimir } from "./imprimir";

// O título vira o nome sugerido do arquivo ao salvar em PDF.
export const metadata: Metadata = { title: "Plano de parto" };

async function Documento({ searchParams }: { searchParams: PageProps<"/app/guias/plano-parto/documento">["searchParams"] }) {
  const { usuaria, perfil } = await exigirUsuariaPronta();
  if ((await getPlano(usuaria.id)) !== "premium") redirect("/app/guias/plano-parto");
  const [salvo, ficha, { ok }] = await Promise.all([getPlanoDeParto(usuaria.id), getFicha(usuaria.id), searchParams]);
  if (!salvo || salvo === "indisponivel") redirect("/app/guias/plano-parto");

  const secoes = documentoDoPlano(salvo.respostas);
  const dados = [
    perfil.perfil === "gestante" && perfil.dum ? { rotulo: "Data provável do parto", valor: formatarDataLonga(dataProvavelDoParto(perfil.dum)) } : null,
    ficha?.tipo_sanguineo ? { rotulo: "Tipo sanguíneo", valor: ficha.tipo_sanguineo } : null,
    ficha?.alergias ? { rotulo: "Alergias", valor: ficha.alergias } : null,
    ficha?.medicamentos ? { rotulo: "Medicamentos em uso", valor: ficha.medicamentos } : null,
  ].filter((d) => d !== null);

  return (
    <>
      <div className="flex flex-col gap-3 print:hidden">
        {ok === "salvo" && (
          <p role="status" className="rounded-2xl bg-azul-100 px-4 py-3 text-[15px] font-semibold text-azul-900">
            Plano salvo.
          </p>
        )}
        <BotaoImprimir />
        <p className="text-center text-[13px] leading-relaxed text-suave">
          Na tela de impressão, escolha &ldquo;Salvar como PDF&rdquo; para guardar o arquivo, ou uma impressora. Leve duas cópias: uma para você e uma
          para a equipe.
        </p>
        <Link
          href="/app/guias/plano-parto"
          className="flex h-12 items-center justify-center rounded-2xl border-2 border-linha bg-white font-semibold hover:border-rosa-300"
        >
          Editar respostas
        </Link>
      </div>

      <FolhaPlanoParto nome={perfil.nome} dados={dados} secoes={secoes} atualizadoEm={salvo.atualizadoEm} />
    </>
  );
}

export default function DocumentoPlanoPartoPage({ searchParams }: PageProps<"/app/guias/plano-parto/documento">) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-5 py-8 print:max-w-none print:p-0">
      <div className="print:hidden">
        <Voltar href="/app/guias/plano-parto" rotulo="Plano de parto" />
      </div>
      <Suspense fallback={<Carregando />}>
        <Documento searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
