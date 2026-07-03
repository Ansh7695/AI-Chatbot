import { Server } from 'socket.io';
import { handleJoin } from './handlers/joinHandler';
import { handleMessage } from './handlers/messageHandler';
import { handleDisconnect } from './handlers/disconnectHandler';

export const initSockets = (io: Server): void => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join handler
    const onJoin = async (data: unknown) => {
      await handleJoin(io, socket, data);
    };
    socket.on('join', onJoin);

    // Message handler
    const onSendMessage = async (data: unknown) => {
      await handleMessage(io, socket, data);
    };
    socket.on('send-message', onSendMessage);

    // Disconnect handler
    socket.on('disconnect', async () => {
      // Remove event listeners explicitly to avoid duplicates/memory leaks
      socket.off('join', onJoin);
      socket.off('send-message', onSendMessage);

      // Perform cleanup and presence updates
      await handleDisconnect(io, socket);
    });
  });
};
