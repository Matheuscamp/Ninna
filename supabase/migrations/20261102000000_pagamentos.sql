-- Ninna: pagamentos do Premium pelo Mercado Pago (Checkout Pro, pagamento avulso).
--
-- Cada pagamento aprovado estende o Premium da usuária pelo período comprado.
-- O id do pagamento no Mercado Pago é a chave: o mesmo aviso chegando duas vezes
-- (webhook repetido, volta do checkout) não credita duas vezes.
-- Só o servidor (chave secreta) grava aqui; a usuária só lê os próprios.

create table public.pagamentos (
  id text primary key, -- id do pagamento no Mercado Pago
  user_id uuid not null references auth.users (id) on delete cascade,
  periodo text not null check (periodo in ('mensal', 'anual')),
  meses int not null check (meses > 0),
  valor numeric(10, 2) not null,
  status text not null check (status in ('aprovado', 'estornado')),
  aprovado_em timestamptz not null default now(),
  estornado_em timestamptz
);

create index pagamentos_user_id_idx on public.pagamentos (user_id);

alter table public.pagamentos enable row level security;

create policy "pagamentos: ler os próprios" on public.pagamentos
  for select to authenticated using ((select auth.uid()) = user_id);
-- Sem regras de insert/update/delete para usuárias: só o servidor altera.

-- Credita um pagamento aprovado. Devolve true se creditou agora, false se ele já
-- tinha sido creditado antes. Premium ainda válido é estendido a partir do fim
-- atual (renovar antes de vencer não perde dias); vencido ou gratuito, a partir de agora.
create function public.creditar_pagamento(p_id text, p_user uuid, p_periodo text, p_meses int, p_valor numeric)
returns boolean
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.pagamentos (id, user_id, periodo, meses, valor, status)
  values (p_id, p_user, p_periodo, p_meses, p_valor, 'aprovado')
  on conflict (id) do nothing;
  if not found then
    return false;
  end if;

  insert into public.assinaturas as a (user_id, plano, valido_ate, atualizado_em)
  values (p_user, 'premium', now() + make_interval(months => p_meses), now())
  on conflict (user_id) do update set
    plano = 'premium',
    valido_ate = case
      -- Premium sem prazo (concedido à mão) continua sem prazo.
      when a.plano = 'premium' and a.valido_ate is null then null
      when a.plano = 'premium' then greatest(a.valido_ate, now()) + make_interval(months => p_meses)
      else now() + make_interval(months => p_meses)
    end,
    atualizado_em = now();
  return true;
end;
$$;

-- Estorno ou contestação (chargeback): tira do Premium o período daquele pagamento.
-- Devolve true se estornou agora, false se não havia o que estornar.
create function public.estornar_pagamento(p_id text)
returns boolean
language plpgsql
security definer set search_path = ''
as $$
declare
  v_user uuid;
  v_meses int;
begin
  update public.pagamentos
     set status = 'estornado', estornado_em = now()
   where id = p_id and status = 'aprovado'
  returning user_id, meses into v_user, v_meses;
  if not found then
    return false;
  end if;

  update public.assinaturas
     set valido_ate = valido_ate - make_interval(months => v_meses), atualizado_em = now()
   where user_id = v_user and plano = 'premium' and valido_ate is not null;
  return true;
end;
$$;

-- Só o servidor chama essas funções (com a chave secreta). Sem isto, qualquer
-- pessoa logada poderia se creditar Premium pela API.
revoke execute on function public.creditar_pagamento(text, uuid, text, int, numeric) from public, anon, authenticated;
revoke execute on function public.estornar_pagamento(text) from public, anon, authenticated;
grant execute on function public.creditar_pagamento(text, uuid, text, int, numeric) to service_role;
grant execute on function public.estornar_pagamento(text) to service_role;
