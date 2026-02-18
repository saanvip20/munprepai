import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "https://munprepai.vercel.app",
  credentials: true
}));

app.use(express.json());

// -----------------------------
// Supabase (Auth only)
// -----------------------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// -----------------------------
// OpenAI
// -----------------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ==================================================
// AUTH ROUTES
// ==================================================

// ---------------- LOGIN ----------------
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    return res.json({
      message: "Login successful",
      user: data.user
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

// ---------------- SIGNUP ----------------
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      message: "Signup successful. Check your email if confirmation is enabled.",
      user: data.user
    });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

// ---------------- FORGOT PASSWORD ----------------
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email required.' });
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://munprepai.vercel.app/reset-password.html"
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      message: "Password reset email sent."
    });

  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

// NOTE:
// Password updating should be handled on frontend using Supabase client
// after user clicks email reset link.
// We REMOVE the broken /api/reset-password route completely.

// ==================================================
// OPENAI ROUTES
// ==================================================

app.post('/api/generate-topic', async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a Model UN expert. Generate one realistic MUN topic in one sentence only." },
        { role: "user", content: "Generate one new MUN topic." }
      ]
    });

    return res.json({
      topic: completion.choices[0].message.content.trim()
    });

  } catch (err) {
    console.error("Generate topic error:", err);
    return res.status(500).json({ error: "Failed to generate topic." });
  }
});

app.post('/api/assess-speech', async (req, res) => {
  const { speech, topic } = req.body;

  if (!speech || speech.length < 10) {
    return res.status(400).json({ error: "Valid speech required." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a Model UN speech coach. Give structured feedback only." },
        { role: "user", content: `Topic: ${topic}\nSpeech: ${speech}` }
      ]
    });

    return res.json({
      feedback: completion.choices[0].message.content.trim()
    });

  } catch (err) {
    console.error("Assess speech error:", err);
    return res.status(500).json({ error: "Failed to assess speech." });
  }
});

app.post('/api/annotate-resolution', async (req, res) => {
  const { resolutionText } = req.body;

  if (!resolutionText || resolutionText.length < 20) {
    return res.status(400).json({ error: "Valid resolution required." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a Model UN expert. Provide inline comments using <<like this>>." },
        { role: "user", content: resolutionText }
      ]
    });

    return res.json({
      annotatedText: completion.choices[0].message.content.trim()
    });

  } catch (err) {
    console.error("Annotate resolution error:", err);
    return res.status(500).json({ error: "Failed to annotate resolution." });
  }
});

app.post('/api/assess-rebuttal', async (req, res) => {
  const { opponentStatement, rebuttal } = req.body;

  if (!opponentStatement || !rebuttal) {
    return res.status(400).json({ error: "Missing data." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a Model UN coach. Assess the rebuttal clearly." },
        { role: "user", content: `Opponent:\n${opponentStatement}\n\nRebuttal:\n${rebuttal}` }
      ]
    });

    return res.json({
      feedback: completion.choices[0].message.content.trim()
    });

  } catch (err) {
    console.error("Assess rebuttal error:", err);
    return res.status(500).json({ error: "Failed to assess rebuttal." });
  }
});

// ==================================================
// HEALTH CHECK
// ==================================================
app.get('/', (req, res) => {
  res.send("✅ Backend running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
