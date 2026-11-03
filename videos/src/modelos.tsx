import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { NomeIlustracao } from "../../src/components/ilustracoes";
import { Som } from "./motor";
import { Bolha, Cartao, Entra, Explosao, Flutua, Ilustracao, Logo, Ondas, Pop, SUAVE, TituloAnimado } from "./pecas";
import { COR, SOMBRA_ROSA, SOMBRA_SUAVE } from "./tema";
import { ANTES, type Cena } from "./tempo";

// Modelos de cena reutilizáveis. Cada vídeo (src/videos/) escolhe um modelo por cena
// e diz em que palavra da fala cada elemento entra ("gatilho").

const preso = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Palavra falada que dispara a animação: "palavra" (1ª vez que aparece) ou ["palavra", 2].
export type Gatilho = string | [string, number];
const quadro = (dados: Cena, g: Gatilho) => (Array.isArray(g) ? dados.quando(g[0], g[1]) : dados.quando(g));

export type Tom = "branco" | "rosa" | "rosaForte" | "lilas" | "menta" | "pessego" | "baunilha" | "azul" | "alertaClaro" | "alerta";
// Texto branco só sobre rosa-600 e alerta (CLAUDE.md, "Design system").
const TONS: Record<Tom, { fundo: string; cor: string }> = {
  branco: { fundo: "rgba(255,255,255,0.94)", cor: COR.tinta },
  rosa: { fundo: COR.rosa100, cor: COR.tinta },
  rosaForte: { fundo: COR.rosa600, cor: COR.branco },
  lilas: { fundo: COR.lilas, cor: COR.tinta },
  menta: { fundo: COR.menta, cor: COR.tinta },
  pessego: { fundo: COR.pessego, cor: COR.tinta },
  baunilha: { fundo: COR.baunilha, cor: COR.tinta },
  azul: { fundo: COR.azul100, cor: COR.tinta },
  alertaClaro: { fundo: COR.alerta50, cor: COR.alerta900 },
  alerta: { fundo: COR.alerta, cor: COR.branco },
};

export type NomeSimbolo = "evitar" | "ok" | "alerta" | "relogio" | "termometro" | "seringa" | "escudo" | "gotinha" | "olho" | "cabeca" | "copo" | "balanca" | "pressao" | "telefone";
export type Icone = { ilustracao: NomeIlustracao } | { simbolo: NomeSimbolo } | { numero: string };

export type Item = { de: Gatilho; rotulo: string; detalhe?: string; icone?: Icone; tom?: Tom };

