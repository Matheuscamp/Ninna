"use client";

import { useRef, useState, useTransition } from "react";
import { Avatar } from "../avatar";
import { enviarFoto, removerFoto } from "./actions";

const LADO = 512;

// Recorta no centro (quadrado), reduz para 512 px e regrava em JPEG.
// Regravar descarta os metadados da câmera, inclusive a localização (GPS).
async function prepararFoto(arquivo: File): Promise<Blob> {
  const imagem = await createImageBitmap(arquivo);
  const lado = Math.min(imagem.width, imagem.height);
  const tela = document.createElement("canvas");
  tela.width = LADO;
  tela.height = LADO;
  const contexto = tela.getContext("2d");
  if (!contexto) throw new Error("sem canvas");
  contexto.drawImage(imagem, (imagem.width - lado) / 2, (imagem.height - lado) / 2, lado, lado, 0, 0, LADO, LADO);
  imagem.close();
  return new Promise((resolver, rejeitar) => tela.toBlob((b) => (b ? resolver(b) : rejeitar(new Error("falha"))), "image/jpeg", 0.85));
}

export function EditorFoto({ urlInicial, nome }: { urlInicial: string | null; nome: string }) {
  const entrada = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(urlInicial);
  const [aviso, setAviso] = useState<{ texto: string; erro?: boolean } | null>(null);
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false);
  const [pendente, iniciar] = useTransition();

  function escolher(arquivo: File | undefined) {
    if (!arquivo) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) {
      setAviso({ texto: "Escolha uma foto em JPG, PNG ou WEBP.", erro: true });
      return;
    }
    setAviso(null);
    iniciar(async () => {
      try {
        const foto = await prepararFoto(arquivo);
        const dados = new FormData();
        dados.set("foto", foto, "foto.jpg");
        const r = await enviarFoto(dados);
        if (r.ok) {
          setUrl(r.url);
          setAviso({ texto: "Foto atualizada." });
        } else setAviso({ texto: r.erro, erro: true });
      } catch {
        setAviso({ texto: "Não foi possível ler essa foto. Tente outra.", erro: true });
      } finally {
        if (entrada.current) entrada.current.value = "";
      }
    });
  }

  function remover() {
    setConfirmandoRemocao(false);
    iniciar(async () => {
      const r = await removerFoto();
      if (r.ok) {
        setUrl(null);
        setAviso({ texto: "Foto removida." });
      } else setAviso({ texto: r.erro, erro: true });
    });
  }

  return (
    <section aria-labelledby="titulo-foto" className="flex items-center gap-4 rounded-3xl bg-white p-4">
      <div className="relative">
        <Avatar url={url} nome={nome} tamanho="size-20" texto="text-3xl" />
        {pendente && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70 text-[12px] font-bold text-rosa-700">
            Salvando…
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h2 id="titulo-foto" className="font-bold">
          Foto de perfil
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <label
            className={`flex h-10 cursor-pointer items-center rounded-xl bg-rosa-50 px-3.5 text-sm font-semibold text-rosa-700 transition hover:bg-rosa-100 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-rosa-600 ${pendente ? "pointer-events-none opacity-60" : ""}`}
          >
            {url ? "Trocar foto" : "Adicionar foto"}
            <input
              ref={entrada}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={pendente}
              onChange={(e) => escolher(e.target.files?.[0])}
              className="sr-only"
            />
          </label>
          {url &&
            (confirmandoRemocao ? (
              <span className="flex items-center gap-1">
                <button type="button" onClick={remover} className="h-10 rounded-xl bg-alerta px-3 text-sm font-semibold text-white">
                  Sim, remover
                </button>
                <button type="button" onClick={() => setConfirmandoRemocao(false)} className="h-10 rounded-xl px-3 text-sm font-semibold text-suave">
                  Não
                </button>
              </span>
            ) : (
              <button
                type="button"
                disabled={pendente}
                onClick={() => setConfirmandoRemocao(true)}
                className="h-10 rounded-xl px-3 text-sm font-semibold text-suave transition hover:bg-azul-50 hover:text-alerta"
              >
                Remover
              </button>
            ))}
        </div>
        <p role="status" aria-live="polite" className={`text-[13px] ${aviso?.erro ? "font-semibold text-alerta" : aviso ? "font-semibold text-azul-700" : "text-suave"}`}>
          {aviso?.texto ?? "JPG, PNG ou WEBP. A foto é recortada em quadrado e a localização da câmera é removida."}
        </p>
      </div>
    </section>
  );
}
