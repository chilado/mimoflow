# 🎨 MimoFlow - Sistema Completo de Gestão para Negócios de Festas e Personalizados

## 📋 Visão Geral

**MimoFlow** é uma plataforma SaaS (Software as a Service) completa e moderna desenvolvida para empresas que trabalham com festas, eventos e produtos personalizados. O sistema oferece gestão integrada de pedidos, estoque, clientes, precificação, catálogo online e muito mais, tudo em uma interface intuitiva e responsiva.

## 🎯 Público-Alvo

- Empresas de festas infantis
- Lojas de produtos personalizados
- Ateliês de artesanato
- Negócios de decoração de eventos
- Empreendedores do segmento de festas

## 🚀 Principais Funcionalidades

### 1. 📊 Dashboard Inteligente
- Visão geral do negócio em tempo real
- Gráficos de vendas e receitas
- Indicadores de performance (KPIs)
- Pedidos recentes e alertas importantes
- Estatísticas de estoque e clientes

### 2. 📦 Gestão de Pedidos
- Criação e acompanhamento de pedidos
- Status personalizados (pendente, em produção, concluído, etc.)
- Informações detalhadas do cliente e evento
- Itens do pedido com quantidades e valores
- Personalização e observações
- Aprovação de arte
- Data de entrega
- Geração de PDF dos pedidos

### 3. 🎨 Gestão de Produtos
- Cadastro completo de produtos
- Múltiplas imagens por produto
- Descrição e preço base
- Vinculação com materiais utilizados
- Cálculo automático de custo
- Organização por categorias

### 4. 📦 Controle de Estoque (Inventário)
- Gestão de materiais e insumos
- Controle de quantidade disponível
- Estoque mínimo com alertas
- Custo por unidade
- Histórico de preços
- Informações de fornecedores
- Categorização de materiais
- Unidades de medida personalizadas

### 5. 💰 Precificação Inteligente
- Calculadora de preços automática
- Configuração de custos fixos mensais
- Margem de lucro desejada
- Taxa de impostos
- Horas de trabalho mensais
- Salário desejado
- Cálculo de hora/trabalho
- Sugestão de preço final

### 6. 👥 Gestão de Clientes
- Cadastro completo de clientes
- Histórico de pedidos
- Informações de contato
- Notas e observações
- Busca e filtros avançados

### 7. 📅 Agenda
- Calendário visual de entregas
- Visualização mensal
- Eventos e compromissos
- Integração com pedidos
- Lembretes de datas importantes

### 8. 💵 Controle Financeiro
- Registro de receitas e despesas
- Categorização de transações
- Relatórios financeiros
- Gráficos de fluxo de caixa
- Análise de lucratividade
- Vinculação com pedidos

### 9. 🌐 Catálogo Online Público
- Página pública personalizada para cada empresa
- URL única: `mimoflow.vercel.app/{slug-da-empresa}`
- Exibição de produtos com imagens
- Informações da empresa (logo, nome, contatos)
- Carrinho de compras
- Envio de pedidos via WhatsApp
- Design responsivo (mobile-first)
- Lightbox para visualização de imagens
- Header recolhível ao fazer scroll

### 10. 💳 Sistema de Assinaturas
- Período de teste gratuito (7 dias)
- Planos flexíveis:
  - **Mensal**: R$ 29,90/mês
  - **Trimestral**: R$ 85,00 (≈ R$ 28,33/mês)
  - **Semestral**: R$ 150,00 (≈ R$ 25,00/mês) - Popular
  - **Anual**: R$ 240,00 (≈ R$ 20,00/mês)
- Pagamento via PIX
- Upload de comprovante
- Controle de vencimento
- Bloqueio automático ao expirar

### 11. 🎫 Sistema de Suporte
- Abertura de chamados
- Tipos de chamado:
  - Assinatura
  - Problema Técnico
  - Cobrança
  - Solicitação de Funcionalidade
  - Reportar Erro
  - Outro
- Acompanhamento de status
- Priorização de tickets
- Notas administrativas

### 12. 🔐 Painel Administrativo (Exclusivo)
- Acesso restrito via URL: `/mimo-painel-admin`
- Login: jarbas.alexa@gmail.com
- Gestão completa de usuários
- Controle de assinaturas
- Aprovação de pagamentos
- Gerenciamento de chamados
- Estatísticas gerais
- Bloqueio/desbloqueio de usuários

### 13. ⚙️ Configurações
- Dados da empresa
- Logo personalizado
- Informações de contato
- WhatsApp e Instagram
- Endereço
- Slug do catálogo
- Tema claro/escuro
- Preferências do sistema

## 🎨 Design e Interface

