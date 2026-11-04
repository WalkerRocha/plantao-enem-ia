
# Guia de Configuração do Supabase

## 1. Executar Migração SQL

No painel do Supabase, vá em:
- **SQL Editor**
- Cole e execute o conteúdo do arquivo `supabase/migrations/001_create_tables.sql`

## 2. Criar Edge Functions

### 2.1. Função create-checkout
1. Vá em **Edge Functions**
2. Clique em **New Function**
3. Nome: `create-checkout`
4. Cole o código de `supabase/functions/create-checkout/index.ts`

### 2.2. Função check-subscription
1. Clique em **New Function**
2. Nome: `check-subscription`
3. Cole o código de `supabase/functions/check-subscription/index.ts`

### 2.3. Função correct-essay
1. Clique em **New Function**
2. Nome: `correct-essay`
3. Cole o código de `supabase/functions/correct-essay/index.ts`

## 3. Configurar Secrets (Variáveis de Ambiente)

No painel do Supabase, vá em **Settings > Secrets** e adicione:

### 3.1. Stripe Secret Key
- **Nome:** `STRIPE_SECRET_KEY`
- **Valor:** Sua chave secreta do Stripe (começa com `sk_`)

### 3.2. OpenAI API Key (para correção de redação)
- **Nome:** `OPENAI_API_KEY`
- **Valor:** Sua chave da OpenAI (opcional, por enquanto usa simulação)

## 4. Configurar Stripe Dashboard

### 4.1. Criar Produto Plano Silver
1. Vá em **Products** no Stripe Dashboard
2. Clique em **Add Product**
3. Nome: "Plantão Enem - Plano Silver"
4. Preço: R$ 49,00 (recorrente mensal)
5. Anote o **Price ID** gerado

### 4.2. Criar Produto Plano Gold
1. Clique em **Add Product**
2. Nome: "Plantão Enem - Plano Gold"
3. Preço: R$ 89,00 (recorrente mensal)
4. Anote o **Price ID** gerado

## 5. Configurar Variáveis de Ambiente no Frontend

No seu projeto Lovable, configure as variáveis:
- `VITE_SUPABASE_URL`: URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase

## 6. Teste o Sistema

1. Acesse a página de cadastro
2. Crie uma conta
3. Faça login
4. Teste a seleção de planos
5. Verifique o checkout do Stripe
6. Teste a área do aluno após pagamento

## Observações Importantes

- Certifique-se de estar no modo **Test** no Stripe durante desenvolvimento
- As Edge Functions podem levar alguns minutos para ficarem ativas
- Verifique os logs das funções em caso de erro
- O sistema de correção de redação usa simulação por enquanto
