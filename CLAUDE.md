@AGENTS.md

# Ninna — orientações para quem for trabalhar no projeto

Assistente de gestação. O README descreve o que existe (rotas, migrações, planos, segurança). Aqui ficam os cuidados que não são óbvios no código.

## Antes de mexer
- Next.js 16 com `cacheComponents`: toda leitura de sessão/cookies fica dentro de `<Suspense>`. Leia o guia em `node_modules/next/dist/docs/` antes de usar uma API do Next.
- Toda página logada usa `exigirUsuariaPronta()` de `src/lib/dal.ts`, o único ponto que lê sessão, consentimento e perfil.
- Migrações em `supabase/migrations/` são rodadas **à mão** pela dona do projeto no SQL Editor do Supabase. Ao criar uma, avise e espere ela rodar; o app deve tolerar a migração ainda não aplicada.
- Funções novas no Postgres ficam executáveis por qualquer um por padrão: use `revoke execute ... from public, anon, authenticated` em funções que não são para a API.
- O plano (gratuito/premium) fica na tabela `assinaturas`, que a usuária só lê. Nunca no `profiles`, que ela pode editar. Limites e preços em `src/lib/planos.ts`.
- Premium só é creditado por `processarPagamento` (`src/lib/mercadopago.ts`), a partir do pagamento lido da API do Mercado Pago, e pelas funções `creditar_pagamento`/`estornar_pagamento`, que só a chave secreta executa. Nunca confie em status ou valor vindos da URL ou do corpo do webhook. `createAdminClient` (chave secreta) é só para isso.

## Armadilhas já encontradas
- O `fetch` do Next duplica respostas para cache: leitura parcial + cancelamento trava. Para buscas diretas use `fetchSupabase` (`src/lib/supabase/fetch.ts`), que também refaz conexões que travam (a rede local às vezes oscila).
- O servidor de desenvolvimento (Turbopack) às vezes mantém módulos antigos: se a tela não refletir o código, confira com `npx next build && npx next start -p 3001` e reinicie o `npm run dev`.
- Confirmação de e-mail está desligada no Supabase durante o desenvolvimento (o SMTP embutido tem limite por hora). Antes de lançar: SMTP próprio (Resend) e religar.

## Como testar
- `npm test` (vitest), `npm run typecheck`, `npm run lint`, `npm run build`.
- Fluxos com login são testados com o Supabase simulado em `src/test/supabase-falso.ts` (não criar contas reais nem digitar senhas).
- Pagamentos: nunca pagar de verdade nem digitar cartão; a API do Mercado Pago é simulada nos testes (`src/lib/mercadopago.test.ts`).
- Para conferir uma tela logada sem conta: página temporária de prévia que renderiza o componente visual com dados de exemplo; apague-a depois.

## Conteúdo de saúde e textos jurídicos
Textos em `src/content/` são uma primeira versão e precisam de revisão de obstetra ou enfermeira obstétrica antes do lançamento.
Termos de Uso (`/termos`) e Política de Privacidade (`/privacidade`) também são primeira versão, para revisão de advogado; os dados do responsável ficam em `src/content/juridico.ts`. Ao coletar um dado novo, usar um fornecedor novo ou mudar preço/regra do Premium, atualize esses textos e suba `VERSAO_CONSENTIMENTO`.

## Próximas etapas
Lembretes de consulta (notificação/e-mail), PWA com modo offline. O que falta para lançar está na seção "Antes de lançar" do README.
