import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Flame, Check, FileText, Map, Users, BookOpen, Wind, Brain, ArrowRight, Shield, Bot } from 'lucide-react';
import focusLabLogo from '@/assets/focuslab-logo.png';

const TOUR_STEPS = [
  { icon: Target, color: 'text-red-500', title: 'R.E.D. — Rotina Essencial Diária', desc: 'Crie suas tarefas mínimas e inegociáveis. Complete todas para ativar o núcleo e manter a consistência.' },
  { icon: FileText, color: 'text-red-400', title: 'Diário de Reconfiguração', desc: 'Reflexão guiada para identificar padrões que impedem seu progresso. Disponível das 18h às 03h.' },
  { icon: Flame, color: 'text-orange-500', title: 'Desafios', desc: 'Protocolos de otimização comportamental: Jejum de Dopamina, Detox Digital, Leitura e mais.' },
  { icon: Check, color: 'text-emerald-500', title: 'Tarefas Gerais', desc: 'Ambiente de alta performance para micro-operações do dia. Reinicia automaticamente.' },
  { icon: Map, color: 'text-purple-500', title: 'Modo Jornada', desc: 'Visualize sua evolução, nível e marcos da trajetória. De Iniciante a Mestre.' },
  { icon: Users, color: 'text-blue-500', title: 'Co-working & FriLabs', desc: 'Conecte-se com outros operadores. Chat, chamadas e bate-papo privado com amigos.' },
  { icon: Shield, color: 'text-yellow-500', title: 'Vício Controlado', desc: 'Substitua hábitos tóxicos usando a Golden Rule. A IA te ajuda no processo.' },
  { icon: Wind, color: 'text-blue-400', title: 'Estação de Desacoplamento', desc: 'Protocolos de respiração e mindfulness para momentos de estresse.' },
  { icon: Bot, color: 'text-red-500', title: 'Assistente IA', desc: 'Seu coach de desenvolvimento pessoal. Pergunte sobre produtividade, hábitos e uso do app.' },
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step >= TOUR_STEPS.length - 1) onComplete();
    else setStep(step + 1);
  };

  const current = TOUR_STEPS[step];
  const Icon = current.icon;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
        className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 w-full max-w-md text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800"><div className="h-full bg-red-600 transition-all" style={{ width: `${((step + 1) / TOUR_STEPS.length) * 100}%` }} /></div>
        
        {step === 0 && <img src={focusLabLogo} alt="FocusLab" className="w-14 h-14 mx-auto mb-4 rounded-full" />}
        
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-900 flex items-center justify-center">
          <Icon className={`w-8 h-8 ${current.color}`} />
        </div>
        
        <h2 className="text-xl font-bold text-white mb-3">{current.title}</h2>
        <p className="text-zinc-400 text-sm leading-relaxed mb-8">{current.desc}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-zinc-600 text-xs">{step + 1} / {TOUR_STEPS.length}</span>
          <div className="flex gap-2">
            <button onClick={onComplete} className="px-4 py-2 text-zinc-500 hover:text-white text-sm font-medium transition-colors">Pular</button>
            <button onClick={handleNext} className="px-6 py-2.5 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
              {step >= TOUR_STEPS.length - 1 ? 'Começar!' : 'Próximo'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
