import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SettingsView } from './SettingsView';
import { RedViewReal } from './RedViewReal';
import { CustomRadarChart } from './CustomRadarChart';
import { JourneyView } from './JourneyView';
import { useAuth } from '@/hooks/useAuth';
import { useRedTasks, useObjective, useGeneralTasks, useChallengeProgress, useJournalEntries, useProjects, useLibraryContent, useCoworkingRooms, useIsAdmin } from '@/hooks/useSupabaseData';
import focusLabLogo from '@/assets/focuslab-logo.png';
import {
  LayoutDashboard, Atom, Activity, Target, BarChart3, Settings, Check, Play, ArrowRight,
  Brain, Dumbbell, BookOpen, Plus, Lock, ChevronLeft, Flame, Droplets, Smartphone, Clock,
  X, Zap, Users, Map, Shield, Video, FileText, Mic, Calendar, Trash2, Save, LogOut, Wind, Loader2,
  MessageCircle, Phone, ArrowLeft
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast, Toaster } from 'sonner';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

type ViewState = 'command_center' | 'red' | 'tasks' | 'challenges' | 'weekly_goals' | 'laboratory' | 'journal' | 'library' | 'journey' | 'coworking' | 'settings' | 'decoupling';

const SYSTEM_CHALLENGES = [
  { id: 1, title: 'Jejum de Dopamina', icon: Brain, duration: '7 dias', desc: 'Reduza estímulos artificiais para recuperar a sensibilidade dos receptores.' },
  { id: 2, title: 'Detox Digital', icon: Smartphone, duration: '3 dias', desc: 'Zero redes sociais e telas não essenciais após as 18h.' },
  { id: 3, title: 'Leitura Diária', icon: BookOpen, duration: '21 dias', desc: 'Ler no mínimo 20 páginas de um livro de não-ficção por dia.' },
  { id: 4, title: 'Exercício Físico', icon: Dumbbell, duration: '14 dias', desc: 'Movimento intencional por 45 minutos sem falhas.' },
  { id: 5, title: 'Hidratação 3L', icon: Droplets, duration: '14 dias', desc: 'Ingestão controlada de 3 litros de água pura diariamente.' },
];

const VIDEO_CATEGORIES = [
  { id: 'focus', title: 'Foco e Atenção', icon: Target, desc: 'Concentração profunda e eliminação de distrações.' },
  { id: 'procrastination', title: 'Procrastinação e Execução', icon: Zap, desc: 'Mecanismos de ação imediata e anti-evasão.' },
  { id: 'dopamine', title: 'Dopamina e Motivação', icon: Brain, desc: 'Regulação de neuroquímica e gestão de esforço.' },
  { id: 'vices', title: 'Vícios e Compulsões', icon: Shield, desc: 'Protocolos de contenção e substituição de hábitos.' },
  { id: 'discipline', title: 'Disciplina e Consistência', icon: Dumbbell, desc: 'Construção de identidade e manutenção de longo prazo.' },
  { id: 'sleep', title: 'Sono e Recuperação', icon: Activity, desc: 'Otimização fisiológica e ritmo circadiano.' },
  { id: 'emotions', title: 'Regulação Emocional', icon: Droplets, desc: 'Ansiedade, estresse e clareza sob pressão.' },
  { id: 'purpose', title: 'Propósito e Direção', icon: Map, desc: 'Alinhamento estratégico de vida.' },
];

