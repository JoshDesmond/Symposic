require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const Anthropic = require('@anthropic-ai/sdk');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 8347;

// Initialize Claude
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

app.use(cors());
app.use(bodyParser.json());

// Initialize database
const database = new Database();
database.runMigrations();

// Store conversation histories (in production, store in DB)
const conversations = {};

// === INTERVIEW CHAT ENDPOINT ===
app.post('/api/interview/chat', async (req, res) => {
  const { profile_id, message, session_id } = req.body;

  if (!profile_id || !message) {
    return res.status(400).json({ error: 'profile_id and message are required' });
  }

  // Create or get session
  const sessionKey = session_id || uuidv4();
  if (!conversations[sessionKey]) {
    conversations[sessionKey] = {
      profile_id,
      messages: [
        {
          role: 'system',
          content: `You are conducting an onboarding interview for a professional networking app that matches people for IRL meetups. Your goal is to understand:
- How they got to where they are professionally
- What they're currently working on or exploring
- What kind of people and conversations energize them
- Where they're heading next
- What matters to them beyond their resume

Conduct a natural, conversational interview. Ask follow-up questions based on their answers. Be curious and dig deeper when something interesting comes up. The interview should feel like a good conversation, not a form.

After 3-5 meaningful exchanges, when you feel you have a solid sense of the person, say: "Thanks for sharing! I have a good sense of who you are now." and end the interview naturally.

Start by introducing yourself briefly and asking an open-ended question to get them talking about their professional journey.`
        }
      ],
      exchange_count: 0
    };
  }

  try {
    // Add user message to history
    conversations[sessionKey].messages.push({
      role: 'user',
      content: message
    });
    conversations[sessionKey].exchange_count++;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 500,
      messages: conversations[sessionKey].messages.filter(m => m.role !== 'system'),
      system: conversations[sessionKey].messages.find(m => m.role === 'system').content
    });

    const assistantMessage = response.content[0].text;

    // Add assistant response to history
    conversations[sessionKey].messages.push({
      role: 'assistant',
      content: assistantMessage
    });

    // Check if interview is complete
    const isComplete = assistantMessage.includes("Thanks for sharing! I have a good sense of who you are now.");

    // If complete, save to database
    if (isComplete) {
      const interviewText = conversations[sessionKey].messages
        .filter(m => m.role !== 'system')
        .map(m => `${m.role === 'user' ? 'User' : 'Interviewer'}: ${m.content}`)
        .join('\n\n');

      database.db.run(
        'INSERT INTO interviews (profile_id, interview_text) VALUES (?, ?)',
        [profile_id, interviewText],
        function(err) {
          if (err) {
            console.error('Failed to save interview:', err);
          }
        }
      );
    }

    res.json({
      session_id: sessionKey,
      response: assistantMessage,
      is_complete: isComplete,
      exchange_count: conversations[sessionKey].exchange_count
    });

  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

// Get interview status
app.get('/api/interview/status/:session_id', (req, res) => {
  const { session_id } = req.params;
  const conversation = conversations[session_id];
  
  if (!conversation) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    exchange_count: conversation.exchange_count,
    is_active: true
  });
});

// === AUTH ENDPOINTS ===

// Register user
app.post('/api/auth/register', (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const profileId = uuidv4();

  database.db.run(
    'INSERT OR IGNORE INTO profiles (profile_id, phone) VALUES (?, ?)',
    [profileId, phone],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ profile_id: profileId, message: 'User registered successfully' });
    }
  );
});

// Lookup profile by phone number
app.get('/api/profile/by-phone/:phone', (req, res) => {
  const { phone } = req.params;

  database.db.get(
    'SELECT * FROM profiles WHERE phone = ?',
    [phone],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.json(row);
    }
  );
});

// === USER PROFILE ENDPOINTS ===

// Create/Update user profile
app.post('/api/profile', (req, res) => {
  const { profile_id, first_name, last_name, linkedin_url, phone } = req.body;

  if (!profile_id) {
    return res.status(400).json({ error: 'profile_id is required' });
  }

  database.db.run(
    `UPDATE profiles SET 
       first_name = ?,
       last_name = ?,
       linkedin_url = ?,
       phone = ?,
       updated_at = CURRENT_TIMESTAMP
     WHERE profile_id = ?`,
    [first_name, last_name, linkedin_url, phone, profile_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.json({ message: 'Profile updated successfully' });
    }
  );
});

// Get user profile
app.get('/api/profile/:profile_id', (req, res) => {
  const { profile_id } = req.params;

  database.db.get(
    'SELECT * FROM profiles WHERE profile_id = ?',
    [profile_id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.json(row);
    }
  );
});

// === INTERVIEW ENDPOINTS ===

// Create interview
app.post('/api/interview', (req, res) => {
  const { profile_id, interview_text } = req.body;

  if (!profile_id || !interview_text) {
    return res.status(400).json({ error: 'profile_id and interview_text are required' });
  }

  database.db.run(
    'INSERT INTO interviews (profile_id, interview_text) VALUES (?, ?)',
    [profile_id, interview_text],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ interview_id: this.lastID, message: 'Interview saved' });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});