import { Highlight, Underline } from "@remotion/rough-notation";
import { Fragment } from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import narracao from "../../roteiros/movimentos-do-bebe.narracao.json";
import roteiro from "../../roteiros/movimentos-do-bebe.json";
import { criarVideo, Som, type CenaVisual } from "../motor";
import { Bolha, Cartao, Entra, Explosao, Flutua, Ilustracao, Logo, Ondas, Pop, SUAVE, TituloAnimado, Visto } from "../pecas";
import { COR, SOMBRA_ROSA } from "../tema";
import type { Cena } from "../tempo";

// Piloto: cenas feitas sob medida (os outros vídeos usam os modelos de src/modelos.tsx).

const preso = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const texto = { fontSize: 46, fontWeight: 700, lineHeight: 1.22 };

// 1. Gancho: a barriga com o bebê, que "chuta" (ondas) quando a fala diz chute e virada.
function Gancho({ dados }: { dados: Cena }) {
  const frame = useCurrentFrame();
  const chutes = [dados.quando("chute"), dados.quando("virada")];
  const tranco = chutes.reduce((soma, q) => soma + Math.max(0, 1 - Math.abs(frame - q - 3) / 6), 0);
  const casa = dados.quando("casa");
  return (
    <>
      <Som nome="coracao" de={2} volume={0.6} />
      <Som nome="coracao" de={26} volume={0.5} />
      {chutes.map((q) => (
        <Som key={q} nome="pop" de={q} volume={0.45} />
      ))}
      <TituloAnimado texto="Seu bebê conversa com você" de={4} tamanho={78} destaque={["conversa"]} />
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Ondas quadros={chutes} tamanho={460} />
        <Pop de={10}>
          <Flutua amplitude={10}>
            <div style={{ width: 460, height: 460, borderRadius: "50%", background: COR.rosa100, boxShadow: SOMBRA_ROSA, display: "flex", alignItems: "center", justifyContent: "center", scale: `${1 + Math.max(0, Math.sin(frame / 5.5)) ** 10 * 0.04}` }}>
              <div style={{ translate: `${tranco * 26}px ${-tranco * 14}px`, rotate: `${Math.sin(frame / 18) * 8 + tranco * 12}deg` }}>
                <Bolha nome="bebe" tamanho={290} fundo={COR.azul100} />
              </div>
            </div>
          </Flutua>
        </Pop>
        <div style={{ position: "absolute", right: -40, top: -10 }}>
          <Pop de={dados.quando("sinal")}>
            <Flutua fase={1}>
              <Bolha nome="coracao" tamanho={170} />
            </Flutua>
          </Pop>
        </div>
      </div>
      <Pop de={casa - 4}>
        <Cartao style={{ padding: "22px 38px" }}>
          <Ilustracao nome="casa" tamanho={90} />
          <span style={{ ...texto, fontSize: 48, fontWeight: 800 }}>Dá para acompanhar em casa</span>
        </Cartao>
      </Pop>
    </>
  );
}

