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

// ==========================================
// GOOGLE DRIVE API PROXY ROUTES
// Eliminates browser CORS preflight blocks for file uploads & downloads.
// Passes client-side Bearer token directly to Google Drive REST API v3.
// ==========================================

// 1. Google Drive Multipart Upload (images & files)
app.post('/api/drive/upload', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  try {
    const { name, parents, properties, description, mimeType, base64Data, content } = req.body;

    let fileBuffer: Buffer;
    let fileMime = mimeType || 'application/octet-stream';

    if (base64Data) {
      fileBuffer = Buffer.from(base64Data, 'base64');
    } else if (content !== undefined) {
      fileBuffer = Buffer.from(typeof content === 'string' ? content : JSON.stringify(content), 'utf-8');
      fileMime = 'application/json; charset=UTF-8';
    } else {
      return res.status(400).json({ error: 'Missing base64Data or content' });
    }

    const boundary = '-------AURELIS_PROXY_' + Date.now();
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const fileMetadata = {
      name: name || 'file',
      parents: parents || ['appDataFolder'],
      properties: properties || {},
      description: description || '',
    };

    const metadataPart = Buffer.from(
      delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(fileMetadata) +
        delimiter +
        `Content-Type: ${fileMime}\r\n\r\n`,
      'utf-8'
    );

    const endPart = Buffer.from(closeDelimiter, 'utf-8');
    const multipartBody = Buffer.concat([metadataPart, fileBuffer, endPart]);

    const driveRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,createdTime,modifiedTime,properties,description',
      {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartBody,
      }
    );

    const data = await driveRes.json();
    if (!driveRes.ok) {
      return res.status(driveRes.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err: any) {
    console.error('Server proxy error uploading to Google Drive:', err);
    return res.status(500).json({ error: err.message || 'Internal proxy upload error' });
  }
});

// 2. Google Drive Patch Existing File (e.g., updating index JSON)
app.patch('/api/drive/files/:fileId', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  try {
    const { fileId } = req.params;
    const { content, base64Data, mimeType } = req.body;

    let bodyData: any;
    let contentType = mimeType || 'application/json; charset=UTF-8';

    if (base64Data) {
      bodyData = Buffer.from(base64Data, 'base64');
    } else {
      bodyData = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    }

    const driveRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: authHeader,
          'Content-Type': contentType,
        },
        body: bodyData,
      }
    );

    const data = await driveRes.json();
    if (!driveRes.ok) {
      return res.status(driveRes.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err: any) {
    console.error('Server proxy error patching file on Google Drive:', err);
    return res.status(500).json({ error: err.message || 'Internal proxy patch error' });
  }
});

// 3. Google Drive List Files
app.get('/api/drive/files', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  try {
    const params = new URLSearchParams(req.query as Record<string, string>);
    const driveRes = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
      headers: { Authorization: authHeader },
    });

    const data = await driveRes.json();
    if (!driveRes.ok) {
      return res.status(driveRes.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err: any) {
    console.error('Server proxy error listing files from Google Drive:', err);
    return res.status(500).json({ error: err.message || 'Internal proxy list error' });
  }
});

// 4. Google Drive Download File Media (images and JSON)
app.get('/api/drive/files/:fileId/media', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  try {
    const { fileId } = req.params;
    const driveRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: authHeader },
    });

    if (!driveRes.ok) {
      return res.status(driveRes.status).json({ error: `Google Drive returned status ${driveRes.status}` });
    }

    const contentType = driveRes.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    const arrayBuf = await driveRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuf));
  } catch (err: any) {
    console.error('Server proxy error downloading media from Google Drive:', err);
    return res.status(500).json({ error: err.message || 'Internal proxy download error' });
  }
});

// 5. Google Drive Delete File
app.delete('/api/drive/files/:fileId', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  try {
    const { fileId } = req.params;
    const driveRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: authHeader },
    });

    if (!driveRes.ok && driveRes.status !== 404) {
      return res.status(driveRes.status).json({ error: `Delete failed with status ${driveRes.status}` });
    }

    return res.status(204).send();
  } catch (err: any) {
    console.error('Server proxy error deleting file from Google Drive:', err);
    return res.status(500).json({ error: err.message || 'Internal proxy delete error' });
  }
});

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

export default app;
export { app };

if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'test') {
  startServer();
}
