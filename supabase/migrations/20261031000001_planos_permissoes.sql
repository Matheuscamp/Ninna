-- Ninna: fecha a função plano_atual na API.
-- Ela ficou executável por qualquer pessoa (até sem login): bastava o id de uma
-- usuária para saber se ela é Premium. Só a trava de documentos precisa dela, e
-- essa trava roda como dona do banco (security definer), então segue funcionando.
-- O app lê o plano pela tabela assinaturas, que tem RLS.
revoke execute on function public.plano_atual(uuid) from public, anon, authenticated;
