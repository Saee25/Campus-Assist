let io;

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('⚡ User connected:', socket.id);

      socket.on('join', (room) => {
        socket.join(room);
        console.log(`👤 User joined room: ${room}`);
      });

      socket.on('disconnect', () => {
        console.log('🔥 User disconnected');
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized');
    }
    return io;
  }
};