// Símbolos de traço que as ilustrações do app não cobrem. Alguns se mexem (relógio, termômetro, medidor).
export function Simbolo({ nome, tamanho = 110 }: { nome: NomeSimbolo; tamanho?: number }) {
  const frame = useCurrentFrame();
  const traco = { stroke: COR.rosa600, strokeWidth: 4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  const desenhos: Record<NomeSimbolo, ReactNode> = {
    evitar: (
      <>
        <circle cx="24" cy="24" r="19" stroke={COR.rosa600} strokeWidth="5" fill={COR.branco} />
        <path d="M11 37L37 11" stroke={COR.rosa600} strokeWidth="5" strokeLinecap="round" />
      </>
    ),
    ok: (
      <>
        <circle cx="24" cy="24" r="21" fill={COR.verde} />
        <path d="M14 25l7 7 13-15" stroke={COR.branco} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>
    ),
    alerta: (
      <>
        <path d="M24 5L45 41H3Z" fill={COR.alerta} stroke={COR.alerta} strokeWidth="4" strokeLinejoin="round" />
        <path d="M24 17v12" stroke={COR.branco} strokeWidth="5" strokeLinecap="round" />
        <circle cx="24" cy="35" r="2.8" fill={COR.branco} />
      </>
    ),
    relogio: (
      <>
        <circle cx="24" cy="24" r="19" {...traco} fill={COR.branco} />
        <path d={`M24 24L${24 + Math.sin(frame / 6) * 12} ${24 - Math.cos(frame / 6) * 12}`} {...traco} />
        <path d={`M24 24L${24 + Math.sin(frame / 72) * 8} ${24 - Math.cos(frame / 72) * 8}`} {...traco} strokeWidth={5} />
      </>
    ),
    termometro: (
      <>
        <rect x="18" y="4" width="12" height="30" rx="6" {...traco} fill={COR.branco} />
        <circle cx="24" cy="36" r="8" fill={COR.alerta} />
        <rect x="21.5" y={30 - interpolate(Math.sin(frame / 14), [-1, 1], [6, 22])} width="5" height={interpolate(Math.sin(frame / 14), [-1, 1], [6, 22])} rx="2.5" fill={COR.alerta} />
      </>
    ),
    seringa: (
      <g transform="rotate(-45 24 24)">
        <rect x="16" y="14" width="16" height="22" rx="3" fill={COR.azul100} stroke={COR.azul700} strokeWidth="3.5" />
        <path d="M24 14V6M18 6h12M24 36v8" stroke={COR.azul700} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M18 22h6M18 28h6" stroke={COR.rosa600} strokeWidth="3" strokeLinecap="round" />
      </g>
    ),
    escudo: (
      <>
        <path d="M24 4l17 6v12c0 11-8 18-17 22C15 40 7 33 7 22V10z" fill={COR.azul700} />
        <path d="M16 24l6 6 11-12" stroke={COR.branco} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>
    ),
    gotinha: (
      <>
        <path d="M24 5C17 16 11 23 11 30a13 13 0 0 0 26 0c0-7-6-14-13-25z" fill={COR.azul100} stroke={COR.azul700} strokeWidth="3.5" />
        <path d="M18 31a6 6 0 0 0 5 6" stroke={COR.branco} strokeWidth="3" strokeLinecap="round" fill="none" />
      </>
    ),
    olho: (
      <>
        <path d="M4 24s8-13 20-13 20 13 20 13-8 13-20 13S4 24 4 24z" {...traco} fill={COR.branco} />
        <circle cx="24" cy="24" r="7" fill={COR.rosa600} />
        <circle cx={26 + Math.sin(frame / 10) * 1.5} cy="22" r="2" fill={COR.branco} />
      </>
    ),
    cabeca: (
      <>
        <circle cx="24" cy="26" r="15" {...traco} fill={COR.branco} />
        <path d="M8 10l4 3-3 3 4 3M40 10l-4 3 3 3-4 3" stroke={COR.alerta} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.6 + 0.4 * Math.sin(frame / 4)} />
        <path d="M18 30c4-3 8-3 12 0" {...traco} />
      </>
    ),
    copo: (
      <>
        <path d="M11 8h26l-4 34H15z" fill={COR.azul50} stroke={COR.azul700} strokeWidth="3.5" strokeLinejoin="round" />
        <rect x="17" y={18 + Math.sin(frame / 12) * 2} width="7" height="7" rx="1.5" fill={COR.azul100} stroke={COR.azul700} strokeWidth="2" />
        <rect x="25" y={24 - Math.sin(frame / 12) * 2} width="7" height="7" rx="1.5" fill={COR.azul100} stroke={COR.azul700} strokeWidth="2" />
      </>
    ),
    balanca: (
      <>
        <rect x="6" y="14" width="36" height="28" rx="8" {...traco} fill={COR.branco} />
        <path d="M14 26a10 10 0 0 1 20 0" {...traco} />
        <path d={`M24 26L${24 + Math.sin(Math.sin(frame / 15)) * 8} 19`} {...traco} />
      </>
    ),
    pressao: (
      <>
        <path d="M6 32a18 18 0 0 1 36 0" fill="none" stroke={COR.menta} strokeWidth="7" />
        <path d="M33 17a18 18 0 0 1 9 15" fill="none" stroke={COR.alerta} strokeWidth="7" />
        <path d={`M24 32L${24 + Math.cos(Math.PI + interpolate(Math.sin(frame / 18), [-1, 1], [0.6, 2.6])) * 14} ${32 + Math.sin(Math.PI + interpolate(Math.sin(frame / 18), [-1, 1], [0.6, 2.6])) * 14}`} stroke={COR.tinta} strokeWidth="4" strokeLinecap="round" />
        <circle cx="24" cy="32" r="3.5" fill={COR.tinta} />
      </>
    ),
    telefone: (
      <path d="M14 6l7 8-4 5c2 5 6 9 11 11l5-4 8 7-4 6C24 39 9 24 8 10z" fill={COR.alerta} transform={`rotate(${Math.sin(frame / 2) * 6} 24 24)`} />
    ),
  };
  return (
    <svg viewBox="0 0 48 48" width={tamanho} height={tamanho} style={{ flexShrink: 0, overflow: "visible" }}>
      {desenhos[nome]}
    </svg>
  );
}

