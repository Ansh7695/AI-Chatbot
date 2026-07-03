import { Message, IMessage } from '../models/Message';

export const getHistory = async (roomId: string, limit = 100): Promise<IMessage[]> => {
  // Fetch latest messages first, then sort them in chronological order (ascending) for client display
  const messages = await Message.find({ roomId })
    .sort({ createdAt: -1 })
    .limit(limit);
  
  return messages.reverse();
};

export const saveMessage = async (
  roomId: string,
  nickname: string,
  text: string
): Promise<IMessage> => {
  const message = new Message({
    roomId,
    nickname,
    text,
  });
  return await message.save();
};

export const getRecentMessages = async (roomId: string, limit: number): Promise<IMessage[]> => {
  const messages = await Message.find({ roomId })
    .sort({ createdAt: -1 })
    .limit(limit);
  
  return messages.reverse();
};
