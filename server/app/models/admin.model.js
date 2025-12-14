const db = require('../commons/connect'); 

const Admin = {};

// ===============================================
// LẤY ADMIN THEO TÊN NGƯỜI DÙNG (USERNAME)
// Dùng cho việc kiểm tra đăng nhập (Login)
// Đã sửa lỗi ER_PARSE_ERROR bằng cách dùng chuỗi một dòng.
// ===============================================
Admin.getByUsername = function (username, result) {
// SỬA: Chuyển SQL thành chuỗi một dòng để loại bỏ ký tự ẩn/khoảng trắng thừa
 const query = "SELECT id, username, password, name FROM admin WHERE username = ? LIMIT 1";
 
 // Thực thi query với username (sử dụng placeholder '?' an toàn)
 db.query(query, [username], (err, rows) => {
 if (err) {
 console.error("Lỗi SQL khi lấy Admin:", err.message, "Query:", query); 
 return result({ status: "error", data: null, message: err.message });
 }
 
 // Trả về dòng dữ liệu đầu tiên (nếu tìm thấy)
 const adminData = rows.length ? rows[0] : null;

 result({ status: "success", data: adminData, message: null });
 });
};

// ===============================================
// LẤY ADMIN THEO ID
// Đã sửa lỗi ER_PARSE_ERROR bằng cách dùng chuỗi một dòng.
// ===============================================
Admin.getById = function (id, result) {
 // SỬA: Chuyển SQL thành chuỗi một dòng
const query = "SELECT id, username, name FROM admin WHERE id = ? LIMIT 1";
 
 db.query(query, [id], (err, rows) => {
 if (err) {
 return result({ status: "error", data: null, message: err.message });
 }
 
 const adminData = rows.length ? rows[0] : null;

result({ status: "success", data: adminData, message: null });
 });
};
module.exports = Admin;