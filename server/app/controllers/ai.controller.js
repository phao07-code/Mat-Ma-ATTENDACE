// server/app/controllers/ai.controller.js
const aiService = require('../services/ai.service');

exports.chat = async (req, res) => {
    const { question } = req.body;
    if (!question) return res.status(400).json({ success: false, message: "Thiếu câu hỏi" });

    try {
        const answer = await aiService.askGemini(question);
        res.json({ success: true, answer });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi xử lý AI" });
    }
};