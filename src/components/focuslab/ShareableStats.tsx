import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Download, Share2, Flame, Target, Zap, Map, X } from 'lucide-react';
import focusLabLogo from '@/assets/focuslab-logo.png';

interface ShareableStatsProps {
  streak: number;
  level: string;
  redCompleted: number;
  redTotal: number;
  challengesCompleted: number;
  displayName: string;
  onClose: () => void;
}

export function ShareableStats({ streak, level, redCompleted, redTotal, challengesCompleted, displayName, onClose }: ShareableStatsProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
      const link = document.createElement('a');
      link.download = `focuslab-stats-${displayName}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch {
      // Fallback: copy text stats
      const text = `🔴 FocusLab Stats\n\n🔥 Streak: ${streak} dias\n⚡ Nível: ${level}\n🎯 RED: ${redCompleted}/${redTotal}\n✅ Desafios: ${challengesCompleted}\n\n#FocusLab #Disciplina`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()} className="flex flex-col items-center gap-4">
        
        {/* The card to capture */}
        <div ref={cardRef} className="w-[340px] bg-gradient-to-br from-zinc-950 via-red-950/30 to-zinc-950 border border-red-900/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_30%_20%,_#dc2626_0%,_transparent_50%)]" />
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_70%_80%,_#dc2626_0%,_transparent_50%)]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <img src={focusLabLogo} alt="" className="w-8 h-8 rounded-full" />
              <span className="text-red-500 text-xs font-bold uppercase tracking-[0.3em]">Focus Lab</span>
            </div>
            
            <h2 className="text-white text-2xl font-bold mb-1">{displayName}</h2>
            <p className="text-zinc-500 text-sm mb-6">Conquistas de Evolução</p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-center">
                <Flame className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{streak}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Dias de Streak</p>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-center">
                <Map className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{level}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Nível</p>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-center">
                <Target className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{redCompleted}/{redTotal}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">RED Hoje</p>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-center">
                <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{challengesCompleted}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Desafios</p>
              </div>
            </div>
            
            <p className="text-zinc-600 text-[10px] text-center uppercase tracking-widest">Disciplina é Liberdade</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={handleDownload} className="px-6 py-3 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" /> {copied ? 'Copiado!' : 'Baixar Imagem'}
          </button>
          <button onClick={onClose} className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-sm transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
