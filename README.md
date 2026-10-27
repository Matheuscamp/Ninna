# Ninna

Assistente de gestação: triagem por perfil (tentante, suspeita, gestante, pós-parto, acolhimento), orientação por fase e agenda do pré-natal. Web app em Next.js 16 + Supabase, pensado para virar PWA.

Já entregue: **login**, **consentimento LGPD**, **triagem** e o **painel** (Início, Agenda, Conteúdo, Perfil e guias interativos).

## Como rodar

1. Crie um projeto em [supabase.com](https://supabase.com), de preferência na região São Paulo.
2. No SQL Editor do Supabase, rode **em ordem** os arquivos de `supabase/migrations/`:
   - `20261026000000_inicial.sql`: perfil, consentimentos e triagem.
   - `20261027000000_painel.sql`: agenda, progresso dos guias e exclusão da conta.
   - `20261028000000_agenda_editar.sql` e `20261029000000_agenda_concluir.sql`: editar e concluir consultas.
   - `20261030000000_documentos.sql`: Central de Documentos (bucket privado no Storage + tabela).
   - `20261031000000_planos.sql` e `20261031000001_planos_permissoes.sql`: plano da usuária (gratuito ou premium) e limite de 10 documentos no gratuito.
   - `20261101000000_ficha_saude.sql`: foto de perfil (bucket privado) e ficha pessoal e de saúde.
   - `20261102000000_pagamentos.sql`: pagamentos do Premium pelo Mercado Pago.

   Todas as tabelas têm RLS ligado.
3. Copie `.env.example` para `.env.local` e preencha a URL e a publishable key do projeto.
4. Em Authentication › URL Configuration, adicione `http://localhost:3000/auth/callback` às Redirect URLs.
5. Instale e rode:

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

**Login com Google (opcional):** em Authentication › Providers › Google, cole o Client ID e o Secret criados no Google Cloud Console. Sem isso, o botão "Continuar com Google" volta para a tela de login com erro.

**Pagamento do Premium (opcional):** veja [Assinatura Premium](#assinatura-premium-mercado-pago). Sem as credenciais, a tela do Premium abre mas o botão de pagar avisa que o pagamento não está disponível.

**Confirmação de e-mail:** se estiver ligada no Supabase (padrão), o cadastro mostra "Confira seu e-mail" e o link leva direto ao consentimento.

## Fluxo

```
/            landing
/triagem     perguntas ramificadas → resultado (não precisa de conta)
/cadastro    cria a conta (ou /entrar)
/consentimento   aceite de dados de saúde + termos (obrigatório, versionado)
/triagem/concluir  grava a triagem respondida antes do login
/app                 início adaptado ao perfil (exige login, consentimento e triagem)
/app/agenda          consultas e exames (até 3 futuras no plano gratuito)
/app/conteudo        artigos por perfil
/app/perfil          momento, conta, ficha de saúde, exportar e excluir conta
/app/perfil/editar   foto de perfil e dados pessoais e de saúde
/app/guias/semana    tarefas e exames da fase (gestante)
/app/guias/parto     tipos de parto, prós e contras
/app/guias/sintomas  checador de sintomas e como confirmar (suspeita)
/app/alertas         sinais de alerta, sempre gratuitos
/app/documentos      central de documentos de saúde (enviar, buscar, filtrar, abrir, baixar, editar, excluir)
/app/premium         planos Premium e pagamento (Mercado Pago)
/app/premium/retorno volta do checkout: confere o pagamento e mostra o resultado
/api/mercadopago/webhook  avisos de pagamento do Mercado Pago
```

Antes do login, as respostas da triagem ficam só no `localStorage` do navegador (por até 24 horas, para sobreviver à aba nova aberta pelo link de confirmação). Elas vão ao servidor depois do consentimento e são apagadas do navegador em seguida.

## Estrutura

| Caminho | O que tem |
| --- | --- |
| `src/lib/triagem.ts` | Regras da triagem: perfil, idade gestacional, DPP, validação (zod) |
| `src/lib/dal.ts` | Único ponto que lê sessão, consentimento e perfil |
| `src/lib/supabase/` | Clientes do Supabase para servidor e proxy |
| `src/proxy.ts` | Renova a sessão e manda quem não está logada para `/entrar` |
| `src/app/(auth)/` | Entrar, cadastro, Google, sair |
| `src/app/consentimento/` | Tela e registro do consentimento |
| `src/app/triagem/` | Assistente da triagem e gravação |
| `src/content/` | Conteúdo dos guias e artigos (a revisar por profissional; depois vai para o CMS) |
| `src/app/app/` | Painel: Início, Agenda, Conteúdo, Perfil, guias e alertas |
| `src/lib/pagamentos.ts` | Regras do pagamento: referência do pedido, o que fazer com cada status, assinatura do webhook |
| `src/lib/mercadopago.ts` | Chamadas à API do Mercado Pago e crédito do Premium |
| `src/lib/documentos.ts` | Regras da Central de Documentos: categorias, tipos, tamanho, assinatura dos arquivos, filtros |
| `supabase/migrations/` | Esquema do banco e regras RLS |

## Central de Documentos: segurança

- Arquivos num bucket **privado** do Supabase Storage, em `documentos/{id da usuária}/`. Regras RLS no Storage e na tabela: cada usuária só acessa a própria pasta.
- O navegador envia o arquivo por um link de envio de uso único gerado pelo servidor (com barra de progresso). Depois, o servidor confere tamanho, tipo e os primeiros bytes do arquivo; se não for imagem ou PDF de verdade, o arquivo é apagado.
- Abrir e baixar passam por `/app/documentos/[id]/arquivo`, que confere a dona e gera um link que expira em 60 segundos. Não existem links públicos permanentes.
- Excluir a conta apaga também os arquivos do Storage.

## Planos

| Recurso | Gratuito | Premium |
| --- | --- | --- |
| Consultas futuras na agenda | até 3 | ilimitadas |
| Documentos de saúde | até 10 | ilimitados |

O plano fica na tabela `assinaturas`, que a usuária só pode ler (não pode se marcar como Premium). Quem altera é o servidor, a partir de um pagamento confirmado. O limite de documentos também é garantido por uma trava no banco. Os limites e os preços ficam em `src/lib/planos.ts`.

Artigos marcados como Premium só abrem para quem é Premium. Sinais de alerta são sempre gratuitos.

## Assinatura Premium (Mercado Pago)

Pagamento avulso pelo Checkout Pro (Pix, cartão ou boleto), sem renovação automática:

| Período | Preço |
| --- | --- |
| 1 mês | R$ 14,90 |
| 12 meses | R$ 99,90 |

**Como funciona:** a usuária escolhe o período em `/app/premium`, o servidor cria o pedido no Mercado Pago e a leva ao checkout. O Premium é creditado quando o pagamento aprovado é **lido da API do Mercado Pago** (nunca pelo que vem na URL ou no corpo do aviso), conferindo que o valor pago bate com o preço do período. Isso acontece em dois lugares, e o que chegar primeiro credita:

- na volta do checkout (`/app/premium/retorno`), para o Premium aparecer na hora (funciona também em localhost);
- no webhook (`/api/mercadopago/webhook`), para Pix e boleto que confirmam depois.

O banco grava cada pagamento pelo id do Mercado Pago (tabela `pagamentos`), então o mesmo pagamento nunca é creditado duas vezes. Renovar antes de vencer soma o período ao fim atual. Estorno ou chargeback tira o período daquele pagamento. As funções que creditam e estornam só podem ser chamadas pelo servidor com a chave secreta.

**Configuração:**

1. Rode a migração `20261102000000_pagamentos.sql`.
2. No `.env.local`, preencha:
   - `SUPABASE_SECRET_KEY`: Supabase › Project Settings › API Keys › Secret keys (`sb_secret_...`). Só no servidor; nunca com prefixo `NEXT_PUBLIC_`.
   - `MERCADOPAGO_ACCESS_TOKEN`: Mercado Pago › Suas integrações › sua aplicação › Credenciais. Para testar, use as **credenciais de teste** e pague com uma conta compradora de teste e os cartões de teste do Mercado Pago.
   - `MERCADOPAGO_WEBHOOK_SECRET`: em Suas integrações › Webhooks, cadastre `https://SEU-DOMINIO/api/mercadopago/webhook` com o evento **Pagamentos** e copie a assinatura secreta. Com ela preenchida, avisos sem assinatura válida são recusados.
3. O webhook precisa de endereço público (https). Em localhost ele não chega, mas a volta do checkout já credita o Premium.

## Scripts

```bash
npm run dev        # servidor de desenvolvimento
npm test           # testes das regras da triagem (vitest)
npm run typecheck  # checagem de tipos
npm run lint
npm run build
```

## Próximas etapas (backlog do MVP)

Lembretes por notificação (S4), PWA offline e lançamento (S6).
