import React from 'react';
import { Flame, Target, BookOpen, Zap, Map, Lock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface JourneyViewProps {
  redTasks?: any[];
  challengeProgress?: any[];
}

export function JourneyView({ redTasks = [], challengeProgress = [] }: JourneyViewProps) {
  const completedToday = redTasks.filter(t => t.completed).length;
  const activeChallenges = challengeProgress.filter(p => p.is_active).length;
  const completedChallenges = challengeProgress.filter(p => !p.is_active && p.completed_at).length;

  // Compute streak (simplified: count consecutive days with completed tasks)
  const streak = completedToday > 0 ? 1 : 0; // Simplified - in production would check historical data

  const currentLevel = streak >= 120 ? 4 : streak >= 61 ? 3 : streak >= 31 ? 2 : streak >= 11 ? 1 : 0;

  const levels = [
    { level: 'Iniciante', desc: '0-10 dias', icon: '🔴', requirements: ['Complete 3 dias de RED', 'Ative 1 desafio'], rewards: ['Acesso ao Laboratório', 'Diário de Reconfiguração'] },
    { level: 'Operador', desc: '11-30 dias', icon: '🟠', requirements: ['10+ dias de consistência', '3+ desafios ativos'], rewards: ['Co-working Virtual', 'Análise com IA'] },
    { level: 'Executor', desc: '31-60 dias', icon: '🟡', requirements: ['30+ dias de RED completo', '2 desafios longos (21d+)'], rewards: ['Modo Focus Intensivo', 'Biblioteca Premium'] },
    { level: 'Arquiteto', desc: '61-120 dias', icon: '🟢', requirements: ['60+ dias de streak', 'Objeto Trimestral alcançado'], rewards: ['Sistema de Automação'] },
    { level: 'Mestre', desc: '120+ dias', icon: '⚡', requirements: ['120+ dias de consistência', '5 objetos trimestrais'], rewards: ['Status de Mestre'] }
  ];

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-12">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-8 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Modo Jornada</h1>
          <p className="text-zinc-500 font-medium text-sm sm:text-base">Visualização de evolução e marcos da sua trajetória.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 lg:mb-12">
          {[
            { icon: Flame, iconColor: 'text-red-500', bgColor: 'bg-red-900/20', label: 'Sequência Atual', value: `${streak} dia${streak !== 1 ? 's' : ''}` },
            { icon: Target, iconColor: 'text-emerald-500', bgColor: 'bg-emerald-900/20', label: 'Desafios Concluídos', value: String(completedChallenges) },
            { icon: BookOpen, iconColor: 'text-blue-500', bgColor: 'bg-blue-900/20', label: 'Desafios Ativos', value: String(activeChallenges) },
            { icon: Zap, iconColor: 'text-purple-500', bgColor: 'bg-purple-900/20', label: 'Nível Atual', value: levels[currentLevel]?.level || 'Novo' },
          ].map((stat, i) => (
            <div key={i} className="bg-black/20 border border-white/5 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bgColor)}><stat.icon className={cn("w-5 h-5", stat.iconColor)} /></div>
              </div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-black/20 border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-8 backdrop-blur-sm mb-8">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Map className="w-5 h-5 text-red-500" /> Timeline de Evolução</h3>
          {redTasks.length === 0 && challengeProgress.length === 0 ? (
            <div className="py-12 text-center">
              <Map className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium mb-2">Sua timeline está vazia</p>
              <p className="text-zinc-600 text-sm">Complete tarefas e desafios para registrar marcos.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedToday > 0 && (
                <div className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border-l-2 border-red-500">
                  <Flame className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div><p className="text-white font-medium text-sm">Hoje: {completedToday} tarefa(s) RED completada(s)</p><p className="text-zinc-500 text-xs">Continue assim!</p></div>
                </div>
              )}
              {activeChallenges > 0 && (
                <div className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border-l-2 border-emerald-500">
                  <Target className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div><p className="text-white font-medium text-sm">{activeChallenges} desafio(s) em andamento</p><p className="text-zinc-500 text-xs">Mantenha a consistência.</p></div>
                </div>
              )}
              {completedChallenges > 0 && (
                <div className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border-l-2 border-blue-500">
                  <Zap className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div><p className="text-white font-medium text-sm">{completedChallenges} desafio(s) concluído(s)</p><p className="text-zinc-500 text-xs">Evolução registrada.</p></div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-black/20 border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-8 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-6">Sistema de Progressão</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {levels.map((phase, i) => (
              <div key={i} className={cn("border rounded-2xl p-4 sm:p-6 text-center bg-black/20 transition-all", i <= currentLevel ? "border-red-900/30 opacity-100" : "border-white/5 opacity-50")}>
                <div className="text-3xl sm:text-4xl mb-3">{phase.icon}</div>
                <h4 className="font-bold mb-1 text-white text-sm sm:text-base">{phase.level}</h4>
                <p className="text-xs text-zinc-500">{phase.desc}</p>
                <div className="mt-3">
                  {i <= currentLevel ? <Zap className="w-4 h-4 text-red-500 mx-auto" /> : <Lock className="w-4 h-4 text-zinc-600 mx-auto" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
