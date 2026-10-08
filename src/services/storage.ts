/**
 * AURELIS Storage & Data Service
 * Modular persistence layer supporting localStorage, JSON Export/Import,
 * and realistic Demo Data for Class 11/12 academic exam preparation.
 */

import { AppState, Subject, Topic, WeeklyTest, ErrorLogEntry, UserSettings } from '../types';
import { generateSchedule, getTodayDateString, addCalendarDays, DEFAULT_REVISION_INTERVALS } from '../utils/scheduler';
import { calculateTopicMastery } from '../utils/mastery';

const STORAGE_KEY = 'aurelis_spaced_repetition_data_v1';

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'subj_physics',
    name: 'Physics',
    color: '#eab308', // Gold / Amber
    iconName: 'Atom',
    description: 'Mechanics, Electromagnetism, Optics, Modern Physics',
  },
  {
    id: 'subj_chemistry',
    name: 'Chemistry',
    color: '#06b6d4', // Cyan
    iconName: 'FlaskConical',
    description: 'Physical, Inorganic, Organic Chemistry',
  },
  {
    id: 'subj_math',
    name: 'Mathematics',
    color: '#8b5cf6', // Violet
    iconName: 'Binary',
    description: 'Calculus, Algebra, Coordinate Geometry, Vectors',
  },
  {
    id: 'subj_biology',
    name: 'Biology',
    color: '#10b981', // Emerald
    iconName: 'Dna',
    description: 'Genetics, Cell Biology, Physiology, Ecology',
  },
];

export const DEFAULT_SETTINGS: UserSettings = {
  studentName: 'Aakash Panjiyar',
  targetExam: 'Class 12 Boards & Competitive Exam',
  targetDailyTopics: 3,
  revisionIntervals: DEFAULT_REVISION_INTERVALS,
  theme: 'dark',
  notificationsEnabled: true,
  notificationTime: '07:30',
  onboarded: true, // Default to true so user immediately sees rich interactive dashboard, but can replay onboarding anytime
  aiAssistanceEnabled: true,
};

/**
 * Generates rich, realistic demo data anchored dynamically around today's date.
 */
