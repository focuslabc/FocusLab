import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Plus, X, ArrowLeft, Brain, BarChart3, Loader2, Trash2, Check } from 'lucide-react';
import { useAddictionHabits, useAddictionLogs } from '@/hooks/useSupabaseData';

const CUE_OPTIONS = ['Estresse', 'Tédio', 'Ansiedade', 'Solidão', 'Horário Específico', 'Local Específico', 'Pessoa Específica'];
const REWARD_OPTIONS = ['Alívio imediato', 'Prazer sensorial', 'Distração', 'Socialização', 'Energia temporária'];
const ROUTINE_SUGGESTIONS: Record<string, string[]> = {
  'Alívio imediato': ['Respiração 4-7-8', 'Caminhada rápida (5 min)', 'Chá calmante', 'Journaling rápido'],
  'Prazer sensorial': ['Música motivacional', 'Alongamento prazeroso', 'Banho revigorante', 'Fruta favorita'],
  'Distração': ['Meditação guiada 5 min', 'Ligar para um amigo', 'Desenhar algo', 'Ler 2 páginas'],
  'Socialização': ['Mandar mensagem para amigo', 'Participar do Co-working', 'Exercício em grupo'],
  'Energia temporária': ['Exercício curto (burpees)', 'Água gelada no rosto', 'Respiração Wim Hof', 'Sprints de 30s'],
};

