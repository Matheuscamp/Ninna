"use client";

import Link from "next/link";
import { useActionState } from "react";
import { BotaoPrimario, BotaoSecundario, Campo } from "@/components/ui";
import { cadastrar, entrar, entrarComGoogle } from "./actions";

function BotaoGoogle({ next }: { next: string }) {
  return (
    <form action={entrarComGoogle}>
      <input type="hidden" name="next" value={next} />
      <BotaoSecundario type="submit" className="flex items-center justify-center gap-3">
        <LogoGoogle />
        Continuar com Google
      </BotaoSecundario>
    </form>
  );
}

// Logo do Google, nas cores oficiais, como pedem as diretrizes do botão "Continuar com Google".
function LogoGoogle() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="size-5">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6C44 38 46.5 31.8 46.5 24.5z" />
      <path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.6 10.7l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.2 1.5-5 2.3-8.2 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
    </svg>
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
        <Campo
          id="email"
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          required
          defaultValue={estado?.valores?.email}
          erro={estado?.erros?.email?.[0]}
        />
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
      <div role="status" className="flex flex-col gap-2 rounded-3xl bg-azul-50 p-6">
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
        <Campo
          id="nome"
          rotulo="Como prefere ser chamada?"
          autoComplete="given-name"
          required
          defaultValue={estado?.valores?.nome}
          erro={estado?.erros?.nome?.[0]}
        />
        <Campo
          id="email"
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          required
          defaultValue={estado?.valores?.email}
          erro={estado?.erros?.email?.[0]}
        />
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
        {/* Passa por /triagem/concluir: grava a triagem feita antes do login, se houver. */}
        <Link href="/entrar?next=/triagem/concluir" className="font-semibold text-rosa-600 underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
