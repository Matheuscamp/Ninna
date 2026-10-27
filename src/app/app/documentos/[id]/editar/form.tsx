"use client";

import Link from "next/link";
import { useActionState } from "react";
import { BotaoPrimario, Campo, CampoSelecao, CampoTextoLongo } from "@/components/ui";
import { CATEGORIAS } from "@/lib/documentos";
import type { EstadoEdicao } from "../../actions";

type Valores = { nome: string; categoria: string; dataDocumento: string; profissional: string; descricao: string };

export function FormEditarDocumento({
  acao,
  iniciais,
}: {
  acao: (estado: EstadoEdicao, formData: FormData) => Promise<EstadoEdicao>;
  iniciais: Valores;
}) {
  const [estado, acaoForm, pendente] = useActionState(acao, undefined);
  const v = { ...iniciais, ...estado?.valores };

  return (
    <form action={acaoForm} className="flex flex-col gap-4">
      <Campo id="nome" rotulo="Nome do documento" required maxLength={120} defaultValue={v.nome} erro={estado?.erros?.nome?.[0]} />
      <CampoSelecao
        id="categoria"
        rotulo="Categoria"
        required
        opcoes={CATEGORIAS}
        defaultValue={v.categoria}
        erro={estado?.erros?.categoria?.[0]}
      />
      <Campo
        id="dataDocumento"
        rotulo="Data do exame ou da vacina (opcional)"
        type="date"
        defaultValue={v.dataDocumento}
        erro={estado?.erros?.dataDocumento?.[0]}
      />
      <Campo
        id="profissional"
        rotulo="Profissional ou estabelecimento (opcional)"
        maxLength={120}
        defaultValue={v.profissional}
        erro={estado?.erros?.profissional?.[0]}
      />
      <CampoTextoLongo id="descricao" rotulo="Descrição (opcional)" maxLength={500} defaultValue={v.descricao} erro={estado?.erros?.descricao?.[0]} />
      {estado?.erro && (
        <p role="alert" className="rounded-2xl bg-rosa-50 p-4 text-[15px] text-rosa-700">
          {estado.erro}
        </p>
      )}
      <BotaoPrimario type="submit" disabled={pendente}>
        {pendente ? "Salvando…" : "Salvar alterações"}
      </BotaoPrimario>
      <Link href="/app/documentos" className="flex h-12 items-center justify-center rounded-2xl font-semibold text-suave">
        Cancelar
      </Link>
    </form>
  );
}