export function IconeItem({ icone, tamanho = 110 }: { icone: Icone; tamanho?: number }) {
  if ("ilustracao" in icone) return <Ilustracao nome={icone.ilustracao} tamanho={tamanho * 1.15} />;
  if ("simbolo" in icone) return <Simbolo nome={icone.simbolo} tamanho={tamanho} />;
  return (
    <div style={{ minWidth: tamanho * 0.8, height: tamanho * 0.8, padding: "0 14px", borderRadius: 999, background: COR.rosa600, color: COR.branco, display: "flex", alignItems: "center", justifyContent: "center", fontSize: tamanho * 0.38, fontWeight: 800, flexShrink: 0 }}>
      {icone.numero}
    </div>
  );
}

function CartaoItem({ item, compacto = false }: { item: Item; compacto?: boolean }) {
  const tom = TONS[item.tom ?? "branco"];
  const escuro = item.tom === "alerta" || item.tom === "rosaForte";
  return (
    <Cartao fundo={tom.fundo} cor={tom.cor} style={{ padding: compacto ? "22px 32px" : "30px 38px", gap: 28 }}>
      {item.icone && (
        <Flutua amplitude={6}>
          {/* Nos cartões escuros, o ícone fica numa bolinha branca para não sumir no fundo. */}
          <div style={escuro ? { background: COR.branco, borderRadius: "50%", padding: 10, display: "flex" } : undefined}>
            <IconeItem icone={item.icone} tamanho={compacto ? 84 : 104} />
          </div>
        </Flutua>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {item.detalhe && <span style={{ fontSize: 36, fontWeight: 700, opacity: 0.8 }}>{item.detalhe}</span>}
        <span style={{ fontSize: compacto ? 44 : 48, fontWeight: 800, lineHeight: 1.18 }}>{item.rotulo}</span>
      </div>
    </Cartao>
  );
}

// Lista de cartões que entram junto com a fala (deslizando da direita ou com "pop").
// `alerta`: selo "Atenção" que balança e som de aviso.
function ListaDeCartoes({ dados, itens, entrada = "direita", compacto }: { dados: Cena; itens: Item[]; entrada?: "direita" | "pop"; compacto?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compacto ? 20 : 26, width: "100%" }}>
      {itens.map((item, i) => {
        const de = quadro(dados, item.de) - 6;
        return (
          <div key={i}>
            <Som nome={entrada === "pop" ? "pop" : "whoosh"} de={de} volume={entrada === "pop" ? 0.4 : 0.22} />
            {entrada === "pop" ? (
              <Pop de={de}>
                <CartaoItem item={item} compacto={compacto} />
              </Pop>
            ) : (
              <Entra de={de} direcao="direita" distancia={240}>
                <CartaoItem item={item} compacto={compacto} />
              </Entra>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SeloAtencao({ texto = "Atenção" }: { texto?: string }) {
  const frame = useCurrentFrame();
  return (
    <>
      <Som nome="aviso" de={4} volume={0.45} />
      <Pop de={2}>
        <span style={{ display: "inline-block", rotate: `${Math.sin(frame * 1.4) * interpolate(frame, [2, 20], [7, 0], preso)}deg`, fontSize: 48, fontWeight: 800, color: COR.branco, background: COR.alerta, borderRadius: 999, padding: "16px 42px" }}>{texto}</span>
      </Pop>
    </>
  );
}

// ——— Modelos ———

// Abertura: título palavra por palavra, ilustração grande que flutua e pulsa, bolhas
// que aparecem em volta e um selo no fim.
export function Abertura({
  dados,
  titulo,
  destaques = [],
  ilustracao,
  fundo = COR.rosa100,
  ondas = [],
  orbitas = [],
  selo,
  batida = false,
}: {
  dados: Cena;
  titulo: string;
  destaques?: string[];
  ilustracao: NomeIlustracao;
  fundo?: string;
  ondas?: Gatilho[];
  orbitas?: { de: Gatilho; icone: Icone }[];
  selo?: { de: Gatilho; texto: string; icone?: Icone };
  batida?: boolean;
}) {
  const frame = useCurrentFrame();
  const quadrosOndas = ondas.map((g) => quadro(dados, g));
  const tranco = quadrosOndas.reduce((soma, q) => soma + Math.max(0, 1 - Math.abs(frame - q - 3) / 6), 0);
  const posicoes = [
    { left: -30, top: -10 },
    { right: -30, top: 10 },
    { left: 0, bottom: -20 },
    { right: 0, bottom: -30 },
  ];
  return (
    <>
      {batida && <Som nome="coracao" de={2} volume={0.55} />}
      {quadrosOndas.map((q) => (
        <Som key={q} nome="pop" de={q} volume={0.4} />
      ))}
      <TituloAnimado texto={titulo} de={4} tamanho={80} destaque={destaques} />
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Ondas quadros={quadrosOndas} tamanho={440} />
        <Pop de={8}>
          <Flutua amplitude={12}>
            <div style={{ width: 440, height: 440, borderRadius: "50%", background: fundo, boxShadow: SOMBRA_ROSA, display: "flex", alignItems: "center", justifyContent: "center", scale: `${1 + Math.max(0, Math.sin(frame / 5.5)) ** 10 * 0.04}` }}>
              <div style={{ translate: `${tranco * 24}px ${-tranco * 12}px`, rotate: `${Math.sin(frame / 18) * 6 + tranco * 10}deg` }}>
                <Ilustracao nome={ilustracao} tamanho={330} />
              </div>
            </div>
          </Flutua>
        </Pop>
        {orbitas.map((o, i) => (
          <div key={i} style={{ position: "absolute", ...posicoes[i % posicoes.length] }}>
            <Som nome="pop" de={quadro(dados, o.de) - 2} volume={0.35} />
            <Pop de={quadro(dados, o.de) - 2}>
              <Flutua fase={i * 1.7}>
                <div style={{ width: 160, height: 160, borderRadius: "50%", background: COR.branco, boxShadow: SOMBRA_SUAVE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconeItem icone={o.icone} tamanho={104} />
                </div>
              </Flutua>
            </Pop>
          </div>
        ))}
      </div>
      {selo && (
        <>
          <Som nome="pop" de={quadro(dados, selo.de) - 4} volume={0.4} />
          <Pop de={quadro(dados, selo.de) - 4}>
            <Cartao style={{ padding: "22px 38px" }}>
              {selo.icone && <IconeItem icone={selo.icone} tamanho={84} />}
              <span style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.2 }}>{selo.texto}</span>
            </Cartao>
          </Pop>
        </>
      )}
    </>
  );
}

// Lista: título e cartões que entram no momento em que são falados.
export function Lista({ dados, titulo, destaques = [], itens, alerta = false, entrada, compacto }: { dados: Cena; titulo: string; destaques?: string[]; itens: Item[]; alerta?: boolean; entrada?: "direita" | "pop"; compacto?: boolean }) {
  return (
    <>
      {alerta && <SeloAtencao />}
      <TituloAnimado texto={titulo} de={alerta ? 8 : 2} tamanho={74} destaque={destaques} />
      <ListaDeCartoes dados={dados} itens={itens} entrada={entrada} compacto={compacto ?? itens.length > 3} />
    </>
  );
}

// Grade: cartões que viram como cartas, cada um no momento em que é falado.
export function Grade({ dados, titulo, destaques = [], itens, rodape }: { dados: Cena; titulo: string; destaques?: string[]; itens: Item[]; rodape?: Item }) {
  const frame = useCurrentFrame();
  return (
    <>
      <TituloAnimado texto={titulo} de={2} tamanho={70} destaque={destaques} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, width: "100%", perspective: 1400 }}>
        {itens.map((item, i) => {
          const de = quadro(dados, item.de) - 4;
          const tom = TONS[item.tom ?? (["baunilha", "azul", "lilas", "pessego"] as const)[i % 4]];
          const sozinho = itens.length % 2 === 1 && i === itens.length - 1;
          return (
            <div key={i} style={{ gridColumn: sozinho ? "span 2" : undefined, transform: `rotateY(${interpolate(frame, [de, de + 16], [90, 0], { ...preso, easing: SUAVE })}deg)`, opacity: frame >= de ? 1 : 0 }}>
              <Som nome="pop" de={de} volume={0.35} />
              <Cartao fundo={tom.fundo} cor={tom.cor} style={{ flexDirection: sozinho ? "row" : "column", gap: 14, minHeight: sozinho ? 0 : 290, justifyContent: "center", textAlign: sozinho ? "left" : "center", padding: "26px 22px" }}>
                {item.icone && (
                  <Flutua amplitude={7} fase={i}>
                    <IconeItem icone={item.icone} tamanho={110} />
                  </Flutua>
                )}
                <span style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.18 }}>{item.rotulo}</span>
              </Cartao>
            </div>
          );
        })}
      </div>
      {rodape && <ListaDeCartoes dados={dados} itens={[rodape]} entrada="pop" />}
    </>
  );
}

// Linha do tempo da gestação (0 a 40 semanas): marcadores que deslizam até a semana,
// faixas que se preenchem e grupos de bolinhas (consultas) que vão aparecendo.
export function Linha({
  dados,
  titulo,
  destaques = [],
  marcos = [],
  faixas = [],
  grupos = [],
  itens = [],
}: {
  dados: Cena;
  titulo: string;
  destaques?: string[];
  marcos?: { de: Gatilho; semana: number; rotulo: string; ilustracao?: NomeIlustracao }[];
  faixas?: { de: Gatilho; inicio: number; fim: number; rotulo: string }[];
  grupos?: { de: Gatilho; ate: Gatilho; semanas: number[]; rotulo: string }[];
  itens?: Item[];
}) {
  const frame = useCurrentFrame();
  const x = (semana: number) => `${(semana / 40) * 100}%`;
  const ticks = [0, 12, 20, 28, 36, 40];
  return (
    <>
      <TituloAnimado texto={titulo} de={2} tamanho={74} destaque={destaques} />
      <Entra de={6} style={{ width: "100%" }}>
        <Cartao style={{ flexDirection: "column", alignItems: "stretch", gap: 18, padding: "40px 46px 34px" }}>
          <div style={{ position: "relative", height: 150 }}>
            {marcos.map((m, i) => {
              const de = quadro(dados, m.de) - 4;
              const p = interpolate(frame, [de, de + 24], [0, 1], { ...preso, easing: SUAVE });
              return (
                <div key={i} style={{ position: "absolute", bottom: 0, left: `${(m.semana / 40) * 100 * p}%`, translate: "-50% 0", opacity: interpolate(frame, [de, de + 6], [0, 1], preso), display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <Som nome="whoosh" de={de} volume={0.22} />
                  <span style={{ fontSize: 30, fontWeight: 800, color: COR.rosa700, whiteSpace: "nowrap", opacity: p }}>{m.rotulo}</span>
                  <Bolha nome={m.ilustracao ?? "bebe"} tamanho={92} fundo={COR.rosa100} />
                </div>
              );
            })}
            {faixas.map((f, i) => {
              const de = quadro(dados, f.de) - 2;
              return (
                f.rotulo && <div key={i} style={{ position: "absolute", bottom: 10, left: x(f.inicio), width: `${((f.fim - f.inicio) / 40) * 100}%`, display: "flex", justifyContent: "center", opacity: interpolate(frame, [de + 10, de + 20], [0, 1], preso) }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: COR.rosa700, whiteSpace: "nowrap" }}>{f.rotulo}</span>
                </div>
              );
            })}
            {grupos.map((g, i) => {
              const de = quadro(dados, g.de) - 2;
              const inicio = Math.min(...g.semanas);
              const fim = Math.max(...g.semanas);
              return (
                <div key={i} style={{ position: "absolute", bottom: 10 + (i % 2) * 56, left: x((inicio + fim) / 2), translate: "-50% 0", opacity: interpolate(frame, [de, de + 8], [0, 1], preso) }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: COR.rosa700, whiteSpace: "nowrap" }}>{g.rotulo}</span>
                </div>
              );
            })}
          </div>
          <div style={{ position: "relative", height: 30, borderRadius: 999, background: COR.rosa50 }}>
            {faixas.map((f, i) => {
              const de = quadro(dados, f.de) - 2;
              const p = interpolate(frame, [de, de + 20], [0, 1], { ...preso, easing: SUAVE });
              return <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: x(f.inicio), width: `${((f.fim - f.inicio) / 40) * 100 * p}%`, borderRadius: 999, background: COR.rosa600 }} />;
            })}
            {grupos.flatMap((g, gi) => {
              const de = quadro(dados, g.de);
              const ate = quadro(dados, g.ate);
              return g.semanas.map((s, i) => {
                const aparece = Math.round(interpolate(i, [0, Math.max(1, g.semanas.length - 1)], [de, ate]));
                return (
                  <div key={`${gi}-${s}`} style={{ position: "absolute", top: -7, left: x(s), translate: "-50% 0", width: 44, height: 44, borderRadius: "50%", background: COR.rosa600, border: `5px solid ${COR.branco}`, boxShadow: SOMBRA_ROSA, scale: `${interpolate(frame, [aparece, aparece + 5, aparece + 10], [0, 1.3, 1], preso)}` }}>
                    {i === 0 && <Som nome="pop" de={aparece} volume={0.3} />}
                  </div>
                );
              });
            })}
          </div>
          <div style={{ position: "relative", height: 40 }}>
            {ticks.map((t) => (
              <span key={t} style={{ position: "absolute", left: x(t), translate: "-50% 0", fontSize: 28, fontWeight: 700, color: COR.suave }}>
                {t}
              </span>
            ))}
          </div>
          <span style={{ fontSize: 28, fontWeight: 700, color: COR.suave, textAlign: "center" }}>semanas de gestação</span>
        </Cartao>
      </Entra>
      {itens.length > 0 && <ListaDeCartoes dados={dados} itens={itens} compacto />}
    </>
  );
}

// Número em destaque, com ondas pulsando e cartões abaixo.
export function Numero({ dados, titulo, numero, de, legenda, tom = "rosa", itens = [] }: { dados: Cena; titulo?: string; numero: string; de: Gatilho; legenda: string; tom?: "rosa" | "alerta"; itens?: Item[] }) {
  const frame = useCurrentFrame();
  const q = quadro(dados, de) - 4;
  const cor = tom === "alerta" ? COR.alerta : COR.rosa600;
  return (
    <>
      {tom === "alerta" && <Som nome="aviso" de={q} volume={0.45} />}
      <Som nome={tom === "alerta" ? "pop" : "ding"} de={q} volume={0.35} />
      {titulo && <TituloAnimado texto={titulo} de={2} tamanho={74} />}
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Ondas quadros={[q, q + 28, q + 56]} cor={cor} tamanho={380} />
        <Explosao de={q} cor={cor} />
        <Pop de={q}>
          <div style={{ width: 380, height: 380, borderRadius: "50%", background: COR.branco, border: `16px solid ${cor}`, boxShadow: SOMBRA_SUAVE, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", scale: `${1 + Math.max(0, Math.sin((frame - q) / 6)) ** 6 * 0.04}` }}>
            <span style={{ fontSize: numero.length > 3 ? 104 : 140, fontWeight: 800, color: cor, lineHeight: 1, letterSpacing: -3 }}>{numero}</span>
            <span style={{ fontSize: 30, fontWeight: 700, color: COR.suave, textAlign: "center", maxWidth: 280, marginTop: 10 }}>{legenda}</span>
          </div>
        </Pop>
      </div>
      {itens.length > 0 && <ListaDeCartoes dados={dados} itens={itens} entrada="pop" compacto />}
    </>
  );
}

// Gráfico de contrações que se desenha durante a cena: "treino" (baixas e irregulares)
// ou "ativa" (fortes e regulares).
export function Contracoes({ dados, titulo, destaques = [], tipo, itens = [] }: { dados: Cena; titulo: string; destaques?: string[]; tipo: "treino" | "ativa"; itens?: Item[] }) {
  const frame = useCurrentFrame();
  const largura = 860;
  const altura = 260;
  const picos = tipo === "ativa" ? [80, 210, 340, 470, 600, 730].map((x) => ({ x, h: 200, w: 70 })) : [{ x: 90, h: 70, w: 60 }, { x: 330, h: 105, w: 70 }, { x: 420, h: 55, w: 50 }, { x: 690, h: 90, w: 65 }];
  const pontos = Array.from({ length: 200 }, (_, i) => {
    const px = (i / 199) * largura;
    const y = picos.reduce((soma, p) => soma + p.h * Math.exp(-(((px - p.x) / (p.w / 2)) ** 2)), 0);
    return [px, altura - 20 - y] as const;
  });
  const p = interpolate(frame, [ANTES, dados.duracao - 24], [0, 1], preso);
  const visiveis = pontos.slice(0, Math.max(2, Math.round(p * pontos.length)));
  const [ux, uy] = visiveis[visiveis.length - 1];
  const cor = tipo === "ativa" ? COR.rosa600 : COR.rosa300;
  return (
    <>
      <TituloAnimado texto={titulo} de={2} tamanho={74} destaque={destaques} />
      <Entra de={6} style={{ width: "100%" }}>
        <Cartao style={{ justifyContent: "center", padding: "30px 20px" }}>
          <svg width={largura} height={altura} viewBox={`0 0 ${largura} ${altura}`}>
            <line x1="0" y1={altura - 20} x2={largura} y2={altura - 20} stroke={COR.linha} strokeWidth="4" />
            <polyline points={visiveis.map(([a, b]) => `${a},${b}`).join(" ")} fill="none" stroke={cor} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={ux} cy={uy} r={14 + Math.sin(frame / 4) * 3} fill={cor} />
          </svg>
        </Cartao>
      </Entra>
      {itens.length > 0 && <ListaDeCartoes dados={dados} itens={itens} compacto />}
    </>
  );
}

// Encerramento: logo com mola, chuva de corações, frase e (opcional) o recado final em destaque.
export function Fim({ dados, frase, destaques = [], de, final, fonte }: { dados: Cena; frase: string; destaques?: string[]; de: Gatilho; final?: { de: Gatilho; texto: string }; fonte: string }) {
  const frame = useCurrentFrame();
  const qFrase = quadro(dados, de) - 4;
  const qFinal = final ? quadro(dados, final.de) - 2 : qFrase;
  const qNota = Math.min(qFinal + 24, dados.duracao - 70);
  return (
    <>
      <Som nome="ding" de={qFinal} volume={0.4} />
      <div style={{ position: "relative" }}>
        <Explosao de={6} quantidade={20} raio={380} />
        {final && <Explosao de={qFinal} quantidade={24} raio={460} />}
        <Pop de={4}>
          <div style={{ rotate: `${Math.sin(frame / 12) * 4}deg` }}>
            <Logo tamanho={260} />
          </div>
        </Pop>
      </div>
      <TituloAnimado texto={frase} de={qFrase} tamanho={68} destaque={destaques} intervalo={2} />
      {final && (
        <Pop de={qFinal}>
          <span style={{ display: "block", fontSize: final.texto.length > 16 ? 74 : 100, fontWeight: 800, color: COR.rosa600, letterSpacing: -2, textAlign: "center", lineHeight: 1.05 }}>{final.texto}</span>
        </Pop>
      )}
      <div style={{ opacity: interpolate(frame, [qNota, qNota + 14], [0, 1], preso), fontSize: 28, fontWeight: 500, color: COR.suave, textAlign: "center", lineHeight: 1.45, maxWidth: 880 }}>
        Fonte: {fonte}.
        <br />
        Narração gerada por computador. Conteúdo em revisão por profissional de saúde.
      </div>
    </>
  );
}

