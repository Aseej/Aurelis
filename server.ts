import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. AI Practice Questions Endpoint
app.post('/api/ai/practice-questions', async (req: Request, res: Response) => {
  try {
    const { subject, chapter, topic, notes } = req.body;
    if (!aiClient) {
      return res.status(200).json({
        fallback: true,
        questions: [
          `State the fundamental physical principles and governing equations of ${topic}.`,
          `Under what boundary conditions does the primary theorem in ${chapter} apply?`,
          `Solve a representative numerical/conceptual scenario applying ${topic} to examination-style problems.`,
        ],
      });
    }

    const prompt = `You are a premier STEM examination tutor for Class 11/12 & competitive exams.
Subject: ${subject}
Chapter: ${chapter}
Topic: ${topic}
Student Notes: ${notes || 'None provided'}

Generate exactly 3 concise, high-yield active recall practice questions for this topic.
Format your response as a JSON array of strings: ["Question 1", "Question 2", "Question 3"].`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    return res.json({ fallback: false, questions: parsed });
  } catch (error: any) {
    console.error('Error generating practice questions:', error?.message);
    return res.json({
      fallback: true,
      questions: [
        `Explain the core theorem and derivation underlying ${req.body.topic}.`,
        `What are the most frequent pitfalls students encounter in ${req.body.chapter}?`,
        `How would you verify your answer independently in an exam scenario?`,
      ],
    });
  }
});

// 2. AI Concept Explanation
app.post('/api/ai/explain', async (req: Request, res: Response) => {
  try {
    const { subject, chapter, topic, level } = req.body; // level: 'intuitive' | 'rigorous' | 'exam_tips'
    if (!aiClient) {
      return res.status(200).json({
        fallback: true,
        explanation: `### Core Intuition for ${topic}\nFocus on the governing conservation laws and boundary definitions in ${chapter}. Review standard sign conventions and dimensional consistency.`,
      });
    }

    const prompt = `You are an elite academic educator.
Provide a clear, high-yield breakdown of:
Subject: ${subject}
Chapter: ${chapter}
Topic: ${topic}
Requested depth: ${level || 'exam_rigorous'}

Provide:
1. One-sentence core intuition
2. Governing mathematical / conceptual formulation
3. Top 2 high-frequency examination traps or sign conventions.
Keep the tone calm, scholarly, and concise (under 250 words). Use markdown.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ fallback: false, explanation: response.text });
  } catch (error: any) {
    console.error('Error explaining concept:', error?.message);
    return res.json({
      fallback: true,
      explanation: `### Concept Review: ${req.body.topic}\nRevisit your lecture notes on ${req.body.chapter} and verify definitions of each variable in the primary formula.`,
    });
  }
});

// 3. AI Error Diagnosis
app.post('/api/ai/analyze-errors', async (req: Request, res: Response) => {
  try {
    const { questionOrProblem, mistakeDescription, correctMethod, topic } = req.body;
    if (!aiClient) {
      return res.json({
        fallback: true,
        analysis: `Underlying tendency: Review conceptual conditions before formula application to eliminate careless errors in ${topic}.`,
      });
    }

    const prompt = `Analyze this student mistake:
Topic: ${topic}
Question/Problem: ${questionOrProblem}
What the student did wrong: ${mistakeDescription}
Correct method: ${correctMethod}

Give a 2-sentence diagnostic identifying the root cognitive misconception and one specific actionable memory trigger to prevent this exact mistake during timed exams.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ fallback: false, analysis: response.text });
  } catch (error: any) {
    return res.json({
      fallback: true,
      analysis: 'Focus on distinguishing similar formula variants before executing calculations.',
    });
  }
});

// 4. AI Weekly Test Question Generator
app.post('/api/ai/weekly-test', async (req: Request, res: Response) => {
  try {
    const { topics } = req.body; // array of topic titles
    if (!aiClient) {
      return res.json({
        fallback: true,
        testPrompt: `Weekly Diagnostic Test covering: ${topics?.join(', ')}.\nReview key derivations, solve 5 textbook practice problems, and mark errors.`,
      });
    }

    const prompt = `Generate a balanced 5-question weekly diagnostic test for a high-school / entrance examination student covering these topics:
${topics.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')}

Format as JSON array with properties:
[{ "questionNumber": 1, "topic": "string", "question": "string", "marks": 5, "answerOutline": "string" }]`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    return res.json({ fallback: false, testQuestions: JSON.parse(response.text || '[]') });
  } catch (error: any) {
    return res.json({
      fallback: true,
      testQuestions: [
        {
          questionNumber: 1,
          topic: req.body.topics?.[0] || 'Core Topic',
          question: 'Derive or explain the central formula and state any approximations made.',
          marks: 5,
          answerOutline: 'Check boundary conditions and verify units.',
        },
      ],
    });
  }
});

// Setup Vite middlewares in development or static serve in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AURELIS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
