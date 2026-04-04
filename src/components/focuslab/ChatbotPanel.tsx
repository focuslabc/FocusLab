import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export function ChatbotPanel() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Msg = { role: 'user', content: input.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';
    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok || !resp.body) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao conectar com a IA');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '' || !line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch { textBuffer = line + '\n' + textBuffer; break; }
        }
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: e.message || 'Erro ao processar resposta.' }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-b from-zinc-950 to-zinc-900/50">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-900/20 rounded-2xl flex items-center justify-center border border-red-900/30">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Assistente IA</h1>
            <p className="text-zinc-500 text-xs sm:text-sm font-medium">Desenvolvimento pessoal e produtividade</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-900/10 rounded-3xl flex items-center justify-center mb-6 border border-red-900/20">
              <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-600" />
            </div>
            <h2 className="text-white text-lg sm:text-xl font-bold mb-2">Olá! Sou o assistente do FocusLab.</h2>
            <p className="text-zinc-500 text-sm max-w-md mb-8">
              Pergunte sobre produtividade, hábitos, disciplina ou como usar o app.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
              {[
                'Como manter a disciplina?',
                'Dicas para acordar mais cedo',
                'O que é a R.E.D.?',
                'Como parar de procrastinar?'
              ].map(q => (
                <button key={q} onClick={() => { setInput(q); }}
                  className="text-left px-4 py-3 bg-black/30 border border-white/5 rounded-xl text-zinc-400 text-sm hover:border-red-900/30 hover:text-zinc-200 transition-all">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[70%] lg:max-w-[60%] px-4 py-3 rounded-2xl text-sm sm:text-base whitespace-pre-wrap leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-red-900/30 text-white rounded-br-md border border-red-900/20'
                  : 'bg-black/40 text-zinc-200 rounded-bl-md border border-white/5'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="bg-black/40 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-md">
              <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-t border-white/5 flex-shrink-0">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Pergunte algo..."
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm sm:text-base focus:outline-none focus:border-red-600 placeholder:text-zinc-600 transition-colors"
          />
          <button
            onClick={send}
            disabled={isLoading || !input.trim()}
            className="px-4 sm:px-5 py-3 bg-red-900 hover:bg-red-800 text-white rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2 font-semibold"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
