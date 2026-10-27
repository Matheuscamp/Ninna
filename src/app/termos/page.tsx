import type { Metadata } from "next";
import Link from "next/link";
import { DocumentoLegal, Lista, Secao } from "@/components/documento-legal";
import { RESPONSAVEL } from "@/content/juridico";
import { PRAZO_ARREPENDIMENTO_DIAS } from "@/lib/pagamentos";
import { formatarPreco, LIMITES_GRATUITOS, PERIODOS } from "@/lib/planos";

export const metadata: Metadata = { title: "Termos de Uso" };

// Primeira versão: precisa de revisão de advogado antes do lançamento (veja src/content/juridico.ts).
export default function TermosPage() {
  return (
    <DocumentoLegal
      titulo="Termos de Uso"
      resumo={
        <>
          <p className="font-bold">O essencial, em poucas linhas</p>
          <Lista>
            <li>O Ninna informa e organiza, mas não substitui consulta, exame ou atendimento médico.</li>
            <li>Em emergência, ligue 192 (SAMU) ou vá ao pronto-socorro.</li>
            <li>O plano gratuito é gratuito para sempre. O Premium é pago uma vez por período e não renova sozinho.</li>
            <li>Você pode desistir do Premium em até {PRAZO_ARREPENDIMENTO_DIAS} dias e receber o valor integral de volta, pelo próprio app.</li>
            <li>Você pode exportar ou excluir seus dados quando quiser.</li>
          </Lista>
        </>
      }
    >
      <Secao id="quem-somos" titulo="1. Quem oferece o Ninna">
        <p>
          O Ninna é oferecido por {RESPONSAVEL.nome}, inscrito sob o nº {RESPONSAVEL.documento}, com endereço em {RESPONSAVEL.endereco}. Para falar
          conosco, escreva para {RESPONSAVEL.email}.
        </p>
        <p>Ao criar uma conta, você aceita estes Termos e a <Link href="/privacidade" className="font-semibold text-azul-700 underline">Política de Privacidade</Link>.</p>
      </Secao>

      <Secao id="o-que-e" titulo="2. O que o Ninna é, e o que não é">
        <p>
          O Ninna é um assistente para quem está tentando engravidar, suspeita de gravidez, está grávida, no pós-parto ou passando por uma perda
          gestacional. Ele oferece orientações por fase, agenda de consultas e exames, guias e uma central para guardar documentos de saúde.
        </p>
        <p className="font-semibold">
          O Ninna não faz diagnóstico, não prescreve tratamento e não substitui o acompanhamento com médico, enfermeira obstétrica ou outro
          profissional de saúde.
        </p>
        <p>
          Os conteúdos são informativos e gerais. Diante de qualquer sinal de alerta, como sangramento, dor forte, febre, perda de líquido, inchaço
          súbito ou diminuição dos movimentos do bebê, procure atendimento imediatamente. Em emergência, ligue 192 (SAMU).
        </p>
      </Secao>

      <Secao id="conta" titulo="3. Sua conta">
        <Lista>
          <li>Você precisa informar um e-mail válido e manter sua senha em segredo. O que for feito com a sua conta é de sua responsabilidade.</li>
          <li>As informações que você cadastra, como datas, consultas e dados de saúde, devem ser verdadeiras. Os cálculos do app, como semanas de gestação, dependem delas.</li>
          <li>O Ninna é destinado a pessoas com 18 anos ou mais. Quem tiver menos idade deve usar com o acompanhamento de um responsável.</li>
          <li>Você pode excluir sua conta a qualquer momento, em Perfil › Excluir conta e dados.</li>
        </Lista>
      </Secao>

      <Secao id="planos" titulo="4. Planos e preços">
        <p>
          <strong>Plano gratuito:</strong> triagem, orientações por fase, guias, sinais de alerta, até {LIMITES_GRATUITOS.consultasFuturas} consultas
          futuras na agenda e até {LIMITES_GRATUITOS.documentos} documentos de saúde. Sinais de alerta e orientações de segurança são sempre gratuitos.
        </p>
        <p>
          <strong>Ninna Premium:</strong> agenda e documentos sem limite e conteúdos extras. Preços atuais:{" "}
          {Object.values(PERIODOS)
            .map((p) => `${formatarPreco(p.preco)} por ${p.rotulo}`)
            .join(" ou ")}
          . O preço que vale é o mostrado na tela no momento da compra.
        </p>
      </Secao>

      <Secao id="pagamento" titulo="5. Pagamento">
        <Lista>
          <li>O pagamento é processado pelo Mercado Pago, por Pix, cartão ou boleto. O Ninna não recebe nem guarda os dados do seu cartão.</li>
          <li>O pagamento é único para o período escolhido. <strong>Não há renovação nem cobrança automática.</strong></li>
          <li>O Premium é liberado assim que o pagamento é aprovado. Pix costuma ser aprovado em minutos; boleto, em até 3 dias úteis.</li>
          <li>Se você renovar antes de o Premium acabar, o novo período começa quando o atual terminar. Você não perde dias.</li>
          <li>Quando o período termina, você volta ao plano gratuito sem perder nada do que guardou. Só não poderá adicionar itens além dos limites do gratuito.</li>
        </Lista>
      </Secao>

      <Secao id="arrependimento" titulo="6. Desistência e reembolso">
        <p>
          Pelo Código de Defesa do Consumidor (art. 49), você pode desistir da compra em até <strong>{PRAZO_ARREPENDIMENTO_DIAS} dias</strong>{" "}
          contados da liberação do Premium, sem precisar explicar o motivo, e receber o <strong>valor integral</strong> de volta.
        </p>
        <p>
          Para isso, abra Perfil › Ninna Premium e toque em &ldquo;Cancelar e pedir reembolso&rdquo; no pagamento. O Premium daquele período é removido na
          hora. O valor volta pela mesma forma de pagamento: no Pix, em instantes; no cartão, em até 2 faturas, conforme o banco emissor.
        </p>
        <p>
          Depois desse prazo não há reembolso proporcional do período não usado, exceto quando a lei exigir ou se o serviço não for prestado como
          prometido. Nesse caso, escreva para {RESPONSAVEL.email}.
        </p>
      </Secao>

      <Secao id="uso" titulo="7. Uso adequado">
        <p>Ao usar o Ninna, você concorda em não:</p>
        <Lista>
          <li>enviar arquivos que não sejam seus documentos de saúde ou que você não tenha direito de guardar;</li>
          <li>tentar acessar dados de outras pessoas, burlar limites do plano ou atacar o funcionamento do serviço;</li>
          <li>usar o app para fins ilegais.</li>
        </Lista>
        <p>Se isso acontecer, podemos suspender ou encerrar a conta, avisando por e-mail sempre que possível.</p>
      </Secao>

      <Secao id="disponibilidade" titulo="8. Disponibilidade e responsabilidade">
        <p>
          Trabalhamos para o Ninna funcionar sempre, mas podem ocorrer interrupções para manutenção ou por falhas de terceiros, como internet e
          provedores. Mantenha também uma cópia dos documentos importantes. Você pode baixá-los a qualquer momento.
        </p>
        <p>
          As decisões sobre sua saúde devem ser tomadas com profissionais que acompanham você. O Ninna não responde por decisões tomadas apenas com
          base nos conteúdos do app, sem prejuízo dos direitos garantidos pelo Código de Defesa do Consumidor.
        </p>
      </Secao>

      <Secao id="propriedade" titulo="9. Conteúdo e marca">
        <p>
          Textos, ilustrações, marca e software do Ninna são protegidos por direitos autorais e não podem ser copiados para outros fins sem
          autorização. Os dados e documentos que você cadastra continuam sendo seus.
        </p>
      </Secao>

      <Secao id="mudancas" titulo="10. Mudanças nestes Termos">
        <p>
          Podemos atualizar estes Termos. Se a mudança for importante, pediremos que você leia e aceite a nova versão ao entrar no app. Mudanças de
          preço nunca afetam um período já pago.
        </p>
      </Secao>

      <Secao id="lei" titulo="11. Lei aplicável e contato">
        <p>
          Estes Termos seguem as leis do Brasil. Eventuais disputas podem ser resolvidas no foro do seu domicílio. Antes disso, fale com a gente em{" "}
          {RESPONSAVEL.email}. Você também pode registrar reclamações no consumidor.gov.br ou no Procon.
        </p>
      </Secao>
    </DocumentoLegal>
  );
}
