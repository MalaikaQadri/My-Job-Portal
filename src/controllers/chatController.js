const asyncHandler = require('express-async-handler');
const db = require('../models');


//  POST body: { user1Id, user2Id }
const getOrCreateChat = asyncHandler(async (req, res) => {
  const { user1Id, user2Id } = req.body;
  if (!user1Id || !user2Id) return res.status(400).json({ message: 'user1Id and user2Id required' });

  // ensure consistent ordering to avoid duplicate pairs (optional)
  const existing = await db.Chat.findOne({
    where: {
      user1Id: user1Id,
      user2Id: user2Id
    }
  });

  if (existing) return res.json({ chat: existing });

  const existingReverse = await db.Chat.findOne({
    where: {
      user1Id: user2Id,
      user2Id: user1Id
    }
  });
  if (existingReverse) return res.json({ chat: existingReverse });

  const chat = await db.Chat.create({ user1Id, user2Id });
  return res.status(201).json({ chat });
});

const getChatMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const messages = await db.Message.findAll({
    where: { chatId },
    order: [['createdAt', 'ASC']]
  });
  res.json({ messages });
});

module.exports = { getOrCreateChat, getChatMessages };