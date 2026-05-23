import { analyzeEmotionalSpending } from '../behavior/emotionalAnalyzer.js';
import { evaluateSpendingPsychology } from '../behavior/spendingPsychology.js';
import { profilePersonality } from '../behavior/personalityProfiler.js';

/**
 * Advanced Emotional Spending Agent.
 * Synthesizes emotional spend indicators, retail therapy ratios, and saver/spender traits.
 * @param {Array<object>} transactions 
 * @param {Array<object>} budgets 
 * @returns {object} Psychological and behavioral profile
 */
export function auditBehavioralPsychology(transactions, budgets = []) {
  const emotional = analyzeEmotionalSpending(transactions);
  const psychology = evaluateSpendingPsychology(transactions);
  const personality = profilePersonality(transactions, budgets);

  return {
    impulseScore: emotional.impulseScore,
    dominantEmotion: emotional.dominantEmotion,
    personalityArchetype: personality.archetype,
    personalityTraits: personality.traits,
    psychologicalDescription: emotional.summary,
    retailTherapyRatio: psychology.retailTherapyRatio,
    selfDisciplineIndex: psychology.selfDisciplineIndex,
    strategicAdvice: personality.advice
  };
}
