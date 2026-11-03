import { Composition } from "remotion";
import { FPS } from "./tema";
import { amamentacao } from "./videos/amamentacao-primeiros-dias";
import { deuPositivo } from "./videos/deu-positivo";
import { enjooGestacao } from "./videos/enjoo-gestacao";
import { movimentosDoBebe } from "./videos/movimentos-do-bebe";
import { primeiraConsulta } from "./videos/primeira-consulta-pre-natal";
import { sinaisDeAlerta } from "./videos/sinais-de-alerta";
import { sinaisPartoChegando } from "./videos/sinais-parto-chegando";
import { vacinasGestacao } from "./videos/vacinas-gestacao";

// Um vídeo por artigo, vertical (9:16) para o celular. O id é o mesmo do roteiro.
const VIDEOS = {
  "movimentos-do-bebe": movimentosDoBebe,
  "sinais-de-alerta": sinaisDeAlerta,
  "sinais-parto-chegando": sinaisPartoChegando,
  "deu-positivo": deuPositivo,
  "primeira-consulta-pre-natal": primeiraConsulta,
  "enjoo-gestacao": enjooGestacao,
  "vacinas-gestacao": vacinasGestacao,
  "amamentacao-primeiros-dias": amamentacao,
};

export function Raiz() {
  return (
    <>
      {Object.entries(VIDEOS).map(([id, { Video, duracao }]) => (
        <Composition key={id} id={id} component={Video} durationInFrames={duracao} fps={FPS} width={1080} height={1920} />
      ))}
    </>
  );
}
