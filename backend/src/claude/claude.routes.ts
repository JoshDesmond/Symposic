import { Router, Request, Response } from 'express';
import { ClaudeService } from './claude.service';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();
const claudeService = new ClaudeService();

/**
 * Input Body Format:
 * {
 *   "name": "Josh",
 *   "messages": [
 *     {
 *       "role": "assistant",
 *       "content": "Hey Josh! Let's have a quick chat so I can understand who you are and connect you with amazing people. Just type naturally - tell me about your work, what excites you, what you're building or exploring. What's your story?"
 *     },
 *     {
 *       "role": "user", 
 *       "content": "I'm a fullstack developer. I've worked at a startup and am currently attempting work as a freelance developer helping small to medium businesses with their tech needs."
 *     }
 *   ]
 * }
 * 
 * Expected Output:
 * {
 *   "message": "That's awesome! I love hearing about developers who are making the leap to freelancing. What's been the most interesting project you've worked on recently, and what kind of tech challenges are you most excited to tackle?"
 * }
 */
router.post('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, messages } = req.body;
    
    // Validate required fields
    if (!name || !messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Name and messages array are required' });
      return;
    }

    // Validate message structure - each message must have role and content
    for (const message of messages) {
      if (!message.role || !message.content) {
        res.status(400).json({ error: 'Each message must have both role and content fields' });
        return;
      }
      if (!['user', 'assistant'].includes(message.role)) {
        res.status(400).json({ error: 'Message role must be either "user" or "assistant"' });
        return;
      }
    }

    const conversation = { name, messages };
    const nextMessage = await claudeService.getNextMessage(conversation);
    res.json({ message: nextMessage });
  } catch (error) {
    console.error('Error getting Claude response:', error);
    res.status(500).json({ error: `Error: ${error}` });
  }
});

router.post('/initial', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  // TODO, should this use try catch?
  const initialMessage = claudeService.getInitialPrompt(name);
  res.json({ message: initialMessage });
});

export default router;