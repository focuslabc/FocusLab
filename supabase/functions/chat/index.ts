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

Ajude com: gestão de tempo, produtividade, disciplina, hábitos, foco, desenvolvimento pessoal, e uso do app FocusLab.

O app tem: R.E.D. (Rotina Essencial Diária), Desafios (Jejum de Dopamina, Detox Digital, Leitura, Exercício, Hidratação), Metas Semanais, Laboratório de Projetos (com brainstorming IA), Biblioteca Estratégica (Aulas e Livros), Co-working Virtual (chat e chamadas), Diário de Reconfiguração, Estação de Desacoplamento (protocolos anti-estresse), Vício Controlado (módulo de substituição de hábitos tóxicos), FriLabs (chat privado entre amigos).

NÃO responda sobre assuntos fora de desenvolvimento pessoal, produtividade e uso do app. Se perguntarem algo fora do escopo, redirecione educadamente para o foco do app.`;

    if (type === 'analysis') {
      systemPrompt = `Você é um analista de performance do FocusLab. Analise os dados fornecidos e dê um resumo CONCISO com insights acionáveis e sugestões de melhoria. Responda SEMPRE em português do Brasil. Seja direto, motivador e prático. Use bullet points e formatação clara. Máximo 300 palavras.`;
    } else if (type === 'brainstorm') {
      systemPrompt = `Você é um consultor criativo do FocusLab. Faça brainstorming detalhado sobre ideias de projetos. Sugira: nome, objetivo, etapas de execução, recursos necessários e possíveis obstáculos. Responda SEMPRE em português do Brasil. Seja criativo e prático.`;
    } else if (type === 'journal_summary') {
      systemPrompt = `Você é o analista de reflexão do FocusLab. Analise as respostas do diário de reconfiguração e dê um resumo com insights profundos, padrões identificados e sugestões de melhoria para amanhã. Responda SEMPRE em português do Brasil. Seja empático mas direto.`;
    } else if (type === 'addiction_help') {
      systemPrompt = `Você é um especialista em mudança de hábitos do FocusLab, baseado na Golden Rule of Habit Change (Charles Duhigg). Ajude o usuário a identificar gatilhos, entender recompensas e substituir rotinas tóxicas por alternativas saudáveis. Responda SEMPRE em português do Brasil. Seja empático, científico e prático.`;
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
