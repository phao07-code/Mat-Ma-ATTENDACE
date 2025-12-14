// server/app/controllers/export.controller.js

const db = require('../commons/connect');
const { Parser } = require('json2csv');

// Hàm format ngày giờ (Giữ nguyên)
const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', { 
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
};

exports.exportToCSV = (req, res) => {
    // 1. Lấy tham số lọc từ URL (req.query)
    const { from, to } = req.query; 

    // 2. Xây dựng câu lệnh SQL cơ bản
    let sql = `
        SELECT 
            h.id_card, 
            u.maSinhVien, 
            u.username AS ho_ten, 
            h.date_time_in, 
            h.date_time_out 
        FROM history h
        LEFT JOIN user u ON h.id_card = u.id_card
    `;

    // 3. Nếu có tham số ngày, thêm điều kiện WHERE
    const params = [];
    if (from && to) {
        sql += ` WHERE h.date_time_in BETWEEN ? AND ?`;
        params.push(from, to);
    }

    sql += ` ORDER BY h.date_time_in DESC`;

    // 4. Thực thi truy vấn với tham số
    db.query(sql, params, (err, data) => {
        if (err) {
            console.error("Lỗi truy vấn Export:", err);
            return res.status(500).json({ status: 'error', message: err.message });
        }

        try {
            const formattedData = JSON.parse(JSON.stringify(data)).map(row => ({
                ...row,
                ho_ten: row.ho_ten || 'Chưa đăng ký',
                date_time_in: formatDate(row.date_time_in),
                date_time_out: formatDate(row.date_time_out)
            }));

            const fields = [
                { label: 'Mã Thẻ (ID Card)', value: 'id_card' },
                { label: 'Mã Sinh Viên', value: 'maSinhVien' },
                { label: 'Họ và Tên', value: 'ho_ten' },
                { label: 'Thời gian vào', value: 'date_time_in' },
                { label: 'Thời gian ra', value: 'date_time_out' }
            ];

            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(formattedData);
            const csvWithBOM = '\uFEFF' + csv;

            res.header('Content-Type', 'text/csv; charset=utf-8');
            res.attachment('danh_sach_diem_danh.csv');
            
            return res.send(csvWithBOM);

        } catch (error) {
            console.error("Lỗi tạo CSV:", error);
            return res.status(500).json({ status: 'error', message: 'Lỗi khi tạo file CSV' });
        }
    });
};