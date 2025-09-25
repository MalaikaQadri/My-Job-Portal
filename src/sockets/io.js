let ioInstance = null;

function init(server) {
  const { Server } = require('socket.io');
  const io = new Server(server, {
    cors: { origin: '*' }
  });
  ioInstance = io;
  return io;
}

function getIo() {
  if (!ioInstance) throw new Error('Socket.io not initialized. Call init(server) first.');
  return ioInstance;
}

module.exports = { init, getIo };