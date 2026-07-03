import { Router, Request, Response, NextFunction } from 'express';
import { getRecentMessages } from '../services/messageService';
import { searchChatHistory } from '../services/aiService';
import { aiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/search', aiRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomId = 'main', query } = req.body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({
        error: {
          message: 'Search query is required.',
          status: 400,
        },
      });
    }

    const sanitizedQuery = query.trim();

    // Fetch last 100 messages for context
    const messages = await getRecentMessages(roomId, 100);

    if (messages.length === 0) {
      return res.json({
        answer: 'No chat messages exist to perform a search.',
        relevantMessageIds: [],
        relevantMessages: [],
      });
    }

    try {
      const result = await searchChatHistory(messages, sanitizedQuery);

      // Filter local message documents to resolve full Message objects
      const relevantMessages = messages.filter((msg) =>
        result.relevantMessageIds.some(
          (id) => id === msg._id.toString() || id === String(msg._id)
        )
      );

      return res.json({
        answer: result.answer,
        relevantMessageIds: result.relevantMessageIds,
        relevantMessages,
      });
    } catch (aiError: any) {
      console.error('AI Service Error (Search):', aiError);
      return res.status(503).json({
        error: {
          message: aiError.message || 'AI Search service is currently unavailable. Please check backend environment keys.',
          status: 503,
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