export function generateInitialDemoData(): AppState {
  const today = getTodayDateString();

  // Anchors:
  // Topic 1 studied 2 days ago -> Revision 1 is due TODAY
  const date2DaysAgo = addCalendarDays(today, -2);
  // Topic 2 studied 4 days ago -> Revision 2 is due TODAY
  const date4DaysAgo = addCalendarDays(today, -4);
  // Topic 3 studied 6 days ago -> Day 7 Weekly Test is due TODAY
  const date6DaysAgo = addCalendarDays(today, -6);
  // Topic 4 studied today -> Initial Learn logged today
  const dateToday = today;
  // Topic 5 studied 13 days ago -> Review 1 is due TODAY
  const date13DaysAgo = addCalendarDays(today, -13);

  // 1. Physics: Moment of Inertia
  const topic1Schedule = generateSchedule('topic_phy_1', date2DaysAgo);
  // Mark step 0 as completed
  topic1Schedule[0].status = 'completed';
  topic1Schedule[0].completedDate = date2DaysAgo;
  topic1Schedule[0].confidenceRating = 'okay';
  // Step 1 scheduledDate is today!

  const topic1: Topic = {
    id: 'topic_phy_1',
    subjectId: 'subj_physics',
    chapterName: 'Rotational Motion',
    title: 'Moment of Inertia & Parallel Axis Theorem',
    studiedDate: date2DaysAgo,
    estimatedDurationMinutes: 20,
    difficulty: 'moderate',
    notes: `## Key Concepts & Theorems
* **Moment of Inertia (I)**: $I = \\sum m_i r_i^2 = \\int r^2 dm$. Rotational analog of mass.
* **Parallel Axis Theorem**: $I = I_{cm} + M d^2$, where $d$ is perpendicular distance between the parallel axes passing through CM and the new axis.
* **Perpendicular Axis Theorem**: Valid ONLY for planar laminar bodies: $I_z = I_x + I_y$.
* Standard bodies:
  - Thin uniform rod about center: $\\frac{1}{12} M L^2$; about end: $\\frac{1}{3} M L^2$.
  - Solid cylinder / disk about central axis: $\\frac{1}{2} M R^2$.
  - Solid sphere about diameter: $\\frac{2}{5} M R^2$.
  - Hollow sphere: $\\frac{2}{3} M R^2$.`,
    mastery: 'learning',
    masteryScore: 35,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schedule: topic1Schedule,
  };

  // 2. Chemistry: Aldehydes & Ketones
  const topic2Schedule = generateSchedule('topic_chem_1', date4DaysAgo);
  topic2Schedule[0].status = 'completed';
  topic2Schedule[0].completedDate = date4DaysAgo;
  topic2Schedule[1].status = 'completed';
  topic2Schedule[1].completedDate = addCalendarDays(date4DaysAgo, 2);
  topic2Schedule[1].confidenceRating = 'easy';
  // Step 2 is due TODAY (+4 days from study date)

  const topic2: Topic = {
    id: 'topic_chem_1',
    subjectId: 'subj_chemistry',
    chapterName: 'Aldehydes, Ketones & Carboxylic Acids',
    title: 'Nucleophilic Addition & Aldol Condensation',
    studiedDate: date4DaysAgo,
    estimatedDurationMinutes: 25,
    difficulty: 'difficult',
    notes: `## Nucleophilic Addition Reactions
* Carbonyl carbon is $sp^2$ hybridized and electrophilic due to electronegativity difference of oxygen.
* **Reactivity order**: $HCHO > RCHO > R_2CO$ (steric crowding + $+I$ effect of alkyl groups reduce electrophilicity).
* **Aldol Condensation**:
  - Reagents: Dilute NaOH / Ba(OH)2 + Carbonyls having $\\alpha$-hydrogen.
  - Intermediate: Enolate ion attacks another carbonyl to give $\\beta$-hydroxy aldehyde (aldol).
  - Heating gives $\\alpha,\\beta$-unsaturated aldehyde via dehydration (conjugated double bond stability).
* **Cannizzaro Reaction**: Disproportionation of aldehydes WITHOUT $\\alpha$-hydrogen using conc. alkali (50% KOH). One molecule oxidizes to carboxylic acid salt, other reduces to primary alcohol.`,
    mastery: 'developing',
    masteryScore: 55,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schedule: topic2Schedule,
  };

  // 3. Mathematics: Integration by Parts
  const topic3Schedule = generateSchedule('topic_math_1', date6DaysAgo);
  topic3Schedule[0].status = 'completed';
  topic3Schedule[0].completedDate = date6DaysAgo;
  topic3Schedule[1].status = 'completed';
  topic3Schedule[1].completedDate = addCalendarDays(date6DaysAgo, 2);
  topic3Schedule[1].confidenceRating = 'okay';
  topic3Schedule[2].status = 'completed';
  topic3Schedule[2].completedDate = addCalendarDays(date6DaysAgo, 4);
  topic3Schedule[2].confidenceRating = 'easy';
  // Step 3 is Day 7 Weekly Test due TODAY!

  const topic3: Topic = {
    id: 'topic_math_1',
    subjectId: 'subj_math',
    chapterName: 'Integral Calculus',
    title: 'Integration by Parts & ILATE Hierarchy',
    studiedDate: date6DaysAgo,
    estimatedDurationMinutes: 30,
    difficulty: 'moderate',
    notes: `## Formula & Core Methodology
$$\\int u v \\, dx = u \\int v \\, dx - \\int \\left( \\frac{du}{dx} \\int v \\, dx \\right) dx$$

* Priority for choosing first function $u$ follows **ILATE**:
  - **I**: Inverse trigonometric functions ($\\arcsin, \\arctan$)
  - **L**: Logarithmic functions ($\\ln x$)
  - **A**: Algebraic functions ($x^n$)
  - **T**: Trigonometric functions ($\\sin x, \\cos x$)
  - **E**: Exponential functions ($e^x$)
* Classic reduction integrals: $\\int e^{ax} \\sin(bx) \\, dx$ requires solving recursively by cycling through integration by parts twice.
* Standard result: $\\int e^x [f(x) + f'(x)] \\, dx = e^x f(x) + C$.`,
    mastery: 'strong',
    masteryScore: 72,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schedule: topic3Schedule,
  };

  // 4. Biology: Genetics - Mendel's Laws
  const topic4Schedule = generateSchedule('topic_bio_1', dateToday);
  const topic4: Topic = {
    id: 'topic_bio_1',
    subjectId: 'subj_biology',
    chapterName: 'Principles of Inheritance and Variation',
    title: "Mendel's Laws & Dihybrid Cross Ratios",
    studiedDate: dateToday,
    estimatedDurationMinutes: 15,
    difficulty: 'easy',
    notes: `## Principles of Inheritance
1. **Law of Segregation**: Alleles segregate during gametogenesis such that each gamete carries only one allele for each gene. No blending.
2. **Law of Independent Assortment**: Alleles of two or more different genes get sorted into gametes independently of one another (applies to unlinked genes).
* Monohybrid phenotypic ratio: $3:1$; Genotypic: $1:2:1$.
* Dihybrid phenotypic ratio: $9:3:3:1$.
* Test Cross: Crossing unknown dominant phenotype with homozygous recessive ($tt$) to test genotype. A $1:1$ ratio indicates heterozygous parent.`,
    mastery: 'new',
    masteryScore: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schedule: topic4Schedule,
  };

  // 5. Physics: Electromagnetic Induction
  const topic5Schedule = generateSchedule('topic_phy_2', date13DaysAgo);
  topic5Schedule[0].status = 'completed';
  topic5Schedule[1].status = 'completed';
  topic5Schedule[1].confidenceRating = 'easy';
  topic5Schedule[2].status = 'completed';
  topic5Schedule[2].confidenceRating = 'easy';
  topic5Schedule[3].status = 'completed';
  topic5Schedule[3].confidenceRating = 'okay';
  // Step 4 is Review 1 due TODAY!

  const topic5: Topic = {
    id: 'topic_phy_2',
    subjectId: 'subj_physics',
    chapterName: 'Electromagnetic Induction',
    title: "Faraday's Law & Lenz's Law of Induction",
    studiedDate: date13DaysAgo,
    estimatedDurationMinutes: 20,
    difficulty: 'moderate',
    notes: `## Electromagnetic Induction Core Laws
* Magnetic Flux $\\Phi_B = \\int \\vec{B} \\cdot d\\vec{A} = B A \\cos \\theta$.
* Faraday's Law: Induced EMF $\\varepsilon = -\\frac{d\\Phi_B}{dt}$.
* Lenz's Law: Induced current creates a magnetic field that opposes the change in magnetic flux that produced it (Conservation of Energy).
* Motional EMF: $\\varepsilon = B v l$ for rod moving perpendicular to field.`,
    mastery: 'strong',
    masteryScore: 78,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schedule: topic5Schedule,
  };

  // Re-evaluate accurate mastery breakdowns
  [topic1, topic2, topic3, topic4, topic5].forEach((t) => {
    const calc = calculateTopicMastery(t);
    t.mastery = calc.level;
    t.masteryScore = calc.score;
  });

  const weeklyTests: WeeklyTest[] = [
    {
      id: 'test_demo_1',
      date: addCalendarDays(today, -7),
      title: 'Mechanics & Physical Chemistry Diagnostic',
      subjectId: 'subj_physics',
      topicIds: ['topic_phy_2'],
      totalMarks: 50,
      marksObtained: 42,
      percentage: 84,
      mistakesNotes: 'Sign error when applying Lenz law direction rule in moving loop problem.',
      generalNotes: 'Very solid numerical accuracy on magnetic flux calculations.',
      createdAt: new Date().toISOString(),
    },
  ];

  const errorLogs: ErrorLogEntry[] = [
    {
      id: 'err_demo_1',
      questionOrProblem: 'Calculate moment of inertia of thin disc about a tangent perpendicular to its plane.',
      subjectId: 'subj_physics',
      chapterName: 'Rotational Motion',
      topicId: 'topic_phy_1',
      topicTitle: 'Moment of Inertia & Parallel Axis Theorem',
      mistakeCategory: 'formula_error',
      mistakeDescription: 'Applied perpendicular axis theorem after parallel axis theorem inappropriately.',
      correctMethod: 'About perpendicular central axis $I_{cm} = \\frac{1}{2} M R^2$. Tangent parallel to this axis is distance $R$ away: $I = I_{cm} + M R^2 = \\frac{3}{2} M R^2$.',
      date: date2DaysAgo,
      resolved: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'err_demo_2',
      questionOrProblem: 'Identify product when benzaldehyde reacts with concentrated NaOH.',
      subjectId: 'subj_chemistry',
      chapterName: 'Aldehydes, Ketones & Carboxylic Acids',
      topicId: 'topic_chem_1',
      topicTitle: 'Nucleophilic Addition & Aldol Condensation',
      mistakeCategory: 'forgot_concept',
      mistakeDescription: 'Attempted to form aldol product despite absence of alpha-hydrogens in benzaldehyde.',
      correctMethod: 'Benzaldehyde has no alpha-hydrogens, so it undergoes Cannizzaro reaction to yield sodium benzoate and benzyl alcohol.',
      date: date4DaysAgo,
      resolved: true,
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    subjects: DEFAULT_SUBJECTS,
    topics: [topic1, topic2, topic3, topic4, topic5],
    weeklyTests,
    errorLogs,
    settings: DEFAULT_SETTINGS,
    isDemoData: true,
    studyDaysHistory: [
      addCalendarDays(today, -4),
      addCalendarDays(today, -3),
      addCalendarDays(today, -2),
      addCalendarDays(today, -1),
      today,
    ],
  };
}

/**
 * Clean initial state with no demo data.
 */
export function createCleanInitialState(): AppState {
  return {
    subjects: DEFAULT_SUBJECTS,
    topics: [],
    weeklyTests: [],
    errorLogs: [],
    settings: DEFAULT_SETTINGS,
    isDemoData: false,
    studyDaysHistory: [],
  };
}

/**
 * Loads persisted app state from localStorage.
 * If data is absent or was marked as demo data, returns a clean empty state.
 */
export function loadPersistedState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) {
        // If persisted data is demo data, reset it to clean state
        if (parsed.isDemoData) {
          const clean = createCleanInitialState();
          savePersistedState(clean);
          return clean;
        }
        if (Array.isArray(parsed.topics) && Array.isArray(parsed.subjects)) {
          if (parsed.settings) {
            if (!parsed.settings.studentName || parsed.settings.studentName === 'Aarav Sharma') {
              parsed.settings.studentName = 'Aakash Panjiyar';
            }
          }
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Failed to parse persisted AURELIS state:', err);
  }
  const clean = createCleanInitialState();
  savePersistedState(clean);
  return clean;
}

/**
 * Saves state to localStorage safely.
 */
export function savePersistedState(state: AppState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.error('Failed to write state to localStorage:', err);
    return false;
  }
}

/**
 * Exports user learning data as a clean JSON file download.
 */
export function exportDataAsJSON(state: AppState): void {
  const exportPayload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    appName: 'AURELIS',
    ...state,
  };
  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aurelis_backup_${getTodayDateString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validates and imports a JSON backup file into AppState.
 */
export function validateAndParseImportJSON(jsonString: string): AppState | null {
  try {
    const data = JSON.parse(jsonString);
    if (
      data &&
      Array.isArray(data.topics) &&
      Array.isArray(data.subjects) &&
      data.settings
    ) {
      return {
        subjects: data.subjects,
        topics: data.topics,
        weeklyTests: Array.isArray(data.weeklyTests) ? data.weeklyTests : [],
        errorLogs: Array.isArray(data.errorLogs) ? data.errorLogs : [],
        settings: { ...DEFAULT_SETTINGS, ...data.settings },
        isDemoData: false,
        studyDaysHistory: Array.isArray(data.studyDaysHistory) ? data.studyDaysHistory : [],
      };
    }
  } catch (err) {
    console.error('Invalid backup JSON format:', err);
  }
  return null;
}
