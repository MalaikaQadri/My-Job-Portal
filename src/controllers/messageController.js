// src/controllers/messageController.js
const asyncHandler = require('express-async-handler');
const db = require('../models');
const { getIo } = require('../sockets/io');

/**
 * Send message via HTTP.
 * Body: { chatId, senderId, receiverId, content }
 * Saves message and emits via socket.io to room 'chat_<chatId>'
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, senderId, receiverId, content } = req.body;
  if (!chatId || !senderId || !receiverId || !content) return res.status(400).json({ message: 'Missing fields' });

  const message = await db.Message.create({ chatId, senderId, receiverId, content });

  // emit via sockets
  try {
    const io = getIo();
    io.to(`chat_${chatId}`).emit('newMessage', {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      createdAt: message.createdAt
    });
  } catch (err) {
    // io may not be initialized when unit-testing controllers; log and continue
    console.warn('Socket emit skipped (io not ready?)', err.message);
  }

  res.status(201).json({ message });
});

module.exports = { sendMessage };