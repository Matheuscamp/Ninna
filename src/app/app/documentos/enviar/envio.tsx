"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BotaoPrimario, Campo, CampoSelecao, CampoTextoLongo } from "@/components/ui";
import {
  ACCEPT_INPUT,
  CATEGORIAS,
  formatarTamanho,
  MAX_ARQUIVOS_POR_ENVIO,
  metadadosSchema,
  nomeSemExtensao,
  validarArquivo,
} from "@/lib/documentos";
import { descartarEnvio, prepararEnvio, registrarDocumento } from "../actions";
import { IconeEnvio, IconePdf } from "../icones";

type Estado = "pronto" | "enviando" | "concluido" | "erro";

type Item = {
  chave: string;
  arquivo: File;
  previa: string | null; // URL local da imagem (não sai do navegador)
  nome: string;
  categoria: string;
  dataDocumento: string;
  profissional: string;
  descricao: string;
  detalhes: boolean;
  estado: Estado;
  progresso: number;
  erro?: string;
};

// Envia o arquivo direto para o Storage pelo link de uso único, informando o progresso.
function enviarParaStorage(url: string, arquivo: File, aoProgredir: (pct: number) => void) {
  return new Promise<void>((resolver, rejeitar) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("content-type", arquivo.type);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("cache-control", "max-age=3600");
    const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (chave) xhr.setRequestHeader("apikey", chave);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) aoProgredir(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolver() : rejeitar(new Error(`status ${xhr.status}`)));
    xhr.onerror = () => rejeitar(new Error("rede"));
    xhr.send(arquivo);
  });
}

