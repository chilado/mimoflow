-- Criar políticas de administração para o painel admin
-- IMPORTANTE: Estas políticas permitem acesso total aos dados para fins administrativos

-- Remover políticas existentes que podem estar bloqueando
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Política para visualizar todos os perfis (necessário para o painel admin)
CREATE POLICY "Allow read all profiles"
ON profiles FOR SELECT
USING (true);

-- Política para atualizar qualquer perfil (necessário para o painel admin)
CREATE POLICY "Allow update all profiles"
ON profiles FOR UPDATE
USING (true)
WITH CHECK (true);

-- Política para inserir perfis
CREATE POLICY "Allow insert profiles"
ON profiles FOR INSERT
WITH CHECK (true);

-- Adicionar comentário explicativo
COMMENT ON TABLE profiles IS 'Tabela de perfis com acesso administrativo total para gerenciamento via painel admin';
