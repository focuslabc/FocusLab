import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Target, FileText, Wind, Flame, Brain, BookOpen, Shield, Loader2, Lock, Calendar, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type TimelineEvent = {
  id: string;
  date: string;
  type: 'red' | 'journal' | 'challenge' | 'decoupling' | 'addiction' | 'library';
  title: string;
  detail: string;
  success: boolean;
};

const EVENT_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  red: { icon: Target, color: 'text-red-400', bg: 'bg-red-900/20', label: 'R.E.D.' },
  journal: { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-900/20', label: 'Diário' },
  challenge: { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-900/20', label: 'Desafio' },
  decoupling: { icon: Wind, color: 'text-cyan-400', bg: 'bg-cyan-900/20', label: 'Desacoplamento' },
  addiction: { icon: Shield, color: 'text-purple-400', bg: 'bg-purple-900/20', label: 'Vício Controlado' },
  library: { icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-900/20', label: 'Biblioteca' },
};

export function MemorialView({ userId, isPremium = false }: { userId: string; isPremium?: boolean }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});

  const maxWeekOffset = isPremium ? 52 : 0; // Premium: 1 year back, free: current week only

  const getWeekRange = useCallback(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) - (weekOffset * 7));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { start: monday, end: sunday };
  }, [weekOffset]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { start, end } = getWeekRange();
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    const allEvents: TimelineEvent[] = [];

    // Fetch RED streaks
    const { data: streaks } = await supabase.from('daily_streaks').select('*')
      .eq('user_id', userId).gte('streak_date', startStr).lte('streak_date', endStr);
    (streaks || []).forEach(s => {
      allEvents.push({
        id: `red-${s.id}`, date: s.streak_date, type: 'red',
        title: `R.E.D. — ${s.red_completed}/${s.red_total}`,
        detail: s.red_completed === s.red_total ? 'Todas as tarefas concluídas' : `${s.red_total - s.red_completed} pendente(s)`,
        success: s.red_completed === s.red_total && s.red_total > 0,
      });
    });

    // Fetch journal entries
    const { data: journals } = await supabase.from('journal_entries').select('*')
      .eq('user_id', userId).gte('entry_date', startStr).lte('entry_date', endStr);
    const journalDates = new Set<string>();
    (journals || []).forEach(j => {
      if (!journalDates.has(j.entry_date)) {
        journalDates.add(j.entry_date);
        allEvents.push({
          id: `journal-${j.entry_date}`, date: j.entry_date, type: 'journal',
          title: 'Diário de Reconfiguração', detail: 'Reflexão registrada',
          success: true,
        });
      }
    });

    // Fetch challenge progress
    const { data: challenges } = await supabase.from('challenge_progress').select('*')
      .eq('user_id', userId).gte('started_at', start.toISOString()).lte('started_at', end.toISOString());
    (challenges || []).forEach(c => {
      allEvents.push({
        id: `challenge-${c.id}`, date: new Date(c.started_at).toISOString().split('T')[0], type: 'challenge',
        title: `Desafio #${c.challenge_id}`,
        detail: c.completed_at ? 'Concluído' : c.is_active ? 'Em progresso' : 'Pausado',
        success: !!c.completed_at,
      });
    });

    // Fetch addiction logs
    const { data: addLogs } = await supabase.from('addiction_daily_logs').select('*')
      .eq('user_id', userId).gte('log_date', startStr).lte('log_date', endStr);
    (addLogs || []).forEach(l => {
      allEvents.push({
        id: `addiction-${l.id}`, date: l.log_date, type: 'addiction',
        title: 'Registro de Hábito',
        detail: l.did_new_routine ? 'Nova rotina aplicada' : l.did_old_routine ? 'Rotina antiga' : 'Sem ação',
        success: !!l.did_new_routine,
      });
    });

    allEvents.sort((a, b) => b.date.localeCompare(a.date));
    setEvents(allEvents);

    // Build heatmap
    const hmap: Record<string, number> = {};
    allEvents.forEach(e => {
      hmap[e.date] = (hmap[e.date] || 0) + (e.success ? 1 : 0);
    });
    setHeatmapData(hmap);
    setLoading(false);
  }, [userId, getWeekRange]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const { start, end } = getWeekRange();
  const weekDays = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    weekDays.push(new Date(d).toISOString().split('T')[0]);
  }

  const filtered = filter ? events.filter(e => e.type === filter) : events;
  const formatDate = (d: string) => {
    const date = new Date(d + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" /> Linhagem do Foco
        </h1>
        <p className="text-zinc-500 font-medium text-sm">Memorial de Consistência — sua linha do tempo de evolução.</p>
      </header>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6 bg-black/20 border border-white/5 rounded-xl p-3">
        <button onClick={() => weekOffset < maxWeekOffset && setWeekOffset(w => w + 1)}
          disabled={weekOffset >= maxWeekOffset}
          className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white disabled:opacity-30 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-white font-bold text-sm">
            {start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} — {end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          {weekOffset === 0 && <p className="text-zinc-500 text-xs">Semana atual</p>}
        </div>
        <button onClick={() => weekOffset > 0 && setWeekOffset(w => w - 1)}
          disabled={weekOffset <= 0}
          className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white disabled:opacity-30 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Premium gate for past weeks */}
      {!isPremium && weekOffset === 0 && (
        <div className="mb-6 bg-gradient-to-r from-amber-900/10 to-amber-900/5 border border-amber-900/20 rounded-xl p-4 flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <p className="text-amber-400 text-sm font-bold">Histórico completo é Premium</p>
            <p className="text-zinc-500 text-xs">Com o Premium, acesse toda sua linha do tempo desde o primeiro dia, busca por IA e relatórios exportáveis.</p>
          </div>
        </div>
      )}

      {/* Heatmap */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" /> Mapa de Atividade
        </h3>
        <div className="flex gap-2">
          {weekDays.map(day => {
            const score = heatmapData[day] || 0;
            const today = new Date().toISOString().split('T')[0];
            const isToday = day === today;
            return (
              <div key={day} className="flex-1 text-center">
                <p className={`text-[10px] font-bold mb-1 ${isToday ? 'text-red-400' : 'text-zinc-600'}`}>
                  {new Date(day + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)}
                </p>
                <div className={`h-8 sm:h-10 rounded-lg transition-colors ${
                  score >= 3 ? 'bg-emerald-500/40 border border-emerald-500/30' :
                  score >= 2 ? 'bg-emerald-500/25 border border-emerald-500/20' :
                  score >= 1 ? 'bg-emerald-500/10 border border-emerald-500/10' :
                  'bg-zinc-900 border border-zinc-800'
                } ${isToday ? 'ring-1 ring-red-500/50' : ''}`} />
                <p className="text-[10px] text-zinc-600 mt-1">{score || '-'}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setFilter(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${!filter ? 'bg-red-900 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
          <Filter className="w-3 h-3" /> Todos
        </button>
        {Object.entries(EVENT_CONFIG).map(([key, cfg]) => (
          <button key={key} onClick={() => setFilter(filter === key ? null : key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${filter === key ? `${cfg.bg} ${cfg.color} border border-current/20` : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
            <cfg.icon className="w-3 h-3" /> {cfg.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Clock className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum registro nesta semana</h3>
          <p className="text-zinc-500 text-sm">Complete tarefas, desafios e use o diário para construir sua linhagem.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-zinc-800" />

          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((event, i) => {
                const cfg = EVENT_CONFIG[event.type];
                return (
                  <motion.div key={event.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex gap-4 items-start relative pl-12">
                    {/* Dot */}
                    <div className={`absolute left-3 top-3 w-4 h-4 rounded-full border-2 ${event.success ? 'border-emerald-500 bg-emerald-500/30' : 'border-zinc-600 bg-zinc-800'}`} />
                    {/* Card */}
                    <div className={`flex-1 ${cfg.bg} border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors`}>
                      <div className="flex items-center gap-2 mb-1">
                        <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                        <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-zinc-600 text-xs ml-auto">{formatDate(event.date)}</span>
                      </div>
                      <h4 className="text-white font-bold text-sm">{event.title}</h4>
                      <p className="text-zinc-400 text-xs mt-0.5">{event.detail}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
