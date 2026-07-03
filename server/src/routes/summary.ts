import { Router, Request, Response, NextFunction } from 'express';
import { getRecentMessages } from '../services/messageService';
import { generateSummary } from '../services/aiService';
import { aiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply rate limiter specifically to this route
router.post('/summary', aiRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomId = 'main' } = req.body;

    // Fetch last 30 messages for summary
    const messages = await getRecentMessages(roomId, 30);

    if (messages.length === 0) {
      return res.json({
        summary: 'No messages to summarize yet. Join the conversation and start chatting!',
        messageCount: 0,
      });
    }

    try {
      const summary = await generateSummary(messages);
      return res.json({
        summary,
        messageCount: messages.length,
      });
    } catch (aiError: any) {
      console.error('AI Service Error (Summary):', aiError);
      return res.status(503).json({
        error: {
          message: aiError.message || 'AI Summarization service is currently unavailable. Please check backend environment keys.',
          status: 503,
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
