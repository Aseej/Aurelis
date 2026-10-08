/**
 * AURELIS — Domain Models & Type Definitions
 * Designed for rigorous spaced repetition and examination preparation.
 */

export type MasteryLevel = 'new' | 'learning' | 'developing' | 'strong' | 'mastered';

export type RecallRating = 'hard' | 'okay' | 'easy';

export type ReviewStatus = 'scheduled' | 'completed' | 'skipped' | 'overdue';

export type DifficultyLevel = 'easy' | 'moderate' | 'difficult';

export type MistakeCategory =
  | 'forgot_concept'
  | 'weak_recall'
  | 'formula_error'
  | 'calculation_error'
  | 'misread_question'
  | 'careless_mistake'
  | 'conceptual_misunderstanding'
  | 'other';

export interface Subject {
  id: string;
  name: string;
  color: string; // Tailwind-friendly hex or token (e.g., #d4af37, #38bdf8, #818cf8, #34d399, etc.)
  iconName: string;
  description?: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  order: number;
}

export interface ReviewScheduleItem {
  id: string;
  topicId: string;
  stepIndex: number; // 0 = Learn (Day 1), 1 = Revision 1 (Day 3), 2 = Revision 2 (Day 5), 3 = Weekly Test (Day 7), 4 = Review (Day 14), 5 = Review (Day 21), 6 = Review (Day 28)
  stageName: string; // e.g. "Learn", "Revision 1", "Revision 2", "Weekly Test", "Review 1", "Review 2", "Review 3"
  intervalDaysFromStart: number; // e.g. 0, 2, 4, 6, 13, 20, 27
  scheduledDate: string; // YYYY-MM-DD
  completedDate?: string; // YYYY-MM-DD
  status: ReviewStatus;
  confidenceRating?: RecallRating;
  userRecallNotes?: string;
  completedAtTimestamp?: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  chapterName: string;
  title: string;
  studiedDate: string; // YYYY-MM-DD (source of truth)
  estimatedDurationMinutes: number; // e.g. 15, 25, 30
  difficulty: DifficultyLevel;
  notes: string;
  mastery: MasteryLevel;
  masteryScore: number; // 0 to 100
  createdAt: string;
  updatedAt: string;
  schedule: ReviewScheduleItem[];
}

export interface WeeklyTest {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  subjectId: string; // or 'all'
  topicIds: string[];
  totalMarks: number;
  marksObtained: number;
  percentage: number;
  mistakesNotes?: string;
  generalNotes?: string;
  createdAt: string;
}

export interface ErrorLogEntry {
  id: string;
  questionOrProblem: string;
  subjectId: string;
  chapterName: string;
  topicId?: string;
  topicTitle: string;
  mistakeCategory: MistakeCategory;
  mistakeDescription: string;
  correctMethod: string;
  date: string; // YYYY-MM-DD
  resolved: boolean;
  createdAt: string;
}

export interface UserSettings {
  studentName: string;
  targetExam: string;
  targetDailyTopics: number;
  revisionIntervals: number[]; // Default: [0, 2, 4, 6, 13, 20, 27]
  theme: 'dark' | 'light';
  notificationsEnabled: boolean;
  notificationTime: string;
  onboarded: boolean;
  aiAssistanceEnabled: boolean;
}

export interface AppState {
  subjects: Subject[];
  topics: Topic[];
  weeklyTests: WeeklyTest[];
  errorLogs: ErrorLogEntry[];
  settings: UserSettings;
  isDemoData: boolean;
  studyDaysHistory?: string[]; // Logged study dates (YYYY-MM-DD)
}

export type ActiveView =
  | 'dashboard'
  | 'review'
  | 'calendar'
  | 'subjects'
  | 'tests'
  | 'errors'
  | 'analytics'
  | 'settings'
  | 'landing';