// 2. Quando: linha do tempo dos trimestres, com marcadores que deslizam até o ponto certo.
function Quando({ dados }: { dados: Cena }) {
  const frame = useCurrentFrame();
  const segundo = dados.quando("segundo");
  const filhos = dados.quando("filhos");
  const otimo = dados.quando("ótimo");
  const preenche = interpolate(frame, [segundo, segundo + 20], [0, 1], { ...preso, easing: SUAVE });
  const marcador = (de: number, ate: number) => interpolate(frame, [de, de + 22], [0, ate], { ...preso, easing: SUAVE });
  return (
    <>
      <Explosao de={otimo} cor={COR.verde} />
      <Som nome="pop" de={segundo} volume={0.4} />
      <Som nome="pop" de={filhos} volume={0.4} />
      <Som nome="ding" de={otimo} volume={0.35} />
      <TituloAnimado texto="Quando começa?" de={2} tamanho={80} destaque={["começa?"]} />
      <Entra de={6} style={{ width: "100%" }}>
        <Cartao style={{ flexDirection: "column", alignItems: "stretch", gap: 26, padding: "44px 40px 40px" }}>
          <div style={{ position: "relative", height: 150 }}>
            {/* Marcador da primeira gestação: vai até o começo do 2º trimestre. */}
            <div style={{ position: "absolute", top: 0, left: `${marcador(segundo, 38)}%`, translate: "-50% 0", opacity: interpolate(frame, [segundo, segundo + 6], [0, 1], preso) }}>
              <Bolha nome="bebe" tamanho={110} fundo={COR.rosa100} />
            </div>
            {/* Quem já teve filhos sente um pouco antes. */}
            <div style={{ position: "absolute", top: 20, left: `${marcador(filhos, 21)}%`, translate: "-50% 0", opacity: interpolate(frame, [filhos, filhos + 6], [0, 1], preso) }}>
              <div style={{ width: 70, height: 70, borderRadius: "50%", background: COR.lilas, border: `6px solid ${COR.branco}`, boxShadow: SOMBRA_ROSA, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, color: COR.rosa700 }}>
                +1
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {["1º", "2º", "3º"].map((t, i) => (
              <div key={t} style={{ flex: 1, height: 36, borderRadius: 999, background: COR.rosa50, overflow: "hidden" }}>
                {i === 1 && <div style={{ height: "100%", width: `${preenche * 100}%`, background: COR.rosa600, borderRadius: 999 }} />}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {["1º tri", "2º tri", "3º tri"].map((t, i) => (
              <span key={t} style={{ flex: 1, textAlign: "center", fontSize: 38, fontWeight: 800, color: i === 1 ? COR.rosa600 : COR.suave, scale: i === 1 ? `${1 + preenche * 0.12}` : "1" }}>
                {t}
              </span>
            ))}
          </div>
        </Cartao>
      </Entra>
      <div style={{ display: "flex", flexDirection: "column", gap: 22, width: "100%" }}>
        <Entra de={filhos} direcao="direita">
          <Cartao fundo={COR.lilas} style={{ padding: "26px 38px" }}>
            <span style={{ ...texto, fontSize: 44 }}>Já teve filhos? Costuma sentir mais cedo</span>
          </Cartao>
        </Entra>
        <Pop de={otimo}>
          <Cartao fundo={COR.menta} style={{ padding: "26px 38px", justifyContent: "center" }}>
            <Visto tamanho={70} desenho={interpolate(frame, [otimo + 4, otimo + 16], [0, 1], preso)} />
            <span style={{ ...texto, fontSize: 48, fontWeight: 800 }}>Mexer bastante é ótimo sinal</span>
          </Cartao>
        </Pop>
      </div>
    </>
  );
}

// 3. Como: três passos que deslizam da direita no momento em que são falados.
function Como({ dados }: { dados: Cena }) {
  const passos = [
    { de: dados.quando("refeição"), nome: "maca", fundo: COR.pessego, rotulo: "Depois de uma refeição" },
    { de: dados.quando("tranquilo"), nome: "lua", fundo: COR.baunilha, rotulo: "Num momento tranquilo" },
    { de: dados.quando("barriga"), nome: "coracao", fundo: COR.rosa100, rotulo: "Mão na barriga: conte cada movimento" },
  ] as const;
  return (
    <>
      <TituloAnimado texto="Como contar" de={2} tamanho={84} destaque={["contar"]} />
      <div style={{ display: "flex", flexDirection: "column", gap: 28, width: "100%" }}>
        {passos.map((p, i) => (
          <Fragment key={p.rotulo}>
            <Som nome="whoosh" de={p.de - 4} volume={0.25} />
            <Entra de={p.de - 6} direcao="direita" distancia={260}>
              <Cartao fundo={p.fundo}>
                <div style={{ width: 84, height: 84, borderRadius: "50%", background: COR.rosa600, color: COR.branco, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                <Flutua amplitude={8} fase={i * 2}>
                  <Ilustracao nome={p.nome} tamanho={130} />
                </Flutua>
                <span style={{ ...texto, fontSize: 48, fontWeight: 800 }}>{p.rotulo}</span>
              </Cartao>
            </Entra>
          </Fragment>
        ))}
      </div>
    </>
  );
}

// 4. Meta: relógio de 1 hora enchendo e seis bolinhas que acendem em volta, uma por vez.
function Meta({ dados }: { dados: Cena }) {
  const frame = useCurrentFrame();
  const inicio = dados.quando("movimentos");
  const chegou = dados.quando("disso");
  const pode = dados.quando("pode");
  const acesas = Math.min(6, Math.floor(interpolate(frame, [inicio, chegou], [0, 6.99], preso)));
  const momentos = Array.from({ length: 6 }, (_, i) => Math.round(interpolate(i, [0, 6.99], [inicio, chegou])));
  const relogio = interpolate(frame, [inicio, chegou], [0, 0.78], preso);
  const certo = interpolate(frame, [pode, pode + 12], [0, 1], { ...preso, easing: SUAVE });
  const raio = 170;
  const volta = 2 * Math.PI * raio;
  return (
    <>
      {momentos.map((m) => (
        <Som key={m} nome="pop" de={m} volume={0.4} />
      ))}
      <Som nome="ding" de={pode} volume={0.5} />
      <TituloAnimado texto="Meta: 6 em até 1 hora" de={dados.quando("meta") - 4} tamanho={80} destaque={["6", "1", "hora"]} />
      <div style={{ position: "relative", width: 620, height: 620 }}>
        <Explosao de={pode} cor={COR.verde} quantidade={22} raio={420} />
        <svg width={620} height={620} viewBox="0 0 620 620" style={{ position: "absolute", inset: 0 }}>
          <circle cx="310" cy="310" r={raio} fill="rgba(255,255,255,0.94)" stroke={COR.rosa100} strokeWidth="34" />
          <circle cx="310" cy="310" r={raio} fill="none" stroke={certo > 0 ? COR.verde : COR.rosa600} strokeWidth="34" strokeLinecap="round" strokeDasharray={volta} strokeDashoffset={volta * (1 - Math.max(relogio, certo))} transform="rotate(-90 310 310)" />
        </svg>
        {Array.from({ length: 6 }, (_, i) => {
          const angulo = (i / 6) * Math.PI * 2 - Math.PI / 2;
          const acesa = i < acesas;
          const desde = frame - momentos[i];
          return (
            <div key={i} style={{ position: "absolute", left: 310 + Math.cos(angulo) * 268 - 50, top: 310 + Math.sin(angulo) * 268 - 50, width: 100, height: 100, borderRadius: "50%", background: acesa ? COR.rosa600 : COR.branco, color: acesa ? COR.branco : COR.rosa300, boxShadow: acesa ? SOMBRA_ROSA : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 800, scale: acesa ? `${interpolate(desde, [0, 4, 10], [1, 1.35, 1.08], preso)}` : "1" }}>
              {i + 1}
            </div>
          );
        })}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {certo > 0 ? (
            <div style={{ scale: `${certo}` }}>
              <Visto tamanho={230} desenho={interpolate(frame, [pode + 6, pode + 18], [0, 1], preso)} />
            </div>
          ) : (
            <span key={acesas} style={{ fontSize: 190, fontWeight: 800, color: COR.rosa600, scale: `${interpolate(frame - momentos[Math.max(0, acesas - 1)], [0, 5], [1.3, 1], preso)}` }}>
              {acesas}
            </span>
          )}
        </div>
      </div>
      <div style={{ opacity: certo, translate: `0px ${(1 - certo) * 40}px` }}>
        <Cartao fundo={COR.menta} style={{ padding: "24px 44px" }}>
          <span style={{ ...texto, fontSize: 56, fontWeight: 800 }}>Pode parar: tudo certo!</span>
        </Cartao>
      </div>
    </>
  );
}

// 5. Alerta: o fundo esquenta e os passos aparecem ligados por setas que se desenham.
function Alerta({ dados }: { dados: Cena }) {
  const frame = useCurrentFrame();
  const naoChegou = dados.quando("não");
  const conte = dados.quando("conte");
  const deNovo = dados.quando("novo");
  const procure = dados.quando("procure");
  const balanco = Math.sin(frame * 1.4) * interpolate(frame, [2, 20], [7, 0], preso);
  const seta = (de: number) => (
    <svg width={60} height={70} viewBox="0 0 60 70">
      <path d="M30 4v52M14 42l16 16 16-16" stroke={COR.rosa600} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - interpolate(frame, [de, de + 12], [0, 1], preso)} />
    </svg>
  );
  return (
    <>
      <Som nome="aviso" de={4} volume={0.45} />
      <Pop de={2}>
        <span style={{ display: "inline-block", rotate: `${balanco}deg`, fontSize: 50, fontWeight: 800, color: COR.branco, background: COR.alerta, borderRadius: 999, padding: "18px 44px" }}>Atenção</span>
      </Pop>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: "100%" }}>
        <Entra de={naoChegou - 4} style={{ width: "100%" }}>
          <Cartao style={{ justifyContent: "center", padding: "26px 38px" }}>
            <span style={{ ...texto, fontSize: 48, fontWeight: 800 }}>Menos de 6 em 1 hora?</span>
          </Cartao>
        </Entra>
        {seta(conte - 8)}
        <Entra de={conte - 2} style={{ width: "100%" }}>
          <Cartao style={{ justifyContent: "center", padding: "26px 38px" }}>
            <svg width={80} height={80} viewBox="0 0 80 80" style={{ flexShrink: 0 }}>
              <circle cx="40" cy="40" r="32" fill={COR.rosa50} stroke={COR.rosa600} strokeWidth="7" />
              <path d={`M40 40L${40 + Math.sin(frame / 4) * 22} ${40 - Math.cos(frame / 4) * 22}`} stroke={COR.rosa600} strokeWidth="6" strokeLinecap="round" />
            </svg>
            <span style={{ ...texto, fontSize: 48, fontWeight: 800 }}>Conte por mais 1 hora</span>
          </Cartao>
        </Entra>
        {seta(deNovo - 8)}
        <Entra de={deNovo - 2} style={{ width: "100%" }}>
          <Cartao fundo={COR.alerta50} cor={COR.alerta900} style={{ flexDirection: "column", gap: 8, padding: "28px 38px", scale: `${1 + Math.max(0, Math.sin((frame - procure) / 4)) * 0.02 * (frame > procure ? 1 : 0)}` }}>
            <span style={{ ...texto, fontSize: 40 }}>De novo menos de 6?</span>
            <span style={{ ...texto, fontSize: 52, fontWeight: 800 }}>
              Procure atendimento{" "}
              <Underline color={COR.alerta} strokeWidth={6} progress={interpolate(frame, [procure + 10, procure + 26], [0, 1], preso)}>
                na hora
              </Underline>
            </span>
          </Cartao>
        </Entra>
      </div>
    </>
  );
}

// 6. Urgente: relógio de 12 horas girando, ondas de alerta e o cartão vermelho da maternidade.
function Urgente({ dados }: { dados: Cena }) {
  const frame = useCurrentFrame();
  const doze = dados.quando("12");
  const maternidade = dados.quando("maternidade");
  const espere = dados.quando("espere");
  const giro = interpolate(frame, [doze, maternidade], [0, 720], { ...preso, easing: Easing.inOut(Easing.cubic) });
  const pulsos = [espere, espere + 26, maternidade + 10, maternidade + 36];
  return (
    <>
      <Som nome="aviso" de={doze} volume={0.4} />
      <Som nome="aviso" de={maternidade} volume={0.5} />
      <div style={{ position: "relative", width: 460, height: 460, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Ondas quadros={pulsos} cor={COR.alerta} tamanho={400} />
        <Pop de={doze - 6}>
          <svg width={400} height={400} viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="180" fill={COR.branco} stroke={COR.alerta} strokeWidth="18" />
            {Array.from({ length: 12 }, (_, i) => (
              <line key={i} x1="200" y1="38" x2="200" y2="62" stroke={COR.alerta900} strokeWidth="8" strokeLinecap="round" transform={`rotate(${i * 30} 200 200)`} />
            ))}
            <line x1="200" y1="200" x2="200" y2="80" stroke={COR.tinta} strokeWidth="12" strokeLinecap="round" transform={`rotate(${giro} 200 200)`} />
            <line x1="200" y1="200" x2="200" y2="120" stroke={COR.alerta} strokeWidth="14" strokeLinecap="round" transform={`rotate(${giro / 12} 200 200)`} />
            <circle cx="200" cy="200" r="14" fill={COR.tinta} />
          </svg>
        </Pop>
      </div>
      <TituloAnimado texto="12 horas sem mexer?" de={doze} tamanho={84} destaque={["12", "horas"]} />
      <Pop de={maternidade - 6} style={{ width: "100%" }}>
        <Cartao fundo={COR.alerta} cor={COR.branco} style={{ justifyContent: "center", padding: "34px 40px", scale: `${1 + Math.max(0, Math.sin((frame - maternidade) / 5)) * 0.03}` }}>
          <span style={{ ...texto, fontSize: 56, fontWeight: 800, textAlign: "center" }}>Vá à maternidade imediatamente</span>
        </Cartao>
      </Pop>
    </>
  );
}

// 7. Fatores: quatro cartões que viram no momento em que são falados.
function Fatores({ dados }: { dados: Cena }) {
  const frame = useCurrentFrame();
  const fatores = [
    { palavra: "cansaço", nome: "lua", rotulo: "Cansaço", fundo: COR.baunilha },
    { palavra: "remédios", nome: "gota", rotulo: "Remédios que dão sono", fundo: COR.azul100 },
    { palavra: "álcool", nome: null, rotulo: "Álcool", fundo: COR.lilas },
    { palavra: "cigarro", nome: null, rotulo: "Cigarro", fundo: COR.pessego },
  ] as const;
  const duvida = dados.quando("dúvida");
  return (
    <>
      <TituloAnimado texto="Podem diminuir os movimentos" de={dados.quando("podem") - 6} tamanho={66} destaque={["diminuir"]} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26, width: "100%", perspective: 1400 }}>
        {fatores.map((f, i) => {
          const de = dados.quando(f.palavra) - 4;
          const virada = interpolate(frame, [de, de + 16], [90, 0], { ...preso, easing: SUAVE });
          return (
            <div key={f.rotulo} style={{ transform: `rotateY(${virada}deg)`, opacity: frame >= de ? 1 : 0 }}>
              <Som nome="pop" de={de} volume={0.35} />
              <Cartao fundo={f.fundo} style={{ flexDirection: "column", gap: 12, height: 290, justifyContent: "center", textAlign: "center", padding: "24px 20px" }}>
                <Flutua amplitude={8} fase={i}>
                  {f.nome ? (
                    <Ilustracao nome={f.nome} tamanho={130} />
                  ) : (
                    <svg viewBox="0 0 48 48" width={110} height={110}>
                      <circle cx="24" cy="24" r="19" stroke={COR.rosa600} strokeWidth="5" fill={COR.branco} />
                      <path d="M11 37L37 11" stroke={COR.rosa600} strokeWidth="5" strokeLinecap="round" />
                    </svg>
                  )}
                </Flutua>
                <span style={{ ...texto, fontSize: 40 }}>{f.rotulo}</span>
              </Cartao>
            </div>
          );
        })}
      </div>
      <Entra de={duvida - 6} style={{ width: "100%" }}>
        <Cartao style={{ justifyContent: "center", padding: "26px 36px" }}>
          <Ilustracao nome="casa" tamanho={100} />
          <span style={{ ...texto, fontSize: 48, fontWeight: 800 }}>
            Na dúvida,{" "}
            <Highlight color={COR.rosa100} progress={interpolate(frame, [duvida + 8, duvida + 24], [0, 1], preso)}>
              procure atendimento
            </Highlight>
          </span>
        </Cartao>
      </Entra>
    </>
  );
}

// 8. Encerramento: logo com mola, chuva de corações e o recado final.
function Encerramento({ dados }: { dados: Cena }) {
  const frame = useCurrentFrame();
  const cuide = dados.quando("cuide-se");
  return (
    <>
      <Som nome="ding" de={cuide} volume={0.4} />
      <div style={{ position: "relative" }}>
        <Explosao de={6} quantidade={20} raio={380} />
        <Explosao de={cuide} quantidade={24} raio={460} />
        <Pop de={4}>
          <div style={{ rotate: `${Math.sin(frame / 12) * 4}deg` }}>
            <Logo tamanho={290} />
          </div>
        </Pop>
      </div>
      <TituloAnimado texto="Passo a passo e muito mais no Ninna" de={dados.quando("passo") - 4} tamanho={70} destaque={["Ninna"]} intervalo={2} />
      <Pop de={cuide - 2}>
        <span style={{ fontSize: 110, fontWeight: 800, color: COR.rosa600, letterSpacing: -2 }}>Cuide-se!</span>
      </Pop>
      <div style={{ opacity: interpolate(frame, [cuide + 10, cuide + 24], [0, 1], preso), fontSize: 28, fontWeight: 500, color: COR.suave, textAlign: "center", lineHeight: 1.45, maxWidth: 880 }}>
        Fonte: {roteiro.fonte}.
        <br />
        Narração gerada por computador. Conteúdo em revisão por profissional de saúde.
      </div>
    </>
  );
}

const CENAS_VISUAIS: Record<string, CenaVisual> = {
  gancho: Gancho,
  quando: Quando,
  como: Como,
  meta: Meta,
  alerta: Alerta,
  urgente: Urgente,
  fatores: Fatores,
  encerramento: Encerramento,
};

export const movimentosDoBebe = criarVideo({ slug: "movimentos-do-bebe", tema: "Gestação", roteiro, narracao, cenas: CENAS_VISUAIS, alertas: ["alerta", "urgente"] });
