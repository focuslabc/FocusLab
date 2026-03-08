import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame, Target, BookOpen, Zap, Map, Shield, Check, Lock,
  ArrowRight, Atom, X, BarChart3, Brain, Clock
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function JourneyView() {
  const [journeyModal, setJourneyModal] = useState<'streak' | 'challenges' | 'content' | 'level' | 'insights' | null>(null);
  const [selectedTimelineItem, setSelectedTimelineItem] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const timelineItems = [
    { date: 'Hoje', title: 'Ativação do Protocolo Anti-Queda Vespertina', desc: 'Implementado baseado em análise do Diário de Reconfiguração', icon: Shield, color: 'red', details: 'Protocolo implementado às 14h30. Inclui alarme às 16h para ativação de deep work de 90min.' },
    { date: '2 dias atrás', title: 'Compromisso de Ação: Atomic Habits', desc: 'Registrado sistema de stacking de hábitos', icon: BookOpen, color: 'blue', details: 'Compromisso: Implementar stacking conectando 15min de leitura após café da manhã. Prazo: 48h.' },
    { date: '5 dias atrás', title: 'Desafio Concluído: Leitura Diária (21 dias)', desc: 'Primeiro desafio de longo prazo completado', icon: Check, color: 'emerald', details: 'Desafio completado com 21/21 dias de leitura. Total: 487 páginas lidas.' },
    { date: '12 dias atrás', title: 'Nível Alcançado: Operador', desc: 'Evolução de Iniciante para Operador', icon: Zap, color: 'purple', details: 'Progressão de nível conquistada após 11 dias de consistência.' },
    { date: '23 dias atrás', title: 'Início da Jornada no Focus Lab', desc: 'Primeiro acesso ao sistema', icon: Atom, color: 'zinc', details: 'Primeira sessão no Focus Lab. Configuração inicial realizada.' }
  ];

  const levels = [
    { level: 'Iniciante', desc: '0-10 dias', status: 'completed', icon: '🔴', requirements: ['Complete 3 dias de RED', 'Ative 1 desafio'], rewards: ['Acesso ao Laboratório', 'Diário de Reconfiguração'] },
    { level: 'Operador', desc: '11-30 dias', status: 'current', icon: '🟠', requirements: ['10+ dias de consistência', '3+ desafios ativos', '5+ compromissos de ação'], rewards: ['Co-working Virtual', 'Análise com IA', 'Protocolo Anti-Queda'] },
    { level: 'Executor', desc: '31-60 dias', status: 'locked', icon: '🟡', requirements: ['30+ dias de RED completo', '2 desafios longos (21d+)'], rewards: ['Modo Focus Intensivo', 'Biblioteca Premium'] },
    { level: 'Arquiteto', desc: '61-120 dias', status: 'locked', icon: '🟢', requirements: ['60+ dias de streak', 'Objeto Trimestral alcançado'], rewards: ['Sistema de Automação', 'Acesso a Experts'] },
    { level: 'Mestre', desc: '120+ dias', status: 'locked', icon: '⚡', requirements: ['120+ dias de consistência', '5 objetos trimestrais alcançados'], rewards: ['Status de Mestre', 'Acesso vitalício'] }
  ];

  return (
    <div className="h-full overflow-y-auto p-8 lg:p-12">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div><h1 className="text-4xl font-bold text-white mb-2">Modo Jornada</h1><p className="text-zinc-500 font-medium">Visualização de evolução e marcos da sua trajetória.</p></div>
          <button onClick={() => setJourneyModal('insights')} className="px-6 py-3 bg-red-900/20 hover:bg-red-900/30 border border-red-600/50 rounded-xl text-red-400 font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Ver Insights</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { modal: 'streak' as const, icon: Flame, iconColor: 'text-red-500', bgColor: 'bg-red-900/20', hoverBorder: 'hover:border-red-600/30', label: 'Sequência Atual', value: '23 dias', extra: <div className="h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-red-600 rounded-full" style={{width: '76%'}} /></div> },
            { modal: 'challenges' as const, icon: Target, iconColor: 'text-emerald-500', bgColor: 'bg-emerald-900/20', hoverBorder: 'hover:border-emerald-600/30', label: 'Desafios Concluídos', value: '12', extra: <p className="text-xs text-zinc-600">5 ativos agora</p> },
            { modal: 'content' as const, icon: BookOpen, iconColor: 'text-blue-500', bgColor: 'bg-blue-900/20', hoverBorder: 'hover:border-blue-600/30', label: 'Conteúdo Consumido', value: '47h', extra: <p className="text-xs text-zinc-600">8 cursos, 5 livros</p> },
            { modal: 'level' as const, icon: Zap, iconColor: 'text-purple-500', bgColor: 'bg-purple-900/20', hoverBorder: 'hover:border-purple-600/30', label: 'Nível Atual', value: 'Operador', extra: <div className="h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-purple-600 rounded-full" style={{width: '45%'}} /></div> },
          ].map((stat) => (
            <button key={stat.modal} onClick={() => setJourneyModal(stat.modal)} className={cn("bg-black/20 border border-white/5 rounded-2xl p-6 backdrop-blur-sm transition-all text-left group cursor-pointer", stat.hoverBorder)}>
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-opacity-30 transition-colors", stat.bgColor)}><stat.icon className={cn("w-5 h-5", stat.iconColor)} /></div>
                <div><p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">{stat.label}</p><p className="text-2xl font-bold text-white">{stat.value}</p></div>
              </div>
              {stat.extra}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="bg-black/20 border border-white/5 rounded-3xl p-8 backdrop-blur-sm mb-8">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Map className="w-5 h-5 text-red-500" /> Timeline de Evolução</h3>
          <div className="space-y-6 relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-red-600 via-red-900 to-transparent" />
            {timelineItems.map((item, i) => (
              <button key={i} onClick={() => setSelectedTimelineItem(i)} className="relative flex gap-4 pl-16 w-full text-left hover:bg-white/5 rounded-xl p-2 -ml-2 transition-colors group cursor-pointer">
                <div className={cn("absolute left-2 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all group-hover:scale-110",
                  item.color === 'red' && "bg-red-900/20 border-2 border-red-600", item.color === 'blue' && "bg-blue-900/20 border-2 border-blue-600",
                  item.color === 'emerald' && "bg-emerald-900/20 border-2 border-emerald-600", item.color === 'purple' && "bg-purple-900/20 border-2 border-purple-600",
                  item.color === 'zinc' && "bg-zinc-900/20 border-2 border-zinc-600")}>
                  <item.icon className={cn("w-5 h-5", item.color === 'red' && "text-red-500", item.color === 'blue' && "text-blue-500", item.color === 'emerald' && "text-emerald-500", item.color === 'purple' && "text-purple-500", item.color === 'zinc' && "text-zinc-500")} />
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h4 className="text-white font-bold group-hover:text-red-400 transition-colors">{item.title}</h4>
                    <span className="px-2 py-0.5 bg-white/5 rounded-full text-xs text-zinc-500 font-mono">{item.date}</span>
                  </div>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"><ArrowRight className="w-5 h-5 text-zinc-600" /></div>
              </button>
            ))}
          </div>
        </div>

        {/* Levels */}
        <div className="bg-black/20 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-6">Sistema de Progressão</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {levels.map((phase, i) => (
              <button key={i} onClick={() => phase.status !== 'locked' ? setSelectedLevel(i) : null} disabled={phase.status === 'locked'}
                className={cn("border rounded-2xl p-6 text-center transition-all",
                  phase.status === 'completed' ? "bg-emerald-900/10 border-emerald-600/30 hover:bg-emerald-900/20 cursor-pointer" :
                  phase.status === 'current' ? "bg-red-900/20 border-red-600/50 shadow-[0_0_20px_rgba(185,28,28,0.2)] hover:bg-red-900/30 cursor-pointer" :
                  "bg-black/20 border-white/5 opacity-50 cursor-not-allowed")}>
                <div className="text-4xl mb-3">{phase.icon}</div>
                <h4 className={cn("font-bold mb-1", phase.status === 'current' ? "text-red-400" : "text-white")}>{phase.level}</h4>
                <p className="text-xs text-zinc-500">{phase.desc}</p>
                {phase.status === 'current' && <div className="mt-3 px-2 py-1 bg-red-600 rounded-full text-xs font-bold uppercase tracking-wider">Ativo</div>}
                {phase.status === 'completed' && <div className="mt-3"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></div>}
                {phase.status === 'locked' && <div className="mt-3"><Lock className="w-4 h-4 text-zinc-600 mx-auto" /></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {(journeyModal || selectedTimelineItem !== null || selectedLevel !== null) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => { setJourneyModal(null); setSelectedTimelineItem(null); setSelectedLevel(null); }}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-zinc-950 border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {journeyModal === 'streak' && 'Histórico de Sequência'}
                    {journeyModal === 'insights' && 'Insights Comportamentais'}
                    {selectedTimelineItem !== null && timelineItems[selectedTimelineItem]?.title}
                    {selectedLevel !== null && levels[selectedLevel]?.level}
                  </h2>
                  <button onClick={() => { setJourneyModal(null); setSelectedTimelineItem(null); setSelectedLevel(null); }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"><X className="w-5 h-5 text-zinc-400" /></button>
                </div>

                {journeyModal === 'streak' && (
                  <div className="space-y-4">
                    <div className="bg-black/40 border border-red-900/30 rounded-2xl p-6">
                      <div className="flex items-center gap-4 mb-4"><Flame className="w-12 h-12 text-red-500" /><div><p className="text-3xl font-bold text-white">23 dias</p><p className="text-sm text-zinc-500">Sequência atual</p></div></div>
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {Array.from({ length: 28 }).map((_, i) => (<div key={i} className={cn("aspect-square rounded-lg", i < 23 ? "bg-red-600" : "bg-white/5")} />))}
                      </div>
                    </div>
                  </div>
                )}

                {journeyModal === 'insights' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-red-900/10 to-purple-900/10 border border-red-900/30 rounded-2xl p-6">
                      <h4 className="font-bold text-white mb-3 flex items-center gap-2"><Brain className="w-5 h-5 text-red-500" /> Padrões Identificados</h4>
                      <ul className="space-y-2 text-sm text-zinc-300">
                        <li className="flex gap-2"><span className="text-red-500 flex-shrink-0">•</span><span>Maior produtividade entre 9h-12h</span></li>
                        <li className="flex gap-2"><span className="text-red-500 flex-shrink-0">•</span><span>Queda de foco típica às 16h</span></li>
                        <li className="flex gap-2"><span className="text-red-500 flex-shrink-0">•</span><span>Taxa de conclusão de RED: 89%</span></li>
                      </ul>
                    </div>
                  </div>
                )}

                {selectedTimelineItem !== null && (
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                    <p className="text-zinc-300 leading-relaxed">{timelineItems[selectedTimelineItem]?.details}</p>
                  </div>
                )}

                {selectedLevel !== null && (
                  <div className="space-y-4">
                    <div className="text-center"><div className="text-6xl mb-4">{levels[selectedLevel].icon}</div></div>
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                      <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Requisitos</h4>
                      <ul className="space-y-2">{levels[selectedLevel].requirements.map((req, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-zinc-300"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /><span>{req}</span></li>
                      ))}</ul>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                      <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Recompensas</h4>
                      <ul className="space-y-2">{levels[selectedLevel].rewards.map((reward, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-zinc-300"><Zap className="w-4 h-4 text-purple-500 flex-shrink-0" /><span>{reward}</span></li>
                      ))}</ul>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
