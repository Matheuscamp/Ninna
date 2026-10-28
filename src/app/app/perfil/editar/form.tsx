"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import { BotaoPrimario, Campo, CampoSelecao, CampoTextoLongo } from "@/components/ui";
import { TIPOS_SANGUINEOS } from "@/lib/ficha";
import { salvarFicha } from "./actions";

export type ValoresFicha = {
  nome: string;
  dataNascimento: string;
  tipoSanguineo: string;
  peso: string;
  altura: string;
  alergias: string;
  medicamentos: string;
  emergenciaNome: string;
  emergenciaParentesco: string;
  emergenciaTelefone: string;
};

function Bloco({ titulo, descricao, children }: { titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-3xl bg-white/90 shadow-suave p-5">
      <legend className="sr-only">{titulo}</legend>
      <div className="flex flex-col gap-0.5" aria-hidden="true">
        <span className="text-[13px] font-bold uppercase tracking-wide text-suave">{titulo}</span>
        {descricao && <span className="text-[13px] text-suave">{descricao}</span>}
      </div>
      {children}
    </fieldset>
  );
}

export function FormFicha({ iniciais }: { iniciais: ValoresFicha }) {
  const [estado, acao, pendente] = useActionState(salvarFicha, undefined);
  const v = { ...iniciais, ...estado?.valores };
  const erro = (campo: keyof ValoresFicha) => estado?.erros?.[campo]?.[0];

  return (
    <form action={acao} className="flex flex-col gap-4">
      <Bloco titulo="Sobre você">
        <Campo id="nome" rotulo="Como prefere ser chamada?" required maxLength={60} autoComplete="given-name" defaultValue={v.nome} erro={erro("nome")} />
        <Campo id="dataNascimento" rotulo="Data de nascimento" type="date" autoComplete="bday" defaultValue={v.dataNascimento} erro={erro("dataNascimento")} />
      </Bloco>

      <Bloco titulo="Saúde" descricao="Úteis nas consultas e numa emergência. Preencha só o que souber.">
        <CampoSelecao
          id="tipoSanguineo"
          rotulo="Tipo sanguíneo"
          opcoes={TIPOS_SANGUINEOS.map((t) => ({ id: t, rotulo: t }))}
          vazio="Não sei / prefiro não informar"
          defaultValue={v.tipoSanguineo}
          erro={erro("tipoSanguineo")}
        />
        <div className="grid grid-cols-2 gap-3">
          <Campo id="peso" rotulo="Peso (kg)" inputMode="decimal" placeholder="Ex.: 68,5" defaultValue={v.peso} erro={erro("peso")} />
          <Campo id="altura" rotulo="Altura (cm)" inputMode="numeric" placeholder="Ex.: 165" defaultValue={v.altura} erro={erro("altura")} />
        </div>
        <CampoTextoLongo
          id="alergias"
          rotulo="Alergias"
          placeholder="Ex.: dipirona, camarão. Deixe em branco se não tiver."
          maxLength={300}
          defaultValue={v.alergias}
          erro={erro("alergias")}
        />
        <CampoTextoLongo
          id="medicamentos"
          rotulo="Medicamentos em uso"
          placeholder="Ex.: ácido fólico, levotiroxina 50 mcg"
          maxLength={300}
          defaultValue={v.medicamentos}
          erro={erro("medicamentos")}
        />
      </Bloco>

      <Bloco titulo="Contato de emergência" descricao="Alguém para avisar se você precisar de ajuda.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Campo id="emergenciaNome" rotulo="Nome" maxLength={80} autoComplete="off" defaultValue={v.emergenciaNome} erro={erro("emergenciaNome")} />
          <Campo
            id="emergenciaParentesco"
            rotulo="Parentesco (opcional)"
            placeholder="Ex.: mãe, parceiro"
            maxLength={40}
            defaultValue={v.emergenciaParentesco}
            erro={erro("emergenciaParentesco")}
          />
        </div>
        <Campo
          id="emergenciaTelefone"
          rotulo="Telefone com DDD"
          type="tel"
          inputMode="tel"
          placeholder="(11) 98765-4321"
          autoComplete="off"
          defaultValue={v.emergenciaTelefone}
          erro={erro("emergenciaTelefone")}
        />
      </Bloco>

      {estado?.erro && (
        <p role="alert" className="rounded-2xl bg-rosa-50 p-4 text-[15px] text-rosa-700">
          {estado.erro}
        </p>
      )}
      {estado?.erros && !estado.erro && (
        <p role="alert" className="rounded-2xl bg-rosa-50 p-4 text-[15px] text-rosa-700">
          Confira os campos marcados.
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <BotaoPrimario type="submit" disabled={pendente} className="sm:flex-1">
          {pendente ? "Salvando…" : "Salvar"}
        </BotaoPrimario>
        <Link href="/app/perfil" className="flex h-12 items-center justify-center rounded-2xl font-semibold text-suave transition hover:bg-white sm:flex-1">
          Cancelar
        </Link>
      </div>
      <p className="text-center text-[13px] text-suave">Só você vê estas informações. Elas entram na exportação dos seus dados.</p>
    </form>
  );
}
