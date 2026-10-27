import Link from "next/link";
import type { ReactNode } from "react";
import type { FichaSaude, PerfilUsuaria } from "@/lib/dal";
import { formatarDataLonga } from "@/lib/datas";
import { formatarTelefone, idade } from "@/lib/ficha";
import type { Plano } from "@/lib/planos";
import { dataProvavelDoParto, PERFIS, trimestre, type Perfil } from "@/lib/triagem";
import { Avatar } from "./avatar";
import { CLASSE_ITEM, ConteudoItem, ItemExportar, ItemSair, RefazerTriagem } from "./interativos";

const PRE_NATAL: Record<string, string> = { sus: "SUS (UBS)", particular: "Particular ou convênio", nao_iniciou: "Ainda não iniciado" };

// Ícones de traço, no mesmo estilo do restante do app.
function Icone({ children, className = "size-5" }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} shrink-0 fill-none stroke-current`} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const ICONES = {
  calendario: <path d="M3 10h18M8 3v4M16 3v4M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />,
  prenatal: <path d="M4 21V9l8-6 8 6v12zM12 10v6M9 13h6" />,
  coracao: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />,
  baixar: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  lixeira: <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3" />,
  sair: <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10" />,
  lapis: <path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" />,
  telefone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  ficha: <path d="M9 4h6v3H9zM7 5H5v16h14V5h-2M12 11v6M9 14h6" />,
};

function Detalhe({ icone, rotulo, valor }: { icone: ReactNode; rotulo: string; valor: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-xl bg-white/70 text-azul-700">
        <Icone>{icone}</Icone>
      </span>
      <span className="flex flex-col">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-azul-700">{rotulo}</span>
        <span className="text-[15px] font-semibold">{valor}</span>
      </span>
    </li>
  );
}

// Ficha de saúde: o que foi preenchido, com o contato de emergência à mão.
function CartaoFicha({ ficha, hoje }: { ficha: FichaSaude; hoje: string }) {
  const itens: { rotulo: string; valor: string }[] = [];
  if (ficha.tipo_sanguineo) itens.push({ rotulo: "Tipo sanguíneo", valor: ficha.tipo_sanguineo });
  if (ficha.data_nascimento) itens.push({ rotulo: "Idade", valor: `${idade(ficha.data_nascimento, hoje)} anos` });
  if (ficha.peso_kg !== null) itens.push({ rotulo: "Peso", valor: `${String(ficha.peso_kg).replace(".", ",")} kg` });
  if (ficha.altura_cm !== null) itens.push({ rotulo: "Altura", valor: `${ficha.altura_cm} cm` });
  const temContato = Boolean(ficha.emergencia_nome && ficha.emergencia_telefone);
  const vazia = itens.length === 0 && !temContato && !ficha.alergias && !ficha.medicamentos;

  return (
    <section aria-labelledby="titulo-ficha" className="flex flex-col gap-4 rounded-3xl bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="titulo-ficha" className="text-[13px] font-bold uppercase tracking-wide text-suave">
          Ficha de saúde
        </h2>
        <Link href="/app/perfil/editar" className="rounded-lg px-2 py-1 text-sm font-semibold text-rosa-600 transition hover:bg-rosa-50">
          {vazia ? "Preencher" : "Editar"}
        </Link>
      </div>

      {vazia ? (
        <p className="text-[15px] leading-relaxed text-suave">
          Tipo sanguíneo, peso, altura, alergias e um contato de emergência ajudam nas consultas e numa emergência.
        </p>
      ) : (
        <>
          {itens.length > 0 && (
            <dl className="grid grid-cols-2 gap-2">
              {itens.map((i) => (
                <div key={i.rotulo} className="rounded-2xl bg-azul-50 px-3 py-2.5">
                  <dt className="text-[12px] font-semibold text-suave">{i.rotulo}</dt>
                  <dd className="text-lg font-bold leading-tight">{i.valor}</dd>
                </div>
              ))}
            </dl>
          )}
          {(ficha.alergias || ficha.medicamentos) && (
            <dl className="flex flex-col gap-2 text-[15px]">
              {ficha.alergias && (
                <div>
                  <dt className="text-[12px] font-semibold uppercase tracking-wide text-alerta">Alergias</dt>
                  <dd className="leading-snug">{ficha.alergias}</dd>
                </div>
              )}
              {ficha.medicamentos && (
                <div>
                  <dt className="text-[12px] font-semibold uppercase tracking-wide text-suave">Medicamentos em uso</dt>
                  <dd className="leading-snug">{ficha.medicamentos}</dd>
                </div>
              )}
            </dl>
          )}
          {temContato && ficha.emergencia_telefone && (
            <div className="flex items-center gap-3 rounded-2xl bg-rosa-50 p-3">
              <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-rosa-600">
                <Icone>{ICONES.telefone}</Icone>
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-rosa-700">Contato de emergência</span>
                <span className="truncate font-bold">
                  {ficha.emergencia_nome}
                  {ficha.emergencia_parentesco ? ` · ${ficha.emergencia_parentesco}` : ""}
                </span>
                <span className="text-sm text-suave">{formatarTelefone(ficha.emergencia_telefone)}</span>
              </div>
              <a
                href={`tel:+55${ficha.emergencia_telefone}`}
                aria-label={`Ligar para ${ficha.emergencia_nome}`}
                className="flex h-11 shrink-0 items-center rounded-xl bg-rosa-600 px-3.5 text-sm font-semibold text-white transition hover:bg-rosa-700"
              >
                Ligar
              </a>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export type DadosPerfil = {
  email: string | undefined;
  plano: Plano;
  semanas: number | null;
  perfil: Pick<PerfilUsuaria, "nome" | "dum" | "pre_natal" | "primeira_gestacao"> & { perfil: Perfil };
  ficha: FichaSaude | null; // null antes da migração da ficha
  fotoUrl: string | null;
  hoje: string;
  mensagem?: string;
};

// Desenho da tela de Perfil. Só recebe dados; quem busca é a página.
export function PerfilVisual({ email, plano, semanas, perfil, ficha, fotoUrl, hoje, mensagem }: DadosPerfil) {
  const gestante = semanas !== null && perfil.dum !== null;
  const nome = perfil.nome?.trim() || null;

  const detalhes: { icone: ReactNode; rotulo: string; valor: string }[] = [];
  if (gestante && perfil.dum) detalhes.push({ icone: ICONES.calendario, rotulo: "Parto previsto", valor: formatarDataLonga(dataProvavelDoParto(perfil.dum)) });
  if (perfil.pre_natal) detalhes.push({ icone: ICONES.prenatal, rotulo: "Pré-natal", valor: PRE_NATAL[perfil.pre_natal] });
  if (perfil.primeira_gestacao !== null) {
    detalhes.push({ icone: ICONES.coracao, rotulo: "Filhos", valor: perfil.primeira_gestacao ? "Primeiro filho" : "Já é mãe" });
  }

  return (
    <>
      <p className="-mt-3 text-[15px] text-suave">{nome ? `Olá, ${nome}. Aqui ficam seu momento e sua conta.` : "Aqui ficam seu momento e sua conta."}</p>

      {mensagem && (
        <p role="status" className="rounded-2xl bg-azul-100 px-4 py-3 text-[15px] font-semibold text-azul-900">
          {mensagem}
        </p>
      )}

      <div className="flex flex-col gap-5 md:grid md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:items-start">
        {/* Gestação: o destaque da página. */}
        <section aria-labelledby="titulo-momento" className="flex flex-col gap-5 rounded-3xl bg-azul-100 p-5 text-azul-900 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 id="titulo-momento" className="text-[13px] font-bold uppercase tracking-wide text-azul-700">
                Seu momento
              </h2>
              <p className="text-[34px] font-bold leading-none">{gestante ? `Semana ${semanas}` : PERFIS[perfil.perfil].titulo}</p>
            </div>
            {gestante && (
              <span className="rounded-full bg-white px-3 py-1 text-[13px] font-bold">{trimestre(semanas)}º trimestre</span>
            )}
          </div>

          {gestante ? (
            <div className="flex flex-col gap-1.5">
              {/* Só semanas inteiras: a data da triagem não permite precisão maior. */}
              <div
                role="progressbar"
                aria-label="Progresso da gestação"
                aria-valuemin={0}
                aria-valuemax={40}
                aria-valuenow={Math.min(semanas, 40)}
                aria-valuetext={`Semana ${semanas} de 40`}
                className="h-2.5 overflow-hidden rounded-full bg-white"
              >
                <div className="h-full rounded-full bg-rosa-600" style={{ width: `${Math.min(100, (semanas / 40) * 100)}%` }} />
              </div>
              <p className="flex justify-between text-[13px] font-semibold text-azul-700">
                <span>{semanas} de 40 semanas</span>
                <span>{semanas < 40 ? `faltam ${40 - semanas} semanas` : "reta final"}</span>
              </p>
            </div>
          ) : (
            <p className="text-[15px] leading-relaxed">{PERFIS[perfil.perfil].descricao}</p>
          )}

          {detalhes.length > 0 && (
            <ul className="flex flex-col gap-3 border-t border-white/70 pt-4">
              {detalhes.map((d) => (
                <Detalhe key={d.rotulo} {...d} />
              ))}
            </ul>
          )}

          <RefazerTriagem />
        </section>

        <div className="flex flex-col gap-5">
          {/* Conta: hierarquia secundária. */}
          <section aria-labelledby="titulo-conta" className="flex items-center gap-4 rounded-3xl bg-white p-4">
            <Avatar url={fotoUrl} nome={nome ?? email ?? "?"} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h2 id="titulo-conta" className="sr-only">
                Conta
              </h2>
              <p className="truncate font-bold">{nome ?? "Sem nome cadastrado"}</p>
              <p className="truncate text-sm text-suave">{email}</p>
              <span
                className={`self-start rounded-full px-2.5 py-0.5 text-[12px] font-bold ${plano === "premium" ? "bg-rosa-600 text-white" : "bg-azul-50 text-azul-700"}`}
              >
                <span className="sr-only">Plano: </span>
                {plano === "premium" ? "Premium" : "Gratuito"}
              </span>
            </div>
            {ficha && (
              <Link
                href="/app/perfil/editar"
                aria-label="Editar dados pessoais e foto"
                className="flex size-11 shrink-0 items-center justify-center rounded-xl text-azul-700 transition hover:bg-azul-50 focus-visible:outline-3 focus-visible:outline-rosa-600"
              >
                <Icone>{ICONES.lapis}</Icone>
              </Link>
            )}
          </section>

          {ficha && <CartaoFicha ficha={ficha} hoje={hoje} />}

          {/* Configurações: só ações que existem de verdade. */}
          <section aria-labelledby="titulo-privacidade" className="overflow-hidden rounded-3xl bg-white">
            <h2 id="titulo-privacidade" className="px-4 pb-1 pt-4 text-[13px] font-bold uppercase tracking-wide text-suave">
              Privacidade e dados
            </h2>
            <div className="divide-y divide-azul-50">
              {ficha && (
                <Link href="/app/perfil/editar" className={CLASSE_ITEM}>
                  <ConteudoItem
                    icone={<Icone>{ICONES.ficha}</Icone>}
                    titulo="Dados pessoais e de saúde"
                    descricao="Foto, tipo sanguíneo, peso, altura e contato de emergência"
                  />
                </Link>
              )}
              <ItemExportar icone={<Icone>{ICONES.baixar}</Icone>} />
              <Link href="/app/perfil/excluir" className={CLASSE_ITEM}>
                <ConteudoItem
                  icone={<Icone>{ICONES.lixeira}</Icone>}
                  titulo="Excluir conta e dados"
                  descricao="Apaga sua conta e tudo o que foi guardado, com confirmação"
                  tom="alerta"
                />
              </Link>
            </div>
          </section>

          <section aria-label="Sessão" className="overflow-hidden rounded-3xl bg-white">
            <ItemSair icone={<Icone>{ICONES.sair}</Icone>} />
          </section>
        </div>
      </div>
    </>
  );
}
