/**
 * Client service for AI Extension Points
 * Calls server-side proxy endpoints. Never exposes API keys in frontend.
 * Provides instant offline fallback templates if offline or server returns fallback.
 */

export interface PracticeQuestionResult {
  fallback: boolean;
  questions: string[];
}

export interface ExplainConceptResult {
  fallback: boolean;
  explanation: string;
}

export interface ErrorDiagnosisResult {
  fallback: boolean;
  analysis: string;
}

export interface WeeklyTestQuestion {
  questionNumber: number;
  topic: string;
  question: string;
  marks: number;
  answerOutline: string;
}

export async function fetchAIPracticeQuestions(
  subject: string,
  chapter: string,
  topic: string,
  notes: string
): Promise<PracticeQuestionResult> {
  try {
    const res = await fetch('/api/ai/practice-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, chapter, topic, notes }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('AI service offline, using heuristic fallback questions.');
  }

  return {
    fallback: true,
    questions: [
      `Define ${topic} precisely in your own words without checking your reference material.`,
      `State the fundamental formula/conditions in ${chapter} and the units of each parameter.`,
      `Identify the two most critical exceptions or edge-cases tested in ${topic}.`,
    ],
  };
}

export async function fetchAIConceptExplanation(
  subject: string,
  chapter: string,
  topic: string,
  level: 'intuitive' | 'rigorous' | 'exam_tips' = 'exam_tips'
): Promise<ExplainConceptResult> {
  try {
    const res = await fetch('/api/ai/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, chapter, topic, level }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('AI service offline, using fallback concept review.');
  }

  return {
    fallback: true,
    explanation: `### Core Focus: ${topic}\nReview your foundational definitions in ${chapter}. Check all sign conventions, dimensional limits, and verify the physical conditions under which the equations hold.`,
  };
}

export async function fetchAIErrorDiagnosis(
  questionOrProblem: string,
  mistakeDescription: string,
  correctMethod: string,
  topic: string
): Promise<ErrorDiagnosisResult> {
  try {
    const res = await fetch('/api/ai/analyze-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionOrProblem, mistakeDescription, correctMethod, topic }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('AI service offline, using diagnostic rule.');
  }

  return {
    fallback: true,
    analysis:
      'Frequent pattern: Rushing into numerical calculation before stating boundary assumptions. Write the governing theorem first before substituting values.',
  };
}

export async function fetchAIWeeklyTest(topics: string[]): Promise<{
  fallback: boolean;
  testQuestions: WeeklyTestQuestion[];
}> {
  try {
    const res = await fetch('/api/ai/weekly-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topics }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('AI test generator offline, using syllabus template.');
  }

  return {
    fallback: true,
    testQuestions: topics.map((t, idx) => ({
      questionNumber: idx + 1,
      topic: t,
      question: `State the main principles and derive/solve a standard 5-mark examination problem for ${t}.`,
      marks: 5,
      answerOutline: 'State formula, write step-by-step working, and check final units.',
    })),
  };
}
