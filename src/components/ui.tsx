import Image from "next/image";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Logo({ tamanho = 40 }: { tamanho?: number }) {
  return (
    <Image
      src="/ninna-icon.png"
      alt="Ninna"
      width={tamanho}
      height={tamanho}
      className="rounded-[22%]"
      priority
    />
  );
}

export function Pagina({ children }: { children: ReactNode }) {
  return <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 py-8">{children}</main>;
}

export function BotaoPrimario({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`h-13 w-full rounded-2xl bg-rosa-600 px-5 text-[17px] font-semibold text-white transition hover:bg-rosa-700 disabled:cursor-not-allowed disabled:bg-rosa-100 disabled:text-suave ${className}`}
    />
  );
}

export function BotaoSecundario({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`h-12 w-full rounded-2xl border-2 border-linha bg-white px-5 text-base font-semibold text-tinta transition hover:border-rosa-300 ${className}`}
    />
  );
}

export function Opcao({
  selecionada,
  titulo,
  descricao,
  onClick,
}: {
  selecionada: boolean;
  titulo: string;
  descricao?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selecionada}
      onClick={onClick}
      className={`flex w-full flex-col gap-0.5 rounded-2xl border-2 px-4 py-3.5 text-left transition ${
        selecionada ? "border-rosa-600 bg-rosa-50" : "border-linha bg-white hover:border-rosa-300"
      }`}
    >
      <span className="text-base font-semibold">{titulo}</span>
      {descricao && <span className="text-sm text-suave">{descricao}</span>}
    </button>
  );
}

export function Campo({
  id,
  rotulo,
  erro,
  ...props
}: { id: string; rotulo: string; erro?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {rotulo}
      </label>
      <input
        id={id}
        name={id}
        {...props}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${id}-erro` : undefined}
        className="h-12 rounded-xl border-2 border-linha bg-white px-4 text-base outline-none focus:border-rosa-600"
      />
      {erro && (
        <p id={`${id}-erro`} className="text-sm text-alerta">
          {erro}
        </p>
      )}
    </div>
  );
}

export function CampoSelecao({
  id,
  rotulo,
  erro,
  opcoes,
  vazio,
  ...props
}: {
  id: string;
  rotulo: string;
  erro?: string;
  opcoes: readonly { id: string; rotulo: string }[];
  vazio?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {rotulo}
      </label>
      <select
        id={id}
        name={props.name ?? id}
        {...props}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${id}-erro` : undefined}
        className="h-12 rounded-xl border-2 border-linha bg-white px-3 text-base outline-none focus:border-rosa-600"
      >
        {vazio !== undefined && <option value="">{vazio}</option>}
        {opcoes.map((o) => (
          <option key={o.id} value={o.id}>
            {o.rotulo}
          </option>
        ))}
      </select>
      {erro && (
        <p id={`${id}-erro`} className="text-sm text-alerta">
          {erro}
        </p>
      )}
    </div>
  );
}

export function CampoTextoLongo({
  id,
  rotulo,
  erro,
  ...props
}: { id: string; rotulo: string; erro?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {rotulo}
      </label>
      <textarea
        id={id}
        name={props.name ?? id}
        rows={3}
        {...props}
        aria-invalid={erro ? true : undefined}
        className="rounded-xl border-2 border-linha bg-white px-4 py-3 text-base outline-none focus:border-rosa-600"
      />
      {erro && <p className="text-sm text-alerta">{erro}</p>}
    </div>
  );
}

export function Carregando() {
  return (
    <p role="status" className="text-suave">
      Carregando…
    </p>
  );
}

export function Voltar({ href, rotulo = "Voltar" }: { href: string; rotulo?: string }) {
  return (
    <Link href={href} className="-ml-2 flex h-11 items-center gap-1 self-start rounded-xl pr-3 font-semibold text-suave hover:bg-white">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 fill-none stroke-current" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {rotulo}
    </Link>
  );
}

export function AvisoMedico() {
  return (
    <p className="text-center text-[13px] leading-relaxed text-suave">
      O Ninna informa e organiza, mas não substitui o acompanhamento médico.
    </p>
  );
}
