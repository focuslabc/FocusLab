import { useProfile } from '@/hooks/useSupabaseData';

export type PlanTier = 'free' | 'basic' | 'premium' | 'gold';

const PLAN_HIERARCHY: Record<PlanTier, number> = {
  free: 0,
  basic: 1,
  premium: 2,
  gold: 3,
};

export interface PlanLimits {
  shadowSessionMinutes: number;
  guildCount: number;
  guildMembers: number;
  aiQuestionsPerMonth: number;
  forgeBlocks: number;
  journalHistoryDays: number;
  canExportPDF: boolean;
  canPredictiveAI: boolean;
  unlimitedShadow: boolean;
  weeklyXPBonus: number;
  hasLayer3Library: boolean;
  hasCapitalAcademy: boolean;
  hasSpecialistTraining: boolean;
  hasDistanceMetric: boolean;
  hasRoutineTrail: boolean;
  hasRescueFeature: boolean;
  hasFullReports: boolean;
  hasGeneralsCouncil: boolean;
  allDecouplingProtocols: boolean;
  standardTraining: boolean;
  deepTraining: boolean;
}

export function getPlanLimits(plan: PlanTier): PlanLimits {
  switch (plan) {
    case 'gold':
      return {
        shadowSessionMinutes: Infinity,
        guildCount: Infinity,
        guildMembers: Infinity,
        aiQuestionsPerMonth: Infinity,
        forgeBlocks: Infinity,
        journalHistoryDays: Infinity,
        canExportPDF: true,
        canPredictiveAI: true,
        unlimitedShadow: true,
        weeklyXPBonus: 200,
        hasLayer3Library: true,
        hasCapitalAcademy: true,
        hasSpecialistTraining: true,
        hasDistanceMetric: true,
        hasRoutineTrail: true,
        hasRescueFeature: true,
        hasFullReports: true,
        hasGeneralsCouncil: true,
        allDecouplingProtocols: true,
        standardTraining: true,
        deepTraining: true,
      };
    case 'premium':
      return {
        shadowSessionMinutes: Infinity,
        guildCount: Infinity,
        guildMembers: 10,
        aiQuestionsPerMonth: Infinity,
        forgeBlocks: Infinity,
        journalHistoryDays: Infinity,
        canExportPDF: true,
        canPredictiveAI: true,
        unlimitedShadow: true,
        weeklyXPBonus: 200,
        hasLayer3Library: false,
        hasCapitalAcademy: false,
        hasSpecialistTraining: false,
        hasDistanceMetric: false,
        hasRoutineTrail: false,
        hasRescueFeature: false,
        hasFullReports: false,
        hasGeneralsCouncil: false,
        allDecouplingProtocols: true,
        standardTraining: true,
        deepTraining: true,
      };
    case 'basic':
      return {
        shadowSessionMinutes: 60,
        guildCount: 2,
        guildMembers: 5,
        aiQuestionsPerMonth: 30,
        forgeBlocks: Infinity,
        journalHistoryDays: 30,
        canExportPDF: false,
        canPredictiveAI: false,
        unlimitedShadow: false,
        weeklyXPBonus: 0,
        hasLayer3Library: false,
        hasCapitalAcademy: false,
        hasSpecialistTraining: false,
        hasDistanceMetric: false,
        hasRoutineTrail: false,
        hasRescueFeature: false,
        hasFullReports: false,
        hasGeneralsCouncil: false,
        allDecouplingProtocols: true,
        standardTraining: true,
        deepTraining: false,
      };
    default: // free
      return {
        shadowSessionMinutes: 30,
        guildCount: 1,
        guildMembers: 3,
        aiQuestionsPerMonth: 5,
        forgeBlocks: 6,
        journalHistoryDays: 7,
        canExportPDF: false,
        canPredictiveAI: false,
        unlimitedShadow: false,
        weeklyXPBonus: 0,
        hasLayer3Library: false,
        hasCapitalAcademy: false,
        hasSpecialistTraining: false,
        hasDistanceMetric: false,
        hasRoutineTrail: false,
        hasRescueFeature: false,
        hasFullReports: false,
        hasGeneralsCouncil: false,
        allDecouplingProtocols: false,
        standardTraining: false,
        deepTraining: false,
      };
  }
}

export function usePlanAccess(userId: string | undefined) {
  const { profile } = useProfile(userId);
  const plan = (profile?.plan as PlanTier) || 'free';
  const limits = getPlanLimits(plan);

  const hasAccess = (requiredPlan: PlanTier): boolean => {
    return PLAN_HIERARCHY[plan] >= PLAN_HIERARCHY[requiredPlan];
  };

  return {
    plan,
    limits,
    hasAccess,
    isPaid: plan !== 'free',
    isPremiumOrAbove: hasAccess('premium'),
    isGold: plan === 'gold',
  };
}
