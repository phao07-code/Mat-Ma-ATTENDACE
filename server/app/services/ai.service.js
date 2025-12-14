// server/app/services/ai.service.js

require('dotenv').config(); 
const { GoogleGenAI } = require('@google/genai');
const db = require('../commons/connect');

const API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

const executeQuery = (query) => {
    return new Promise((resolve, reject) => {
        db.query(query, [], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const askGemini = async (userQuestion) => {
    // 💡 QUAY LẠI MODEL NÀY (VÌ NÓ TỒN TẠI VỚI TÀI KHOẢN BẠN)
    const MODEL_NAME = 'gemini-2.0-flash'; 

    try {
        // --- PHẦN "HUẤN LUYỆN" (FEW-SHOT PROMPTING) ---
        const dbSchema = `
        Bạn là chuyên gia SQL MySQL. Nhiệm vụ: Chuyển câu hỏi tự nhiên thành SQL.
        
        Cơ sở dữ liệu:
        1. Bảng 'user' (id_card, username, maSinhVien).
        2. Bảng 'history' (id_card, date_time_in, date_time_out).

        Quy tắc:
        - Luôn JOIN history và user để lấy tên (username).
        - Trả về CHỈ câu lệnh SQL, không markdown.

        ---------------------------------------------------
        📖 VÍ DỤ MẪU (AI HÃY HỌC THEO):
        1. User: "Hôm nay những ai đi muộn?" (Quy tắc: > 7h00 sáng)
           SQL: SELECT u.username, h.date_time_in FROM history h JOIN user u ON h.id_card = u.id_card WHERE DATE(h.date_time_in) = CURDATE() AND TIME(h.date_time_in) > '07:00:00';

        2. User: "Hôm nay ai chưa về?"
           SQL: SELECT u.username, h.date_time_in FROM history h JOIN user u ON h.id_card = u.id_card WHERE DATE(h.date_time_in) = CURDATE() AND h.date_time_out IS NULL;

        3. User: "Thống kê điểm danh hôm nay"
           SQL: SELECT u.username, h.date_time_in, h.date_time_out FROM history h JOIN user u ON h.id_card = u.id_card WHERE DATE(h.date_time_in) = CURDATE() ORDER BY h.date_time_in DESC;
        ---------------------------------------------------
        `;

        const sqlPrompt = `${dbSchema}\n\nCâu hỏi: "${userQuestion}"\nSQL Query:`;
        
        console.log(`🤖 Đang gọi model: ${MODEL_NAME}...`);

        // 1. Tạo SQL
        const resultSQL = await ai.models.generateContent({
            model: MODEL_NAME, 
            contents: [{ role: 'user', parts: [{ text: sqlPrompt }] }]
        });
        
        let sql = resultSQL.response.candidates[0].content.parts[0].text;
        sql = sql.replace(/```sql/g, '').replace(/```/g, '').trim();
        console.log("✅ SQL Generated:", sql); 

        // 2. Chạy SQL
        const data = await executeQuery(sql);

        // 3. Tóm tắt kết quả
        const summaryPrompt = `
            Câu hỏi: "${userQuestion}"
            Dữ liệu tìm được: ${JSON.stringify(data)}
            Hãy trả lời ngắn gọn, thân thiện bằng Tiếng Việt.
        `;

        const resultFinal = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }]
        });

        return resultFinal.response.candidates[0].content.parts[0].text;

    } catch (error) {
        // Xử lý lỗi Hết hạn mức (429)
        if (error.status === 429 || (error.body && error.body.error && error.body.error.code === 429)) {
            return "⚠️ AI đang quá tải (Hết hạn mức miễn phí). Vui lòng đợi 1 phút rồi hỏi lại.";
        }
        
        // Xử lý lỗi Không tìm thấy Model (404)
        if (error.status === 404) {
            return `Lỗi: Không tìm thấy model '${MODEL_NAME}'.`;
        }

        console.error("❌ Lỗi AI Service:", error);
        return "Đang có lỗi kết nối với trí tuệ nhân tạo.";
    }
};

module.exports = { askGemini };