export function AddictionView({ userId }: { userId: string }) {
  const { habits, loading, addHabit, updateHabit, removeHabit } = useAddictionHabits(userId);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', frequency: '', cue: '', routine: '', reward: '', new_routine: '' });
  const [step, setStep] = useState(0);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    await addHabit(form);
    setForm({ name: '', description: '', frequency: '', cue: '', routine: '', reward: '', new_routine: '' });
    setShowCreate(false);
    setStep(0);
  };

  if (selectedHabit) {
    const habit = habits.find(h => h.id === selectedHabit);
    if (!habit) return null;
    return <HabitDetail habit={habit} userId={userId} onBack={() => setSelectedHabit(null)} onRemove={() => { removeHabit(habit.id); setSelectedHabit(null); }} />;
  }

  if (showCreate) {
    const suggestions = ROUTINE_SUGGESTIONS[form.reward] || [];
    return (
      <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
        <button onClick={() => { setShowCreate(false); setStep(0); }} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm"><ArrowLeft className="w-4 h-4" /> Voltar</button>
        <h1 className="text-2xl font-bold text-white mb-6">Mapear Novo Hábito</h1>
        <div className="max-w-2xl space-y-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg text-white font-bold">1. Identifique o Hábito</h2>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Fumar, Redes sociais excessivas..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600" />
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descrição (opcional)..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600 h-20 resize-none" />
              <input value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))} placeholder="Frequência (ex: 5x/dia, 3x/semana)..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600" />
              <button onClick={() => setStep(1)} disabled={!form.name.trim()} className="w-full py-3 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold disabled:opacity-50">Próximo →</button>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg text-white font-bold">2. Mapeie o Loop (Awareness Training)</h2>
              <div><label className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Gatilho (Cue)</label>
                <div className="flex flex-wrap gap-2 mb-2">{CUE_OPTIONS.map(c => <button key={c} onClick={() => setForm(p => ({ ...p, cue: c }))} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${form.cue === c ? 'bg-red-900 text-white' : 'bg-zinc-800 text-zinc-400'}`}>{c}</button>)}</div>
                <input value={form.cue} onChange={e => setForm(p => ({ ...p, cue: e.target.value }))} placeholder="Ou descreva..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-600" />
              </div>
              <div><label className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Comportamento Atual (Routine)</label>
                <input value={form.routine} onChange={e => setForm(p => ({ ...p, routine: e.target.value }))} placeholder="O que você faz quando o gatilho dispara?" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600" />
              </div>
              <div><label className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Recompensa Real (Reward)</label>
                <div className="flex flex-wrap gap-2 mb-2">{REWARD_OPTIONS.map(r => <button key={r} onClick={() => setForm(p => ({ ...p, reward: r }))} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${form.reward === r ? 'bg-red-900 text-white' : 'bg-zinc-800 text-zinc-400'}`}>{r}</button>)}</div>
              </div>
              <button onClick={() => setStep(2)} className="w-full py-3 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold">Próximo →</button>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg text-white font-bold">3. Golden Rule — Nova Rotina</h2>
              <p className="text-zinc-400 text-sm">Mantenha o Gatilho + Recompensa, troque apenas a Rotina.</p>
              {suggestions.length > 0 && (
                <div><label className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Sugestões para "{form.reward}"</label>
                  <div className="flex flex-wrap gap-2">{suggestions.map(s => <button key={s} onClick={() => setForm(p => ({ ...p, new_routine: s }))} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${form.new_routine === s ? 'bg-emerald-900 text-emerald-300' : 'bg-zinc-800 text-zinc-400'}`}>{s}</button>)}</div>
                </div>
              )}
              <input value={form.new_routine} onChange={e => setForm(p => ({ ...p, new_routine: e.target.value }))} placeholder="Ou crie sua própria rotina substituta..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600" />
              <button onClick={handleCreate} disabled={!form.new_routine.trim()} className="w-full py-3 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl font-bold disabled:opacity-50">✓ Salvar Hábito</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3"><Shield className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" /> Vício Controlado</h1>
          <p className="text-zinc-500 font-medium text-sm sm:text-base">Substitua hábitos tóxicos pela Golden Rule.</p></div>
        <button onClick={() => setShowCreate(true)} className="px-5 py-3 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold text-sm flex items-center gap-2 shrink-0"><Plus className="w-4 h-4" /> NOVO HÁBITO</button>
      </div>
      {loading ? <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto" /> :
        habits.length === 0 ? (
          <div className="py-16 text-center"><Shield className="w-16 h-16 text-zinc-700 mx-auto mb-4" /><h3 className="text-xl font-bold text-white mb-2">Nenhum hábito mapeado</h3><p className="text-zinc-500 font-medium">Comece mapeando um hábito que deseja mudar.</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {habits.map(h => (
              <div key={h.id} onClick={() => setSelectedHabit(h.id)} className="bg-black/20 border border-white/5 rounded-2xl p-5 sm:p-6 hover:border-red-900/30 transition-all cursor-pointer group">
                <h3 className="text-lg font-bold text-white mb-1">{h.name}</h3>
                {h.frequency && <p className="text-zinc-500 text-xs mb-2">Frequência: {h.frequency}</p>}
                <div className="flex items-center gap-2 mt-3"><span className="px-2 py-0.5 bg-red-900/20 text-red-400 text-[10px] rounded-full font-bold">{h.cue || 'Gatilho'}</span><span className="text-zinc-600">→</span><span className="px-2 py-0.5 bg-emerald-900/20 text-emerald-400 text-[10px] rounded-full font-bold">{h.new_routine || 'Nova Rotina'}</span></div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

function HabitDetail({ habit, userId, onBack, onRemove }: { habit: any; userId: string; onBack: () => void; onRemove: () => void }) {
  const { logs, logDay } = useAddictionLogs(habit.id);
  const [didOld, setDidOld] = useState(false);
  const [didNew, setDidNew] = useState(false);
  const [craving, setCraving] = useState(5);
  const [note, setNote] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const todayLog = logs.find(l => l.log_date === new Date().toISOString().split('T')[0]);
  const successRate = logs.length > 0 ? Math.round((logs.filter(l => l.did_new_routine && !l.did_old_routine).length / logs.length) * 100) : 0;

  const handleLog = async () => {
    await logDay(userId, didOld, didNew, craving, note);
    setNote('');
  };

  const getAIHelp = async () => {
    setAiLoading(true); setAiResult('');
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ type: 'addiction_help', messages: [{ role: 'user', content: `Hábito: ${habit.name}. Gatilho: ${habit.cue}. Rotina antiga: ${habit.routine}. Recompensa: ${habit.reward}. Nova rotina: ${habit.new_routine}. Taxa de sucesso: ${successRate}%. Últimos registros: ${logs.slice(0, 7).map(l => `${l.log_date}: old=${l.did_old_routine}, new=${l.did_new_routine}, craving=${l.craving_level}`).join('; ')}. Dê conselhos e motivação.` }] }),
      });
      if (!resp.ok || !resp.body) throw new Error();
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '', res = '';
      while (true) { const { done, value } = await reader.read(); if (done) break; buf += decoder.decode(value, { stream: true }); let idx; while ((idx = buf.indexOf('\n')) !== -1) { let line = buf.slice(0, idx); buf = buf.slice(idx + 1); if (line.endsWith('\r')) line = line.slice(0, -1); if (!line.startsWith('data: ')) continue; const j = line.slice(6).trim(); if (j === '[DONE]') break; try { const p = JSON.parse(j); const c = p.choices?.[0]?.delta?.content; if (c) { res += c; setAiResult(res); } } catch {} } }
    } catch { setAiResult('Erro ao conectar com IA.'); }
    setAiLoading(false);
  };

  return (
    <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm"><ArrowLeft className="w-4 h-4" /> Voltar</button>
      <div className="flex justify-between items-start mb-6">
        <div><h1 className="text-2xl font-bold text-white mb-1">{habit.name}</h1><p className="text-zinc-500 text-sm">{habit.description || 'Sem descrição'}</p></div>
        <button onClick={onRemove} className="p-2 bg-zinc-800 hover:bg-red-900/30 text-zinc-400 hover:text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
      </div>

      {/* Loop Mapping */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-red-900/10 border border-red-900/20 rounded-xl p-4"><p className="text-red-400 text-xs font-bold uppercase mb-1">Gatilho</p><p className="text-white text-sm">{habit.cue || '-'}</p></div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"><p className="text-zinc-400 text-xs font-bold uppercase mb-1">Rotina Antiga</p><p className="text-white text-sm line-through">{habit.routine || '-'}</p></div>
        <div className="bg-emerald-900/10 border border-emerald-900/20 rounded-xl p-4"><p className="text-emerald-400 text-xs font-bold uppercase mb-1">Nova Rotina</p><p className="text-white text-sm">{habit.new_routine || '-'}</p></div>
      </div>

      {/* Daily Log */}
      <div className="bg-black/20 border border-white/5 rounded-2xl p-6 mb-6 max-w-2xl">
        <h3 className="text-white font-bold mb-4">Registro de Hoje</h3>
        {todayLog ? (
          <div className="text-emerald-400 flex items-center gap-2"><Check className="w-5 h-5" /> Registro de hoje já salvo!</div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={didOld} onChange={e => setDidOld(e.target.checked)} className="accent-red-600" /><span className="text-sm text-zinc-300">Fiz a rotina antiga</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={didNew} onChange={e => setDidNew(e.target.checked)} className="accent-emerald-600" /><span className="text-sm text-zinc-300">Fiz a nova rotina</span></label>
            </div>
            <div><label className="text-xs text-zinc-500 uppercase font-bold mb-2 block">Nível de Desejo (1-10): {craving}</label>
              <input type="range" min={1} max={10} value={craving} onChange={e => setCraving(Number(e.target.value))} className="w-full accent-red-600" /></div>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Nota rápida (opcional)..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-600" />
            <button onClick={handleLog} className="w-full py-3 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold">Registrar</button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-center"><p className="text-xs text-zinc-500 uppercase font-bold mb-1">Registros</p><p className="text-2xl font-bold text-white">{logs.length}</p></div>
        <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-center"><p className="text-xs text-zinc-500 uppercase font-bold mb-1">Taxa Sucesso</p><p className="text-2xl font-bold text-emerald-400">{successRate}%</p></div>
        <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-center"><p className="text-xs text-zinc-500 uppercase font-bold mb-1">Desejo Médio</p><p className="text-2xl font-bold text-yellow-400">{logs.length > 0 ? (logs.reduce((a, l) => a + (l.craving_level || 5), 0) / logs.length).toFixed(1) : '-'}</p></div>
        <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-center"><p className="text-xs text-zinc-500 uppercase font-bold mb-1">Recompensa</p><p className="text-sm font-bold text-white truncate">{habit.reward || '-'}</p></div>
      </div>

      {/* AI Help */}
      <button onClick={getAIHelp} disabled={aiLoading} className="px-5 py-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-xl text-sm font-bold border border-red-900/30 flex items-center gap-2 mb-4">
        {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />} Conselho da IA
      </button>
      {aiResult && <div className="bg-black/30 border border-red-900/20 rounded-xl p-4 text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">{aiResult}</div>}
    </div>
  );
}
