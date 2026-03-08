// RedViewReal - Adapted for local state (no Supabase)
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Target, Check, Plus, Trash2, Save, Settings, Clock, X,
  Brain, Dumbbell, Briefcase, MoreHorizontal, Loader2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export interface RedTask {
  id: string;
  user_id: string;
  text: string;
  category: 'Bio' | 'Mind' | 'Work' | 'Outro';
  completed: boolean;
  completed_at?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

type TaskCategory = 'Bio' | 'Mind' | 'Work' | 'Outro';

const CATEGORY_ICONS: Record<TaskCategory, any> = {
  Bio: Dumbbell, Mind: Brain, Work: Briefcase, Outro: MoreHorizontal
};

export function RedViewReal({
  tasks, tasksLoading, addTask, toggleTask, removeTask, updateTask,
  objective, objectiveLoading, updateObjective, createObjective, userId
}: {
  tasks: RedTask[];
  tasksLoading: boolean;
  addTask: (t: Omit<RedTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<RedTask>) => Promise<void>;
  objective: any;
  objectiveLoading: boolean;
  updateObjective: (u: any) => Promise<void>;
  createObjective: (o: any) => Promise<void>;
  userId: string | null;
}) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [newTask, setNewTask] = useState<{ text: string; category: TaskCategory }>({ text: '', category: 'Work' });
  const [tempMeta, setTempMeta] = useState('');
  const [tempDate, setTempDate] = useState('');
  const [tempTime, setTempTime] = useState('');
  const [timeToNextEvent, setTimeToNextEvent] = useState('');
  const [nextEventLabel, setNextEventLabel] = useState('');

  useEffect(() => {
    if (objective) {
      setTempMeta(objective.title);
      setTempDate(objective.target_date);
      setTempTime(objective.end_time || '23:59');
    } else if (!objectiveLoading && userId) {
      const nextQuarter = new Date();
      nextQuarter.setMonth(nextQuarter.getMonth() + 3);
      createObjective({
        title: 'Conquistar meu próximo grande objetivo',
        target_date: nextQuarter.toISOString().split('T')[0],
        end_time: '23:59',
        quarter: 'Q1 2026'
      });
    }
  }, [objective, objectiveLoading, userId, createObjective]);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const cycleStart = new Date();
      if (now.getHours() >= 3) cycleStart.setDate(now.getDate() + 1);
      cycleStart.setHours(3, 0, 0, 0);
      const hours = now.getHours();
      let target: Date; let label: string;
      if (hours < 3) { target = cycleStart; label = 'Reset do Ciclo'; }
      else if (hours < 12) { target = new Date(now); target.setHours(12, 0, 0, 0); label = 'Bloco da Manhã'; }
      else if (hours < 18) { target = new Date(now); target.setHours(18, 0, 0, 0); label = 'Bloco da Tarde'; }
      else { target = cycleStart; label = 'Bloco Noturno'; }
      const diff = target.getTime() - now.getTime();
      const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
      const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeToNextEvent(`${String(hoursLeft).padStart(2, '0')}:${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`);
      setNextEventLabel(label);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAddTask = async () => {
    if (!newTask.text.trim() || !userId) return;
    setIsSavingTask(true);
    await addTask({ text: newTask.text.trim(), category: newTask.category, completed: false, position: tasks.length });
    setNewTask({ text: '', category: 'Work' });
    setIsAddingTask(false);
    setIsSavingTask(false);
  };

  const handleSaveMeta = async () => {
    if (!objective) return;
    await updateObjective({ title: tempMeta, target_date: tempDate, end_time: tempTime });
    setIsEditingMeta(false);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isRedComplete = totalCount > 0 && completedCount === totalCount;

  if (tasksLoading || objectiveLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center"><Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" /><p className="text-zinc-400 font-medium">Carregando R.E.D...</p></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-6 lg:p-12 overflow-y-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">R.E.D. - Rotina Essencial Diária</h1>
          <p className="text-zinc-500 font-medium">Sua base inegociável de execução</p>
        </div>
        <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-zinc-800 backdrop-blur-sm">
          <Clock className="w-5 h-5 text-red-600" />
          <div className="text-right">
            <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{nextEventLabel}</div>
            <div className="text-red-600 font-mono font-bold">{timeToNextEvent}</div>
          </div>
        </div>
      </header>

      {/* Skill Wheel */}
      <div className="mb-12 flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 bg-red-900/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative w-64 h-64 md:w-80 md:h-80 mb-6">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
            {totalCount === 0 && <circle cx="50" cy="50" r="45" fill="transparent" stroke="#27272a" strokeWidth="2" strokeDasharray="4 4" />}
            {tasks.map((task, i) => {
              const segmentAngle = 360 / totalCount;
              const startAngle = i * segmentAngle - 90;
              const endAngle = startAngle + segmentAngle - (totalCount > 1 ? 2 : 0);
              const startRad = (Math.PI * startAngle) / 180;
              const endRad = (Math.PI * endAngle) / 180;
              const r = 45;
              const x1 = 50 + r * Math.cos(startRad); const y1 = 50 + r * Math.sin(startRad);
              const x2 = 50 + r * Math.cos(endRad); const y2 = 50 + r * Math.sin(endRad);
              const largeArcFlag = segmentAngle - 2 > 180 ? 1 : 0;
              const pathData = totalCount === 1
                ? `M 50 5 a 45 45 0 1 1 -0.1 0`
                : `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
              return (
                <motion.path key={`wheel-${task.id}`} d={pathData} fill="none"
                  stroke={task.completed ? "#dc2626" : "#27272a"} strokeWidth="8" strokeLinecap="round"
                  className="cursor-pointer transition-colors duration-300 hover:stroke-red-800"
                  onClick={() => toggleTask(task.id)}
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: i * 0.1 }} />
              );
            })}
            <circle cx="50" cy="50" r="30" fill="#09090b" className="shadow-inner" />
            {isRedComplete ? (
              <g className="text-red-500 animate-pulse">
                <circle cx="50" cy="50" r="28" fill="none" stroke="#dc2626" strokeWidth="1" />
                <text x="50" y="52" fontSize="12" fill="#dc2626" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">NÚCLEO</text>
                <text x="50" y="62" fontSize="8" fill="#ef4444" textAnchor="middle" dominantBaseline="middle">ATIVO</text>
              </g>
            ) : (
              <text x="50" y="55" fontSize="10" fill="#52525b" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">{completedCount}/{totalCount}</text>
            )}
          </svg>
          {tasks.map((task, i) => {
            const segmentAngle = 360 / totalCount;
            const midAngle = i * segmentAngle + (segmentAngle / 2) - 90;
            const midRad = (Math.PI * midAngle) / 180;
            const r = 45;
            const left = 50 + r * Math.cos(midRad);
            const top = 50 + r * Math.sin(midRad);
            const Icon = CATEGORY_ICONS[task.category];
            return (
              <div key={`icon-${task.id}`} className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: `${left}%`, top: `${top}%` }}>
                <Icon className={cn("w-4 h-4 md:w-5 md:h-5", task.completed ? "text-white" : "text-zinc-600")} />
              </div>
            );
          })}
        </div>
        <p className="text-zinc-400 text-sm font-medium text-center max-w-xs">
          {isRedComplete ? "Acesso total liberado. Você ativou a RED hoje." : "Toque nos segmentos para registrar conclusão."}
        </p>
      </div>

      {/* Meta Trimestral */}
      {objective && (
        <div className="mb-8 bg-gradient-to-r from-zinc-900 to-black border border-red-900/30 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5"><Target className="w-48 h-48 text-red-600" /></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="px-3 py-1 bg-red-900/20 border border-red-900/50 rounded-full text-red-400 text-xs font-bold uppercase tracking-widest">Objeto de Foco ({objective.quarter || 'Q1 2026'})</div>
              <button onClick={() => { setTempMeta(objective.title); setTempDate(objective.target_date); setTempTime(objective.end_time || '23:59'); setIsEditingMeta(!isEditingMeta); }}
                className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-colors"><Settings className="w-4 h-4" /></button>
            </div>
            {isEditingMeta ? (
              <div className="space-y-3">
                <input value={tempMeta} onChange={(e) => setTempMeta(e.target.value)} className="w-full bg-black/40 border border-red-900/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600" placeholder="Ex: Lançar meu primeiro produto digital" />
                <div className="flex gap-3">
                  <input type="date" value={tempDate} onChange={(e) => setTempDate(e.target.value)} className="flex-1 bg-black/40 border border-red-900/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-red-600" />
                  <input type="time" value={tempTime} onChange={(e) => setTempTime(e.target.value)} className="bg-black/40 border border-red-900/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-red-600" />
                  <button onClick={handleSaveMeta} className="bg-red-900 hover:bg-red-800 text-white px-6 py-2 rounded-xl font-bold transition-colors flex items-center gap-2"><Save className="w-4 h-4" /> SALVAR</button>
                </div>
              </div>
            ) : (
              <h2 className="text-2xl md:text-3xl font-bold text-white">{objective.title}</h2>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-6 bg-black/20 border border-zinc-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Progresso Diário</span>
          <span className="text-2xl font-bold text-white">{completionRate}%</span>
        </div>
        <div className="h-3 bg-zinc-900 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${completionRate}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full" />
        </div>
        <div className="mt-2 text-xs text-zinc-500 font-medium">{completedCount} de {totalCount} tarefas completadas</div>
      </div>

      {/* Tasks */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">Tarefas do Núcleo</h3>
          <div className="flex gap-2">
            {tasks.length > 0 && (
              <button onClick={() => setIsDeleting(!isDeleting)} className={cn("px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2", isDeleting ? "bg-red-900 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700")}>
                <Trash2 className="w-4 h-4" />{isDeleting ? 'CANCELAR' : 'EXCLUIR'}
              </button>
            )}
            <button onClick={() => setIsAddingTask(true)} className="px-4 py-2 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2"><Plus className="w-4 h-4" /> NOVA TAREFA</button>
          </div>
        </div>

        <AnimatePresence>
          {isAddingTask && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <div className="space-y-3">
                <input type="text" value={newTask.text} onChange={(e) => setNewTask(prev => ({ ...prev, text: e.target.value }))} placeholder="Descreva a tarefa..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAddTask()} />
                <div className="flex gap-2">
                  {(['Bio', 'Mind', 'Work', 'Outro'] as TaskCategory[]).map((cat) => {
                    const Icon = CATEGORY_ICONS[cat];
                    return (
                      <button key={cat} onClick={() => setNewTask(prev => ({ ...prev, category: cat }))}
                        className={cn("flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2", newTask.category === cat ? "bg-red-900 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700")}>
                        <Icon className="w-4 h-4" />{cat}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddTask} className={cn("flex-1 py-2 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold transition-colors", isSavingTask && "opacity-50 cursor-not-allowed")}>ADICIONAR</button>
                  <button onClick={() => { setIsAddingTask(false); setNewTask({ text: '', category: 'Work' }); }} className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors">CANCELAR</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {tasks.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="font-medium">Nenhuma tarefa no núcleo ainda.</p>
            <p className="text-sm mt-2">Adicione suas rotinas essenciais para começar.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {tasks.map((task) => {
                const Icon = CATEGORY_ICONS[task.category];
                return (
                  <motion.div key={task.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}
                    className={cn("group flex items-center gap-4 p-4 rounded-xl border transition-all", task.completed ? "bg-emerald-950/20 border-emerald-900/30" : "bg-zinc-900/50 border-zinc-800 hover:border-red-900/30")}>
                    <button onClick={() => toggleTask(task.id)}
                      className={cn("flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all", task.completed ? "bg-emerald-600 border-emerald-600" : "border-zinc-600 hover:border-red-600")}>
                      {task.completed && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <Icon className={cn("w-5 h-5", task.completed ? "text-emerald-500" : "text-zinc-500")} />
                    <span className={cn("flex-1 font-medium", task.completed ? "text-zinc-500 line-through" : "text-white")}>{task.text}</span>
                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider", task.completed ? "bg-emerald-900/30 text-emerald-400" : "bg-zinc-800 text-zinc-400")}>{task.category}</span>
                    {isDeleting && (
                      <button onClick={() => removeTask(task.id)} className="p-2 hover:bg-red-900/20 rounded-lg text-red-500 hover:text-red-400 transition-colors"><X className="w-5 h-5" /></button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
