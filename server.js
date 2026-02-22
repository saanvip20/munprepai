import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS for frontend
app.use(cors({ origin: "https://munprepai.vercel.app" }));
app.use(express.json());

// Supabase client — keep SERVICE_KEY in .env, never frontend
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ------------------------
// LOGIN
// ------------------------
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });

    return res.json({ message: 'Login successful!', user: data.user });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ------------------------
// SIGNUP
// ------------------------
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });

    return res.json({ message: 'Sign-up successful! Check your email for confirmation.', user: data.user });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ------------------------
// FORGOT PASSWORD
// ------------------------
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://munprepai.vercel.app/reset-password'
    });
    if (error) return res.status(400).json({ error: error.message });

    return res.json({ message: 'Password reset email sent! Check your inbox.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ------------------------
// RESET PASSWORD
// ------------------------
app.post('/api/reset-password', async (req, res) => {
  const { access_token, new_password } = req.body;
  if (!access_token || !new_password) return res.status(400).json({ error: 'Token and new password are required.' });

  try {
    const { data, error } = await supabase.auth.updateUser({ password: new_password }, { access_token });
    if (error) return res.status(400).json({ error: error.message });

    return res.json({ message: 'Password updated successfully!' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ------------------------
// OPENAI ENDPOINTS
// ------------------------

// Generate MUN topic
app.post('/api/generate-topic', async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a Model UN expert. ONLY generate a realistic, challenging MUN topic in 1 sentence.' },
        { role: 'user', content: 'Generate one new MUN topic.' }
      ]
    });

    return res.json({ topic: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error('Generate topic error:', err);
    return res.status(500).json({ error: 'Failed to generate topic.' });
  }
});

// Assess speech
app.post('/api/assess-speech', async (req, res) => {
  const { speech, topic } = req.body;
  if (!speech || speech.trim().length < 10) return res.status(400).json({ error: 'Provide a valid speech.' });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a Model UN speech coach. ONLY provide feedback on the given speech.' },
        { role: 'user', content: `Topic: ${topic}\nSpeech: ${speech}\nPlease give feedback.` }
      ]
    });

    return res.json({ feedback: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error('Assess speech error:', err);
    return res.status(500).json({ error: 'Failed to assess speech.' });
  }
});

// Annotate resolution
app.post('/api/annotate-resolution', async (req, res) => {
  const { resolutionText } = req.body;
  if (!resolutionText || resolutionText.trim().length < 20) return res.status(400).json({ error: 'Provide a valid resolution.' });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a Model UN expert. ONLY analyze and annotate the draft resolution. Use inline comments <<like this>>.' },
        { role: 'user', content: resolutionText }
      ]
    });

    return res.json({ annotatedText: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error('Annotate resolution error:', err);
    return res.status(500).json({ error: 'Failed to annotate resolution.' });
  }
});

// Assess resolution
app.post('/api/assess-resolution', async (req, res) => {
  const { resolutionText } = req.body;
  if (!resolutionText || resolutionText.trim().length < 20) return res.status(400).json({ error: 'Provide a valid resolution.' });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a Model UN expert. ONLY analyze the draft resolution and provide inline feedback using <<like this>>.' },
        { role: 'user', content: resolutionText }
      ]
    });

    return res.json({ annotatedText: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error('Assess resolution error:', err);
    return res.status(500).json({ error: 'Failed to assess resolution.' });
  }
});

// Generate opposing statement
app.post('/api/generate-opponent-statement', async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a Model UN expert. ONLY generate a concise, challenging, and diplomatic opposing delegate statement.' },
        { role: 'user', content: 'Generate one opposing delegate statement.' }
      ]
    });

    return res.json({ opponentStatement: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error('Generate opposing statement error:', err);
    return res.status(500).json({ error: 'Failed to generate opposing statement.' });
  }
});

// Assess rebuttal
app.post('/api/assess-rebuttal', async (req, res) => {
  const { opponentStatement, rebuttal } = req.body;
  if (!opponentStatement || !rebuttal) return res.status(400).json({ error: 'Missing statement or rebuttal.' });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a Model UN speech coach. ONLY assess the user rebuttal against the opponent statement.' },
        { role: 'user', content: `Opposing statement:\n${opponentStatement}\n\nUser rebuttal:\n${rebuttal}` }
      ]
    });

    return res.json({ feedback: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error('Assess rebuttal error:', err);
    return res.status(500).json({ error: 'Failed to assess rebuttal.' });
  }
});
// ------------------------
// VERIFY SESSION
// ------------------------
app.post('/api/verify-session', async (req, res) => {
  const { access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({ error: 'Access token required.' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(access_token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid session.' });
    }

    return res.json({ user: data.user });

  } catch (err) {
    console.error('Verify session error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});
// ------------------------
// TEST ROUTE
// ------------------------
app.get('/', (req, res) => res.send('✅ Backend is running'));

app.listen(PORT, () => console.log(`✅ Server running on PORT ${PORT}`));

