import { Server, Socket } from 'socket.io';
import { getHistory } from '../../services/messageService';

interface JoinPayload {
  nickname: string;
  roomId?: string;
}

export const handleJoin = async (
  io: Server,
  socket: Socket,
  payload: unknown
): Promise<void> => {
  try {
    if (!payload || typeof payload !== 'object') {
      socket.emit('error-message', 'Invalid payload');
      return;
    }

    const { nickname, roomId = 'main' } = payload as JoinPayload;

    if (!nickname || typeof nickname !== 'string' || nickname.trim() === '') {
      socket.emit('error-message', 'Nickname is required');
      return;
    }

    const sanitizedNickname = nickname.trim();
    const sanitizedRoomId = (roomId || 'main').trim();

    // Store details on socket instance
    socket.data.nickname = sanitizedNickname;
    socket.data.roomId = sanitizedRoomId;

    // Join Socket.io room
    await socket.join(sanitizedRoomId);
    console.log(`User [${sanitizedNickname}] joined room [${sanitizedRoomId}]`);

    // Fetch and send message history
    const history = await getHistory(sanitizedRoomId);
    socket.emit('chat-history', history);

    // Broadcast presence update: send the list of all nicknames in this room
    const sockets = await io.in(sanitizedRoomId).fetchSockets();
    const nicknames = sockets
      .map((s) => s.data.nickname)
      .filter((name): name is string => typeof name === 'string' && name !== '');

    io.to(sanitizedRoomId).emit('presence-update', nicknames);
    
    // Optional: send a join announcement
    socket.to(sanitizedRoomId).emit('user-joined', { nickname: sanitizedNickname });
  } catch (error) {
    console.error('Error handling join:', error);
    socket.emit('error-message', 'Internal socket error during join');
  }
};
