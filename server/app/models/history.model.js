const { domainToUnicode } = require('url');
// models/history.model.js
const db = require('../commons/connect');

const BASE_SELECT = `
    SELECT 
        h.id, 
        h.id_card, 
        u.maSinhVien, 
        u.username, 
        h.date_time_in, 
        h.date_time_out,
        h.state 
    FROM history h 
    INNER JOIN user u ON h.id_card = u.id_card
`;

const History = {};

// Lấy tất cả lịch sử
History.all = function (data, result) {
    db.query(`${BASE_SELECT} ORDER BY h.id DESC`, (err, table) => {
        if (err) return result({ status: "error", data: null, message: err });
        result({ status: "success", data: table, message: null });
    });
};

// Lấy theo limit
History.getLimit = function (data, result) {
    const limit = parseInt(data.limit) || 100;
    db.query(`${BASE_SELECT} ORDER BY h.id DESC LIMIT ?`, [limit], (err, table) => {
        if (err) return result({ status: "error", data: null, message: err });
        result({ status: "success", data: table, message: null });
    });
};

// Lấy theo id_card + khoảng thời gian (ngày hiện tại)
History.getByCardId = function (data, result) {
    db.query(
        `${BASE_SELECT} 
         WHERE h.id_card = ? 
         AND DATE(h.date_time_in) = DATE(?) 
         ORDER BY h.id DESC 
         LIMIT 1`,
        [data.id_card, data.from],
        (err, table) => {
            if (err) return result({ status: "error", data: null, message: err });
            result({ status: "success", data: table, message: null });
        }
    );
};

// Lọc theo khoảng thời gian
History.filter = function (from, to, sort, result) {
    const validSort = (sort === 'ASC') ? 'ASC' : 'DESC';
    db.query(
        `${BASE_SELECT} 
         WHERE h.date_time_in BETWEEN ? AND ? 
         ORDER BY h.id ${validSort}`,
        [from, to],
        (err, table) => {
            if (err) return result({ status: "error", data: null, message: err });
            result({ status: "success", data: table, message: null });
        }
    );
};

// Thêm lịch sử
History.add = function (data, result) {
    db.query("INSERT INTO history SET ?", data, (err, res) => {
        if (err) return result({ status: "error", data: null, message: err });
        result({ 
            status: "success", 
            data: { id: res.insertId, ...data }, 
            message: null 
        });
    });
};

// Cập nhật lịch sử
History.update = function (data, result) {
    db.query("UPDATE history SET ? WHERE id = ?", data, (err, res) => {
        if (err) return result({ status: "error", data: null, message: err });
        result({ status: "success", data: res, message: null });
    });
};

// Xóa lịch sử
History.delete = function (id, result) {
    db.query("DELETE FROM history WHERE id = ?", [id], (err, res) => {
        if (err) return result({ status: "error", data: null, message: err });
        result({ status: "success", data: res, message: null });
    });
};

module.exports = History;