// `vagas`: quantos documentos ainda cabem no plano (null = Premium, ilimitado).
export function EnvioDocumentos({ vagas }: { vagas: number | null }) {
  const router = useRouter();
  const entrada = useRef<HTMLInputElement>(null);
  const [itens, setItens] = useState<Item[]>([]);
  const [recusados, setRecusados] = useState<{ nome: string; motivo: string }[]>([]);
  const [arrastando, setArrastando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const previas = useRef<string[]>([]);

  // Libera as prévias locais ao sair da tela.
  useEffect(() => () => previas.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const atualizar = (chave: string, patch: Partial<Item>) =>
    setItens((atual) => atual.map((i) => (i.chave === chave ? { ...i, ...patch } : i)));

  function adicionar(lista: FileList | null) {
    if (!lista) return;
    const novos: Item[] = [];
    const recusas: { nome: string; motivo: string }[] = [];
    // Dois limites: arquivos por envio e vagas do plano (os já enviados nesta tela também contam).
    const porEnvio = MAX_ARQUIVOS_POR_ENVIO - itens.filter((i) => i.estado !== "concluido").length;
    const doPlano = vagas === null ? Infinity : vagas - itens.length;
    for (const arquivo of Array.from(lista)) {
      const motivo = validarArquivo(arquivo);
      if (motivo) {
        recusas.push({ nome: arquivo.name, motivo });
        continue;
      }
      if (novos.length >= doPlano) {
        recusas.push({ nome: arquivo.name, motivo: "Não cabe mais no plano gratuito (até 10 documentos)." });
        continue;
      }
      if (novos.length >= porEnvio) {
        recusas.push({ nome: arquivo.name, motivo: `Envie até ${MAX_ARQUIVOS_POR_ENVIO} arquivos por vez.` });
        continue;
      }
      const previa = arquivo.type.startsWith("image/") ? URL.createObjectURL(arquivo) : null;
      if (previa) previas.current.push(previa);
      novos.push({
        chave: crypto.randomUUID(),
        arquivo,
        previa,
        nome: nomeSemExtensao(arquivo.name),
        categoria: "",
        dataDocumento: "",
        profissional: "",
        descricao: "",
        detalhes: false,
        estado: "pronto",
        progresso: 0,
      });
    }
    setItens((atual) => [...atual, ...novos]);
    setRecusados(recusas);
    if (entrada.current) entrada.current.value = "";
  }

  function remover(chave: string) {
    setItens((atual) => {
      const item = atual.find((i) => i.chave === chave);
      if (item?.previa) URL.revokeObjectURL(item.previa);
      return atual.filter((i) => i.chave !== chave);
    });
  }

  function categoriaParaTodos(valor: string) {
    if (!valor) return;
    setItens((atual) => atual.map((i) => (i.estado === "concluido" ? i : { ...i, categoria: valor })));
  }

  async function enviarUm(item: Item): Promise<boolean> {
    const metadados = {
      nome: item.nome,
      categoria: item.categoria,
      dataDocumento: item.dataDocumento,
      profissional: item.profissional,
      descricao: item.descricao,
    };
    const validacao = metadadosSchema.safeParse(metadados);
    if (!validacao.success) {
      atualizar(item.chave, { estado: "erro", erro: item.categoria ? "Confira o nome do documento." : "Escolha uma categoria." });
      return false;
    }

    atualizar(item.chave, { estado: "enviando", progresso: 0, erro: undefined });
    const preparo = await prepararEnvio({ nome: item.arquivo.name, tipo: item.arquivo.type, tamanho: item.arquivo.size }).catch(() => null);
    if (!preparo?.ok) {
      atualizar(item.chave, { estado: "erro", erro: preparo?.erro ?? "Sem conexão. Tente de novo." });
      return false;
    }

    try {
      await enviarParaStorage(preparo.url, item.arquivo, (pct) => atualizar(item.chave, { progresso: pct }));
    } catch {
      atualizar(item.chave, { estado: "erro", erro: "O envio foi interrompido. Confira sua internet e tente de novo." });
      return false;
    }

    // Nunca deixa a tela em "Conferindo…" para sempre: desiste em 45 s.
    const limite = new Promise<null>((resolver) => setTimeout(() => resolver(null), 45_000));
    const registro = await Promise.race([
      registrarDocumento({ caminho: preparo.caminho, nomeOriginal: item.arquivo.name, metadados: validacao.data }),
      limite,
    ]).catch(() => null);
    if (!registro?.ok) {
      if (!registro) await descartarEnvio(preparo.caminho).catch(() => undefined);
      atualizar(item.chave, { estado: "erro", erro: registro?.erro ?? "Não foi possível salvar. Tente de novo." });
      return false;
    }
    atualizar(item.chave, { estado: "concluido", progresso: 100 });
    return true;
  }

  async function enviarTodos() {
    const pendentes = itens.filter((i) => i.estado === "pronto" || i.estado === "erro");
    if (pendentes.length === 0) return;
    setEnviando(true);
    let enviados = 0;
    // Um por vez: mais estável em conexões móveis e o progresso fica claro.
    for (const item of pendentes) if (await enviarUm(item)) enviados++;
    setEnviando(false);
    if (enviados === pendentes.length) {
      router.push(`/app/documentos?ok=enviados&n=${enviados}`);
      router.refresh();
    }
  }

  const pendentes = itens.filter((i) => i.estado !== "concluido");
  const semCategoria = pendentes.some((i) => !i.categoria);

  return (
    <div className="flex flex-col gap-5">
      <label
        htmlFor="arquivos"
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          if (!enviando) adicionar(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center gap-3 rounded-3xl border-2 border-dashed px-5 py-8 text-center transition focus-within:border-rosa-600 ${
          arrastando ? "border-rosa-600 bg-rosa-50" : "border-rosa-300 bg-white hover:bg-rosa-50/60"
        }`}
      >
        <span className="flex size-14 items-center justify-center rounded-2xl bg-rosa-50 text-rosa-600">
          <IconeEnvio />
        </span>
        <span className="text-base font-bold">{arrastando ? "Solte os arquivos aqui" : "Arraste os arquivos ou toque para escolher"}</span>
        <span className="text-sm text-suave">
          JPG, PNG, WEBP ou PDF · até 10 MB cada · até {MAX_ARQUIVOS_POR_ENVIO} por vez
          {vagas !== null && ` · ${vagas === 1 ? "cabe mais 1 documento" : `cabem mais ${vagas} documentos`}`}
        </span>
        <input
          ref={entrada}
          id="arquivos"
          type="file"
          multiple
          accept={ACCEPT_INPUT}
          disabled={enviando}
          onChange={(e) => adicionar(e.target.files)}
          className="sr-only"
        />
      </label>

      {recusados.length > 0 && (
        <div role="alert" className="flex flex-col gap-1 rounded-2xl bg-rosa-50 p-4 text-sm text-rosa-700">
          <p className="font-bold">{recusados.length === 1 ? "1 arquivo não foi adicionado" : `${recusados.length} arquivos não foram adicionados`}</p>
          {recusados.map((r) => (
            <p key={r.nome}>
              <span className="font-semibold">{r.nome}</span>: {r.motivo}
            </p>
          ))}
        </div>
      )}

      {pendentes.length > 1 && (
        <CampoSelecao
          id="categoria-todos"
          rotulo="Categoria para todos (opcional)"
          opcoes={CATEGORIAS}
          vazio="Escolha para aplicar a todos"
          defaultValue=""
          disabled={enviando}
          onChange={(e) => categoriaParaTodos(e.target.value)}
        />
      )}

      {itens.length > 0 && (
        <ul className="flex flex-col gap-3">
          {itens.map((item) => {
            const bloqueado = enviando || item.estado === "concluido" || item.estado === "enviando";
            return (
              <li key={item.chave} className="flex flex-col gap-4 rounded-3xl bg-white/90 shadow-suave p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-azul-50 text-rosa-600">
                    {item.previa ? (
                      // eslint-disable-next-line @next/next/no-img-element -- prévia local (blob:), fora do otimizador de imagens
                      <img src={item.previa} alt="" className="size-full object-cover" />
                    ) : (
                      <IconePdf />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-semibold">{item.arquivo.name}</span>
                    <span className="text-[13px] text-suave">{formatarTamanho(item.arquivo.size)}</span>
                  </div>
                  {!bloqueado && (
                    <button
                      type="button"
                      onClick={() => remover(item.chave)}
                      aria-label={`Tirar ${item.arquivo.name} da lista`}
                      className="flex size-10 items-center justify-center rounded-xl text-suave hover:bg-azul-50"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {item.estado === "concluido" ? (
                  <p role="status" className="flex items-center gap-2 text-sm font-semibold text-azul-700">
                    ✓ Enviado com sucesso
                  </p>
                ) : (
                  <fieldset disabled={bloqueado} className="flex flex-col gap-3">
                    <legend className="sr-only">Informações de {item.arquivo.name}</legend>
                    <Campo
                      id={`nome-${item.chave}`}
                      rotulo="Nome do documento"
                      required
                      maxLength={120}
                      value={item.nome}
                      onChange={(e) => atualizar(item.chave, { nome: e.target.value })}
                    />
                    <CampoSelecao
                      id={`categoria-${item.chave}`}
                      rotulo="Categoria"
                      required
                      opcoes={CATEGORIAS}
                      vazio="Escolha uma categoria"
                      value={item.categoria}
                      onChange={(e) => atualizar(item.chave, { categoria: e.target.value })}
                    />
                    <button
                      type="button"
                      aria-expanded={item.detalhes}
                      onClick={() => atualizar(item.chave, { detalhes: !item.detalhes })}
                      className="self-start text-sm font-semibold text-rosa-600"
                    >
                      {item.detalhes ? "− Menos detalhes" : "+ Data, profissional e descrição (opcional)"}
                    </button>
                    {item.detalhes && (
                      <div className="flex flex-col gap-3">
                        <Campo
                          id={`data-${item.chave}`}
                          rotulo="Data do exame ou da vacina"
                          type="date"
                          value={item.dataDocumento}
                          onChange={(e) => atualizar(item.chave, { dataDocumento: e.target.value })}
                        />
                        <Campo
                          id={`prof-${item.chave}`}
                          rotulo="Profissional ou estabelecimento"
                          placeholder="Ex.: Laboratório Central, Dra. Ana"
                          maxLength={120}
                          value={item.profissional}
                          onChange={(e) => atualizar(item.chave, { profissional: e.target.value })}
                        />
                        <CampoTextoLongo
                          id={`desc-${item.chave}`}
                          rotulo="Descrição"
                          maxLength={500}
                          value={item.descricao}
                          onChange={(e) => atualizar(item.chave, { descricao: e.target.value })}
                        />
                      </div>
                    )}
                  </fieldset>
                )}

                {item.estado === "enviando" && (
                  <div className="flex flex-col gap-1">
                    <div
                      role="progressbar"
                      aria-label={`Enviando ${item.arquivo.name}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={item.progresso}
                      className="h-2 overflow-hidden rounded-full bg-linha"
                    >
                      <div className="h-full rounded-full bg-rosa-600 transition-all" style={{ width: `${item.progresso}%` }} />
                    </div>
                    <span className="text-[13px] text-suave">{item.progresso < 100 ? `Enviando… ${item.progresso}%` : "Conferindo o arquivo…"}</span>
                  </div>
                )}
                {item.estado === "erro" && (
                  <p role="alert" className="text-sm font-semibold text-alerta">
                    {item.erro}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {pendentes.length > 0 && (
        <div className="flex flex-col gap-2">
          {semCategoria && !enviando && <p className="text-center text-sm text-suave">Escolha a categoria de cada documento para enviar.</p>}
          <BotaoPrimario type="button" onClick={enviarTodos} disabled={enviando || semCategoria}>
            {enviando
              ? "Enviando…"
              : pendentes.length === 1
                ? "Enviar documento"
                : `Enviar ${pendentes.length} documentos`}
          </BotaoPrimario>
        </div>
      )}

      {itens.some((i) => i.estado === "concluido") && !enviando && (
        <Link href="/app/documentos" className="text-center font-semibold text-rosa-600">
          Ver meus documentos
        </Link>
      )}

      <p className="flex items-start gap-2 rounded-2xl bg-azul-50 p-4 text-[13px] leading-relaxed text-suave">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="mt-0.5 size-4 shrink-0 fill-none stroke-current" strokeWidth={2} strokeLinecap="round">
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
        Seus documentos ficam guardados de forma privada. Só você tem acesso, e os links para abrir ou baixar expiram em
        poucos segundos.
      </p>
    </div>
  );
}
