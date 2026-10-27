import type { Metadata } from "next";
import Link from "next/link";
import { DocumentoLegal, Lista, Secao } from "@/components/documento-legal";
import { RESPONSAVEL } from "@/content/juridico";

export const metadata: Metadata = { title: "Política de Privacidade" };

// Primeira versão: precisa de revisão de advogado antes do lançamento (veja src/content/juridico.ts).
// Ao coletar um dado novo ou usar um fornecedor novo, atualize esta página.
export default function PrivacidadePage() {
  return (
    <DocumentoLegal
      titulo="Política de Privacidade"
      resumo={
        <>
          <p className="font-bold">O essencial, em poucas linhas</p>
          <Lista>
            <li>Usamos seus dados de saúde só para personalizar o Ninna para você.</li>
            <li>Não vendemos seus dados e não usamos nada do que você guarda para anúncios.</li>
            <li>Seus documentos ficam num espaço privado. Ninguém mais tem acesso, nem por link.</li>
            <li>Você pode baixar uma cópia de tudo ou apagar sua conta quando quiser, pelo Perfil.</li>
          </Lista>
        </>
      }
    >
      <Secao id="controlador" titulo="1. Quem cuida dos seus dados">
        <p>
          O controlador dos dados pessoais tratados no Ninna é {RESPONSAVEL.nome}, inscrito sob o nº {RESPONSAVEL.documento}, com endereço em{" "}
          {RESPONSAVEL.endereco}.
        </p>
        <p>
          O encarregado pelo tratamento de dados pessoais é {RESPONSAVEL.encarregado}, que pode ser contatado em {RESPONSAVEL.email}.
        </p>
      </Secao>

      <Secao id="dados" titulo="2. Quais dados guardamos">
        <p>
          <strong>Conta:</strong> e-mail, senha (guardada de forma cifrada, ninguém consegue lê-la) e nome. Se você entrar com o Google, recebemos seu
          e-mail e nome da conta Google.
        </p>
        <p>
          <strong>Dados de saúde</strong>, que a LGPD chama de dados sensíveis:
        </p>
        <Lista>
          <li>respostas da triagem, como o seu momento, data da última menstruação ou data provável do parto, primeira gestação, cesárea ou perda anterior, gestação de risco e acompanhamento pré-natal;</li>
          <li>ficha de saúde que você preencher: data de nascimento, tipo sanguíneo, peso, altura, alergias e medicamentos;</li>
          <li>consultas e exames da agenda, tarefas marcadas nos guias e os documentos de saúde que você enviar, como exames, laudos e receitas;</li>
          <li>foto de perfil, se você enviar.</li>
        </Lista>
        <p>
          <strong>Contato de emergência:</strong> nome, parentesco e telefone de uma pessoa que você indicar. Só cadastre alguém que concorde com isso.
        </p>
        <p>
          <strong>Pagamentos do Premium:</strong> número do pagamento no Mercado Pago, período, valor, data e situação, como aprovado ou reembolsado.{" "}
          <strong>Não recebemos nem guardamos dados de cartão</strong>; quem processa o pagamento é o Mercado Pago.
        </p>
        <p>
          <strong>Registros de aceite:</strong> quando você aceitou estes termos e o uso dos dados de saúde, e qual versão.
        </p>
      </Secao>

      <Secao id="finalidades" titulo="3. Para que usamos e com qual base legal">
        <Lista>
          <li>
            <strong>Personalizar o app</strong>, como calcular as semanas de gestação, mostrar orientações e exames da sua fase e organizar sua agenda
            e documentos. Base legal: seu <strong>consentimento específico e destacado</strong> para dados de saúde (LGPD, art. 11, I), pedido antes de você
            usar o app.
          </li>
          <li>
            <strong>Manter sua conta e prestar o serviço contratado</strong>, incluindo o Premium. Base legal: execução de contrato (art. 7º, V).
          </li>
          <li>
            <strong>Cumprir obrigações legais</strong>, como guardar registros de acesso e documentos fiscais pelos prazos da lei. Base legal: art. 7º, II.
          </li>
          <li>
            <strong>Segurança</strong>, para evitar fraudes e acessos indevidos. Base legal: legítimo interesse (art. 7º, IX), nunca com dados de saúde.
          </li>
        </Lista>
        <p>
          Não usamos seus dados para anúncios, não criamos perfis para terceiros e não tomamos decisões automatizadas que afetem seus direitos.
        </p>
      </Secao>

      <Secao id="compartilhamento" titulo="4. Com quem compartilhamos">
        <p>Não vendemos seus dados. Eles passam apenas por fornecedores necessários para o Ninna funcionar, que só podem usá-los para isso:</p>
        <Lista>
          <li>
            <strong>Supabase:</strong> banco de dados, login e armazenamento de arquivos. Os dados ficam em servidores na região de São Paulo.
          </li>
          <li>
            <strong>Mercado Pago:</strong> processamento dos pagamentos do Premium. O Mercado Pago trata os dados do pagamento conforme a política de
            privacidade dele.
          </li>
          <li>
            <strong>Google:</strong> apenas se você escolher entrar com o Google.
          </li>
          <li>
            <strong>Provedores de hospedagem e de envio de e-mail</strong>, para o site funcionar e para enviarmos e-mails da sua conta.
          </li>
        </Lista>
        <p>
          Alguns desses fornecedores são empresas estrangeiras e podem tratar dados fora do Brasil. Nesses casos, exigimos garantias de proteção
          compatíveis com a LGPD (art. 33). Também podemos compartilhar dados quando uma autoridade exigir por lei ou ordem judicial.
        </p>
      </Secao>

      <Secao id="seguranca" titulo="5. Como protegemos">
        <Lista>
          <li>Toda comunicação com o Ninna é criptografada (https).</li>
          <li>Regras no próprio banco de dados garantem que cada conta só acessa os próprios dados.</li>
          <li>Documentos e fotos ficam num armazenamento privado. Para abrir um arquivo, o app gera um link que expira em segundos.</li>
          <li>Os arquivos enviados são conferidos, e só imagens e PDFs são aceitos.</li>
        </Lista>
        <p>
          Se acontecer um incidente de segurança que possa trazer risco a você, avisaremos você e a Autoridade Nacional de Proteção de Dados (ANPD).
        </p>
      </Secao>

      <Secao id="retencao" titulo="6. Por quanto tempo guardamos">
        <p>
          Guardamos seus dados enquanto sua conta existir. Ao excluir a conta, apagamos do Ninna seus dados e arquivos, sem possibilidade de
          recuperação. Ficam apenas o que a lei obriga a manter, como notas fiscais e registros de pagamento, que também ficam no Mercado Pago, e
          registros de acesso, pelo prazo legal de 6 meses (Marco Civil da Internet).
        </p>
        <p>
          Antes de criar a conta, as respostas da triagem ficam só no seu navegador, por até 24 horas.
        </p>
      </Secao>

      <Secao id="direitos" titulo="7. Seus direitos e como exercê-los">
        <p>Pela LGPD (art. 18), você pode:</p>
        <Lista>
          <li>
            <strong>Ver e baixar seus dados:</strong> em Perfil › Exportar meus dados, você recebe uma cópia de tudo em formato aberto (portabilidade).
          </li>
          <li>
            <strong>Corrigir:</strong> edite sua ficha, agenda e documentos no próprio app, ou refaça a triagem.
          </li>
          <li>
            <strong>Apagar e revogar o consentimento:</strong> em Perfil › Excluir conta e dados. Como os dados de saúde são a base do app, revogar o
            consentimento significa encerrar a conta.
          </li>
          <li>
            <strong>Saber com quem compartilhamos, pedir informações ou se opor a algum uso:</strong> escreva para {RESPONSAVEL.email}.
          </li>
        </Lista>
        <p>
          Respondemos em até 15 dias. Se não ficar satisfeita, você pode reclamar à ANPD (gov.br/anpd).
        </p>
      </Secao>

      <Secao id="cookies" titulo="8. Cookies e armazenamento no navegador">
        <p>
          Usamos apenas cookies essenciais, que mantêm você conectada à sua conta. Não usamos cookies de publicidade nem de rastreamento. O navegador
          também guarda, por até 24 horas, as respostas da triagem feita antes do cadastro.
        </p>
      </Secao>

      <Secao id="mudancas" titulo="9. Mudanças nesta política">
        <p>
          Se mudarmos algo importante, como um novo uso dos dados ou um novo fornecedor que receba dados de saúde, pediremos seu aceite de novo ao
          entrar no app. Veja também os <Link href="/termos" className="font-semibold text-azul-700 underline">Termos de Uso</Link>.
        </p>
      </Secao>
    </DocumentoLegal>
  );
}
