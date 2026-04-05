import { Lock, Crown } from 'lucide-react';
import type { PlanTier } from '@/hooks/usePlanAccess';

const PLAN_NAMES: Record<PlanTier, string> = {
  free: 'Grátis',
  basic: 'Básico',
  premium: 'Premium',
  gold: 'Gold',
};

export function PlanGate({ requiredPlan, onUpgrade }: { requiredPlan: PlanTier; onUpgrade: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-yellow-900/20 rounded-2xl flex items-center justify-center mb-4 border border-yellow-900/30">
        <Lock className="w-8 h-8 text-yellow-500" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Recurso Bloqueado</h3>
      <p className="text-zinc-400 text-sm mb-6 max-w-sm">
        Este recurso está disponível a partir do plano <span className="text-white font-bold">{PLAN_NAMES[requiredPlan]}</span>.
      </p>
      <button onClick={onUpgrade} className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-yellow-900/20 transition-all">
        <Crown className="w-4 h-4" /> Ver Planos
      </button>
    </div>
  );
}
