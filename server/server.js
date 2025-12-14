// server.js

const cors = require('cors');
const express = require('express')
const app = express()
const port = 42600

// 💡 IMPORT CÁC THƯ VIỆN CẦN THIẾT
const session = require('express-session'); 
const bodyParser = require('body-parser'); 

// ----------------------------------------------------
// 1. CẤU HÌNH MIDDLEWARE (Phải chạy trước Router)
// ----------------------------------------------------

/*
Cấu hình CORS policy
*/
app.use(cors(
    {
        origin: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://113.161.240.83:3000",
            "http://mqtt.coder96.com:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
        ],
        // Cần thiết để cho phép gửi Cookie Session qua các domain khác nhau
        credentials: true, 
        exposedHeaders: ["set-cookie"]
    }
));


/*
Cấu hình Body Parser (Để đọc req.body)
*/
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 


/*
💡 CẤU HÌNH EXPRESS-SESSION
*/
app.use(session({
    // ⚠️ QUAN TRỌNG: Thay chuỗi này bằng một chuỗi ngẫu nhiên, dài và duy nhất.
    secret: 'YOUR_VERY_LONG_AND_SECURE_SECRET_KEY_FOR_ADMIN_SESSION', 
    resave: false,
    saveUninitialized: false, 
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24, // Session tồn tại 24 giờ
        secure: false, // Đặt thành true nếu dùng HTTPS (production)
        httpOnly: true // Đảm bảo cookie không thể truy cập bằng JavaScript phía client
    }
}));


// ----------------------------------------------------
// 2. CÁC ROUTER 
// ----------------------------------------------------
require('./app/routers/history.router')(app);
require('./app/routers/user.router')(app);
require('./app/routers/export.router')(app);
const aiRouter = require('./app/routers/ai.router'); 
app.use('/api', aiRouter);
const adminRouter = require('./app/routers/admin.router'); 
app.use('/api', adminRouter); // Sử dụng base path là /api cho các API Admin

// ----------------------------------------------------
// 3. KHỞI ĐỘNG SERVER
// ----------------------------------------------------
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})