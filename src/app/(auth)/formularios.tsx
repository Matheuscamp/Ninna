"use client";

import Link from "next/link";
import { useActionState } from "react";
import { BotaoPrimario, BotaoSecundario, Campo } from "@/components/ui";
import { cadastrar, entrar, entrarComGoogle } from "./actions";

function BotaoGoogle({ next }: { next: string }) {
  return (
    <form action={entrarComGoogle}>
      <input type="hidden" name="next" value={next} />
      <BotaoSecundario type="submit">Continuar com Google</BotaoSecundario>
    </form>
  );
}

function Divisor() {
  return (
    <div className="flex items-center gap-3 text-sm text-suave" aria-hidden="true">
      <span className="h-px flex-1 bg-linha" />
      ou
      <span className="h-px flex-1 bg-linha" />
    </div>
  );
}

export function FormEntrar({ next, erroRetorno }: { next: string; erroRetorno?: string }) {
  const [estado, acao, pendente] = useActionState(entrar, undefined);

  return (
    <div className="flex flex-col gap-5">
      {erroRetorno && (
        <p role="alert" className="rounded-2xl bg-rosa-50 p-4 text-[15px] text-rosa-700">
          {erroRetorno}
        </p>
      )}
      <BotaoGoogle next={next} />
      <Divisor />
      <form action={acao} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />
        <Campo id="email" rotulo="E-mail" type="email" autoComplete="email" required erro={estado?.erros?.email?.[0]} />
        <Campo
          id="senha"
          rotulo="Senha"
          type="password"
          autoComplete="current-password"
          required
          erro={estado?.erros?.senha?.[0]}
        />
        {estado?.erro && (
          <p role="alert" className="text-sm text-alerta">
            {estado.erro}
          </p>
        )}
        <BotaoPrimario type="submit" disabled={pendente}>
          {pendente ? "Entrando…" : "Entrar"}
        </BotaoPrimario>
      </form>
      <p className="text-center text-[15px]">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-rosa-600 underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}

export function FormCadastro() {
  const [estado, acao, pendente] = useActionState(cadastrar, undefined);

  if (estado?.enviado) {
    return (
      <div role="status" className="flex flex-col gap-2 rounded-3xl bg-white p-6">
        <h2 className="text-xl font-bold">Confira seu e-mail</h2>
        <p className="leading-relaxed text-suave">
          Enviamos um link para confirmar sua conta. Depois de clicar nele, você volta para cá e continua de onde
          parou.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <BotaoGoogle next="/consentimento" />
      <Divisor />
      <form action={acao} className="flex flex-col gap-4">
        <Campo id="nome" rotulo="Como prefere ser chamada?" autoComplete="given-name" required erro={estado?.erros?.nome?.[0]} />
        <Campo id="email" rotulo="E-mail" type="email" autoComplete="email" required erro={estado?.erros?.email?.[0]} />
        <Campo
          id="senha"
          rotulo="Senha (mínimo 8 caracteres)"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          erro={estado?.erros?.senha?.[0]}
        />
        {estado?.erro && (
          <p role="alert" className="text-sm text-alerta">
            {estado.erro}
          </p>
        )}
        <BotaoPrimario type="submit" disabled={pendente}>
          {pendente ? "Criando conta…" : "Criar conta"}
        </BotaoPrimario>
      </form>
      <p className="text-center text-[15px]">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-semibold text-rosa-600 underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