// --- Auth Screen ---
const AuthScreen = () => {
  const { signIn, signUp } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) toast.error(error.message || 'Erro ao entrar');
      else toast.success('Acesso autorizado. Bem-vindo ao Núcleo.');
    } else {
      const { error } = await signUp(email, password, name);
      if (error) toast.error(error.message || 'Erro ao cadastrar');
      else toast.success('Conta criada! Verifique seu e-mail para confirmar.');
    }
    setIsLoading(false);
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col relative overflow-hidden font-montserrat text-white">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,_#3f3f46_1px,_transparent_1px)] bg-[size:24px_24px]"></div>
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
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-zinc-950 border border-red-900/30 w-full max-w-md rounded-3xl p-8 relative overflow-hidden shadow-[0_0_50px_rgba(153,27,27,0.1)]">
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
              <div className="mb-8 text-center">
                <div className="w-12 h-12 bg-red-900/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-red-900/30"><Lock className="w-6 h-6 text-red-600" /></div>
                <h3 className="text-2xl font-bold text-white">{mode === 'login' ? 'Entrar no Sistema' : 'Criar Nova Conta'}</h3>
              </div>
              <form onSubmit={handleAuth} className="space-y-4">
                {mode === 'signup' && (
                  <div><label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Nome</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600 transition-all" placeholder="Seu nome completo" /></div>
                )}
                <div><label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">E-mail</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600 transition-all" placeholder="exemplo@email.com" /></div>
                <div><label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Senha</label>
                  <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600 transition-all" placeholder="••••••••" /></div>
                <button type="submit" disabled={isLoading} className="w-full py-4 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-900/20 mt-4 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {mode === 'login' ? 'AUTENTICAR' : 'CADASTRAR'}
                </button>
              </form>
              <div className="mt-6 pt-6 border-t border-white/5 text-center">
                <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setName(''); }} className="text-zinc-400 hover:text-red-500 text-sm font-semibold transition-colors">
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
const Sidebar = ({ currentView, setView, onLogout }: { currentView: ViewState, setView: (v: ViewState) => void, onLogout: () => void }) => {
  const [redExpanded, setRedExpanded] = useState(true);
  const menuItems = [
    { id: 'command_center', icon: LayoutDashboard, label: 'Centro de Comando' },
    { id: 'red', icon: Target, label: 'R.E.D. (Núcleo)', hasSubmenu: true },
    { id: 'decoupling', icon: Wind, label: 'Desacoplamento' },
    { id: 'tasks', icon: Check, label: 'Tarefas Gerais' },
    { id: 'challenges', icon: Flame, label: 'Desafios' },
    { id: 'weekly_goals', icon: BarChart3, label: 'Metas Semanais' },
    { id: 'laboratory', icon: Atom, label: 'Laboratório (Projetos)' },
    { id: 'library', icon: Video, label: 'Biblioteca' },
    { id: 'journey', icon: Map, label: 'Modo Jornada' },
    { id: 'coworking', icon: Users, label: 'Co-working' },
  ];
  const redSubItems = [{ id: 'journal', icon: FileText, label: 'Diário Reconfig.' }];

  return (
    <div className="w-14 sm:w-20 lg:w-64 h-full bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col flex-shrink-0 z-20 shadow-2xl">
      <div className="p-3 sm:p-4 lg:p-8 flex items-center gap-3 mb-2 lg:mb-4">
        <img src={focusLabLogo} alt="FocusLab" className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
        <span className="hidden lg:block text-sm font-bold tracking-[0.2em] uppercase text-white">Focus Lab</span>
      </div>
      <nav className="flex-1 px-1.5 sm:px-2 lg:px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.id}>
            <button onClick={() => { if (item.hasSubmenu) setRedExpanded(!redExpanded); setView(item.id as ViewState); }}
              className={cn("w-full flex items-center justify-center lg:justify-start gap-3 lg:gap-4 p-2.5 sm:p-3 lg:p-4 rounded-xl transition-all group relative overflow-hidden",
                currentView === item.id ? "bg-red-900/20 text-white border border-red-600/20 shadow-[0_0_15px_rgba(185,28,28,0.1)]" : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5")}>
              {currentView === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 shadow-[0_0_10px_#dc2626]" />}
              <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", currentView === item.id ? "text-red-600" : "group-hover:text-red-500")} />
              <span className="hidden lg:block text-sm font-semibold tracking-wide text-left">{item.label}</span>
              {item.hasSubmenu && <ChevronLeft className={cn("hidden lg:block w-4 h-4 ml-auto transition-transform", redExpanded ? "rotate-[-90deg]" : "")} />}
            </button>
            {item.hasSubmenu && redExpanded && (
              <div className="mt-1 ml-0 lg:ml-8 space-y-1">
                {redSubItems.map((subItem) => (
                  <button key={subItem.id} onClick={() => setView(subItem.id as ViewState)}
                    className={cn("w-full flex items-center justify-center lg:justify-start gap-3 p-2 sm:p-3 rounded-lg transition-all group relative overflow-hidden",
                      currentView === subItem.id ? "bg-red-900/20 text-white border border-red-600/20" : "text-zinc-600 hover:text-zinc-300 hover:bg-white/5")}>
                    {currentView === subItem.id && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-600" />}
                    <subItem.icon className={cn("w-4 h-4 flex-shrink-0 transition-colors", currentView === subItem.id ? "text-red-500" : "")} />
                    <span className="hidden lg:block text-xs font-semibold tracking-wide text-left">{subItem.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="p-2 sm:p-3 lg:p-6 border-t border-white/5">
        <div className="hidden lg:flex items-center gap-3 mb-4 opacity-50">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">IA Ativa</span>
        </div>
        <button onClick={() => setView('settings')} className={cn("w-full flex items-center justify-center lg:justify-start gap-3 lg:gap-4 p-2 rounded-lg transition-all mb-2",
          currentView === 'settings' ? "bg-red-900/20 text-white border border-red-600/20" : "text-zinc-600 hover:text-zinc-300 hover:bg-white/5")}>
          <Settings className={cn("w-5 h-5 transition-colors", currentView === 'settings' ? "text-red-500" : "")} />
          <span className="hidden lg:block text-sm font-medium">Configurações</span>
        </button>
        <button onClick={onLogout} className="w-full flex items-center justify-center lg:justify-start gap-3 lg:gap-4 p-2 rounded-lg transition-all text-zinc-600 hover:text-red-500 hover:bg-red-900/10">
          <LogOut className="w-5 h-5 transition-colors" /><span className="hidden lg:block text-sm font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};

// --- Simple Views ---
const DecouplingView = ({ setView }: { setView: (v: ViewState) => void }) => {
  const [activeProtocol, setActiveProtocol] = useState<string | null>(null);
  return (
    <div className="h-full w-full bg-gradient-to-b from-zinc-950 to-blue-950/20 p-4 sm:p-6 lg:p-12 overflow-y-auto flex flex-col">
      <header className="mb-8 lg:mb-12"><h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 tracking-tight flex items-center gap-3"><Wind className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" /> Estação de Desacoplamento</h1>
        <p className="text-zinc-400 font-medium text-sm sm:text-base">Protocolos curtos para momentos de estresse, ansiedade ou sobrecarga.</p></header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 flex-1">
        {[
          { id: 'box', title: 'Respiração Box (4-4-4-4)', desc: 'Regulação do sistema nervoso autônomo. 2 minutos.', icon: Wind },
          { id: 'ground', title: 'Grounding 5-4-3-2-1', desc: 'Ancoragem no momento presente. 3 minutos.', icon: Target },
          { id: 'nothing', title: 'Apenas Existir', desc: 'Timer silencioso de 5 minutos. Nenhuma ação requerida.', icon: Activity }
        ].map(protocol => (
          <div key={protocol.id} onClick={() => setActiveProtocol(protocol.id)} className="bg-black/40 border border-blue-900/30 rounded-2xl lg:rounded-3xl p-6 lg:p-8 hover:border-blue-500/50 transition-all cursor-pointer group flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-blue-900/20 flex items-center justify-center mb-4 lg:mb-6 group-hover:scale-110 transition-transform"><protocol.icon className="w-6 h-6 lg:w-8 lg:h-8 text-blue-400" /></div>
            <h3 className="text-lg lg:text-xl font-bold text-white mb-2">{protocol.title}</h3><p className="text-zinc-500 text-sm">{protocol.desc}</p>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {activeProtocol && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="text-center">
              <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="w-32 h-32 rounded-full border-4 border-blue-500/50 flex items-center justify-center mx-auto mb-8">
                <div className="w-24 h-24 rounded-full bg-blue-500/20 blur-md" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Protocolo Ativo</h2><p className="text-blue-400 mb-8">Respire profundamente...</p>
              <button onClick={() => setActiveProtocol(null)} className="px-6 py-2 border border-zinc-700 hover:bg-zinc-800 text-white rounded-full transition-colors">Encerrar Protocolo</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TasksView = ({ userId }: { userId: string }) => {
  const { tasks, loading, addTask, toggleTask, updateTaskText, removeCompleted } = useGeneralTasks(userId);
  
  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-12 h-12 text-red-600 animate-spin" /></div>;

  return (
    <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Tarefas Gerais</h1>
      <p className="text-zinc-500 mb-8 lg:mb-12 font-medium text-sm sm:text-base max-w-2xl">Ambiente de alta performance. Execute uma micro-operação de cada vez.</p>
      <div className="max-w-3xl space-y-3 sm:space-y-4">
        {tasks.length === 0 ? (
          <div className="py-12 lg:py-16 text-center"><Check className="w-12 h-12 lg:w-16 lg:h-16 text-zinc-700 mx-auto mb-4" /><p className="text-zinc-500 font-medium mb-2">Nenhuma tarefa criada ainda</p></div>
        ) : (
          <AnimatePresence>{tasks.map((task) => (
            <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
              className={cn("w-full p-4 sm:p-6 border rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-6 transition-all group backdrop-blur-sm", task.completed ? "border-red-900/30 bg-red-900/10" : "border-white/5 bg-black/20 hover:border-white/10")}>
              <div onClick={() => toggleTask(task.id)}
                className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer shrink-0", task.completed ? "border-red-700 bg-red-700" : "border-zinc-700 group-hover:border-zinc-500")}>
                {task.completed && <Check className="w-4 h-4 text-white" />}
              </div>
              <input value={task.text} onChange={(e) => updateTaskText(task.id, e.target.value)}
                className={cn("text-base sm:text-lg font-medium transition-colors bg-transparent border-none focus:outline-none w-full min-w-0", task.completed ? "text-zinc-600 line-through" : "text-zinc-200")} />
            </motion.div>
          ))}</AnimatePresence>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4">
          <button onClick={() => addTask('Nova Tarefa')}
            className="py-3 sm:py-4 border-2 border-dashed border-zinc-800 rounded-xl sm:rounded-2xl text-zinc-500 font-bold uppercase tracking-widest hover:border-zinc-600 hover:text-zinc-300 transition-all bg-black/20 flex items-center justify-center gap-2 text-sm"><Plus className="w-4 h-4" /> Adicionar</button>
          <button onClick={removeCompleted} disabled={!tasks.some(t => t.completed)}
            className="py-3 sm:py-4 border-2 border-dashed border-zinc-800 rounded-xl sm:rounded-2xl text-zinc-500 font-bold uppercase tracking-widest hover:border-red-900/50 hover:text-red-600 transition-all bg-black/20 flex items-center justify-center gap-2 disabled:opacity-50 text-sm"><Trash2 className="w-4 h-4" /> Remover</button>
        </div>
      </div>
    </div>
  );
};

// --- Coworking View ---
const CoworkingView = ({ userId }: { userId: string }) => {
  const { rooms, loading, createRoom, deleteRoom } = useCoworkingRooms(userId);
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState<'chat' | 'call'>('chat');
  const [roomDesc, setRoomDesc] = useState('');

  const handleCreate = async () => {
    if (!roomName.trim()) return;
    await createRoom(roomName.trim(), roomType, roomDesc.trim());
    setRoomName(''); setRoomDesc(''); setShowCreate(false);
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-12 h-12 text-red-600 animate-spin" /></div>;

  return (
    <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 lg:mb-12 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Co-working Virtual</h1>
          <p className="text-zinc-500 font-medium text-sm sm:text-base">Conecte-se com outros operadores em salas de bate-papo e chamadas.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-5 py-3 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" /> CRIAR SALA
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6">
            <h3 className="text-white font-bold mb-4">Nova Sala</h3>
            <div className="space-y-3">
              <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Nome da sala..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600" autoFocus />
              <textarea value={roomDesc} onChange={(e) => setRoomDesc(e.target.value)} placeholder="Descrição (opcional)..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600 h-20 resize-none" />
              <div className="flex gap-2">
                <button onClick={() => setRoomType('chat')} className={cn("flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2", roomType === 'chat' ? "bg-red-900 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700")}>
                  <MessageCircle className="w-4 h-4" /> Bate-papo
                </button>
                <button onClick={() => setRoomType('call')} className={cn("flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2", roomType === 'call' ? "bg-red-900 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700")}>
                  <Phone className="w-4 h-4" /> Chamada
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreate} className="flex-1 py-2.5 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold transition-colors">CRIAR</button>
                <button onClick={() => setShowCreate(false)} className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors">CANCELAR</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {rooms.length === 0 ? (
        <div className="py-16 text-center">
          <Users className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhuma sala criada ainda</h3>
          <p className="text-zinc-500 font-medium">Crie uma sala para começar a colaborar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="bg-black/20 border border-white/5 rounded-2xl p-5 sm:p-6 hover:border-red-900/30 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                {room.room_type === 'chat' ? <MessageCircle className="w-5 h-5 text-blue-400" /> : <Phone className="w-5 h-5 text-emerald-400" />}
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{room.room_type === 'chat' ? 'Bate-papo' : 'Chamada'}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{room.name}</h3>
              {room.description && <p className="text-zinc-500 text-sm mb-4">{room.description}</p>}
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold text-sm transition-colors">Entrar</button>
                {room.created_by === userId && (
                  <button onClick={() => deleteRoom(room.id)} className="px-3 py-2 bg-zinc-800 hover:bg-red-900/30 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const JournalView = ({ userId }: { userId: string }) => {
  const { entries, saveEntry } = useJournalEntries(userId);
  const questions = [
    { q: 'O que impediu você de completar 100% da R.E.D. hoje?', ph: 'Identifique gatilhos, padrões ou situações específicas...' },
    { q: 'Qual foi o momento exato em que você desviou do protocolo?', ph: 'Hora, contexto, estado emocional...' },
    { q: 'Que sistema ou barreira pode prevenir isso amanhã?', ph: 'Seja específico e actionável...' },
    { q: 'Reflexão livre: O que você aprendeu sobre si mesmo hoje?', ph: 'Escreva livremente sem julgamento...' },
  ];

  return (
    <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 tracking-tight flex items-center gap-3"><FileText className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" /> Diário de Reconfiguração</h1>
      <p className="text-zinc-500 font-medium mb-8 lg:mb-12 text-sm sm:text-base">Reflexão guiada para identificar padrões e criar intervenções.</p>
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {questions.map((item, i) => (
          <div key={i} className="bg-black/20 border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
            <label className="block text-white font-bold mb-3 text-sm">{item.q}</label>
            <textarea
              value={entries[i] || ''}
              onChange={(e) => saveEntry(i, e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600 min-h-[80px] sm:min-h-[100px] resize-y font-medium leading-relaxed"
              placeholder={item.ph}
            />
          </div>
        ))}
        <button onClick={() => toast.success('Padrões analisados!')} className="w-full py-3 sm:py-4 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"><Brain className="w-5 h-5" /> ANALISAR PADRÕES</button>
      </div>
    </div>
  );
};

// --- Laboratory View ---
const LaboratoryView = ({ userId }: { userId: string }) => {
  const { projects, loading, addProject, removeProject } = useProjects(userId);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) return;
    await addProject(title.trim(), desc.trim());
    setTitle(''); setDesc(''); setShowCreate(false);
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-12 h-12 text-red-600 animate-spin" /></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-12 overflow-y-auto h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 lg:mb-12 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Laboratório de Projetos</h1>
          <p className="text-zinc-500 font-medium text-sm sm:text-base">Área de construção estratégica e organização mental.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-5 py-3 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" /> NOVO PROJETO
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6 max-w-2xl">
            <div className="space-y-3">
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome do projeto..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600" autoFocus />
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descrição (opcional)..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600 h-20 resize-none" />
              <div className="flex gap-2">
                <button onClick={handleCreate} className="flex-1 py-2.5 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold transition-colors">CRIAR</button>
                <button onClick={() => { setShowCreate(false); setTitle(''); setDesc(''); }} className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors">CANCELAR</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {projects.length === 0 && !showCreate ? (
        <div className="py-16 text-center max-w-2xl mx-auto">
          <Atom className="w-16 h-16 text-zinc-700 mx-auto mb-4" /><h3 className="text-xl font-bold text-white mb-2">Nenhum projeto criado ainda</h3>
          <p className="text-zinc-500 font-medium mb-8">O Laboratório é seu espaço para desenvolver ideias e organizar pensamentos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projects.map((p) => (
            <div key={p.id} className="bg-black/20 border border-white/5 rounded-2xl p-5 sm:p-6 hover:border-red-900/30 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <Atom className="w-5 h-5 text-zinc-500 group-hover:text-red-500 transition-colors" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{p.status === 'active' ? 'Ativo' : p.status}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
              {p.description && <p className="text-zinc-500 text-sm mb-4">{p.description}</p>}
              <button onClick={() => removeProject(p.id)} className="px-3 py-1.5 bg-zinc-800 hover:bg-red-900/30 text-zinc-400 hover:text-red-400 rounded-lg text-xs font-bold transition-colors">
                <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Library View ---
const LibraryView = ({ isAdmin }: { isAdmin: boolean }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { content, loading, addContent, removeContent } = useLibraryContent(selectedCategory || undefined);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const handleAdd = async () => {
    if (!newTitle.trim() || !selectedCategory) return;
    await addContent({ category_id: selectedCategory, title: newTitle.trim(), description: newDesc.trim(), content_url: newUrl.trim() });
    setNewTitle(''); setNewDesc(''); setNewUrl(''); setShowAdd(false);
  };

  if (selectedCategory) {
    const cat = VIDEO_CATEGORIES.find(c => c.id === selectedCategory);
    return (
      <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
        <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Voltar à Biblioteca
        </button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{cat?.title}</h1>
            <p className="text-zinc-500 font-medium text-sm sm:text-base">{cat?.desc}</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowAdd(true)} className="px-5 py-3 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shrink-0">
              <Plus className="w-4 h-4" /> ADICIONAR
            </button>
          )}
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6 max-w-2xl">
              <div className="space-y-3">
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Título do conteúdo..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600" autoFocus />
                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Descrição..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600 h-20 resize-none" />
                <input type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="URL do conteúdo (opcional)..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600" />
                <div className="flex gap-2">
                  <button onClick={handleAdd} className="flex-1 py-2.5 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold transition-colors">ADICIONAR</button>
                  <button onClick={() => setShowAdd(false)} className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors">CANCELAR</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>
        ) : content.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Nenhum conteúdo ainda</h3>
            <p className="text-zinc-500 font-medium">Esta categoria ainda não possui conteúdo disponível.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {content.map((item) => (
              <div key={item.id} className="bg-black/20 border border-white/5 rounded-2xl p-5 sm:p-6 hover:border-red-900/30 transition-all">
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                {item.description && <p className="text-zinc-500 text-sm mb-3">{item.description}</p>}
                {item.content_url && <a href={item.content_url} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 text-sm font-medium">Abrir conteúdo →</a>}
                {isAdmin && (
                  <button onClick={() => removeContent(item.id)} className="mt-3 px-3 py-1.5 bg-zinc-800 hover:bg-red-900/30 text-zinc-400 hover:text-red-400 rounded-lg text-xs font-bold transition-colors block">
                    <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Remover
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Biblioteca Estratégica</h1>
      <p className="text-zinc-500 font-medium mb-8 lg:mb-12 text-sm sm:text-base">Conteúdo operacional. Consuma e execute.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {VIDEO_CATEGORIES.map((cat) => (
          <div key={cat.id} onClick={() => setSelectedCategory(cat.id)} className="bg-black/20 border border-white/5 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:border-red-900/50 hover:bg-red-900/5 transition-all cursor-pointer group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform text-zinc-400 group-hover:text-red-500"><cat.icon className="w-5 h-5 sm:w-6 sm:h-6" /></div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">{cat.title}</h3><p className="text-zinc-500 text-xs sm:text-sm leading-relaxed">{cat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---
export default function FocusLabApp() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('command_center');

  const userId = user?.id;
  const { tasks: redTasks, loading: redLoading, addTask, toggleTask, removeTask, updateTask } = useRedTasks(userId);
  const { objective, loading: objLoading, updateObjective, createObjective } = useObjective(userId);
  const { progress: challengeProgress, startChallenge } = useChallengeProgress(userId);
  const { isAdmin } = useIsAdmin(userId);

  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center">
        <Toaster position="top-center" theme="dark" />
        <div className="text-center"><Loader2 className="w-16 h-16 text-red-600 animate-spin mx-auto mb-4" /><p className="text-zinc-400 font-medium">Carregando sistema...</p></div>
      </div>
    );
  }

  if (!user) {
    return <><Toaster position="top-center" theme="dark" /><AuthScreen /></>;
  }

  // Command Center data
  const lifeAreasData = (() => {
    const scores = { Mente: 0, Corpo: 0, Carreira: 0, Espírito: 0, Social: 0, Finanças: 0 };
    redTasks.forEach(task => {
      if (!task.completed) return;
      if (task.category === 'Mind') scores.Mente += 20;
      else if (task.category === 'Bio') scores.Corpo += 20;
      else if (task.category === 'Work') scores.Carreira += 20;
      else scores.Espírito += 10;
    });
    return [
      { subject: 'Mente', A: Math.min(scores.Mente, 150), fullMark: 150 },
      { subject: 'Corpo', A: Math.min(scores.Corpo, 150), fullMark: 150 },
      { subject: 'Carreira', A: Math.min(scores.Carreira, 150), fullMark: 150 },
      { subject: 'Espírito', A: Math.min(scores.Espírito, 150), fullMark: 150 },
      { subject: 'Social', A: Math.min(scores.Social, 150), fullMark: 150 },
      { subject: 'Finanças', A: Math.min(scores.Finanças, 150), fullMark: 150 },
    ];
  })();

  const focusObjective = objective?.title || 'Defina seu objeto de foco na aba R.E.D.';
  const focusTargetDate = objective?.target_date;
  const daysRemaining = focusTargetDate ? Math.max(0, Math.ceil((new Date(focusTargetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : null;

  const handleLogout = async () => {
    await signOut();
    toast.success('Desconectado com sucesso.');
  };

  const renderView = () => {
    switch (currentView) {
      case 'red': return <RedViewReal tasks={redTasks} tasksLoading={redLoading} addTask={addTask} toggleTask={toggleTask} removeTask={removeTask} updateTask={updateTask} objective={objective} objectiveLoading={objLoading} updateObjective={updateObjective} createObjective={createObjective} userId={userId || null} />;
      case 'settings': return <SettingsView userId={userId} />;
      case 'journey': return <JourneyView />;
      case 'decoupling': return <DecouplingView setView={setCurrentView} />;
      case 'tasks': return <TasksView userId={userId!} />;
      case 'coworking': return <CoworkingView userId={userId!} />;
      case 'journal': return <JournalView userId={userId!} />;
      case 'laboratory': return <LaboratoryView userId={userId!} />;
      case 'library': return <LibraryView isAdmin={isAdmin} />;
      case 'challenges': return (
        <div className="p-4 sm:p-6 lg:p-12 overflow-y-auto h-full">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Desafios</h1><p className="text-zinc-500 font-medium mb-8 lg:mb-12 text-sm sm:text-base">Protocolos de otimização comportamental.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {SYSTEM_CHALLENGES.map((c) => {
              const active = challengeProgress.find(p => p.challenge_id === c.id && p.is_active);
              return (
                <div key={c.id} className="bg-black/20 border border-white/5 hover:border-red-900/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 transition-all group relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><c.icon className="w-32 h-32 text-red-600" /></div>
                  <div className="relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 text-red-600 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-black/50"><c.icon className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{c.title}</h3>
                    <div className="inline-block px-3 py-1 text-xs font-bold rounded-full mb-3 sm:mb-4 border bg-red-900/20 text-red-400 border-red-900/30">{c.duration}</div>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6 sm:mb-8 line-clamp-2">{c.desc}</p>
                    <button onClick={() => !active && startChallenge(c.id)}
                      className={cn("w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2",
                        active ? "bg-emerald-900/30 text-emerald-400 border border-emerald-600/30 cursor-default" : "bg-zinc-800 text-white hover:bg-red-900")}>
                      {active ? <><Check className="w-4 h-4" /> EM ANDAMENTO</> : <><Play className="w-4 h-4" /> INICIAR PROTOCOLO</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
      case 'weekly_goals': return (
        <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Metas Semanais</h1><p className="text-zinc-500 font-medium mb-8 lg:mb-12 text-sm sm:text-base">Análise de consistência e aderência ao plano.</p>
            <div className="mb-12 bg-black/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/5 backdrop-blur-sm">
              <h3 className="text-sm text-zinc-400 uppercase tracking-widest font-bold mb-8">Performance Semanal</h3>
              <div className="py-12 sm:py-16 text-center">
                <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 font-medium mb-2">Nenhum dado de performance ainda</p>
                <p className="text-zinc-600 text-sm">Complete tarefas na R.E.D. para gerar dados de performance.</p>
              </div>
            </div>
          </div>
        </div>
      );
      default: // command_center
        return (
          <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 lg:mb-12 gap-4">
              <div><h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">Centro de Comando</h1><p className="text-zinc-500 font-medium text-sm sm:text-base">Sua jornada de evolução continua.</p></div>
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-zinc-800 backdrop-blur-sm relative z-20">
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Tarefas RED</span>
                  <div className="text-red-600 font-bold text-sm">{redTasks.filter(t => t.completed).length}/{redTasks.length}</div>
                </div>
                <Flame className="w-6 h-6 text-red-600 animate-pulse drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
              </div>
            </header>
            {/* Focus Emblem */}
            <div className="mb-8 lg:mb-12 flex flex-col items-center justify-center relative group">
              <div className="absolute inset-0 bg-red-900/10 blur-[100px] rounded-full pointer-events-none" />
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-gradient-to-br from-zinc-900 to-black border-2 border-red-900/50 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(153,27,27,0.3)] mb-4 sm:mb-6 group-hover:shadow-[0_0_80px_rgba(220,38,38,0.5)] transition-all duration-500">
                  <Target className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />
                </div>
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="px-3 py-1 bg-red-900/20 border border-red-900/50 rounded-full text-red-400 text-[10px] font-bold uppercase tracking-widest">Objeto de Foco</div>
                  {daysRemaining !== null && <div className="text-zinc-500 text-xs font-mono">Faltam {daysRemaining} dias</div>}
                </div>
                <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-4 sm:mb-6 max-w-2xl px-2 sm:px-4 drop-shadow-md">{focusObjective}</h2>
              </motion.div>
            </div>
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 lg:mb-12">
              <div className="bg-zinc-900/40 border border-red-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-red-900/50 transition-colors cursor-pointer group" onClick={() => setCurrentView('red')}>
                <div className="flex items-center gap-3 mb-3 sm:mb-4"><div className="p-2 bg-red-900/20 rounded-lg text-red-500"><Target className="w-4 h-4 sm:w-5 sm:h-5" /></div><span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">R.E.D.</span></div>
                <h3 className="text-white font-bold mb-2 group-hover:text-red-400 transition-colors text-sm sm:text-base">{redTasks.length > 0 ? `${redTasks.filter(t => t.completed).length}/${redTasks.length} tarefas hoje` : 'Nenhuma tarefa ainda'}</h3>
                <p className="text-zinc-500 text-xs sm:text-sm">{redTasks.length > 0 ? 'Continue executando.' : 'Configure sua rotina essencial.'}</p>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-red-900/50 transition-colors cursor-pointer group" onClick={() => setCurrentView('challenges')}>
                <div className="flex items-center gap-3 mb-3 sm:mb-4"><div className="p-2 bg-zinc-800 rounded-lg text-zinc-300"><Flame className="w-4 h-4 sm:w-5 sm:h-5" /></div><span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Desafios</span></div>
                <h3 className="text-white font-bold mb-2 group-hover:text-red-400 transition-colors text-sm sm:text-base">{challengeProgress.filter(p => p.is_active).length > 0 ? `${challengeProgress.filter(p => p.is_active).length} ativo(s)` : 'Nenhum ativo'}</h3>
                <p className="text-zinc-500 text-xs sm:text-sm">{challengeProgress.length > 0 ? 'Continue evoluindo.' : 'Inicie seu primeiro desafio.'}</p>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-red-900/50 transition-colors cursor-pointer group" onClick={() => setCurrentView('tasks')}>
                <div className="flex items-center gap-3 mb-3 sm:mb-4"><div className="p-2 bg-zinc-800 rounded-lg text-zinc-300"><Check className="w-4 h-4 sm:w-5 sm:h-5" /></div><span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tarefas</span></div>
                <h3 className="text-white font-bold mb-2 group-hover:text-red-400 transition-colors text-sm sm:text-base">Tarefas Gerais</h3>
                <p className="text-zinc-500 text-xs sm:text-sm">Organize suas micro-operações.</p>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-blue-900/50 transition-colors cursor-pointer group" onClick={() => setCurrentView('decoupling')}>
                <div className="flex items-center gap-3 mb-3 sm:mb-4"><div className="p-2 bg-zinc-800 rounded-lg text-zinc-300 group-hover:text-blue-400"><Wind className="w-4 h-4 sm:w-5 sm:h-5" /></div><span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Descompressão</span></div>
                <h3 className="text-white font-bold mb-2 group-hover:text-blue-400 transition-colors text-sm sm:text-base">Desacoplamento</h3><p className="text-zinc-500 text-xs sm:text-sm">Protocolos para estresse.</p>
              </div>
            </div>
            {/* Radar + Next Steps */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
              <div className="bg-black/20 border border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 backdrop-blur-sm flex flex-col">
                <div className="flex items-center gap-3 mb-4 sm:mb-6"><div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Zap className="w-4 h-4 text-emerald-500" /></div>
                  <h3 className="text-sm text-zinc-300 font-bold uppercase tracking-widest">Próximos Passos</h3></div>
                <div className="space-y-3 sm:space-y-4 flex-1">
                  {redTasks.length === 0 && (
                    <div className="p-3 sm:p-4 bg-zinc-900/50 rounded-xl border-l-2 border-red-500"><p className="text-sm text-zinc-300 font-medium leading-relaxed"><span className="text-red-400 font-bold text-xs uppercase block mb-1">Começar</span>Crie suas primeiras tarefas na R.E.D.</p></div>
                  )}
                  {redTasks.length > 0 && redTasks.filter(t => !t.completed).length > 0 && (
                    <div className="p-3 sm:p-4 bg-zinc-900/50 rounded-xl border-l-2 border-red-500"><p className="text-sm text-zinc-300 font-medium leading-relaxed"><span className="text-red-400 font-bold text-xs uppercase block mb-1">Pendente</span>{redTasks.filter(t => !t.completed).length} tarefa(s) aguardando.</p></div>
                  )}
                  {redTasks.length > 0 && redTasks.every(t => t.completed) && (
                    <div className="p-3 sm:p-4 bg-zinc-900/50 rounded-xl border-l-2 border-emerald-500"><p className="text-sm text-zinc-300 font-medium leading-relaxed"><span className="text-emerald-400 font-bold text-xs uppercase block mb-1">Excelente</span>Todas as tarefas RED concluídas!</p></div>
                  )}
                  {challengeProgress.filter(p => p.is_active).length === 0 && (
                    <div className="p-3 sm:p-4 bg-zinc-900/50 rounded-xl border-l-2 border-zinc-600"><p className="text-sm text-zinc-300 font-medium leading-relaxed"><span className="text-zinc-400 font-bold text-xs uppercase block mb-1">Desafios</span>Explore os desafios.</p></div>
                  )}
                </div>
              </div>
              <div className="lg:col-span-2 bg-black/20 border border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden backdrop-blur-sm">
                <h3 className="text-sm text-zinc-400 uppercase tracking-widest font-bold mb-4 sm:mb-6">Métricas de Vida</h3>
                <div className="h-56 sm:h-64 md:h-80 w-full flex items-center justify-center"><CustomRadarChart data={lifeAreasData} /></div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-screen bg-zinc-950 text-white flex overflow-hidden">
      <Toaster position="top-center" theme="dark" />
      <Sidebar currentView={currentView} setView={setCurrentView} onLogout={handleLogout} />
      <main className="flex-1 overflow-hidden min-w-0">{renderView()}</main>
    </div>
  );
}
