import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// --- Google Drive Persistent Session & Backup Proxy Backend ---
interface DriveSession {
  uid: string;
  email: string;
  displayName?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope?: string;
  updatedAt: number;
}

const DATA_DIR = path.resolve(__dirname, '.data');
const SESSIONS_FILE = path.join(DATA_DIR, 'drive-sessions.json');

function getSessions(): Record<string, DriveSession> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
    }
    if (!fs.existsSync(SESSIONS_FILE)) {
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify({}), { encoding: 'utf8', mode: 0o600 });
      return {};
    }
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read drive sessions:', e);
    return {};
  }
}

function saveSessions(sessions: Record<string, DriveSession>): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), { encoding: 'utf8', mode: 0o600 });
  } catch (e) {
    console.error('Failed to save drive sessions:', e);
  }
}

// 5. Store / Refresh Google Drive Session
app.post('/api/drive/session', (req: Request, res: Response) => {
  try {
    const { uid, email, displayName, accessToken, refreshToken, expiresAt, scope } = req.body;
    if (!uid || !accessToken) {
      return res.status(400).json({ error: 'Missing required session parameters: uid and accessToken' });
    }
    const sessions = getSessions();
    const now = Date.now();
    const calculatedExpiry = expiresAt ? parseInt(expiresAt, 10) : (now + 3500 * 1000);

    sessions[uid] = {
      uid,
      email: email || (sessions[uid]?.email ?? ''),
      displayName: displayName || (sessions[uid]?.displayName ?? ''),
      accessToken,
      refreshToken: refreshToken || sessions[uid]?.refreshToken,
      expiresAt: calculatedExpiry,
      scope: scope || sessions[uid]?.scope || 'https://www.googleapis.com/auth/drive.appdata',
      updatedAt: now,
    };
    saveSessions(sessions);
    return res.json({
      success: true,
      validUntil: calculatedExpiry,
      email: sessions[uid].email,
    });
  } catch (err: any) {
    console.error('Error saving drive session:', err);
    return res.status(500).json({ error: 'Internal server error saving session' });
  }
});

// 6. Get Google Drive Session Status
app.get('/api/drive/status', (req: Request, res: Response) => {
  try {
    const uid = (req.query.uid as string) || (req.headers['x-user-id'] as string);
    if (!uid) {
      return res.status(200).json({ connected: false, valid: false, reason: 'no_uid' });
    }
    const sessions = getSessions();
    const session = sessions[uid];
    if (!session) {
      return res.status(200).json({ connected: false, valid: false, reason: 'no_session' });
    }
    const now = Date.now();
    const isValid = now < session.expiresAt;
    return res.status(200).json({
      connected: true,
      valid: isValid,
      email: session.email,
      displayName: session.displayName,
      expiresAt: session.expiresAt,
      timeRemainingSeconds: Math.max(0, Math.floor((session.expiresAt - now) / 1000)),
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve drive status' });
  }
});

// 7. Get Active Token for Authorized User
app.get('/api/drive/token', (req: Request, res: Response) => {
  try {
    const uid = (req.query.uid as string) || (req.headers['x-user-id'] as string);
    if (!uid) {
      return res.status(401).json({ error: 'Unauthorized: missing user id' });
    }
    const sessions = getSessions();
    const session = sessions[uid];
    if (!session) {
      return res.status(404).json({ error: 'No Drive session found for this user' });
    }
    const now = Date.now();
    if (now >= session.expiresAt) {
      return res.status(401).json({ error: 'Drive session has expired', expiresAt: session.expiresAt });
    }
    return res.json({
      accessToken: session.accessToken,
      expiresAt: session.expiresAt,
      email: session.email,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve drive token' });
  }
});

// 8. Disconnect / Clear Session
app.post('/api/drive/disconnect', (req: Request, res: Response) => {
  try {
    const { uid } = req.body;
    if (uid) {
      const sessions = getSessions();
      delete sessions[uid];
      saveSessions(sessions);
    }
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to disconnect session' });
  }
});

// 9. Proxy: List Backups from Drive
app.get('/api/drive/backups', async (req: Request, res: Response) => {
  try {
    const uid = (req.query.uid as string) || (req.headers['x-user-id'] as string);
    const authHeader = req.headers.authorization;
    let token: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (uid) {
      const sessions = getSessions();
      const session = sessions[uid];
      if (session && Date.now() < session.expiresAt) {
        token = session.accessToken;
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'AUTH_REQUIRED: No active Drive token' });
    }

    const query = encodeURIComponent("trashed = false and name contains 'aurelis_backup'");
    const driveUrl = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}&fields=files(id,name,size,createdTime,modifiedTime,properties,description)&orderBy=createdTime desc&pageSize=20`;
    const driveRes = await fetch(driveUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!driveRes.ok) {
      const errText = await driveRes.text();
      return res.status(driveRes.status).send(errText);
    }
    const data = await driveRes.json();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 10. Proxy: Upload Backup Snapshot to Drive
app.post('/api/drive/backup', async (req: Request, res: Response) => {
  try {
    const { uid, backupPayload, streakDays } = req.body;
    const authHeader = req.headers.authorization;
    let token: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (uid) {
      const sessions = getSessions();
      const session = sessions[uid];
      if (session && Date.now() < session.expiresAt) {
        token = session.accessToken;
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'AUTH_REQUIRED: No active Drive token' });
    }

    const now = new Date();
    const timestampStr = now.toISOString();
    const dateFormatted = timestampStr.replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `aurelis_backup_${dateFormatted}.json`;
    const payloadString = typeof backupPayload === 'string' ? backupPayload : JSON.stringify(backupPayload, null, 2);

    const boundary = '-------AURELIS_BOUNDARY_' + Date.now();
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const fileMetadata = {
      name: fileName,
      parents: ['appDataFolder'],
      description: `AURELIS Spaced Repetition Study Backup (${backupPayload?.metadata?.topicsCount || 0} topics, ${streakDays || 0}d streak)`,
      properties: {
        format: 'aurelis_cloud_backup',
        version: '1.0.0',
        subjectsCount: String(backupPayload?.metadata?.subjectsCount || 0),
        topicsCount: String(backupPayload?.metadata?.topicsCount || 0),
        testsCount: String(backupPayload?.metadata?.weeklyTestsCount || 0),
        errorsCount: String(backupPayload?.metadata?.errorLogsCount || 0),
        streakDays: String(streakDays || 0),
        backupTimestamp: timestampStr,
        checksum: backupPayload?.checksum || '',
      },
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(fileMetadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      payloadString +
      closeDelimiter;

    const driveRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,createdTime,modifiedTime,properties,description',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!driveRes.ok) {
      const errText = await driveRes.text();
      return res.status(driveRes.status).send(errText);
    }

    const uploadedFile = await driveRes.json();
    return res.json({ success: true, file: uploadedFile });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
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
