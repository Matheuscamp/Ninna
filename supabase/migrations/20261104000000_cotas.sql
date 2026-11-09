-- Ninna: limites contra abuso. A chave pública do Supabase é pública: qualquer conta
-- pode gravar direto pela API, sem passar pelo app, e o cadastro é aberto. Sem estes
-- limites, uma única conta conseguiria encher o armazenamento e o banco do projeto.
-- Nenhum limite aqui alcança o uso normal, e o Premium segue sem limite de documentos.

-- 1. Tamanho dos campos livres que ainda não tinham limite.
-- `not valid`: vale para o que for gravado daqui em diante, sem reavaliar o que já existe.
alter table public.profiles
  add constraint profiles_nome_tamanho check (char_length(nome) <= 120) not valid,
  add constraint profiles_foto_caminho_tamanho check (char_length(foto_caminho) <= 200) not valid;

alter table public.triage_answers
  add constraint triage_respostas_tamanho check (pg_column_size(respostas) < 20000) not valid,
  add constraint triage_perfil_tamanho check (char_length(perfil) <= 20) not valid;

alter table public.consents
  add constraint consents_versao_tamanho check (char_length(versao) <= 40) not valid;

-- 2. Quantidade de linhas por usuária em cada tabela.
-- Argumentos do gatilho: máximo de linhas e, opcionalmente, 'so_gratuito'.
-- A trava evita que gravações simultâneas passem do limite.
create function public.limitar_linhas()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_maximo int := tg_argv[0]::int;
  v_so_gratuito boolean := coalesce(tg_argv[1] = 'so_gratuito', false);
  v_total int;
begin
  if v_so_gratuito and public.plano_atual(new.user_id) = 'premium' then
    return new;
  end if;
  perform pg_advisory_xact_lock(hashtextextended('linhas:' || tg_table_name || ':' || new.user_id::text, 0));
  execute format('select count(*) from public.%I where user_id = $1', tg_table_name)
    into v_total using new.user_id;
  if v_total >= v_maximo then
    raise exception 'limite_registros' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger limitar_linhas before insert on public.triage_answers
  for each row execute function public.limitar_linhas('50');
create trigger limitar_linhas before insert on public.consents
  for each row execute function public.limitar_linhas('100');
create trigger limitar_linhas before insert on public.task_progress
  for each row execute function public.limitar_linhas('500');
create trigger limitar_linhas before insert on public.appointments
  for each row execute function public.limitar_linhas('300', 'so_gratuito');

-- 3. Quantidade de arquivos por usuária. O limite de 10 documentos conta linhas de
-- health_documents; arquivos enviados e nunca registrados ficavam de fora.
-- Precisa ser gatilho, e não regra de RLS: quem envia por link assinado não passa
-- pela regra de insert na hora do envio.
-- Gratuito: 20 arquivos (os 10 documentos, com folga para envios interrompidos).
create function public.limitar_arquivos()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_dona uuid;
  v_maximo int;
  v_total int;
begin
  if new.bucket_id not in ('documentos', 'avatares') then
    return new;
  end if;

  begin
    v_dona := (storage.foldername(new.name))[1]::uuid;
  exception when invalid_text_representation then
    return new; -- fora da pasta de uma usuária: as regras de RLS já barram
  end;
  if v_dona is null then
    return new;
  end if;

  if new.bucket_id = 'avatares' then
    v_maximo := 5;
  elsif public.plano_atual(v_dona) = 'premium' then
    return new;
  else
    v_maximo := 20;
  end if;

  perform pg_advisory_xact_lock(hashtextextended('arquivos:' || new.bucket_id || ':' || v_dona::text, 0));
  select count(*) into v_total
    from storage.objects o
   where o.bucket_id = new.bucket_id and o.name like v_dona::text || '/%';
  if v_total >= v_maximo then
    raise exception 'limite_arquivos' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger limitar_arquivos before insert on storage.objects
  for each row execute function public.limitar_arquivos();

-- São só gatilhos: nada aqui é para a API.
revoke execute on function public.limitar_linhas() from public, anon, authenticated;
revoke execute on function public.limitar_arquivos() from public, anon, authenticated;
