# Setup Completo do Sistema de Pagamento PIX

## Passo a Passo para Configurar

### 1️⃣ Criar a Tabela payment_proofs

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New query**
5. Cole o conteúdo do arquivo `CREATE_PAYMENT_PROOFS_TABLE.sql`
6. Clique em **Run** (ou Ctrl+Enter)
7. Aguarde a mensagem de sucesso

### 2️⃣ Criar o Bucket de Storage

1. No Supabase Dashboard, vá em **Storage**
2. Clique em **New bucket**
3. Configure:
   - **Name**: `payment-proofs`
   - **Public bucket**: ✅ **MARQUE ESTA OPÇÃO**
4. Clique em **Create bucket**

### 3️⃣ Configurar Políticas do Storage

1. Clique no bucket `payment-proofs` que você acabou de criar
2. Vá na aba **Policies**
3. Clique em **New Policy**
4. Selecione **For full customization**
5. Cole este código:

```sql
-- Política 1: Upload
CREATE POLICY "Users can upload payment proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política 2: Visualização pública
CREATE POLICY "Public can view payment proofs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payment-proofs');
```

### 4️⃣ Atualizar Types do Supabase (Opcional mas Recomendado)

Execute no terminal do projeto:

```bash
npx supabase gen types typescript --project-id seu-project-id > src/integrations/supabase/types.ts
```

Ou manualmente atualize o arquivo `src/integrations/supabase/types.ts` se necessário.

### 5️⃣ Testar o Sistema

1. Acesse http://localhost:8080
2. Faça login com uma conta de teste
3. Vá em **Meu Plano**
4. Selecione um plano
5. Faça upload de uma imagem de teste
6. Verifique se aparece "Comprovante enviado com sucesso!"

### 6️⃣ Testar o Painel Admin

1. Acesse http://localhost:8080/mimo-painel-admin
2. Login: `jarbas.alexa@gmail.com`
3. Senha: `Jarbas8080`
4. Vá na aba **Pagamentos**
5. Verifique se o comprovante aparece
6. Teste aprovar o pagamento

## Verificação Rápida

Execute este SQL para verificar se tudo está configurado:

```sql
-- Verificar tabela
SELECT COUNT(*) as total_comprovantes FROM public.payment_proofs;

-- Verificar bucket
SELECT * FROM storage.buckets WHERE id = 'payment-proofs';

-- Verificar políticas da tabela
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'payment_proofs';

-- Verificar políticas do storage
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%payment%';
```

## Estrutura Final

### Tabela: payment_proofs
- ✅ Criada com todas as colunas necessárias
- ✅ RLS habilitado
- ✅ Políticas de acesso configuradas
- ✅ Índices para performance
- ✅ Trigger para updated_at

### Storage: payment-proofs
- ✅ Bucket público criado
- ✅ Políticas de upload configuradas
- ✅ Políticas de visualização configuradas

### Estrutura de Pastas no Storage
```
payment-proofs/
├── {user_id_1}/
│   ├── 1234567890.jpg
│   ├── 1234567891.pdf
│   └── ...
├── {user_id_2}/
│   └── ...
```

## Troubleshooting

### Erro: "Bucket not found"
✅ Solução: Criar o bucket conforme Passo 2

### Erro: "Could not find the table"
✅ Solução: Executar o SQL do Passo 1

### Erro: "Permission denied"
✅ Solução: Verificar políticas RLS (Passos 1 e 3)

### Erro: "Invalid file path"
✅ Solução: Verificar se o bucket está público

## Comandos Úteis

### Limpar dados de teste
```sql
-- Remover todos os comprovantes (cuidado!)
DELETE FROM public.payment_proofs;

-- Remover comprovantes de um usuário específico
DELETE FROM public.payment_proofs WHERE user_id = 'user-id-aqui';
```

### Ver últimos comprovantes
```sql
SELECT 
  company_name,
  plan,
  amount,
  status,
  created_at
FROM public.payment_proofs
ORDER BY created_at DESC
LIMIT 10;
```

## Pronto! 🎉

Após seguir todos os passos, o sistema de pagamento PIX estará 100% funcional.
