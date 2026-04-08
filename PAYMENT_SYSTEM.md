# Sistema de Pagamento Manual via PIX

## Resumo das Alterações

Sistema de pagamento via Stripe foi completamente removido e substituído por um sistema manual de pagamento via PIX com gerenciamento administrativo.

## Funcionalidades Implementadas

### 1. Página Meu Plano (PlanPage)

#### Remoções:
- ✅ Removida integração com Stripe
- ✅ Removida função `create-checkout`
- ✅ Removidos parâmetros de URL do Stripe (success/cancelled)
- ✅ Removida variável `acting` não utilizada

#### Adições:
- ✅ Dialog de pagamento PIX ao selecionar plano
- ✅ Exibição de informações bancárias:
  - Nome: Jarbson Braga Santos
  - Chave PIX: 98974002272 (Celular)
  - Banco: Santander
  - Valor do plano selecionado
- ✅ Upload de comprovante de pagamento (imagem ou PDF)
- ✅ Botão para enviar comprovante via WhatsApp
- ✅ Mensagem de alerta sobre prazo de aprovação (24h úteis)

### 2. Banco de Dados

#### Tabela Utilizada: `payment_proofs` (já existente)
```sql
- id: uuid (PK)
- user_id: uuid (FK para auth.users)
- company_name: text
- plan: enum (monthly, quarterly, semiannual, annual)
- amount: numeric
- proof_url: text (URL do comprovante no storage)
- status: enum (pending, approved, rejected)
- admin_notes: text
- approved_at: timestamp
- approved_by: text
- created_at: timestamp
- updated_at: timestamp
```

#### Storage Bucket: `payment-proofs` (já existente)
- ✅ Bucket público para visualização
- ✅ Políticas RLS já configuradas

### 3. Painel Administrativo

#### Nova Aba: Pagamentos
- ✅ Dashboard com estatísticas:
  - Total de pagamentos pendentes
  - Total de pagamentos aprovados
  - Total de pagamentos rejeitados
- ✅ Tabela de comprovantes com:
  - Empresa
  - Plano escolhido
  - Valor
  - Status (badge colorido)
  - Data de envio
- ✅ Filtros:
  - Busca por empresa ou ID
  - Filtro por status (todos, pendentes, aprovados, rejeitados)
- ✅ Ações por comprovante:
  - Ver comprovante (abre em nova aba)
  - Gerenciar (dialog de aprovação/rejeição)
  - Enviar WhatsApp para cliente

#### Dialog de Gerenciamento:
- ✅ Visualização de detalhes do pagamento
- ✅ Campo para notas administrativas
- ✅ Botão "Aprovar e Ativar Plano":
  - Atualiza status do comprovante para "approved"
  - Cria ou atualiza assinatura na tabela `subscriptions`
  - Atualiza profile com novo plano
  - Calcula data de expiração automaticamente
  - Desbloqueia usuário se estiver bloqueado
- ✅ Botão "Rejeitar":
  - Atualiza status para "rejected"
  - Salva notas administrativas

### 4. Componente AdminPaymentsTab

Novo componente criado em `src/components/AdminPaymentsTab.tsx`:
- ✅ Gerenciamento completo de comprovantes
- ✅ Interface responsiva
- ✅ Integração com Supabase Storage
- ✅ Integração com WhatsApp
- ✅ Feedback visual com badges coloridos
- ✅ Loading states e error handling

## Fluxo de Pagamento

### Usuário:
1. Acessa página "Meu Plano"
2. Seleciona um plano (Mensal, Trimestral, Semestral ou Anual)
3. Dialog abre com informações PIX
4. Realiza transferência PIX
5. Faz upload do comprovante
6. Opcionalmente envia via WhatsApp
7. Aguarda aprovação (até 24h úteis)

### Administrador:
1. Acessa painel admin (mimo-painel-admin)
2. Vai para aba "Pagamentos"
3. Visualiza comprovantes pendentes
4. Clica em "Gerenciar" no comprovante
5. Visualiza o comprovante
6. Adiciona notas se necessário
7. Aprova ou rejeita o pagamento
8. Sistema ativa assinatura automaticamente se aprovado

## Informações de Contato

- **WhatsApp Suporte**: 98974002272
- **Chave PIX**: 98974002272 (Celular)
- **Titular**: Jarbson Braga Santos
- **Banco**: Santander

## Valores dos Planos

- **Mensal**: R$ 29,90 (30 dias)
- **Trimestral**: R$ 85,00 (90 dias)
- **Semestral**: R$ 150,00 (180 dias)
- **Anual**: R$ 240,00 (365 dias)

## Arquivos Modificados

- `src/pages/PlanPage.tsx` - Removido Stripe, adicionado PIX
- `src/pages/AdminPanelPage.tsx` - Adicionada aba de pagamentos
- `src/components/AdminPaymentsTab.tsx` - Novo componente (criado)
- `src/integrations/supabase/types.ts` - Tipos atualizados

## Próximos Passos

O sistema está pronto para uso! Basta testar o fluxo completo:

1. Usuário seleciona plano
2. Usuário faz upload de comprovante
3. Admin aprova pagamento no painel
4. Verificar se assinatura foi ativada automaticamente

## Segurança

- ✅ Políticas RLS implementadas
- ✅ Apenas usuários autenticados podem fazer upload
- ✅ Usuários só veem próprios comprovantes
- ✅ Admin tem acesso total
- ✅ Validação de tipos de arquivo (imagem/PDF)
- ✅ Nomes de arquivo únicos com timestamp

## Observações

- Sistema totalmente desacoplado do Stripe
- Não há mais dependências de pagamento automático
- Controle total do admin sobre aprovações
- Histórico completo de pagamentos mantido
- Integração com WhatsApp para suporte rápido
