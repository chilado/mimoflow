# Configuração do Storage para Comprovantes de Pagamento

## Problema
O erro ao enviar comprovante ocorre porque o bucket `payment-proofs` não existe no Supabase Storage ou as políticas de acesso não estão configuradas.

## Solução

### Opção 1: Via Interface do Supabase (Recomendado)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Storage** no menu lateral
4. Clique em **New bucket**
5. Configure o bucket:
   - **Name**: `payment-proofs`
   - **Public bucket**: ✅ Marque como público
   - Clique em **Create bucket**

6. Configurar políticas de acesso:
   - Clique no bucket `payment-proofs`
   - Vá na aba **Policies**
   - Clique em **New Policy**
   - Crie as seguintes políticas:

#### Política 1: Upload de usuários
```
Policy name: Users can upload payment proofs
Allowed operation: INSERT
Target roles: authenticated
USING expression: 
bucket_id = 'payment-proofs' AND (storage.foldername(name))[1] = auth.uid()::text
```

#### Política 2: Visualização própria
```
Policy name: Users can view own payment proofs
Allowed operation: SELECT
Target roles: authenticated
USING expression:
bucket_id = 'payment-proofs' AND (storage.foldername(name))[1] = auth.uid()::text
```

#### Política 3: Admin visualiza tudo
```
Policy name: Admin can view all payment proofs
Allowed operation: SELECT
Target roles: authenticated
USING expression:
bucket_id = 'payment-proofs' AND auth.jwt() ->> 'email' = 'jarbas.alexa@gmail.com'
```

#### Política 4: Acesso público
```
Policy name: Public can view payment proofs
Allowed operation: SELECT
Target roles: public
USING expression:
bucket_id = 'payment-proofs'
```

### Opção 2: Via SQL Editor

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New query**
5. Cole o conteúdo do arquivo `SETUP_STORAGE.sql`
6. Clique em **Run** ou pressione `Ctrl+Enter`

## Verificação

Após configurar, teste o upload:

1. Acesse a página **Meu Plano**
2. Selecione um plano
3. Faça upload de uma imagem ou PDF
4. Verifique se aparece a mensagem de sucesso

## Troubleshooting

### Erro: "Bucket not found"
- Verifique se o bucket `payment-proofs` foi criado
- Confirme que o nome está correto (sem espaços ou caracteres especiais)

### Erro: "Permission denied"
- Verifique se as políticas foram criadas corretamente
- Confirme que o bucket está marcado como público
- Verifique se o usuário está autenticado

### Erro: "Invalid file path"
- O sistema cria automaticamente uma pasta com o ID do usuário
- Formato: `{user_id}/{timestamp}.{extensão}`
- Exemplo: `abc123/1234567890.jpg`

## Estrutura de Pastas

```
payment-proofs/
├── {user_id_1}/
│   ├── 1234567890.jpg
│   ├── 1234567891.pdf
│   └── ...
├── {user_id_2}/
│   ├── 1234567892.jpg
│   └── ...
└── ...
```

Cada usuário tem sua própria pasta identificada pelo `user_id`, garantindo organização e segurança.

## Logs de Debug

O código agora inclui logs detalhados no console do navegador:
- `Tentando fazer upload do arquivo: ...`
- `Upload realizado com sucesso: ...`
- `URL pública: ...`
- Mensagens de erro específicas

Abra o Console do navegador (F12) para ver os logs durante o upload.
