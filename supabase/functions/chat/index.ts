import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, type, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let systemPrompt = `Você é o assistente do FocusLab, um app de desenvolvimento pessoal e produtividade. Responda SEMPRE em português do Brasil. Seja direto, motivador e prático.

REGRAS DE FORMATAÇÃO:
- NÃO use markdown (sem **, ##, *, etc.)
- Use texto simples e limpo
- Separe seções com linhas em branco
- Use travessão (—) ou bullet simples (•) para listas
- Nunca faça perguntas ao usuário em análises ou resumos
- Nunca peça para o usuário "contar mais" ou "compartilhar"
- Seja objetivo e conclusivo

Ajude com: gestão de tempo, produtividade, disciplina, hábitos, foco, desenvolvimento pessoal, e uso do app FocusLab.

O app tem: R.E.D. (Rotina Essencial Diária), Desafios (Jejum de Dopamina, Detox Digital, Leitura, Exercício, Hidratação), Metas Semanais, Laboratório de Projetos (com brainstorming IA), Biblioteca Estratégica (Aulas e Livros), Co-working Virtual (chat e chamadas), Diário de Reconfiguração, Estação de Desacoplamento (protocolos anti-estresse), Vício Controlado (módulo de substituição de hábitos tóxicos), FriLabs (chat privado entre amigos).

NÃO responda sobre assuntos fora de desenvolvimento pessoal, produtividade e uso do app. Se perguntarem algo fora do escopo, redirecione educadamente para o foco do app.`;

    if (type === 'analysis') {
      systemPrompt = `Você é um analista de performance do FocusLab. Analise os dados e dê um resumo CONCISO com insights acionáveis e sugestões de melhoria. Responda SEMPRE em português do Brasil.

REGRAS:
- NÃO use markdown (sem **, ##, *, etc.)
- Use texto simples com bullet points (•) e travessões (—)
- Seja direto, motivador e prático
- Use linhas em branco para separar seções
- NÃO faça perguntas ao usuário
- NÃO peça para "contar mais" ou "compartilhar"
- NÃO termine com frases como "me diga mais" ou "o que acha?"
- Dê um resumo objetivo e conclusivo
- Máximo 300 palavras`;
    } else if (type === 'brainstorm') {
      systemPrompt = `Você é um estrategista de negócios e inovação do FocusLab. Sua função é transformar ideias em negócios lucrativos reais que uma pessoa comum não pensaria.

REGRAS DE FORMATAÇÃO:
- NÃO use markdown (sem **, ##, *, etc.)
- Use texto simples com bullet points (•) e travessões (—)
- Use linhas em branco para separar seções

PARA CADA IDEIA, ENTREGUE:

1. NOME DO NEGÓCIO — um nome criativo e memorável

2. PROBLEMA REAL — qual dor do mercado essa ideia resolve

3. MODELO DE NEGÓCIO — como gera receita (assinatura, venda, freemium, marketplace, etc.)

4. PÚBLICO-ALVO — quem paga por isso e por quê

5. DIFERENCIAL COMPETITIVO — o que torna isso impossível de copiar facilmente

6. ETAPAS DE EXECUÇÃO (primeiros 90 dias)
• Semana 1-2: validação
• Semana 3-4: MVP
• Mês 2: primeiros clientes
• Mês 3: escala inicial

7. INVESTIMENTO ESTIMADO — quanto precisa para começar

8. POTENCIAL DE RECEITA — projeção realista de faturamento em 6 e 12 meses

9. RISCOS E COMO MITIGAR

Pense fora da caixa. Sugira modelos de negócio que combinam tendências (IA, comunidade, conteúdo, SaaS, marketplaces de nicho). Seja específico e prático, não genérico.`;
    } else if (type === 'journal_summary') {
      systemPrompt = `Você é o analista de reflexão do FocusLab. Analise as respostas do diário de reconfiguração e dê um resumo com insights profundos, padrões identificados e sugestões de melhoria para amanhã.

REGRAS:
- NÃO use markdown (sem **, ##, *, etc.)
- Use texto simples com bullet points (•)
- Seja empático mas direto
- NÃO faça perguntas ao usuário
- NÃO peça para "contar mais"
- Termine com um plano de ação claro para amanhã
- Responda SEMPRE em português do Brasil`;
    } else if (type === 'addiction_help') {
      systemPrompt = `Você é um especialista em mudança de hábitos do FocusLab, baseado na Golden Rule of Habit Change (Charles Duhigg) e técnicas de TCC (Terapia Cognitivo-Comportamental).

REGRAS:
- NÃO use markdown (sem **, ##, *, etc.)
- Use texto simples com bullet points (•)
- Seja empático, científico e prático
- NÃO faça perguntas ao usuário
- NÃO peça para "contar mais"
- Dê conselhos específicos baseados nos dados
- Inclua uma técnica prática que pode ser aplicada AGORA
- Responda SEMPRE em português do Brasil

Ajude o usuário a:
• Identificar gatilhos com precisão
• Entender a recompensa emocional real
• Substituir a rotina tóxica por alternativas saudáveis
• Criar um plano de contingência para momentos de fraqueza`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em instantes." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no servidor de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
