import { Router, Request, Response } from 'express';
import { ClaudeService } from './claude.service';
import { requireAuth } from '../auth/auth.middleware';
import { Interview } from '@shared/types';
import { db } from '../database';

const router = Router();
const claudeService = new ClaudeService();


/**
 * Input Body Format:
 * {
 *   "interview": {
 *     "createdAt": "2024-01-01T00:00:00.000Z",
 *     "messages": [
 *       {
 *         "role": "assistant",
 *         "content": "Hey Josh! Let's have a quick chat..."
 *       },
 *       {
 *         "role": "user", 
 *         "content": "I'm a fullstack developer..."
 *       }
 *     ]
 *   }
 * }
 * 
 * Expected Output:
 * {
 *   "interview": {
 *     "createdAt": "2024-01-01T00:00:00.000Z",
 *     "messages": [
 *       // ... existing messages plus new assistant message at next index
 *     ]
 *   }
 * }
 */
router.post('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { interview } = req.body;
    const phone = (req as any).userPhone;
    
    // Validate required fields
    if (!interview || !interview.messages || !Array.isArray(interview.messages)) {
      res.status(400).json({ error: 'Interview object with messages array is required' });
      return;
    }

    // Validate message structure - each message must have role and content
    for (const message of interview.messages) {
      if (!message.role || !message.content) {
        res.status(400).json({ error: 'Each message must have both role and content fields' });
        return;
      }
      if (!['user', 'assistant'].includes(message.role)) {
        res.status(400).json({ error: 'Message role must be either "user" or "assistant"' });
        return;
      }
    }
    
    // Food for thought: A sufficiently motivated prompt injector could modify the assistant's messages and upload fully custom text here as is

    const updatedInterview = await claudeService.getNextMessage(interview);
    
    // Update the interview in the database
    const result = await db.result(
      `UPDATE interviews 
       SET interview_data = $1 
       FROM profiles 
       WHERE interviews.profile_id = profiles.profile_id 
         AND profiles.phone = $2`,
      [JSON.stringify(updatedInterview), phone]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Interview or profile not found' });
      return;
    }

    res.json({ interview: updatedInterview });
  } catch (error) {
    console.error('Error getting Claude response:', error);
    res.status(500).json({ error: `Error: ${error}` });
  }
});

/**
 * Input Body Format:
 * {
 *   "name": "Josh"
 * }
 * 
 * Expected Output:
 * {
 *   "interview": {
 *     "createdAt": "2024-01-01T00:00:00.000Z",
 *     "messages": [
 *       {
 *         "role": "assistant",
 *         "content": "Hey Josh! Let's have a quick chat..."
 *       }
 *     ]
 *   }
 * }
 */
router.post('/initial', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const phone = (req as any).userPhone;
    
    if (!name) {
      res.status(400).json({ error: 'Name is required to start interview' });
      return;
    }

    const initialMessage = claudeService.getInitialPrompt(name);
    const interviewData: Interview = {
      createdAt: new Date().toISOString(),
      messages: [initialMessage]
    };
    
    // Create interview record in database with phone join
    const result = await db.one(
      `INSERT INTO interviews (profile_id, interview_data) 
       SELECT profile_id, $2
       FROM profiles 
       WHERE phone = $1
       RETURNING interview_id, created_at`,
      [phone, JSON.stringify(interviewData)]
    );

    if (!result) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const interview: Interview = {
      createdAt: result.created_at,
      messages: interviewData.messages
    };

    res.json({ interview });
  } catch (error) {
    console.error('Error loading initial interview message:', error);
    res.status(500).json({ error: `Error: ${error}` });
  }
});

export default router;