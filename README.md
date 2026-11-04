# Plantão ENEM IA

Plataforma de estudos para o ENEM com inteligência artificial embutida: um tutor por área do conhecimento que responde dúvidas (inclusive a partir da foto da questão) e um corretor de redação que avalia o texto pelas 5 competências oficiais do ENEM.

Projeto pessoal, construído sozinho do zero com desenvolvimento assistido por IA (Lovable), publicado e com assinaturas pagas via PIX. **Resultado: 2 assinantes.**

> Esta é a versão pública do código. Credenciais, senhas e dados do projeto em produção foram removidos, e o histórico de commits não foi incluído.

## O problema

Quem estuda para o ENEM sozinho tem pouco acesso a correção de redação e a alguém para tirar dúvidas na hora. Correção humana é cara e demora; professor particular, mais ainda.

## O que a plataforma faz

| Funcionalidade | Como funciona |
| --- | --- |
| **Tutor de IA por área** | O aluno envia a dúvida em texto ou foto. A Edge Function `answer-question` escolhe um prompt de sistema por área (Matemática, Língua Portuguesa, Ciências da Natureza, Ciências Humanas, Redação) e consulta o GPT-4o, que também lê imagens. |
| **Correção de redação** | A função `correct-essay` avalia a redação nas 5 competências do ENEM (0–200 cada) e devolve JSON com nota final, nota por competência, pontos fortes, pontos a melhorar e dicas. |
| **Conteúdo por área e provas anteriores** | Painéis do aluno por área e área administrativa para o professor publicar atividades, gabaritos, simulados e provas anteriores. |
| **Planos e assinatura** | 5 planos (Simulado, Bronze, Silver, Gold e Platina, de R$ 19 a R$ 119) com liberação de recursos por plano. |
| **Pagamento** | PIX e cartão via Mercado Pago, com webhook que ativa a assinatura automaticamente. A primeira versão usava Stripe e foi migrada para o Mercado Pago, que tem PIX. |

## Arquitetura

```
React + Vite (front-end)
   │  Supabase Auth · consultas com RLS
   ▼
Supabase (PostgreSQL + Storage)
   │
   ├── Edge Function answer-question ──► OpenAI GPT-4o (texto + imagem)
   ├── Edge Function correct-essay   ──► OpenAI GPT-4o (saída em JSON)
   ├── Edge Function create-mercadopago-payment ──► Mercado Pago (PIX / cartão)
   └── Edge Function mercadopago-webhook ◄── confirmação do pagamento → ativa o plano
```

**Stack:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Supabase (PostgreSQL, Auth, Storage, Edge Functions em Deno), OpenAI GPT-4o, Mercado Pago. Desenvolvido com Lovable.

## Decisões de prompt

- **Um especialista por área:** o prompt de sistema muda conforme a matéria da dúvida, para a resposta seguir a abordagem de cada área.
- **Saída estruturada na correção:** o modelo devolve JSON em formato fixo, gravado direto no banco e exibido em tela. Se o JSON vier inválido, um fallback guarda o texto da resposta em vez de perder a correção.
- **Temperatura baixa (0,3):** correções e explicações mais consistentes entre execuções.

## Como rodar

1. Crie um projeto no Supabase e aplique as migrações de `supabase/migrations`.
2. Copie `.env.example` para `.env` e preencha a URL e a chave pública do Supabase.
3. Nos secrets das Edge Functions, configure `OPENAI_API_KEY` e `MERCADO_PAGO_ACCESS_TOKEN`.
4. Rode:

```bash
npm install
npm run dev
```

## Limitações conhecidas

Esta foi a primeira versão de um MVP, e documentar o que eu faria diferente faz parte do projeto:

- O acesso de administrador e as contas de demonstração são validados no front-end. Em produção, o caminho certo é usar perfis no banco com RLS.
- Na primeira versão, a chave da OpenAI ficava numa tabela do banco. Nesta versão pública ela é lida apenas dos secrets das Edge Functions, e a função de leitura não pode ser chamada pelo cliente.
- Não há testes automatizados.

## Autor

**Walker Rocha** · Estudante de Ciência de Dados e IA (PUC Minas) · [LinkedIn](https://www.linkedin.com/in/walker-rocha-09a86525b) · [GitHub](https://github.com/WalkerRocha)
