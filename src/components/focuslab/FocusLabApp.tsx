import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SettingsView } from './SettingsView';
import { RedViewReal } from './RedViewReal';
import { CustomRadarChart } from './CustomRadarChart';
import { JourneyView, getJourneyLevel } from './JourneyView';
import { ChatbotPanel } from './ChatbotPanel';
import { FriLabsView } from './FriLabsView';
import { AddictionView } from './AddictionView';
import { OnboardingTour } from './OnboardingTour';
import { ShareableStats } from './ShareableStats';
import { UserProfileModal } from './UserProfileModal';
import { MemorialView } from './MemorialView';
import { PlansView } from './PlansView';
import { PlanBadge } from './PlanBadge';
import { useAuth } from '@/hooks/useAuth';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import { useRedTasks, useObjective, useGeneralTasks, useChallengeProgress, useJournalEntries, useProjects, useLibraryContent, useCoworkingRooms, useIsAdmin, useProfile, useCoworkingMessages, useDailyStreaks, useFriendships, checkUsernameAvailable, useBlockedUsers } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import focusLabLogo from '@/assets/focuslab-logo.png';
import {
  LayoutDashboard, Atom, Activity, Target, BarChart3, Settings, Check, Play, ArrowRight,
  Brain, Dumbbell, BookOpen, Plus, Lock, Flame, Droplets, Smartphone, Clock,
  X, Zap, Users, Map, Shield, Video, FileText, Calendar, Trash2, Save, LogOut, Wind, Loader2,
  MessageCircle, Phone, ArrowLeft, Menu, Send, Pause, Square, ExternalLink, GraduationCap, BookMarked, Lightbulb, Edit3, Bot, Upload, Reply, Heart, Ban
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

type ViewState = 'command_center' | 'red' | 'tasks' | 'challenges' | 'weekly_goals' | 'laboratory' | 'journal' | 'library' | 'journey' | 'coworking' | 'settings' | 'decoupling' | 'chatbot' | 'frilabs' | 'addiction' | 'memorial' | 'plans';

const SYSTEM_CHALLENGES = [
  { id: 1, title: 'Jejum de Dopamina', icon: Brain, duration: '7 dias', days: 7, desc: 'Reduza estímulos artificiais para recuperar a sensibilidade dos receptores.' },
  { id: 2, title: 'Detox Digital', icon: Smartphone, duration: '3 dias', days: 3, desc: 'Zero redes sociais e telas não essenciais após as 18h.' },
  { id: 3, title: 'Leitura Diária', icon: BookOpen, duration: '21 dias', days: 21, desc: 'Ler no mínimo 20 páginas de um livro de não-ficção por dia.' },
  { id: 4, title: 'Exercício Físico', icon: Dumbbell, duration: '14 dias', days: 14, desc: 'Movimento intencional por 45 minutos sem falhas.' },
  { id: 5, title: 'Hidratação 3L', icon: Droplets, duration: '14 dias', days: 14, desc: 'Ingestão controlada de 3 litros de água pura diariamente.' },
];

const AULAS_CATEGORIES = [
  { id: 'aula_focus', title: 'Foco e Atenção', icon: Target, desc: 'Concentração profunda e eliminação de distrações.' },
  { id: 'aula_procrastination', title: 'Procrastinação e Execução', icon: Zap, desc: 'Mecanismos de ação imediata e anti-evasão.' },
  { id: 'aula_dopamine', title: 'Dopamina e Motivação', icon: Brain, desc: 'Regulação de neuroquímica e gestão de esforço.' },
  { id: 'aula_discipline', title: 'Disciplina e Consistência', icon: Dumbbell, desc: 'Construção de identidade e manutenção de longo prazo.' },
];
const LIVROS_CATEGORIES = [
  { id: 'livro_productivity', title: 'Produtividade', icon: Target, desc: 'Livros sobre gestão de tempo e eficiência.' },
  { id: 'livro_mindset', title: 'Mentalidade', icon: Brain, desc: 'Desenvolvimento de mindset de crescimento.' },
  { id: 'livro_habits', title: 'Hábitos', icon: Dumbbell, desc: 'Ciência da formação e quebra de hábitos.' },
  { id: 'livro_emotions', title: 'Inteligência Emocional', icon: Droplets, desc: 'Regulação emocional e autoconhecimento.' },
];

// --- Auth Screen ---
const AuthScreen = () => {
  const { signIn, signUp } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameAvail, setUsernameAvail] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const usernameTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleUsernameChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9.]/g, '');
    setUsername(clean);
    setUsernameAvail(null);
    if (usernameTimer.current) clearTimeout(usernameTimer.current);
    if (clean.length >= 3) {
      usernameTimer.current = setTimeout(async () => {
        const avail = await checkUsernameAvailable(clean);
        setUsernameAvail(avail);
      }, 500);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) { toast.error(error.message || 'Erro ao entrar'); setIsLoading(false); }
        else toast.success('Acesso autorizado.');
      } else {
        if (username.length < 3) { toast.error('Username deve ter pelo menos 3 caracteres'); setIsLoading(false); return; }
        if (usernameAvail === false) { toast.error('Este @username já está em uso'); setIsLoading(false); return; }
        const { error } = await signUp(email, password, name, username);
        if (error) { toast.error(error.message || 'Erro ao cadastrar'); setIsLoading(false); }
        else { toast.success('Conta criada com sucesso!'); setIsLoading(false); }
      }
    } catch { setIsLoading(false); }
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col relative overflow-hidden font-montserrat text-white">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,_#3f3f46_1px,_transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-red-950 opacity-90" />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <img src={focusLabLogo} alt="FocusLab" className="w-16 h-16 mx-auto mb-8 rounded-full" />
          <h2 className="text-red-600 uppercase tracking-[0.4em] text-sm mb-6 font-bold">Focus Lab</h2>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight max-w-4xl tracking-tight">Disciplina é <span className="text-zinc-500">Liberdade</span></h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-12 font-medium">Gerencie seus projetos, monitore sua consistência e execute com precisão cirúrgica.</p>
          <button onClick={() => setShowModal(true)} className="group px-10 py-4 bg-red-900 text-white rounded-full text-lg font-bold hover:bg-red-800 transition-all flex items-center gap-3 mx-auto shadow-[0_0_30px_rgba(153,27,27,0.4)] tracking-wide">
            ACESSAR SISTEMA <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-zinc-950 border border-red-900/30 w-full max-w-md rounded-3xl p-8 relative overflow-hidden shadow-[0_0_50px_rgba(153,27,27,0.1)] max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
              <div className="mb-8 text-center">
                <div className="w-12 h-12 bg-red-900/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-red-900/30"><Lock className="w-6 h-6 text-red-600" /></div>
                <h3 className="text-2xl font-bold text-white">{mode === 'login' ? 'Entrar no Sistema' : 'Criar Nova Conta'}</h3>
              </div>
              <form onSubmit={handleAuth} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div><label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Nome</label>
                      <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600 transition-all" placeholder="Seu nome completo" /></div>
                    <div><label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">@Username</label>
                      <input type="text" required value={username} onChange={e => handleUsernameChange(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600 transition-all" placeholder="seu.usuario" minLength={3} />
                      {username.length >= 3 && usernameAvail !== null && <p className={`text-xs mt-1 ${usernameAvail ? 'text-emerald-400' : 'text-red-400'}`}>{usernameAvail ? '✓ Username disponível' : '✗ Username já em uso'}</p>}
                    </div>
                  </>
                )}
                <div><label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">E-mail</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600 transition-all" placeholder="exemplo@email.com" /></div>
                <div><label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Senha</label>
                  <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600 transition-all" placeholder="••••••••" /></div>
                <button type="submit" disabled={isLoading} className="w-full py-4 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-900/20 mt-4 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {mode === 'login' ? 'AUTENTICAR' : 'CADASTRAR'}
                </button>
              </form>
              <div className="mt-6 pt-6 border-t border-white/5 text-center">
                <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setName(''); setUsername(''); setUsernameAvail(null); }} className="text-zinc-400 hover:text-red-500 text-sm font-semibold transition-colors">
                  {mode === 'login' ? 'Não tem uma conta? Cadastre-se aqui!' : 'Já possui uma conta? Entre aqui.'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Sidebar ---
const Sidebar = ({ currentView, setView, onLogout, mobileOpen, setMobileOpen, profile, plan }: { currentView: ViewState; setView: (v: ViewState) => void; onLogout: () => void; mobileOpen: boolean; setMobileOpen: (v: boolean) => void; profile: any; plan?: string }) => {
  const menuItems = [
    { id: 'command_center', icon: LayoutDashboard, label: 'Centro de Comando' },
    { id: 'red', icon: Target, label: 'R.E.D. (Núcleo)' },
    { id: 'journal', icon: FileText, label: 'Diário Reconfig.' },
    { id: 'decoupling', icon: Wind, label: 'Desacoplamento' },
    { id: 'tasks', icon: Check, label: 'Tarefas Gerais' },
    { id: 'challenges', icon: Flame, label: 'Desafios' },
    { id: 'addiction', icon: Shield, label: 'Vício Controlado' },
    { id: 'weekly_goals', icon: BarChart3, label: 'Metas Semanais' },
    { id: 'laboratory', icon: Atom, label: 'Laboratório' },
    { id: 'library', icon: BookOpen, label: 'Biblioteca' },
    { id: 'journey', icon: Map, label: 'Modo Jornada' },
    { id: 'coworking', icon: Users, label: 'Co-working' },
    { id: 'frilabs', icon: Heart, label: 'FriLabs' },
    { id: 'memorial', icon: Clock, label: 'Linhagem do Foco' },
    { id: 'chatbot', icon: Bot, label: 'Assistente IA' },
    { id: 'plans', icon: Crown, label: 'Planos' },
  ];

  const sidebarContent = (
    <>
      <div className="p-4 lg:p-6 flex items-center gap-3 mb-2">
        {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" /> : <img src={focusLabLogo} alt="FocusLab" className="w-8 h-8 flex-shrink-0" />}
        <span className="text-sm font-bold tracking-[0.2em] uppercase text-white truncate">{profile?.display_name || 'Focus Lab'}</span>
      </div>
      <nav className="flex-1 px-2 lg:px-4 space-y-1 overflow-y-auto">
        {menuItems.map(item => (
          <button key={item.id} onClick={() => { setView(item.id as ViewState); setMobileOpen(false); }}
            className={cn("w-full flex items-center gap-3 p-3 rounded-xl transition-all group relative overflow-hidden",
              currentView === item.id ? "bg-red-900/20 text-white border border-red-600/20" : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5")}>
            {currentView === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />}
            <item.icon className={cn("w-4 h-4 flex-shrink-0", currentView === item.id ? "text-red-600" : "group-hover:text-red-500")} />
            <span className="text-xs font-semibold tracking-wide text-left truncate">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 lg:p-6 border-t border-white/5 space-y-1">
        <button onClick={() => { setView('settings'); setMobileOpen(false); }} className={cn("w-full flex items-center gap-3 p-3 rounded-lg transition-all",
          currentView === 'settings' ? "bg-red-900/20 text-white border border-red-600/20" : "text-zinc-600 hover:text-zinc-300 hover:bg-white/5")}>
          <Settings className={cn("w-4 h-4", currentView === 'settings' ? "text-red-500" : "")} /><span className="text-xs font-medium">Configurações</span>
        </button>
        <button onClick={onLogout} className="w-full flex items-center gap-3 p-3 rounded-lg transition-all text-zinc-600 hover:text-red-500 hover:bg-red-900/10">
          <LogOut className="w-4 h-4" /><span className="text-xs font-medium">Sair</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="hidden md:flex w-60 h-full bg-black/40 backdrop-blur-xl border-r border-white/5 flex-col flex-shrink-0 z-20 shadow-2xl">{sidebarContent}</div>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="md:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm" />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'tween', duration: 0.2 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-72 bg-zinc-950 border-r border-white/5 flex flex-col z-40 shadow-2xl">
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Decoupling View ---
const DecouplingView = () => {
  const [activeProtocol, setActiveProtocol] = useState<string | null>(null);
  return (
    <div className="h-full w-full bg-gradient-to-b from-zinc-950 to-blue-950/20 p-4 sm:p-6 lg:p-12 overflow-y-auto flex flex-col">
      <header className="mb-8"><h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center gap-3"><Wind className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" /> Estação de Desacoplamento</h1><p className="text-zinc-400 font-medium text-sm sm:text-base">Protocolos curtos para momentos de estresse.</p></header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 flex-1">
        {[
          { id: 'box', title: 'Respiração Box (4-4-4-4)', desc: 'Regulação do sistema nervoso. 2 minutos.', icon: Wind },
          { id: 'ground', title: 'Grounding 5-4-3-2-1', desc: 'Ancoragem no presente. 3 minutos.', icon: Target },
          { id: 'nothing', title: 'Apenas Existir', desc: 'Timer silencioso de 5 minutos.', icon: Activity }
        ].map(p => (
          <div key={p.id} onClick={() => setActiveProtocol(p.id)} className="bg-black/40 border border-blue-900/30 rounded-2xl p-6 lg:p-8 hover:border-blue-500/50 transition-all cursor-pointer group flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-blue-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><p.icon className="w-6 h-6 lg:w-8 lg:h-8 text-blue-400" /></div>
            <h3 className="text-lg lg:text-xl font-bold text-white mb-2">{p.title}</h3><p className="text-zinc-500 text-sm">{p.desc}</p>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {activeProtocol && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="text-center">
              <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="w-32 h-32 rounded-full border-4 border-blue-500/50 flex items-center justify-center mx-auto mb-8"><div className="w-24 h-24 rounded-full bg-blue-500/20 blur-md" /></motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Protocolo Ativo</h2><p className="text-blue-400 mb-8">Respire profundamente...</p>
              <button onClick={() => setActiveProtocol(null)} className="px-6 py-2 border border-zinc-700 hover:bg-zinc-800 text-white rounded-full transition-colors">Encerrar</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Tasks View ---
const TasksView = ({ userId }: { userId: string }) => {
  const { tasks, loading, addTask, toggleTask, updateTaskText, removeCompleted, isInWindow } = useGeneralTasks(userId);
  const inWindow = isInWindow();
  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-12 h-12 text-red-600 animate-spin" /></div>;
  return (
    <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Tarefas Gerais</h1>
      <p className="text-zinc-500 mb-2 font-medium text-sm sm:text-base max-w-2xl">Ambiente de alta performance.</p>
      {!inWindow && <p className="text-yellow-500/80 text-xs mb-4 bg-yellow-900/10 border border-yellow-900/20 px-3 py-2 rounded-lg inline-block">⏰ As tarefas reiniciam às 23:00 e retornam às 04:00.</p>}
      <div className="max-w-3xl space-y-3 mt-4">
        {tasks.length === 0 ? (
          <div className="py-12 text-center"><Check className="w-16 h-16 text-zinc-700 mx-auto mb-4" /><p className="text-zinc-500 font-medium">Nenhuma tarefa criada ainda</p></div>
        ) : (
          <AnimatePresence>{tasks.map(task => (
            <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
              className={cn("w-full p-4 border rounded-xl flex items-center gap-3 transition-all group backdrop-blur-sm", task.completed ? "border-red-900/30 bg-red-900/10" : "border-white/5 bg-black/20 hover:border-white/10")}>
              <div onClick={() => toggleTask(task.id)} className={cn("w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer shrink-0", task.completed ? "border-red-700 bg-red-700" : "border-zinc-700 group-hover:border-zinc-500")}>
                {task.completed && <Check className="w-4 h-4 text-white" />}
              </div>
              <input value={task.text} onChange={e => updateTaskText(task.id, e.target.value)}
                className={cn("text-base font-medium transition-colors bg-transparent border-none focus:outline-none w-full min-w-0", task.completed ? "text-zinc-600 line-through" : "text-zinc-200")} />
            </motion.div>
          ))}</AnimatePresence>
        )}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <button onClick={() => addTask('Nova Tarefa')} className="py-3 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 font-bold uppercase tracking-widest hover:border-zinc-600 hover:text-zinc-300 transition-all bg-black/20 flex items-center justify-center gap-2 text-sm"><Plus className="w-4 h-4" /> Adicionar</button>
          <button onClick={removeCompleted} disabled={!tasks.some(t => t.completed)} className="py-3 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 font-bold uppercase tracking-widest hover:border-red-900/50 hover:text-red-600 transition-all bg-black/20 flex items-center justify-center gap-2 disabled:opacity-50 text-sm"><Trash2 className="w-4 h-4" /> Remover</button>
        </div>
      </div>
    </div>
  );
};

// --- Journal View ---
const JournalView = ({ userId }: { userId: string }) => {
  const { entries, saveEntry } = useJournalEntries(userId);
  const [completed, setCompleted] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const questions = [
    { q: 'O que impediu você de completar 100% da R.E.D. hoje?', ph: 'Identifique gatilhos, padrões ou situações...' },
    { q: 'Qual foi o momento exato em que você desviou do protocolo?', ph: 'Hora, contexto, estado emocional...' },
    { q: 'Que sistema pode prevenir isso amanhã?', ph: 'Seja específico e actionável...' },
    { q: 'Reflexão livre: O que você aprendeu hoje?', ph: 'Escreva livremente...' },
  ];
  const now = new Date();
  const hour = now.getHours();
  const isOpen = hour >= 18 || hour < 3;
  const allFilled = questions.every((_, i) => (entries[i] || '').trim().length > 0);

  const handleContinue = async () => {
    setCompleted(true); setAiLoading(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ type: 'journal_summary', messages: [{ role: 'user', content: `Analise as respostas do meu diário de reconfiguração de hoje e dê um resumo com insights e sugestões de melhoria.\n\n${questions.map((q, i) => `${q.q}\nResposta: ${entries[i] || '(vazio)'}`).join('\n\n')}` }] }),
      });
      if (!resp.ok || !resp.body) throw new Error();
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '', result = '';
      while (true) { const { done, value } = await reader.read(); if (done) break; buf += decoder.decode(value, { stream: true }); let idx; while ((idx = buf.indexOf('\n')) !== -1) { let line = buf.slice(0, idx); buf = buf.slice(idx + 1); if (line.endsWith('\r')) line = line.slice(0, -1); if (!line.startsWith('data: ')) continue; const j = line.slice(6).trim(); if (j === '[DONE]') break; try { const p = JSON.parse(j); const c = p.choices?.[0]?.delta?.content; if (c) { result += c; setAiSummary(result); } } catch {} } }
    } catch { setAiSummary('Erro ao gerar resumo. Tente novamente.'); }
    setAiLoading(false);
  };

  if (completed) {
    return (
      <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-3"><FileText className="w-6 h-6 text-red-500" /> Resumo do Diário</h1>
        <p className="text-zinc-500 font-medium mb-6 text-sm">Análise da IA sobre suas respostas de hoje.</p>
        <div className="max-w-3xl mx-auto bg-black/20 border border-white/5 rounded-2xl p-6">
          {aiLoading && !aiSummary && <div className="flex items-center gap-3"><Loader2 className="w-5 h-5 text-red-500 animate-spin" /><span className="text-zinc-400 text-sm">Gerando resumo...</span></div>}
          {aiSummary && <div className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">{aiSummary}</div>}
        </div>
        <button onClick={() => { setCompleted(false); setAiSummary(''); }} className="mt-6 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors"><ArrowLeft className="w-4 h-4 inline mr-2" /> Voltar ao Diário</button>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-3"><FileText className="w-6 h-6 text-red-500" /> Diário de Reconfiguração</h1>
      <p className="text-zinc-500 font-medium mb-2 text-sm">Reflexão guiada para identificar padrões.</p>
      {!isOpen && <p className="text-yellow-500/80 text-xs mb-4 bg-yellow-900/10 border border-yellow-900/20 px-3 py-2 rounded-lg inline-block">⏰ O diário abre às 18:00 e reseta às 03:00.</p>}
      <div className="max-w-3xl mx-auto space-y-4 mt-4">
        {questions.map((item, i) => (
          <div key={i} className="bg-black/20 border border-white/5 rounded-xl p-4 sm:p-6">
            <label className="block text-white font-bold mb-3 text-sm">{item.q}</label>
            <textarea value={entries[i] || ''} onChange={e => saveEntry(i, e.target.value)} disabled={!isOpen}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600 min-h-[80px] resize-y font-medium leading-relaxed disabled:opacity-50 text-sm" placeholder={item.ph} />
          </div>
        ))}
        {allFilled && isOpen && (
          <button onClick={handleContinue} className="w-full py-4 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
            Continuar <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// --- Room Creator Name ---
const RoomCreatorName = ({ createdBy, currentUserId }: { createdBy: string; currentUserId: string }) => {
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    if (createdBy === currentUserId) return;
    supabase.from('profiles').select('display_name,username').eq('user_id', createdBy).maybeSingle().then(({ data }) => setProfile(data));
  }, [createdBy, currentUserId]);
  if (createdBy === currentUserId) return <p className="text-zinc-600 text-xs mb-2">Criado por: Você</p>;
  return <p className="text-zinc-600 text-xs mb-2">Criado por: {profile?.username ? `@${profile.username}` : profile?.display_name || 'Operador'}</p>;
};

// --- Coworking View ---
const CoworkingView = ({ userId, userName, userAvatar, activeRoom, setActiveRoom }: { userId: string; userName: string; userAvatar?: string; activeRoom: any; setActiveRoom: (r: any) => void }) => {
  const { rooms, loading, createRoom, deleteRoom } = useCoworkingRooms(userId);
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState<'chat' | 'call'>('chat');
  const [roomDesc, setRoomDesc] = useState('');
  const [meetLink, setMeetLink] = useState('');

  const handleCreate = async () => {
    if (!roomName.trim()) return;
    if (roomType === 'call' && !meetLink.trim()) { toast.error('Cole o link do Google Meet ou Discord'); return; }
    await createRoom(roomName.trim(), roomType, roomDesc.trim(), meetLink.trim());
    setRoomName(''); setRoomDesc(''); setMeetLink(''); setShowCreate(false);
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-12 h-12 text-red-600 animate-spin" /></div>;

  return (
    <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Co-working Virtual</h1><p className="text-zinc-500 font-medium text-sm sm:text-base">Conecte-se com outros operadores.</p></div>
        <button onClick={() => setShowCreate(true)} className="px-5 py-3 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shrink-0"><Plus className="w-4 h-4" /> CRIAR SALA</button>
      </div>
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6">
            <h3 className="text-white font-bold mb-4">Nova Sala</h3>
            <div className="space-y-3">
              <input type="text" value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="Nome da sala..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600" autoFocus />
              <textarea value={roomDesc} onChange={e => setRoomDesc(e.target.value)} placeholder="Descrição (opcional)..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600 h-20 resize-none" />
              <div className="flex gap-2">
                <button onClick={() => setRoomType('chat')} className={cn("flex-1 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2", roomType === 'chat' ? "bg-red-900 text-white" : "bg-zinc-800 text-zinc-400")}><MessageCircle className="w-4 h-4" /> Bate-papo</button>
                <button onClick={() => setRoomType('call')} className={cn("flex-1 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2", roomType === 'call' ? "bg-red-900 text-white" : "bg-zinc-800 text-zinc-400")}><Phone className="w-4 h-4" /> Chamada</button>
              </div>
              {roomType === 'call' && <input type="url" value={meetLink} onChange={e => setMeetLink(e.target.value)} placeholder="Cole o link do Google Meet ou Discord..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600" />}
              <div className="flex gap-2">
                <button onClick={handleCreate} className="flex-1 py-2.5 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold transition-colors">CRIAR</button>
                <button onClick={() => setShowCreate(false)} className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors">CANCELAR</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {rooms.length === 0 ? (
        <div className="py-16 text-center"><Users className="w-16 h-16 text-zinc-700 mx-auto mb-4" /><h3 className="text-xl font-bold text-white mb-2">Nenhuma sala criada ainda</h3><p className="text-zinc-500 font-medium">Crie uma sala para colaborar.</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {rooms.map(room => (
            <div key={room.id} className={cn("bg-black/20 border rounded-2xl p-5 sm:p-6 hover:border-red-900/30 transition-all group", activeRoom?.id === room.id ? "border-red-600/50" : "border-white/5")}>
              <div className="flex items-center gap-3 mb-3">{room.room_type === 'chat' ? <MessageCircle className="w-5 h-5 text-blue-400" /> : <Phone className="w-5 h-5 text-emerald-400" />}<span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{room.room_type === 'chat' ? 'Bate-papo' : 'Chamada'}</span></div>
              <h3 className="text-lg font-bold text-white mb-1">{room.name}</h3>
              {room.description && <p className="text-zinc-500 text-sm mb-2">{room.description}</p>}
              <RoomCreatorName createdBy={room.created_by} currentUserId={userId!} />
              <div className="flex gap-2 mt-2">
                {room.room_type === 'chat' ? (
                  <button onClick={() => setActiveRoom(activeRoom?.id === room.id ? null : room)} className={cn("flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2", activeRoom?.id === room.id ? "bg-red-900 text-white" : "bg-blue-900/30 hover:bg-blue-900/50 text-blue-400")}><MessageCircle className="w-4 h-4" /> {activeRoom?.id === room.id ? 'Ativo' : 'Entrar'}</button>
                ) : (
                  <a href={room.meet_link || '#'} target="_blank" rel="noopener noreferrer" className={cn("flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2", room.meet_link ? "bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400" : "bg-zinc-800 text-zinc-500 cursor-not-allowed")}><ExternalLink className="w-4 h-4" /> Entrar na Chamada</a>
                )}
                {room.created_by === userId && <button onClick={() => deleteRoom(room.id)} className="px-3 py-2 bg-zinc-800 hover:bg-red-900/30 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Chat Overlay ---
const ChatOverlay = ({ room, userId, userName, userAvatar, onClose, onClickUser, blockedIds = [] }: { room: any; userId: string; userName: string; userAvatar?: string; onClose: () => void; onClickUser?: (uid: string) => void; blockedIds?: string[] }) => {
  const { messages: rawMessages, sendMessage } = useCoworkingMessages(room.id);
  const messages = rawMessages.filter((m: any) => !blockedIds.includes(m.user_id));
  const [chatInput, setChatInput] = useState('');
  const [replyTo, setReplyTo] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!chatInput.trim()) return;
    await sendMessage(userId, userName, chatInput.trim(), userAvatar, replyTo?.id);
    setChatInput(''); setReplyTo(null);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[320px] sm:w-[380px] h-[460px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-3 bg-zinc-900/50">
        <MessageCircle className="w-5 h-5 text-blue-400" /><h3 className="text-white font-bold text-sm flex-1 truncate">{room.name}</h3>
        <button onClick={onClose} className="px-3 py-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-xs font-bold transition-colors">Sair</button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && <p className="text-center text-zinc-600 text-sm py-8">Nenhuma mensagem ainda.</p>}
        {messages.map((msg: any) => {
          const replyMsg = msg.reply_to ? messages.find((m: any) => m.id === msg.reply_to) : null;
          return (
            <div key={msg.id} className={`flex ${msg.user_id === userId ? 'justify-end' : 'justify-start'} group`}>
              <div className="max-w-[85%]">
                {replyMsg && <div className="text-[10px] text-zinc-600 bg-zinc-900/50 px-2 py-1 rounded-t-lg border-l-2 border-zinc-700 mb-0.5 truncate">↳ {replyMsg.user_name}: {replyMsg.content?.slice(0, 40)}</div>}
                <div className={`px-3 py-2 rounded-xl text-sm ${msg.user_id === userId ? 'bg-red-900/30 text-white rounded-br-sm' : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'}`}>
                  {msg.user_id !== userId && (
                    <div className="flex items-center gap-2 mb-1 cursor-pointer" onClick={() => onClickUser?.(msg.user_id)}>
                      {msg.avatar_url && <img src={msg.avatar_url} alt="" className="w-4 h-4 rounded-full object-cover" />}
                      <p className="text-xs text-zinc-500 font-bold hover:text-red-400 transition-colors">{msg.user_name}</p>
                    </div>
                  )}
                  {msg.content}
                </div>
                <button onClick={() => setReplyTo(msg)} className="opacity-0 group-hover:opacity-100 text-[10px] text-zinc-600 hover:text-zinc-400 transition-all mt-0.5"><Reply className="w-3 h-3 inline mr-1" />Responder</button>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>
      {replyTo && (
        <div className="px-3 py-2 border-t border-zinc-800 bg-zinc-900/50 flex items-center gap-2">
          <span className="text-xs text-zinc-500 flex-1 truncate">Respondendo a <span className="text-white font-bold">{replyTo.user_name}</span></span>
          <button onClick={() => setReplyTo(null)} className="text-zinc-500 hover:text-white"><X className="w-3 h-3" /></button>
        </div>
      )}
      <div className="p-3 border-t border-zinc-800">
        <div className="flex gap-2">
          <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Mensagem..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-600" />
          <button onClick={handleSend} className="p-2.5 bg-red-900 hover:bg-red-800 text-white rounded-xl transition-colors"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};

// --- Laboratory View ---
const LaboratoryView = ({ userId }: { userId: string }) => {
  const { projects, loading, addProject, updateProject, removeProject } = useProjects(userId);
  const [tab, setTab] = useState<'projects' | 'brainstorm'>('projects');
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [brainstormInput, setBrainstormInput] = useState('');
  const [brainstormResult, setBrainstormResult] = useState('');
  const [brainstormLoading, setBrainstormLoading] = useState(false);

  const handleCreate = async () => { if (!title.trim()) return; await addProject(title.trim(), desc.trim()); setTitle(''); setDesc(''); setShowCreate(false); };

  const handleBrainstorm = async () => {
    if (!brainstormInput.trim()) return;
    setBrainstormLoading(true); setBrainstormResult('');
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ type: 'brainstorm', messages: [{ role: 'user', content: `Faça um brainstorming detalhado sobre esta ideia de projeto: ${brainstormInput}` }] }),
      });
      if (!resp.ok || !resp.body) throw new Error();
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '', result = '';
      while (true) { const { done, value } = await reader.read(); if (done) break; buf += decoder.decode(value, { stream: true }); let idx; while ((idx = buf.indexOf('\n')) !== -1) { let line = buf.slice(0, idx); buf = buf.slice(idx + 1); if (line.endsWith('\r')) line = line.slice(0, -1); if (!line.startsWith('data: ')) continue; const j = line.slice(6).trim(); if (j === '[DONE]') break; try { const p = JSON.parse(j); const c = p.choices?.[0]?.delta?.content; if (c) { result += c; setBrainstormResult(result); } } catch {} } }
    } catch { setBrainstormResult('Erro ao gerar brainstorming. Tente novamente.'); }
    setBrainstormLoading(false);
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-12 h-12 text-red-600 animate-spin" /></div>;

  if (editingId) {
    const project = projects.find(p => p.id === editingId);
    return (
      <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
        <button onClick={() => { updateProject(editingId, { description: editContent }); setEditingId(null); }} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm font-medium"><ArrowLeft className="w-4 h-4" /> Salvar e Voltar</button>
        <h1 className="text-2xl font-bold text-white mb-4">{project?.title}</h1>
        <textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full h-[calc(100vh-250px)] bg-black/20 border border-white/5 rounded-xl p-6 text-white focus:outline-none focus:ring-1 focus:ring-red-600 resize-none font-medium leading-relaxed text-base" placeholder="Escreva aqui..." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-12 overflow-y-auto h-full">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Laboratório</h1>
      <p className="text-zinc-500 font-medium mb-6 text-sm">Área de construção e brainstorming.</p>
      <div className="flex gap-2 mb-8">
        <button onClick={() => setTab('projects')} className={cn("px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2", tab === 'projects' ? "bg-red-900 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700")}><Atom className="w-4 h-4" /> Projetos</button>
        <button onClick={() => setTab('brainstorm')} className={cn("px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2", tab === 'brainstorm' ? "bg-red-900 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700")}><Lightbulb className="w-4 h-4" /> Brainstorming IA</button>
      </div>
      {tab === 'projects' ? (
        <>
          <div className="flex justify-end mb-6"><button onClick={() => setShowCreate(true)} className="px-5 py-3 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold text-sm flex items-center gap-2 shrink-0"><Plus className="w-4 h-4" /> NOVO PROJETO</button></div>
          <AnimatePresence>{showCreate && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6 max-w-2xl">
              <div className="space-y-3">
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Nome do projeto..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600" autoFocus />
                <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descrição..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600 h-20 resize-none" />
                <div className="flex gap-2">
                  <button onClick={handleCreate} className="flex-1 py-2.5 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold transition-colors">CRIAR</button>
                  <button onClick={() => { setShowCreate(false); setTitle(''); setDesc(''); }} className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors">CANCELAR</button>
                </div>
              </div>
            </motion.div>
          )}</AnimatePresence>
          {projects.length === 0 && !showCreate ? (
            <div className="py-16 text-center"><Atom className="w-16 h-16 text-zinc-700 mx-auto mb-4" /><h3 className="text-xl font-bold text-white mb-2">Nenhum projeto criado</h3></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {projects.map(p => (
                <div key={p.id} className="bg-black/20 border border-white/5 rounded-2xl p-5 sm:p-6 hover:border-red-900/30 transition-all">
                  <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                  {p.description && <p className="text-zinc-500 text-sm mb-4 line-clamp-3">{p.description}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingId(p.id); setEditContent(p.description || ''); }} className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2"><Edit3 className="w-3.5 h-3.5" /> Editar</button>
                    <button onClick={() => removeProject(p.id)} className="px-3 py-2 bg-zinc-800 hover:bg-red-900/30 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="max-w-3xl">
          <div className="bg-black/20 border border-white/5 rounded-2xl p-6 mb-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-yellow-500" /> Descreva sua ideia</h3>
            <textarea value={brainstormInput} onChange={e => setBrainstormInput(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600 h-32 resize-none mb-4" placeholder="Ex: Um app de meditação gamificado..." />
            <button onClick={handleBrainstorm} disabled={brainstormLoading || !brainstormInput.trim()} className="px-6 py-3 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold disabled:opacity-50 flex items-center gap-2">
              {brainstormLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />} GERAR BRAINSTORMING
            </button>
          </div>
          {brainstormResult && <div className="bg-black/20 border border-white/5 rounded-2xl p-6"><h3 className="text-white font-bold mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500" /> Resultado</h3><div className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">{brainstormResult}</div></div>}
        </div>
      )}
    </div>
  );
};

// --- Library View ---
const LibraryView = ({ isAdmin }: { isAdmin: boolean }) => {
  const [section, setSection] = useState<'aulas' | 'livros'>('aulas');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { content, loading, addContent, removeContent } = useLibraryContent(selectedCategory || undefined);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [addMode, setAddMode] = useState<'url' | 'upload'>('url');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const categories = section === 'aulas' ? AULAS_CATEGORIES : LIVROS_CATEGORIES;

  const handleAdd = async () => {
    if (!newTitle.trim() || !selectedCategory) return;
    let finalUrl = newUrl.trim();
    if (addMode === 'upload' && uploadFile) {
      setUploading(true);
      const filePath = `${selectedCategory}/${Date.now()}_${uploadFile.name}`;
      const { error } = await supabase.storage.from('library').upload(filePath, uploadFile);
      if (error) { toast.error('Erro ao enviar arquivo'); setUploading(false); return; }
      const { data: { publicUrl } } = supabase.storage.from('library').getPublicUrl(filePath);
      finalUrl = publicUrl;
      setUploading(false);
    }
    await addContent({ category_id: selectedCategory, title: newTitle.trim(), description: newDesc.trim(), content_url: finalUrl });
    setNewTitle(''); setNewDesc(''); setNewUrl(''); setUploadFile(null); setShowAdd(false);
  };

  if (selectedCategory) {
    const cat = [...AULAS_CATEGORIES, ...LIVROS_CATEGORIES].find(c => c.id === selectedCategory);
    return (
      <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
        <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm font-medium"><ArrowLeft className="w-4 h-4" /> Voltar</button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div><h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{cat?.title}</h1><p className="text-zinc-500 font-medium text-sm">{cat?.desc}</p></div>
          {isAdmin && <button onClick={() => setShowAdd(true)} className="px-5 py-3 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold text-sm flex items-center gap-2 shrink-0"><Plus className="w-4 h-4" /> ADICIONAR</button>}
        </div>
        <AnimatePresence>{showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6 max-w-2xl">
            <div className="space-y-3">
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Título..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600" autoFocus />
              <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Descrição..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600 h-20 resize-none" />
              <div className="flex gap-2">
                <button onClick={() => setAddMode('url')} className={cn("flex-1 py-2 rounded-lg font-semibold text-sm", addMode === 'url' ? "bg-red-900 text-white" : "bg-zinc-800 text-zinc-400")}><ExternalLink className="w-4 h-4 inline mr-1" /> URL</button>
                <button onClick={() => setAddMode('upload')} className={cn("flex-1 py-2 rounded-lg font-semibold text-sm", addMode === 'upload' ? "bg-red-900 text-white" : "bg-zinc-800 text-zinc-400")}><Upload className="w-4 h-4 inline mr-1" /> Upload</button>
              </div>
              {addMode === 'url' ? <input type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="URL..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600" /> : (
                <div className="border-2 border-dashed border-zinc-700 rounded-xl p-4 text-center"><input type="file" onChange={e => setUploadFile(e.target.files?.[0] || null)} className="hidden" id="lib-upload" accept=".pdf,.doc,.docx,.mp4,.mp3,.png,.jpg" /><label htmlFor="lib-upload" className="cursor-pointer text-zinc-400 hover:text-white"><Upload className="w-8 h-8 mx-auto mb-2" /><p className="text-sm font-medium">{uploadFile ? uploadFile.name : 'Selecionar arquivo'}</p></label></div>
              )}
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={uploading} className="flex-1 py-2.5 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2">{uploading && <Loader2 className="w-4 h-4 animate-spin" />} ADICIONAR</button>
                <button onClick={() => setShowAdd(false)} className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors">CANCELAR</button>
              </div>
            </div>
          </motion.div>
        )}</AnimatePresence>
        {loading ? <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div> :
          content.length === 0 ? <div className="py-16 text-center"><BookOpen className="w-16 h-16 text-zinc-700 mx-auto mb-4" /><h3 className="text-xl font-bold text-white mb-2">Nenhum conteúdo ainda</h3></div> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {content.map(item => (
                <div key={item.id} className="bg-black/20 border border-white/5 rounded-2xl p-5 sm:p-6 hover:border-red-900/30 transition-all">
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  {item.description && <p className="text-zinc-500 text-sm mb-3">{item.description}</p>}
                  {item.content_url && <a href={item.content_url} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 text-sm font-medium">Abrir conteúdo →</a>}
                  {isAdmin && <button onClick={() => removeContent(item.id)} className="mt-3 px-3 py-1.5 bg-zinc-800 hover:bg-red-900/30 text-zinc-400 hover:text-red-400 rounded-lg text-xs font-bold block"><Trash2 className="w-3.5 h-3.5 inline mr-1" /> Remover</button>}
                </div>
              ))}
            </div>
          )}
      </div>
    );
  }

  return (
    <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Biblioteca Estratégica</h1>
      <p className="text-zinc-500 font-medium mb-6 text-sm">Conteúdo operacional.</p>
      <div className="flex gap-2 mb-8">
        <button onClick={() => setSection('aulas')} className={cn("px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2", section === 'aulas' ? "bg-red-900 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700")}><GraduationCap className="w-4 h-4" /> Aulas</button>
        <button onClick={() => setSection('livros')} className={cn("px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2", section === 'livros' ? "bg-red-900 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700")}><BookMarked className="w-4 h-4" /> Livros</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {categories.map(cat => (
          <div key={cat.id} onClick={() => setSelectedCategory(cat.id)} className="bg-black/20 border border-white/5 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:border-red-900/50 hover:bg-red-900/5 transition-all cursor-pointer group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-zinc-400 group-hover:text-red-500"><cat.icon className="w-5 h-5 sm:w-6 sm:h-6" /></div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">{cat.title}</h3>
            <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed">{cat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- AI Analysis Button ---
const AIAnalysisButton = ({ prompt, label }: { prompt: string; label: string }) => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const analyze = async () => {
    setOpen(true); setLoading(true); setResult('');
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ type: 'analysis', messages: [{ role: 'user', content: prompt }] }),
      });
      if (!resp.ok || !resp.body) throw new Error();
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '', res = '';
      while (true) { const { done, value } = await reader.read(); if (done) break; buf += decoder.decode(value, { stream: true }); let idx; while ((idx = buf.indexOf('\n')) !== -1) { let line = buf.slice(0, idx); buf = buf.slice(idx + 1); if (line.endsWith('\r')) line = line.slice(0, -1); if (!line.startsWith('data: ')) continue; const j = line.slice(6).trim(); if (j === '[DONE]') break; try { const p = JSON.parse(j); const c = p.choices?.[0]?.delta?.content; if (c) { res += c; setResult(res); } } catch {} } }
    } catch { setResult('Erro ao analisar. Tente novamente.'); }
    setLoading(false);
  };

  return (
    <>
      <button onClick={analyze} className="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-xl text-xs font-bold border border-red-900/30 flex items-center gap-2"><Brain className="w-3.5 h-3.5" /> {label}</button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 bg-black/30 border border-red-900/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-red-400 flex items-center gap-2"><Brain className="w-4 h-4" /> Análise IA</h4>
              <button onClick={() => setOpen(false)} className="text-zinc-600 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            {loading && !result && <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 text-red-500 animate-spin" /><span className="text-zinc-500 text-xs">Analisando...</span></div>}
            {result && <div className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">{result}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Main App ---
export default function FocusLabApp() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('command_center');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('focuslab-theme') !== 'light');
  
  const [activeCoworkingRoom, setActiveCoworkingRoom] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showShareStats, setShowShareStats] = useState(false);
  const [profileModalUserId, setProfileModalUserId] = useState<string | null>(null);

  const userId = user?.id;
  const { tasks: redTasks, loading: redLoading, addTask, toggleTask, removeTask, updateTask, reorderTasks } = useRedTasks(userId);
  const { objective, loading: objLoading, updateObjective, createObjective } = useObjective(userId);
  const { progress: challengeProgress, startChallenge, pauseChallenge, stopChallenge, getDaysElapsed } = useChallengeProgress(userId);
  const { isAdmin } = useIsAdmin(userId);
  const { profile } = useProfile(userId);
  const { streak, weeklyData, recordDay } = useDailyStreaks(userId);
  const { sendRequest: sendFriendRequest } = useFriendships(userId);
  const { blockedIds, blockUser, isBlocked } = useBlockedUsers(userId);

  // Record streak when RED tasks change
  useEffect(() => {
    if (userId && redTasks.length > 0) {
      const completed = redTasks.filter(t => t.completed).length;
      recordDay(completed, redTasks.length);
    }
  }, [redTasks, userId, recordDay]);

  // Show onboarding for new users
  useEffect(() => {
    if (profile && !profile.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [profile]);

  // Load global active theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Try cached first for instant load
        const cached = localStorage.getItem('focuslab-active-theme');
        if (cached) {
          const { applyThemeToDOM } = await import('./ThemeEditor');
          applyThemeToDOM(JSON.parse(cached));
        }
        // Then fetch from DB for latest
        const { data } = await supabase.from('global_themes').select('colors').eq('is_active', true).single();
        if (data) {
          const colors = typeof data.colors === 'string' ? JSON.parse(data.colors) : data.colors;
          const { applyThemeToDOM } = await import('./ThemeEditor');
          applyThemeToDOM(colors);
          localStorage.setItem('focuslab-active-theme', JSON.stringify(colors));
        }
      } catch {}
    };
    loadTheme();
  }, []);

  const handleCompleteOnboarding = async () => {
    setShowOnboarding(false);
    if (profile) {
      await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', profile.id);
    }
  };

  if (authLoading) {
    return <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center"><Loader2 className="w-16 h-16 text-red-600 animate-spin mx-auto mb-4" /><p className="text-zinc-400 font-medium">Carregando sistema...</p></div>;
  }

  if (!user) return <><AuthScreen /></>;

  const lifeAreasData = (() => {
    const scores = { Mente: 0, Corpo: 0, Carreira: 0, Espírito: 0, Social: 0, Finanças: 0 };
    redTasks.forEach(task => { if (!task.completed) return; if (task.category === 'Mind') scores.Mente += 20; else if (task.category === 'Bio') scores.Corpo += 20; else if (task.category === 'Work') scores.Carreira += 20; else scores.Espírito += 10; });
    return Object.entries(scores).map(([subject, A]) => ({ subject, A: Math.min(A, 150), fullMark: 150 }));
  })();

  const focusObjective = objective?.title || 'Defina seu objeto de foco na aba R.E.D.';
  const daysRemaining = objective?.target_date ? Math.max(0, Math.ceil((new Date(objective.target_date).getTime() - Date.now()) / 86400000)) : null;
  const journeyLevel = getJourneyLevel(streak);

  const handleLogout = async () => { await signOut(); toast.success('Desconectado.'); };

  const renderView = () => {
    switch (currentView) {
      case 'red': return (
        <div className="h-full overflow-y-auto">
          <RedViewReal tasks={redTasks} tasksLoading={redLoading} addTask={addTask} toggleTask={toggleTask} removeTask={removeTask} updateTask={updateTask} reorderTasks={reorderTasks} objective={objective} objectiveLoading={objLoading} updateObjective={updateObjective} createObjective={createObjective} userId={userId || null} />
          <div className="px-4 sm:px-6 lg:px-12 pb-8">
            <AIAnalysisButton label="Análise IA do R.E.D." prompt={`Analise minha R.E.D. Tarefas: ${redTasks.map(t => `${t.text} (${t.category}, ${t.completed ? 'concluída' : 'pendente'})`).join('; ')}. ${redTasks.filter(t => t.completed).length}/${redTasks.length} concluídas. Streak: ${streak} dias.`} />
          </div>
        </div>
      );
      case 'settings': return <SettingsView userId={userId} darkMode={darkMode} setDarkMode={setDarkMode} blockedIds={blockedIds} onUnblock={(uid) => { import('@/hooks/useSupabaseData').then(m => { /* handled via prop */ }); }} />;
      case 'journey': return <JourneyView redTasks={redTasks} challengeProgress={challengeProgress} streak={streak} onShareStats={() => setShowShareStats(true)} />;
      case 'decoupling': return <DecouplingView />;
      case 'tasks': return <TasksView userId={userId!} />;
      case 'coworking': return <CoworkingView userId={userId!} userName={profile?.display_name || 'Operador'} userAvatar={profile?.avatar_url} activeRoom={activeCoworkingRoom} setActiveRoom={setActiveCoworkingRoom} />;
      case 'journal': return <JournalView userId={userId!} />;
      case 'laboratory': return <LaboratoryView userId={userId!} />;
      case 'library': return <LibraryView isAdmin={isAdmin} />;
      case 'frilabs': return <FriLabsView userId={userId!} />;
      case 'addiction': return <AddictionView userId={userId!} />;
      case 'memorial': return <MemorialView userId={userId!} isPremium={profile?.is_premium || false} />;
      case 'chatbot': return <ChatbotPanel />;
      case 'challenges': {
        const completedChallenges = challengeProgress.filter(p => !p.is_active && p.completed_at).length;
        return (
        <div className="p-4 sm:p-6 lg:p-12 overflow-y-auto h-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Desafios</h1>
          <p className="text-zinc-500 font-medium mb-4 text-sm">Protocolos de otimização comportamental.</p>
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-black/20 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500" />
              <div><p className="text-[10px] text-zinc-500 uppercase font-bold">Concluídos</p><p className="text-white font-bold text-lg">{completedChallenges}</p></div>
            </div>
            <div className="bg-black/20 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-500" />
              <div><p className="text-[10px] text-zinc-500 uppercase font-bold">Ativos</p><p className="text-white font-bold text-lg">{challengeProgress.filter(p => p.is_active).length}</p></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {SYSTEM_CHALLENGES.map(c => {
              const active = challengeProgress.find(p => p.challenge_id === c.id && p.is_active);
              const completed = challengeProgress.find(p => p.challenge_id === c.id && !p.is_active && p.completed_at);
              const isPaused = active?.paused_at;
              const daysElapsed = active ? getDaysElapsed(active) : 0;
              const daysLeft = active ? Math.max(0, c.days - daysElapsed) : c.days;
              // Auto-complete if days elapsed >= challenge days
              if (active && daysElapsed >= c.days && !isPaused) {
                stopChallenge(active.id);
              }
              return (
                <div key={c.id} className="bg-black/20 border border-white/5 hover:border-red-900/30 rounded-2xl p-5 sm:p-8 transition-all group relative overflow-hidden">
                  {completed && <div className="absolute top-3 right-3 px-2 py-1 bg-emerald-900/30 text-emerald-400 rounded-full text-[10px] font-bold">✓ Concluído</div>}
                  <div className="absolute top-0 right-0 p-8 opacity-5"><c.icon className="w-32 h-32 text-red-600" /></div>
                  <div className="relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 text-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><c.icon className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{c.title}</h3>
                    <div className="inline-block px-3 py-1 text-xs font-bold rounded-full mb-3 border bg-red-900/20 text-red-400 border-red-900/30">{c.duration}</div>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-2">{c.desc}</p>
                    {active && (
                      <div className="mb-4 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                        <div className="flex justify-between items-center text-xs"><span className="text-zinc-500">Progresso:</span><span className="text-white font-bold">{Math.min(daysElapsed, c.days)}/{c.days} dias</span></div>
                        <div className="h-2 bg-zinc-800 rounded-full mt-2 overflow-hidden"><div className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all" style={{ width: `${Math.min(100, (daysElapsed / c.days) * 100)}%` }} /></div>
                        <p className="text-xs text-zinc-500 mt-2">{isPaused ? '⏸ Pausado' : `⏱ Faltam ${daysLeft} dias`}</p>
                      </div>
                    )}
                    {!active ? (
                      <button onClick={() => startChallenge(c.id)} className="w-full py-2.5 rounded-xl font-bold text-sm bg-zinc-800 text-white hover:bg-red-900 flex items-center justify-center gap-2"><Play className="w-4 h-4" /> INICIAR</button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => pauseChallenge(active.id)} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-zinc-800 text-white hover:bg-zinc-700 flex items-center justify-center gap-2">{isPaused ? <><Play className="w-4 h-4" /> RETOMAR</> : <><Pause className="w-4 h-4" /> PAUSAR</>}</button>
                        <button onClick={() => stopChallenge(active.id)} className="px-4 py-2.5 rounded-xl font-bold text-sm bg-red-900/30 text-red-400 hover:bg-red-900/50 flex items-center justify-center gap-2"><Square className="w-4 h-4" /> PARAR</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        );
      }
      case 'weekly_goals': {
        const completedToday = redTasks.filter(t => t.completed).length;
        const totalToday = redTasks.length;
        const completionPct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
        const activeChals = challengeProgress.filter(p => p.is_active).length;
        const completedChals = challengeProgress.filter(p => !p.is_active && p.completed_at).length;
        // Build weekly dates
        const now = new Date();
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        monday.setHours(0, 0, 0, 0);
        const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        const weekDates = weekDays.map((_, i) => {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          return d.toISOString().split('T')[0];
        });
        // Calculate weekly average
        const weekPcts = weekDates.map(date => {
          const entry = weeklyData[date];
          if (!entry || entry.total === 0) return 0;
          return Math.round((entry.completed / entry.total) * 100);
        });
        const weekAvg = weekPcts.filter(p => p > 0).length > 0 ? Math.round(weekPcts.reduce((a, b) => a + b, 0) / Math.max(1, weekPcts.filter(p => p > 0).length)) : 0;
        return (
          <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Metas Semanais</h1>
              <p className="text-zinc-500 font-medium mb-8 text-sm">Análise de consistência.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'RED Hoje', value: `${completionPct}%` },
                  { label: 'Média Semana', value: `${weekAvg}%` },
                  { label: 'Desafios Ativos', value: String(activeChals) },
                  { label: 'Concluídos', value: String(completedChals), color: 'text-emerald-500' },
                ].map((s, i) => (
                  <div key={i} className="bg-black/20 border border-white/5 rounded-2xl p-4 sm:p-6 text-center">
                    <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-2">{s.label}</p>
                    <p className={`text-2xl sm:text-3xl font-bold ${s.color || 'text-white'}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-black/20 rounded-2xl p-5 sm:p-8 border border-white/5 mb-6">
                <h3 className="text-sm text-zinc-400 uppercase tracking-widest font-bold mb-6">Performance Semanal</h3>
                <div className="space-y-4">
                  {weekDays.map((day, i) => {
                    const date = weekDates[i];
                    const today = new Date().toISOString().split('T')[0];
                    const isToday = date === today;
                    const entry = weeklyData[date];
                    const pct = entry && entry.total > 0 ? Math.round((entry.completed / entry.total) * 100) : 0;
                    const hasData = !!entry;
                    return (
                      <div key={day} className="flex items-center gap-4">
                        <span className={cn("w-10 text-xs font-bold", isToday ? "text-red-400" : hasData ? "text-zinc-300" : "text-zinc-500")}>{day}</span>
                        <div className="flex-1 h-3 bg-zinc-900 rounded-full overflow-hidden"><div className={cn("h-full rounded-full transition-all", isToday ? "bg-gradient-to-r from-red-600 to-red-500" : hasData ? "bg-gradient-to-r from-zinc-500 to-zinc-400" : "bg-zinc-800")} style={{ width: `${pct}%` }} /></div>
                        <span className={cn("text-xs font-bold w-10 text-right", isToday ? "text-white" : hasData ? "text-zinc-300" : "text-zinc-700")}>{hasData ? `${pct}%` : '-'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <AIAnalysisButton label="Análise IA das Metas" prompt={`Performance semanal: RED hoje ${completionPct}%, média da semana ${weekAvg}%. Tarefas: ${completedToday}/${totalToday}. Desafios ativos: ${activeChals}, concluídos: ${completedChals}. Streak: ${streak} dias. Dados da semana: ${weekDays.map((d, i) => `${d}: ${weekPcts[i]}%`).join(', ')}. Dê sugestões de melhoria.`} />
            </div>
          </div>
        );
      }
      default: // command_center
        return (
          <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
              <div><h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">Centro de Comando</h1><p className="text-zinc-500 font-medium text-sm">Sua jornada de evolução continua.</p></div>
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-zinc-800 relative z-20">
                <div className="text-right"><span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Streak</span><div className="text-red-600 font-bold text-sm">🔥 {streak} dias</div></div>
                <div className="text-right"><span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">RED</span><div className="text-red-600 font-bold text-sm">{redTasks.filter(t => t.completed).length}/{redTasks.length}</div></div>
              </div>
            </header>
            <div className="mb-8 flex flex-col items-center justify-center relative group">
              <div className="absolute inset-0 bg-red-900/10 blur-[100px] rounded-full pointer-events-none" />
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-gradient-to-br from-zinc-900 to-black border-2 border-red-900/50 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(153,27,27,0.3)] mb-4 sm:mb-6">
                  <Target className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="px-3 py-1 bg-red-900/20 border border-red-900/50 rounded-full text-red-400 text-[10px] font-bold uppercase tracking-widest">Objeto de Foco</div>
                  {daysRemaining !== null && <div className="text-zinc-500 text-xs font-mono">Faltam {daysRemaining} dias</div>}
                </div>
                <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-3 max-w-2xl px-2 drop-shadow-md">{focusObjective}</h2>
                <div className="px-3 py-1 bg-zinc-800 rounded-full text-zinc-400 text-xs font-bold">{journeyLevel.icon} {journeyLevel.level}</div>
              </motion.div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
              {[
                { id: 'red' as ViewState, icon: Target, iconBg: 'bg-red-900/20', iconColor: 'text-red-500', label: 'R.E.D.', value: redTasks.length > 0 ? `${redTasks.filter(t => t.completed).length}/${redTasks.length}` : 'Configurar', sub: 'Rotina Essencial' },
                { id: 'challenges' as ViewState, icon: Flame, iconBg: 'bg-zinc-800', iconColor: 'text-zinc-300', label: 'Desafios', value: challengeProgress.filter(p => p.is_active).length > 0 ? `${challengeProgress.filter(p => p.is_active).length} ativo(s)` : 'Explorar', sub: 'Protocolos' },
                { id: 'tasks' as ViewState, icon: Check, iconBg: 'bg-zinc-800', iconColor: 'text-zinc-300', label: 'Tarefas', value: 'Gerais', sub: 'Micro-operações' },
                { id: 'decoupling' as ViewState, icon: Wind, iconBg: 'bg-zinc-800', iconColor: 'text-zinc-300', label: 'Descompressão', value: 'Ativo', sub: 'Anti-estresse' },
              ].map(card => (
                <div key={card.id} onClick={() => setCurrentView(card.id)} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 sm:p-6 hover:border-red-900/50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3"><div className={cn("p-2 rounded-lg", card.iconBg)}><card.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", card.iconColor)} /></div><span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{card.label}</span></div>
                  <h3 className="text-white font-bold mb-1 group-hover:text-red-400 transition-colors text-sm sm:text-base">{card.value}</h3>
                  <p className="text-zinc-500 text-xs sm:text-sm">{card.sub}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
              <div className="bg-black/20 border border-zinc-800 rounded-2xl p-5 sm:p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-4"><div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Zap className="w-4 h-4 text-emerald-500" /></div><h3 className="text-sm text-zinc-300 font-bold uppercase tracking-widest">Próximos Passos</h3></div>
                <div className="space-y-3 flex-1">
                  {redTasks.length === 0 && <div className="p-3 bg-zinc-900/50 rounded-xl border-l-2 border-red-500"><p className="text-sm text-zinc-300 font-medium"><span className="text-red-400 font-bold text-xs uppercase block mb-1">Começar</span>Crie suas primeiras tarefas na R.E.D.</p></div>}
                  {redTasks.length > 0 && redTasks.filter(t => !t.completed).length > 0 && <div className="p-3 bg-zinc-900/50 rounded-xl border-l-2 border-red-500"><p className="text-sm text-zinc-300 font-medium"><span className="text-red-400 font-bold text-xs uppercase block mb-1">Pendente</span>{redTasks.filter(t => !t.completed).length} tarefa(s) aguardando.</p></div>}
                  {redTasks.length > 0 && redTasks.every(t => t.completed) && <div className="p-3 bg-zinc-900/50 rounded-xl border-l-2 border-emerald-500"><p className="text-sm text-zinc-300 font-medium"><span className="text-emerald-400 font-bold text-xs uppercase block mb-1">Excelente</span>Todas as tarefas RED concluídas!</p></div>}
                </div>
              </div>
              <div className="lg:col-span-2 bg-black/20 border border-zinc-800 rounded-2xl p-5 sm:p-8">
                <h3 className="text-sm text-zinc-400 uppercase tracking-widest font-bold mb-4 sm:mb-6">Métricas de Vida</h3>
                <div className="h-56 sm:h-64 md:h-80 w-full flex items-center justify-center"><CustomRadarChart data={lifeAreasData} /></div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn("h-screen w-screen bg-zinc-950 text-white flex overflow-hidden", !darkMode && "light-theme")}>
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setMobileMenuOpen(true)} className="p-1.5 hover:bg-white/5 rounded-lg"><Menu className="w-6 h-6 text-zinc-400" /></button>
        <img src={focusLabLogo} alt="FocusLab" className="w-6 h-6" />
        <span className="text-sm font-bold text-white tracking-wider uppercase">Focus Lab</span>
      </div>
      <Sidebar currentView={currentView} setView={setCurrentView} onLogout={handleLogout} mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} profile={profile} />
      <main className="flex-1 overflow-hidden min-w-0 md:mt-0 mt-14">{renderView()}</main>

      {activeCoworkingRoom && activeCoworkingRoom.room_type === 'chat' && (
        <ChatOverlay room={activeCoworkingRoom} userId={userId!} userName={profile?.display_name || 'Operador'} userAvatar={profile?.avatar_url} onClose={() => setActiveCoworkingRoom(null)} onClickUser={uid => setProfileModalUserId(uid)} blockedIds={blockedIds} />
      )}


      <AnimatePresence>
        {showOnboarding && <OnboardingTour onComplete={handleCompleteOnboarding} />}
      </AnimatePresence>

      <AnimatePresence>
        {showShareStats && (
          <ShareableStats streak={streak} level={journeyLevel.level} redCompleted={redTasks.filter(t => t.completed).length} redTotal={redTasks.length} challengesCompleted={challengeProgress.filter(p => !p.is_active && p.completed_at).length} displayName={profile?.display_name || 'Operador'} onClose={() => setShowShareStats(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {profileModalUserId && profileModalUserId !== userId && !isBlocked(profileModalUserId) && (
          <UserProfileModal userId={profileModalUserId} currentUserId={userId!} onClose={() => setProfileModalUserId(null)} onSendFriendRequest={uid => { sendFriendRequest(uid); setProfileModalUserId(null); }} onOpenDM={uid => { setCurrentView('frilabs'); setProfileModalUserId(null); }} onBlock={uid => { blockUser(uid); setProfileModalUserId(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
}
