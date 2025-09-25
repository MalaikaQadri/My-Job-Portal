const express = require('express');
const router = express.Router();

const { getOrCreateChat, getChatMessages } = require('../controllers/chatController');

router.post('/create', getOrCreateChat);
router.get('/:chatId/', getChatMessages);

module.exports = router;