### Identidade Visual
- **Cor Principal**: Rosa/Magenta vibrante (#E91E63)
- **Estilo**: Moderno, clean e minimalista
- **Tipografia**: 
  - Headings: DM Sans
  - Body: Inter
- **Tema**: Claro e escuro (dark mode)

### Experiência do Usuário
- Interface intuitiva e fácil de usar
- Design responsivo (mobile, tablet, desktop)
- Animações suaves e elegantes
- Feedback visual em todas as ações
- Acessibilidade (WCAG AA)
- Performance otimizada
- PWA (Progressive Web App)

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca JavaScript
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderna
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI de alta qualidade
- **Radix UI** - Componentes acessíveis
- **React Router** - Navegação
- **React Query** - Gerenciamento de estado servidor
- **React Hook Form** - Formulários
- **Zod** - Validação de schemas
- **Lucide React** - Ícones
- **Recharts** - Gráficos
- **jsPDF** - Geração de PDFs
- **date-fns** - Manipulação de datas

### Backend
- **Supabase** - Backend as a Service
  - Autenticação
  - Banco de dados PostgreSQL
  - Storage de arquivos
  - Row Level Security (RLS)
  - Realtime subscriptions

### Infraestrutura
- **Vercel** - Hospedagem e deploy
- **GitHub** - Controle de versão
- **PWA** - Service Workers para offline

## 🔒 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) no banco de dados
- Políticas de acesso granulares
- Sanitização de inputs
- Validação de dados com Zod
- HTTPS obrigatório
- Proteção contra XSS e SQL Injection
- Controle de sessão
- Backup automático

## 📱 Progressive Web App (PWA)

- Instalável em dispositivos móveis e desktop
- Funciona offline (cache inteligente)
- Notificações push
- Ícones e splash screens personalizados
- Atualização automática
- Performance otimizada

## 💳 Sistema de Pagamento

### Método: PIX Manual
- Informações bancárias exibidas no checkout
- Upload de comprovante pelo cliente
- Aprovação manual pelo administrador
- Ativação automática da assinatura
- Integração com WhatsApp para suporte
- Histórico completo de pagamentos

### Fluxo de Pagamento
1. Cliente seleciona plano
2. Visualiza dados PIX
3. Realiza transferência
4. Faz upload do comprovante
5. Admin recebe notificação
6. Admin aprova pagamento
7. Sistema ativa assinatura automaticamente

## 📊 Controle de Acesso

### Usuário Empresa
- Acesso completo ao sistema
- Gestão do próprio negócio
- Catálogo público personalizado
- Suporte via chamados

### Administrador (Jarbas)
- Painel administrativo exclusivo
- Gestão de todos os usuários
- Aprovação de pagamentos
- Gerenciamento de chamados
- Controle de assinaturas
- Estatísticas globais

### Público (Visitantes)
- Acesso ao catálogo online
- Visualização de produtos
- Carrinho de compras
- Envio de pedidos via WhatsApp

## 🎯 Diferenciais

✅ **Tudo em um só lugar** - Gestão completa do negócio
✅ **Catálogo online incluído** - Presença digital automática
✅ **Precificação inteligente** - Nunca mais venda no prejuízo
✅ **Controle de estoque** - Saiba exatamente o que tem
✅ **Financeiro integrado** - Acompanhe lucros e despesas
✅ **Design moderno** - Interface bonita e profissional
✅ **Mobile-first** - Funciona perfeitamente no celular
✅ **Preço acessível** - A partir de R$ 20/mês
✅ **Teste grátis** - 7 dias para experimentar
✅ **Suporte dedicado** - Atendimento via WhatsApp

## 📈 Benefícios para o Cliente

### Organização
- Todos os dados em um só lugar
- Fim das planilhas confusas
- Histórico completo de pedidos
- Controle total do negócio

### Profissionalismo
- Catálogo online personalizado
- Pedidos organizados
- Comunicação clara com clientes
- Imagem profissional

### Economia
- Evita desperdício de materiais
- Precificação correta
- Controle de custos
- Aumento de lucratividade

### Crescimento
- Decisões baseadas em dados
- Identificação de produtos mais vendidos
- Análise de rentabilidade
- Planejamento estratégico

## 🌟 Casos de Uso

### Exemplo 1: Loja de Festas Infantis
- Cadastra produtos (kits de festa, docinhos, decoração)
- Registra materiais (papel, fitas, EVA, etc.)
- Recebe pedidos pelo catálogo online
- Gerencia agenda de entregas
- Controla estoque de materiais
- Calcula preço justo de cada kit

### Exemplo 2: Ateliê de Personalizados
- Cadastra produtos personalizados
- Vincula materiais a cada produto
- Recebe pedidos com especificações
- Aprova arte com cliente
- Controla produção
- Emite relatórios financeiros

### Exemplo 3: Decoração de Eventos
- Gerencia múltiplos eventos
- Controla agenda de montagens
- Cadastra clientes corporativos
- Acompanha custos por evento
- Gera propostas profissionais
- Analisa lucratividade

## 🚀 Roadmap Futuro

- [ ] Integração com marketplaces
- [ ] App mobile nativo
- [ ] Automação de marketing
- [ ] Relatórios avançados
- [ ] Integração com contabilidade
- [ ] Sistema de comissões
- [ ] Multi-idiomas
- [ ] API pública

## 📞 Suporte

- **WhatsApp**: (98) 97400-2272
- **Email**: jarbas.alexa@gmail.com
- **Sistema de Chamados**: Integrado na plataforma

## 🏆 Conclusão

O **MimoFlow** é a solução completa para quem trabalha com festas e produtos personalizados. Com uma interface moderna, funcionalidades robustas e preço acessível, o sistema ajuda empreendedores a organizarem seus negócios, aumentarem a lucratividade e crescerem de forma sustentável.

**Transforme seu negócio com o MimoFlow!** 🎉
