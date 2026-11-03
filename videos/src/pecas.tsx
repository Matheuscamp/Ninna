import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ILUSTRACOES, type NomeIlustracao } from "../../src/components/ilustracoes";
import logo from "../../public/ninna-logo.svg";
import { COR, FONTE, SOMBRA_SUAVE } from "./tema";

// Peças visuais e de movimento dos vídeos, no mesmo padrão do app (CLAUDE.md, "Design system").

const preso = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const SUAVE = Easing.bezier(0.16, 1, 0.3, 1);

// Degradê rosa → azul com formas desfocadas que flutuam e partículas (bolinhas e
// coraçõezinhos) subindo devagar.
export function Fundo({ children }: { children: ReactNode }) {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const flutua = (fase: number, amplitude = 40) => Math.sin(frame / 45 + fase) * amplitude;
  const forma = (estilo: CSSProperties): CSSProperties => ({ position: "absolute", borderRadius: "50%", filter: "blur(90px)", ...estilo });
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${COR.rosa50} 0%, ${COR.azul50} 60%, ${COR.azul50} 100%)`, fontFamily: FONTE, color: COR.tinta, overflow: "hidden" }}>
      <div style={forma({ width: 660, height: 660, left: -220 + flutua(0), top: -200 + flutua(1, 20), background: COR.rosa100, opacity: 0.85 })} />
      <div style={forma({ width: 720, height: 720, right: -240 + flutua(3, 20), top: 620 + flutua(2), background: COR.azul100, opacity: 0.9 })} />
      <div style={forma({ width: 620, height: 620, left: 220 + flutua(4), bottom: -260, background: COR.lilas, opacity: 0.7 })} />
      {Array.from({ length: 18 }, (_, i) => {
        const velocidade = 1.2 + random(`v${i}`) * 1.8;
        const y = height + 80 - ((frame * velocidade + random(`y${i}`) * height * 1.4) % (height + 200));
        const x = random(`x${i}`) * 1080 + Math.sin(frame / 30 + i) * 24;
        const tamanho = 14 + random(`t${i}`) * 26;
        const coracao = i % 3 === 0;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, opacity: 0.35 + random(`o${i}`) * 0.3, rotate: `${Math.sin(frame / 40 + i) * 15}deg` }}>
            {coracao ? (
              <svg viewBox="0 0 24 24" width={tamanho * 1.4} height={tamanho * 1.4}>
                <path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z" fill={COR.rosa300} />
              </svg>
            ) : (
              <div style={{ width: tamanho, height: tamanho, borderRadius: "50%", background: i % 2 ? COR.branco : COR.azul100 }} />
            )}
          </div>
        );
      })}
      {children}
    </AbsoluteFill>
  );
}

export function Ilustracao({ nome, tamanho }: { nome: NomeIlustracao; tamanho: number }) {
  return (
    <svg viewBox="40 10 120 110" width={tamanho} height={tamanho} style={{ flexShrink: 0 }}>
      {ILUSTRACOES[nome]}
    </svg>
  );
}

// Ilustração numa bolha colorida (Bolha do app).
export function Bolha({ nome, tamanho, fundo = COR.branco, style }: { nome: NomeIlustracao; tamanho: number; fundo?: string; style?: CSSProperties }) {
  return (
    <div style={{ width: tamanho, height: tamanho, borderRadius: "50%", background: fundo, boxShadow: SOMBRA_SUAVE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, ...style }}>
      <Ilustracao nome={nome} tamanho={tamanho * 0.78} />
    </div>
  );
}

export function Logo({ tamanho }: { tamanho: number }) {
  return <Img src={logo} style={{ width: tamanho, height: tamanho, borderRadius: "22%" }} />;
}

export function Cartao({ children, fundo = "rgba(255,255,255,0.94)", cor = COR.tinta, style }: { children: ReactNode; fundo?: string; cor?: string; style?: CSSProperties }) {
  return (
    <div style={{ background: fundo, color: cor, borderRadius: 48, boxShadow: SOMBRA_SUAVE, padding: "34px 42px", display: "flex", alignItems: "center", gap: 30, ...style }}>
      {children}
    </div>
  );
}

// Selo de "tudo certo" (círculo verde com visto que se desenha).
export function Visto({ tamanho = 72, desenho = 1 }: { tamanho?: number; desenho?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={tamanho} height={tamanho} style={{ flexShrink: 0 }}>
      <circle cx="24" cy="24" r="24" fill={COR.verde} />
      <path d="M14 25l7 7 13-15" stroke={COR.branco} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - desenho} />
    </svg>
  );
}

// Entra com mola, passando um pouco do tamanho e voltando (efeito "pop").
export function Pop({ de = 0, children, style }: { de?: number; children: ReactNode; style?: CSSProperties }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - de, fps, config: { damping: 11, mass: 0.7, stiffness: 140 } });
  return <div style={{ scale: `${p}`, opacity: interpolate(frame - de, [0, 4], [0, 1], preso), ...style }}>{children}</div>;
}

// Sobe e aparece (ou vem de um lado, com `de` e `direcao`).
export function Entra({ de = 0, direcao = "baixo", distancia = 90, children, style }: { de?: number; direcao?: "baixo" | "direita" | "esquerda"; distancia?: number; children: ReactNode; style?: CSSProperties }) {
  const frame = useCurrentFrame();
  const p = interpolate(frame - de, [0, 18], [0, 1], { ...preso, easing: SUAVE });
  const desloca = (1 - p) * distancia;
  const translate = direcao === "baixo" ? `0px ${desloca}px` : `${direcao === "direita" ? desloca : -desloca}px 0px`;
  return <div style={{ opacity: interpolate(frame - de, [0, 10], [0, 1], preso), translate, ...style }}>{children}</div>;
}

// Balanço contínuo, para nada ficar parado.
export function Flutua({ amplitude = 14, velocidade = 1, fase = 0, children, style }: { amplitude?: number; velocidade?: number; fase?: number; children: ReactNode; style?: CSSProperties }) {
  const frame = useCurrentFrame();
  return <div style={{ translate: `0px ${Math.sin((frame / 22) * velocidade + fase) * amplitude}px`, rotate: `${Math.sin((frame / 35) * velocidade + fase) * 2}deg`, ...style }}>{children}</div>;
}

// Explosão de coraçõezinhos e bolinhas saindo do centro a partir do quadro `de`.
export function Explosao({ de, cor = COR.rosa600, quantidade = 16, raio = 360 }: { de: number; cor?: string; quantidade?: number; raio?: number }) {
  const frame = useCurrentFrame();
  const t = frame - de;
  if (t < 0 || t > 40) return null;
  const p = interpolate(t, [0, 40], [0, 1], { ...preso, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, pointerEvents: "none" }}>
      {Array.from({ length: quantidade }, (_, i) => {
        const angulo = (i / quantidade) * Math.PI * 2 + random(`a${de}${i}`) * 0.4;
        const distancia = raio * (0.6 + random(`d${de}${i}`) * 0.5) * p;
        const tamanho = 18 + random(`s${de}${i}`) * 22;
        const cores = [cor, COR.rosa300, COR.verde, COR.azul100];
        return (
          <svg key={i} viewBox="0 0 24 24" width={tamanho} height={tamanho} style={{ position: "absolute", left: Math.cos(angulo) * distancia - tamanho / 2, top: Math.sin(angulo) * distancia - tamanho / 2, opacity: 1 - p, rotate: `${p * 180}deg` }}>
            {i % 2 ? <path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z" fill={cores[i % 4]} /> : <circle cx="12" cy="12" r="8" fill={cores[i % 4]} />}
          </svg>
        );
      })}
    </div>
  );
}

// Ondas que se espalham (chute do bebê, alerta pulsando).
export function Ondas({ quadros, cor = COR.rosa600, tamanho = 520 }: { quadros: number[]; cor?: string; tamanho?: number }) {
  const frame = useCurrentFrame();
  return (
    <>
      {quadros.flatMap((de) =>
        [0, 8].map((atraso) => {
          const t = frame - de - atraso;
          if (t < 0 || t > 34) return null;
          return (
            <div key={`${de}-${atraso}`} style={{ position: "absolute", left: "50%", top: "50%", width: tamanho, height: tamanho, marginLeft: -tamanho / 2, marginTop: -tamanho / 2, borderRadius: "50%", border: `8px solid ${cor}`, scale: interpolate(t, [0, 34], [0.8, 1.7], { easing: Easing.out(Easing.cubic) }), opacity: interpolate(t, [0, 34], [0.6, 0]) }} />
          );
        }),
      )}
    </>
  );
}

// Título que entra palavra por palavra. `destaque`: palavras em rosa.
export function TituloAnimado({ texto, de = 0, tamanho = 84, destaque = [], intervalo = 3, style }: { texto: string; de?: number; tamanho?: number; destaque?: string[]; intervalo?: number; style?: CSSProperties }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ fontSize: tamanho, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5, textAlign: "center", display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: tamanho * 0.25, ...style }}>
      {texto.split(" ").map((palavra, i) => {
        const p = spring({ frame: frame - de - i * intervalo, fps, config: { damping: 13, mass: 0.6 } });
        return (
          <span key={i} style={{ display: "inline-block", color: destaque.includes(palavra) ? COR.rosa600 : undefined, opacity: Math.min(1, p * 1.5), translate: `0px ${(1 - p) * 50}px`, rotate: `${(1 - p) * -8}deg` }}>
            {palavra}
          </span>
        );
      })}
    </div>
  );
}

// Cabeçalho fixo com a logo, o tema e uma barra de progresso do vídeo.
export function Cabecalho({ tema }: { tema: string }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <>
      <div style={{ position: "absolute", top: 86, left: 72, right: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <Logo tamanho={88} />
          <span style={{ fontSize: 50, fontWeight: 700, color: COR.rosa700 }}>Ninna</span>
        </div>
        <span style={{ fontSize: 34, fontWeight: 700, color: COR.rosa700, background: "rgba(255,255,255,0.85)", borderRadius: 999, padding: "16px 30px", boxShadow: SOMBRA_SUAVE }}>{tema}</span>
      </div>
      <div style={{ position: "absolute", top: 206, left: 72, right: 72, height: 10, borderRadius: 999, background: "rgba(255,255,255,0.7)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(frame / (durationInFrames - 1)) * 100}%`, borderRadius: 999, background: COR.rosa600 }} />
      </div>
    </>
  );
}
