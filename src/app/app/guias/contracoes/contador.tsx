"use client";

import { useEffect, useState } from "react";
import { REGRA_IR_PARA_MATERNIDADE, TEXTOS_CONTRACOES } from "@/content/contracoes";
import { atingiuPadrao, comIntervalos, descartarAntigas, formatarDuracao, lerSalvas, resumoDoPeriodo, type Contracao } from "@/lib/contracoes";
import { FUSO } from "@/lib/datas";

// Os registros ficam só neste aparelho (localStorage): funcionam sem internet e
// não vão para o servidor. Somem sozinhos depois de 12 horas ou ao recomeçar.
const CHAVE = "ninna:contracoes";

function salvar(contracoes: Contracao[], emAndamento: number | null) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify({ contracoes, emAndamento }));
  } catch {
    // Armazenamento bloqueado (ex.: navegação privada): o contador segue só na memória.
  }
}

function hora(instante: number) {
  return new Date(instante).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: FUSO });
}

function Numero({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-2xl bg-white px-2 py-3 text-center">
      <span className="text-xl font-bold tabular-nums">{valor}</span>
      <span className="text-[12px] leading-tight text-suave">{rotulo}</span>
    </div>
  );
}

export function ContadorContracoes() {
  const [contracoes, setContracoes] = useState<Contracao[]>([]);
  const [emAndamento, setEmAndamento] = useState<number | null>(null);
  // O relógio só começa no navegador (o horário do servidor não serve para a tela).
  const [agora, setAgora] = useState(0);
  const [carregado, setCarregado] = useState(false);
  const [apagando, setApagando] = useState(false);

  // Recupera o que estava salvo (ex.: a tela recarregou no meio de uma contração).
  useEffect(() => {
    let salvo: string | null = null;
    try {
      salvo = localStorage.getItem(CHAVE);
    } catch {}
    const dados = lerSalvas(salvo);
    const instante = Date.now();
    /* eslint-disable react-hooks/set-state-in-effect -- leitura única do armazenamento do aparelho */
    setAgora(instante);
    setContracoes(descartarAntigas(dados.contracoes, instante));
    setEmAndamento(dados.emAndamento);
    setCarregado(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Relógio: a cada segundo durante uma contração; a cada 15 s entre elas.
  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), emAndamento !== null ? 1000 : 15_000);
    return () => clearInterval(id);
  }, [emAndamento]);

  function alternar() {
    const instante = Date.now();
    setAgora(instante);
    navigator.vibrate?.(30);
    if (emAndamento === null) {
      setEmAndamento(instante);
      salvar(contracoes, instante);
    } else {
      const novas = descartarAntigas([...contracoes, { inicio: emAndamento, fim: instante }], instante);
      setContracoes(novas);
      setEmAndamento(null);
      salvar(novas, null);
    }
  }

  function desfazerUltima() {
    const novas = contracoes.slice(0, -1);
    setContracoes(novas);
    salvar(novas, emAndamento);
  }

  function recomecar() {
    setContracoes([]);
    setEmAndamento(null);
    setApagando(false);
    salvar([], null);
  }

  const resumo = resumoDoPeriodo(contracoes, agora);
  const padrao = atingiuPadrao(contracoes, agora);
  const lista = comIntervalos(contracoes).reverse();
  const ultima = lista[0];
  const contando = emAndamento !== null;

  return (
    <div className="flex flex-col gap-5">
      {padrao && (
        <section role="alert" className="flex flex-col gap-1.5 rounded-3xl bg-rosa-600 p-5 text-white">
          <h2 className="text-xl font-bold">{TEXTOS_CONTRACOES.padrao.titulo}</h2>
          <p className="text-[15px] leading-relaxed">{TEXTOS_CONTRACOES.padrao.texto}</p>
        </section>
      )}

      <div className="flex flex-col items-center gap-3 py-2">
        <button
          type="button"
          onClick={alternar}
          disabled={!carregado}
          className={`flex size-52 flex-col items-center justify-center gap-1 rounded-full text-white shadow-lg transition active:scale-95 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-rosa-600 disabled:opacity-60 ${
            contando ? "bg-azul-900" : "bg-rosa-600 hover:bg-rosa-700"
          }`}
        >
          <span className="text-[28px] font-bold">{contando ? "Parou" : "Começou"}</span>
          {contando ? (
            <span role="timer" className="text-lg font-semibold tabular-nums opacity-90">
              {formatarDuracao((agora - emAndamento) / 1000)}
            </span>
          ) : (
            <span className="px-6 text-center text-sm opacity-90">toque quando a contração começar</span>
          )}
        </button>
        <p aria-live="polite" className="min-h-6 text-center text-[15px] text-suave">
          {contando
            ? "Toque em Parou quando a barriga relaxar."
            : ultima
              ? `Última contração começou há ${formatarDuracao((agora - ultima.inicio) / 1000)}`
              : ""}
        </p>
      </div>

      <section aria-labelledby="titulo-hora" className="flex flex-col gap-2.5">
        <h2 id="titulo-hora" className="text-lg font-bold">
          Última hora
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <Numero rotulo="contrações" valor={String(resumo.quantidade)} />
          <Numero rotulo="duração média" valor={resumo.duracaoMediaSeg === null ? "–" : formatarDuracao(resumo.duracaoMediaSeg)} />
          <Numero rotulo="intervalo médio" valor={resumo.intervaloMedioSeg === null ? "–" : formatarDuracao(resumo.intervaloMedioSeg)} />
        </div>
        <p className="text-[13px] leading-relaxed text-suave">
          Referência para ir à maternidade: contrações de {REGRA_IR_PARA_MATERNIDADE.duracaoMinimaSeg / 60} minuto a cada{" "}
          {REGRA_IR_PARA_MATERNIDADE.intervaloMaximoMin} minutos ou menos, por {REGRA_IR_PARA_MATERNIDADE.periodoMin / 60} hora.{" "}
          {TEXTOS_CONTRACOES.orientacaoMedica}
        </p>
      </section>

      {lista.length > 0 && (
        <section aria-labelledby="titulo-registros" className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <h2 id="titulo-registros" className="text-lg font-bold">
              Registros
            </h2>
            <button type="button" onClick={desfazerUltima} className="flex h-11 items-center rounded-xl px-3 text-sm font-semibold text-azul-700 hover:bg-white">
              Desfazer última
            </button>
          </div>
          <table className="w-full overflow-hidden rounded-3xl bg-white text-left text-[15px]">
            <thead className="text-[12px] uppercase tracking-wide text-suave">
              <tr>
                <th scope="col" className="px-4 pb-1 pt-3 font-semibold">
                  Início
                </th>
                <th scope="col" className="px-4 pb-1 pt-3 font-semibold">
                  Duração
                </th>
                <th scope="col" className="px-4 pb-1 pt-3 font-semibold">
                  Intervalo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-azul-50 tabular-nums">
              {lista.slice(0, 20).map((c) => (
                <tr key={c.inicio}>
                  <td className="px-4 py-2.5">{hora(c.inicio)}</td>
                  <td className="px-4 py-2.5">{formatarDuracao(c.duracaoSeg)}</td>
                  <td className="px-4 py-2.5 text-suave">{c.intervaloSeg === null ? "–" : formatarDuracao(c.intervaloSeg)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {apagando ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#fdecea] p-3">
              <span className="text-sm">Apagar todos os registros deste aparelho?</span>
              <span className="flex gap-2">
                <button type="button" onClick={recomecar} className="h-10 rounded-xl bg-alerta px-3 text-sm font-semibold text-white">
                  Apagar
                </button>
                <button type="button" onClick={() => setApagando(false)} className="h-10 rounded-xl bg-white px-3 text-sm font-semibold">
                  Voltar
                </button>
              </span>
            </div>
          ) : (
            <button type="button" onClick={() => setApagando(true)} className="flex h-11 items-center self-center rounded-xl px-3 text-sm font-semibold text-suave hover:bg-white">
              Recomeçar contagem
            </button>
          )}
        </section>
      )}
    </div>
  );
}
