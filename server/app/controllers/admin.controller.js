// /Server/app/controllers/admin.controller.js

const AdminModel = require('../models/admin.model'); 

// ----------------------------------------------------
// HÀM TIỆN ÍCH: BỌC CALLBACK THÀNH PROMISE
// ----------------------------------------------------
const wrapModel = (modelFunc, param) => {
    return new Promise((resolve, reject) => {
        modelFunc(param, (result) => {
            if (result.status === "error") {
                // Trả về lỗi, để catch block xử lý
                reject(new Error(result.message)); 
            } else {
                // Trả về dữ liệu (data)
                resolve(result.data); 
            }
        });
    });
};

// ----------------------------------------------------
// 🚀 HÀM ĐĂNG NHẬP CHÍNH (POST /api/login)
// ----------------------------------------------------
const loginAdmin = async (req, res) => {
    const { username, pwd } = req.body; 
    

    if (!username || !pwd) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin.' });
    }

    try {
        // 1. GỌI MODEL DÙNG PROMISE WRAPPER
        const adminData = await wrapModel(AdminModel.getByUsername, username); 

        if (!adminData) {
            return res.status(401).json({ success: false, message: 'Tên đăng nhập không tồn tại.' });
        }
        
        // 🚨 DEBUG: Kiểm tra mật khẩu (Giữ lại để debug)
        console.log(`[DEBUG] Username: ${username}`);
        console.log(`[DEBUG] Password (plaintext) length: ${pwd.length}`);
        console.log(`[DEBUG] DB Password: ${adminData.password}`);
        
        // 2. So sánh mật khẩu PLAINTEXT
        const isMatch = (pwd === adminData.password); 
        
        console.log(`[DEBUG] Plaintext Match: ${isMatch}`);

        if (isMatch) {
            // 3. Nếu khớp, thiết lập Session
            req.session.isAdminLoggedIn = true;
            req.session.adminInfo = {
                id: adminData.id,
                name: adminData.name, 
                username: adminData.username 
            };
            
            // 💡 KIỂM TRA LỖI LƯU SESSION TRƯỚC KHI TRẢ VỀ THÀNH CÔNG
            req.session.save((err) => {
                if (err) {
                    // Nếu có lỗi khi lưu session (thường là lỗi kết nối Session Store)
                    console.error('🔴 LỖI SESSION SAVE (Kiểm tra Session Store):', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Lỗi lưu trữ phiên đăng nhập. Vui lòng kiểm tra cấu hình server.' 
                    });
                }
                
                // 4. TRẢ VỀ THÀNH CÔNG NẾU LƯU SESSION OK
                return res.json({ 
                    success: true, 
                    message: 'Đăng nhập thành công.',
                    admin: req.session.adminInfo
                });
            });

        } else {
            return res.status(401).json({ success: false, message: 'Sai mật khẩu.' });
        }

    } catch (error) {
        console.error('Lỗi server khi đăng nhập:', error);
        return res.status(500).json({ success: false, message: error.message || 'Lỗi máy chủ nội bộ.' });
    }
};

// ----------------------------------------------------
// HÀM ĐĂNG XUẤT (POST /api/logout) - Giữ nguyên
// ----------------------------------------------------
const logoutAdmin = (req, res) => {
    // Hủy session
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Không thể đăng xuất.' });
        }
        res.clearCookie('connect.sid'); 
        res.json({ success: true, message: 'Đăng xuất thành công.' });
    });
};

// ----------------------------------------------------
// HÀM KIỂM TRA SESSION (GET /api/check-auth) - Giữ nguyên
// ----------------------------------------------------
const checkAuth = (req, res) => {
    if (req.session.isAdminLoggedIn) {
        return res.json({ 
            isLoggedIn: true, 
            admin: req.session.adminInfo 
        });
    } else {
        return res.json({ isLoggedIn: false });
    }
};

module.exports = {
    loginAdmin,
    logoutAdmin,
    checkAuth,
};