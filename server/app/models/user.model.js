const { domainToUnicode } = require('url');
// models/user.model.js
// models/user.model.js
const db = require('../commons/connect');

const User = {};

// ===============================================
// LẤY TẤT CẢ NGƯỜI DÙNG
// ===============================================
User.all = function (data, result) {
    const query = `
        SELECT id, id_card, username, maSinhVien, create_time 
        FROM user 
        ORDER BY id DESC
    `;

    db.query(query, (err, rows) => {
        if (err) {
            return result({ status: "error", data: null, message: err.message });
        }
        result({ status: "success", data: rows, message: null });
    });
};

// ===============================================
// LẤY THEO ID CARD
// ===============================================
User.getByIdCard = function (id_card, result) {
    const query = `
        SELECT id, id_card, username, maSinhVien, create_time 
        FROM user 
        WHERE id_card = ? 
        LIMIT 1
    `;

    db.query(query, [id_card], (err, rows) => {
        if (err) {
            return result({ status: "error", data: null, message: err.message });
        }
        result({ status: "success", data: rows, message: null });
    });
};

// ===============================================
// THÊM NGƯỜI DÙNG MỚI
// ===============================================
User.add = function (data, result) {
    const query = "INSERT INTO user SET ?";

    db.query(query, data, (err, res) => {
        if (err) {
            // Bắt lỗi trùng khóa UNIQUE
            if (err.code === 'ER_DUP_ENTRY') {
                if (err.message.includes('maSinhVien')) {
                    return result({ 
                        status: "error", 
                        data: null, 
                        message: "Mã sinh viên đã tồn tại! Vui lòng chọn mã khác." 
                    });
                }
                if (err.message.includes('id_card')) {
                    return result({ 
                        status: "error", 
                        data: null, 
                        message: "Thẻ RFID này đã được đăng ký cho sinh viên khác!" 
                    });
                }
            }
            return result({ 
                status: "error", 
                data: null, 
                message: err.message || "Lỗi khi thêm người dùng" 
            });
        }

        result({ 
            status: "success", 
            data: { id: res.insertId, ...data }, 
            message: "Thêm sinh viên thành công!" 
        });
    });
};

// ===============================================
// CẬP NHẬT NGƯỜI DÙNG
// data = [ { username, maSinhVien, ... }, id ]
// ===============================================
User.update = function (data, result) {
    if (!Array.isArray(data) || data.length !== 2) {
        return result({ status: "error", data: null, message: "Dữ liệu cập nhật không hợp lệ" });
    }

    const [fields, userId] = data;

    const query = "UPDATE user SET ? WHERE id = ?";

    db.query(query, [fields, userId], (err, res) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                if (err.message.includes('maSinhVien')) {
                    return result({ 
                        status: "error", 
                        data: null, 
                        message: "Mã sinh viên đã được sử dụng bởi sinh viên khác!" 
                    });
                }
                if (err.message.includes('id_card')) {
                    return result({ 
                        status: "error", 
                        data: null, 
                        message: "Thẻ RFID này đã được dùng cho sinh viên khác!" 
                    });
                }
            }
            return result({ 
                status: "error", 
                data: null, 
                message: err.message || "Lỗi khi cập nhật" 
            });
        }

        if (res.affectedRows === 0) {
            return result({ status: "error", data: null, message: "Không tìm thấy sinh viên để cập nhật" });
        }

        result({ 
            status: "success", 
            data: { id: userId, ...fields }, 
            message: "Cập nhật thành công!" 
        });
    });
};

// ===============================================
// XÓA NGƯỜI DÙNG
// ===============================================
User.delete = function (id, result) {
    const query = "DELETE FROM user WHERE id = ?";

    db.query(query, [id], (err, res) => {
        if (err) {
            return result({ status: "error", data: null, message: err.message });
        }

        if (res.affectedRows === 0) {
            return result({ status: "error", data: null, message: "Không tìm thấy sinh viên để xóa" });
        }

        result({ status: "success", data: null, message: "Xóa sinh viên thành công!" });
    });
};

module.exports = User;