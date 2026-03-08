import React from 'react';
import {
  Flame, Target, BookOpen, Zap, Map, Shield, Check, Lock,
  ArrowRight, Atom, X, BarChart3, Brain, Clock
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function JourneyView() {
  const levels = [
    { level: 'Iniciante', desc: '0-10 dias', status: 'locked', icon: '🔴', requirements: ['Complete 3 dias de RED', 'Ative 1 desafio'], rewards: ['Acesso ao Laboratório', 'Diário de Reconfiguração'] },
    { level: 'Operador', desc: '11-30 dias', status: 'locked', icon: '🟠', requirements: ['10+ dias de consistência', '3+ desafios ativos', '5+ compromissos de ação'], rewards: ['Co-working Virtual', 'Análise com IA', 'Protocolo Anti-Queda'] },
    { level: 'Executor', desc: '31-60 dias', status: 'locked', icon: '🟡', requirements: ['30+ dias de RED completo', '2 desafios longos (21d+)'], rewards: ['Modo Focus Intensivo', 'Biblioteca Premium'] },
    { level: 'Arquiteto', desc: '61-120 dias', status: 'locked', icon: '🟢', requirements: ['60+ dias de streak', 'Objeto Trimestral alcançado'], rewards: ['Sistema de Automação', 'Acesso a Experts'] },
    { level: 'Mestre', desc: '120+ dias', status: 'locked', icon: '⚡', requirements: ['120+ dias de consistência', '5 objetos trimestrais alcançados'], rewards: ['Status de Mestre', 'Acesso vitalício'] }
  ];

  return (
    <div className="h-full overflow-y-auto p-8 lg:p-12">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Modo Jornada</h1>
          <p className="text-zinc-500 font-medium">Visualização de evolução e marcos da sua trajetória.</p>
        </div>

        {/* Stats - Empty */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Flame, iconColor: 'text-red-500', bgColor: 'bg-red-900/20', label: 'Sequência Atual', value: '0 dias' },
            { icon: Target, iconColor: 'text-emerald-500', bgColor: 'bg-emerald-900/20', label: 'Desafios Concluídos', value: '0' },
            { icon: BookOpen, iconColor: 'text-blue-500', bgColor: 'bg-blue-900/20', label: 'Conteúdo Consumido', value: '0h' },
            { icon: Zap, iconColor: 'text-purple-500', bgColor: 'bg-purple-900/20', label: 'Nível Atual', value: 'Novo' },
          ].map((stat, i) => (
            <div key={i} className="bg-black/20 border border-white/5 rounded-2xl p-6 backdrop-blur-sm text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bgColor)}><stat.icon className={cn("w-5 h-5", stat.iconColor)} /></div>
                <div><p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">{stat.label}</p><p className="text-2xl font-bold text-white">{stat.value}</p></div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline - Empty */}
        <div className="bg-black/20 border border-white/5 rounded-3xl p-8 backdrop-blur-sm mb-8">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Map className="w-5 h-5 text-red-500" /> Timeline de Evolução</h3>
          <div className="py-12 text-center">
            <Map className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium mb-2">Sua timeline está vazia</p>
            <p className="text-zinc-600 text-sm">Complete tarefas e desafios para registrar marcos na sua jornada.</p>
          </div>
        </div>

        {/* Levels */}
        <div className="bg-black/20 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-6">Sistema de Progressão</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {levels.map((phase, i) => (
              <div key={i} className="border rounded-2xl p-6 text-center bg-black/20 border-white/5 opacity-50">
                <div className="text-4xl mb-3">{phase.icon}</div>
                <h4 className="font-bold mb-1 text-white">{phase.level}</h4>
                <p className="text-xs text-zinc-500">{phase.desc}</p>
                <div className="mt-3"><Lock className="w-4 h-4 text-zinc-600 mx-auto" /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
