import { Check, Crown, Star, Shield, Zap, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import type { PlanTier } from '@/hooks/usePlanAccess';

const PLANS = [
  {
    id: 'free' as PlanTier,
    name: 'Grátis',
    price: 'R$ 0',
    period: '',
    icon: Zap,
    color: 'from-zinc-700 to-zinc-800',
    border: 'border-zinc-700',
    highlight: false,
    features: [
      'Centro de Comando completo (R.E.D., Objeto de Foco, Energia Disciplinar)',
      'Desacoplamento: protocolos básicos + 3 avançados permanentes',
      'Financeira: IA básica (diagnóstico, simulações) + Recruta e Soldado',
      'Física: treinos Express (5 min), scanner básico, desafios iniciais',
      'Tarefas Gerais completo (categorias, tempo, prioridade, filtros)',
      'Diário: perguntas dinâmicas básicas + gráfico 7 dias',
      'Forja Diária: linha do tempo básica (até 6 blocos)',
      'Modo Sombra: sessões de até 30 minutos',
      'Aliados: 1 Guilda com até 3 pessoas',
      'XP: acumula e gasta na Loja de Recompensas',
    ],
  },
  {
    id: 'basic' as PlanTier,
    name: 'Básico',
    price: 'R$ 9,90',
    period: '/mês',
    icon: Shield,
    color: 'from-blue-900 to-blue-800',
    border: 'border-blue-700',
    highlight: false,
    checkoutUrl: 'https://pay.kiwify.com.br/eNVmieH',
    features: [
      'Tudo do Grátis, mais:',
      'Desacoplamento: todos os protocolos liberados',
      'Financeira: IA avançada (até 30 perguntas/mês)',
      'Física: treinos Padrão (10-15 min) liberados',
      'Diário: análise histórica (últimos 30 dias)',
      'Forja: blocos ilimitados + sugestões de IA',
      'Modo Sombra: sessões de até 60 minutos',
      'Aliados: até 2 Guildas, 5 pessoas cada',
    ],
  },
  {
    id: 'premium' as PlanTier,
    name: 'Premium',
    price: 'R$ 19,90',
    period: '/mês',
    icon: Star,
    color: 'from-purple-900 to-purple-800',
    border: 'border-purple-600',
    highlight: true,
    checkoutUrl: 'https://pay.kiwify.com.br/qb0saiO',
    features: [
      'Tudo do Básico, mais:',
      'Financeira: perguntas ilimitadas + análise preditiva',
      'Física: treinos Profundo (20 min) liberados',
      'Diário: exportação PDF + insights semanais avançados',
      'Forja: relatório semanal de aderência + notificações',
      'Modo Sombra: sessões ilimitadas',
      'Aliados: guildas ilimitadas, até 10 pessoas',
      'Bônus mensal: +200 XP por mês',
    ],
  },
  {
    id: 'gold' as PlanTier,
    name: 'Gold',
    price: 'R$ 29,90',
    period: '/mês',
    icon: Crown,
    color: 'from-yellow-900 to-amber-800',
    border: 'border-yellow-600',
    highlight: false,
    checkoutUrl: 'https://pay.kiwify.com.br/sKEFgEr',
    features: [
      'Tudo do Premium, mais:',
      'Desacoplamento: Camada 3 (biblioteca) permanente',
      'Financeira: Academia do Capital (até Estrategista)',
      'Física: treinos Especialista (instrutores convidados)',
      'Diário: "Distância da Meta" em tempo real + previsões',
      'Forja: "Trilha de Rotina" com XP',
      'Aliados: funcionalidade "resgate" coletivo',
      'Relatórios: histórico completo + exportação total',
      'Acesso ao "Conselho de Generais"',
    ],
  },
];

export function PlansView({ currentPlan }: { currentPlan: PlanTier }) {
  return (
    <div className="h-full w-full p-4 sm:p-6 lg:p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">Escolha seu Plano</h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">Desbloqueie todo o potencial do FocusLab. Cancele quando quiser.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          {PLANS.map((plan, idx) => {
            const isCurrent = currentPlan === plan.id;
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative flex flex-col bg-black/30 border rounded-2xl p-5 sm:p-6 transition-all ${
                  plan.highlight ? `${plan.border} shadow-[0_0_30px_rgba(147,51,234,0.15)]` : 'border-white/10'
                } ${isCurrent ? 'ring-2 ring-red-600' : ''}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                    Mais Popular
                  </div>
                )}

                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-zinc-500 text-sm">{plan.period}</span>}
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-zinc-300">{f}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="py-3 bg-zinc-800 text-zinc-400 rounded-xl font-bold text-sm text-center">
                    Plano Atual
                  </div>
                ) : plan.checkoutUrl ? (
                  <a
                    href={plan.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`py-3 rounded-xl font-bold text-sm text-center transition-all flex items-center justify-center gap-2 ${
                      plan.highlight
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30'
                        : 'bg-red-900 hover:bg-red-800 text-white'
                    }`}
                  >
                    Assinar Agora
                  </a>
                ) : (
                  <div className="py-3 bg-zinc-900 text-zinc-500 rounded-xl font-bold text-sm text-center">
                    Plano Gratuito
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-zinc-600 text-xs">Pagamento seguro via Kiwify. Após a confirmação, seu plano será ativado automaticamente.</p>
        </div>
      </div>
    </div>
  );
}
