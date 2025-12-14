// server/app/routers/ai.router.js

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// Định nghĩa route cho Chat AI
// Đường dẫn đầy đủ sẽ là: POST /api/ai/chat (do server.js cấu hình prefix /api)
router.post('/ai/chat', aiController.chat);

module.exports = router;