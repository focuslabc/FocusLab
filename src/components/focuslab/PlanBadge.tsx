import { Crown, Star, Gem, Shield } from 'lucide-react';
import type { PlanTier } from '@/hooks/usePlanAccess';

const PLAN_CONFIG: Record<PlanTier, { label: string; icon: typeof Crown; color: string; bg: string; border: string } | null> = {
  free: null,
  basic: { label: 'Básico', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-900/40' },
  premium: { label: 'Premium', icon: Star, color: 'text-purple-400', bg: 'bg-purple-900/20', border: 'border-purple-900/40' },
  gold: { label: 'Gold', icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-900/40' },
};

export function PlanBadge({ plan, size = 'sm' }: { plan: PlanTier; size?: 'sm' | 'md' }) {
  const config = PLAN_CONFIG[plan];
  if (!config) return null;
  const Icon = config.icon;
  
  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${config.color} ${config.bg} border ${config.border}`}>
        <Icon className="w-3 h-3" />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.color} ${config.bg} border ${config.border}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
