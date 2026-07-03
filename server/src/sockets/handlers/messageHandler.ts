import { Server, Socket } from 'socket.io';
import { saveMessage } from '../../services/messageService';

interface MessagePayload {
  text: string;
}

export const handleMessage = async (
  io: Server,
  socket: Socket,
  payload: unknown
): Promise<void> => {
  try {
    const { nickname, roomId } = socket.data;

    if (!nickname || !roomId) {
      socket.emit('error-message', 'You must join a room first');
      return;
    }

    if (!payload || typeof payload !== 'object') {
      socket.emit('error-message', 'Invalid payload');
      return;
    }

    const { text } = payload as MessagePayload;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return; // Ignore empty messages silently
    }

    const sanitizedText = text.trim();

    // Save to database
    const savedMessage = await saveMessage(roomId, nickname, sanitizedText);

    // Broadcast message to everyone in the room (including the sender)
    io.to(roomId).emit('new-message', savedMessage);
  } catch (error) {
    console.error('Error handling message:', error);
    socket.emit('error-message', 'Internal socket error during send message');
  }
};
