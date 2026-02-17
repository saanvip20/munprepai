const API_URL = "https://munprepai.onrender.com";

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const requireToken = async (req, res, next) => {
  const { access_token } = req.body;

  if (!access_token) {
    return res.status(401).json({ error: 'No access token provided.' });
  }

  try {
    // 1️⃣ Verify user
    const { data, error } = await supabase.auth.getUser(access_token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired session.' });
    }

    const userId = data.user.id;

    // 2️⃣ Get token count
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select('tokens')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      return res.status(400).json({ error: 'Token record not found.' });
    }

    if (tokenData.tokens <= 0) {
      return res.status(403).json({ error: 'Not enough tokens.' });
    }

    // 3️⃣ Deduct token
    const newBalance = tokenData.tokens - 1;

    await supabase
      .from('user_tokens')
      .update({ tokens: newBalance, updated_at: new Date() })
      .eq('user_id', userId);

    // 4️⃣ Attach data to request
    req.user = data.user;
    req.tokensLeft = newBalance;

    next();
  } catch (err) {
    console.error('Token middleware error:', err);
    return res.status(500).json({ error: 'Token verification failed.' });
  }
};


app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(401).json({ error: error.message });

    res.json({ session: data.session });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/generate-topic', async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a Model UN expert. ONLY generate a realistic, challenging, and regionally relevant MUN topic in 1 sentence.'
        },
        { role: 'user', content: 'Generate one new MUN topic.' }
      ]
    });

    res.json({
      topic: completion.choices[0].message.content.trim(),
      tokens_left: req.tokensLeft
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate topic.' });
  }
});


app.post('/api/assess-speech',  async (req, res) => {
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

    res.json({ feedback: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to assess speech.' });
  }
});

app.post('/api/annotate-resolution',  async (req, res) => {
  const { resolutionText } = req.body;
  if (!resolutionText || resolutionText.trim().length < 20) return res.status(400).json({ error: 'Provide a valid resolution.' });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a Model UN expert. ONLY analyze and annotate the draft resolution. Use inline comments <<like this>>.`
        },
        { role: 'user', content: resolutionText }
      ]
    });

    res.json({ annotatedText: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate annotation.' });
  }
});

app.post('/api/assess-resolution',  async (req, res) => {
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

    res.json({ annotatedText: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to assess resolution.' });
  }
});

app.post('/api/generate-opponent-statement',  async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a Model UN expert. ONLY generate a concise, challenging, and diplomatic opposing delegate statement.' },
        { role: 'user', content: 'Generate one opposing delegate statement.' }
      ]
    });

    res.json({ opponentStatement: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate opposing statement.' });
  }
});

app.post('/api/assess-rebuttal',  async (req, res) => {
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

    res.json({ feedback: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to assess rebuttal.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(401).json({ error: error.message });

    return res.json({ session: data.session });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/verify-session', async (req, res) => {
  const { access_token } = req.body;

  if (!access_token) return res.status(401).json({ error: 'No access token provided.' });

  try {
    const { data, error } = await supabase.auth.getUser(access_token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired session.' });
    }

    return res.json({ user: data.user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // 1️⃣ Sign up the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return res.status(400).json({ error: error.message });

    // 2️⃣ Give the user 5 free tokens in user_tokens table
    if (data.user) {
      const { error: tokenError } = await supabase
        .from('user_tokens')
        .insert({
          user_id: data.user.id,
          tokens: 5, // free tokens at signup
        });

      if (tokenError) {
        console.error('Error giving free tokens:', tokenError);
        // Not fatal, signup succeeded even if tokens failed
      }
    }

    // 3️⃣ Respond with user data
    return res.json({ user: data.user, message: 'Sign-up successful! Please check your email for confirmation. You have 5 free tokens.' });

  } catch (err) {
    console.error('Signup server error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/reset-password' 
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: 'Password reset email sent! Check your inbox.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/reset-password', async (req, res) => {
  const { access_token, new_password } = req.body;

  if (!access_token || !new_password) {
    return res.status(400).json({ error: 'Token and new password required.' });
  }

  try {
    const { data, error } = await supabase.auth.updateUser(
      { password: new_password },
      { access_token }
    );

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: 'Password updated successfully!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});




app.get('/', (req, res) => res.send('✅ Backend is running'));

app.listen(PORT, () => {
  console.log(`✅ Server running (PORT=${PORT})`);
});

