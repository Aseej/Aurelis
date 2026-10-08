/**
 * AURELIS Mastery System
 *
 * Transparent, deterministic calculation based on:
 * 1. Progress through the 7-step spaced repetition curve (weight: 50%)
 * 2. Active recall confidence ratings (weight: 35%)
 * 3. Recent error frequency and test performance (weight: 15%)
 */

import { Topic, MasteryLevel, RecallRating } from '../types';

export interface MasteryCalculationBreakdown {
  score: number; // 0 - 100
  level: MasteryLevel;
  label: string;
  description: string;
  completedStages: number;
  totalStages: number;
  recallAverageScore: number; // 0 - 100
  formulaExplanation: string;
}

export function calculateTopicMastery(
  topic: Topic,
  unresolvedMistakeCount = 0
): MasteryCalculationBreakdown {
  const schedule = topic.schedule || [];
  const totalStages = schedule.length || 7;
  const completedItems = schedule.filter((item) => item.status === 'completed');
  const completedStages = completedItems.length;

  if (completedStages <= 1) {
    // Only initial learn session completed
    return {
      score: 10,
      level: 'new',
      label: 'New Topic',
      description: 'Recently learned. Awaiting initial spaced revision.',
      completedStages,
      totalStages,
      recallAverageScore: 0,
      formulaExplanation: 'Stage 1 of 7 completed (10% baseline).',
    };
  }

  // Calculate curve completion ratio (up to 50 points)
  const curveProgress = (completedStages / totalStages) * 50;

  // Calculate recall quality (ratings on completed reviews, up to 35 points)
  // Hard = 1, Okay = 2, Easy = 3
  const ratedItems = completedItems.filter((i) => i.confidenceRating);
  let recallPoints = 20; // default middle
  let recallAvg = 50;

  if (ratedItems.length > 0) {
    const totalRatingPoints = ratedItems.reduce((acc, curr) => {
      if (curr.confidenceRating === 'easy') return acc + 3;
      if (curr.confidenceRating === 'okay') return acc + 2;
      return acc + 1; // 'hard'
    }, 0);
    const maxPossible = ratedItems.length * 3;
    const ratio = totalRatingPoints / maxPossible;
    recallAvg = Math.round(ratio * 100);
    recallPoints = ratio * 35;
  }

  // Error penalty / test bonus (up to 15 points)
  let stabilityPoints = 15;
  if (unresolvedMistakeCount > 0) {
    stabilityPoints = Math.max(0, 15 - unresolvedMistakeCount * 5);
  }

  const rawScore = Math.round(curveProgress + recallPoints + stabilityPoints);
  const finalScore = Math.min(100, Math.max(0, rawScore));

  let level: MasteryLevel = 'learning';
  let label = 'Learning';
  let description = 'Building initial neural pathways.';

  if (finalScore >= 90 && completedStages >= 5) {
    level = 'mastered';
    label = 'Mastered';
    description = 'Demonstrated long-term retention across multiple review cycles.';
  } else if (finalScore >= 70 && completedStages >= 4) {
    level = 'strong';
    label = 'Strong';
    description = 'Consistent recall across spaced intervals with minimal friction.';
  } else if (finalScore >= 40 && completedStages >= 2) {
    level = 'developing';
    label = 'Developing';
    description = 'Early consolidation underway; maintaining steady revision.';
  } else if (finalScore >= 15) {
    level = 'learning';
    label = 'Learning';
    description = 'Active repetition required to prevent forgetting.';
  } else {
    level = 'new';
    label = 'New';
    description = 'Beginning spaced intervals.';
  }

  return {
    score: finalScore,
    level,
    label,
    description,
    completedStages,
    totalStages,
    recallAverageScore: recallAvg,
    formulaExplanation: `${Math.round(curveProgress)}pts (Schedule: ${completedStages}/${totalStages}) + ${Math.round(recallPoints)}pts (Recall Quality: ${recallAvg}%) + ${Math.round(stabilityPoints)}pts (Stability & Error Log)`,
  };
}

export function getMasteryBadgeClass(level: MasteryLevel): string {
  switch (level) {
    case 'mastered':
      return 'text-amber-300 bg-amber-400/10 border-amber-400/25';
    case 'strong':
      return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'developing':
      return 'text-sky-400 bg-sky-400/10 border-sky-400/20';
    case 'learning':
      return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    case 'new':
    default:
      return 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20';
  }
}
