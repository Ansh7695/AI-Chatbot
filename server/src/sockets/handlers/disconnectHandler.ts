import { Server, Socket } from 'socket.io';

export const handleDisconnect = async (
  io: Server,
  socket: Socket
): Promise<void> => {
  try {
    const { nickname, roomId } = socket.data;

    if (nickname && roomId) {
      console.log(`User [${nickname}] disconnected from room [${roomId}]`);

      // Broadcast user-left system notification
      socket.to(roomId).emit('user-left', { nickname });

      // Recalculate presence list and broadcast
      const sockets = await io.in(roomId).fetchSockets();
      const nicknames = sockets
        .map((s) => s.data.nickname)
        .filter((name): name is string => typeof name === 'string' && name !== '');

      io.to(roomId).emit('presence-update', nicknames);
    }
  } catch (error) {
    console.error('Error handling disconnect:', error);
  }
};
