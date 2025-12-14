// src/pages/login-screen.js
import React, { useState } from 'react';
import * as api from './api/networking'; 
import styles from '../styles/login-screen.module.css'; 
// Import Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faCircleNotch, faShieldHalved } from '@fortawesome/free-solid-svg-icons';

const LoginScreen = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const credentials = { username, pwd: password }; 

        try {
            const response = await api.adminLogin(credentials);
            
            if (response.success) {
                onLoginSuccess(response.admin.name || 'Admin'); 
            } else {
                setError(response.message || 'Thông tin đăng nhập không chính xác.');
            }
        } catch (err) {
            console.error("Login API Error:", err);
            setError('Lỗi kết nối server. Vui lòng kiểm tra lại mạng.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            {/* Các hình nền trang trí (Blobs) để làm nổi bật hiệu ứng kính */}
            <div className={styles.backgroundShape1}></div>
            <div className={styles.backgroundShape2}></div>

            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <div className={styles.logoIcon}>
                        <FontAwesomeIcon icon={faShieldHalved} />
                    </div>
                    <h2>Chào mừng trở lại</h2>
                    <p className={styles.subtitle}>Đăng nhập hệ thống quản trị</p>
                </div>

                {error && <div className={styles.errorAlert}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="username">Tên đăng nhập</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>
                                <FontAwesomeIcon icon={faUser} />
                            </span>
                            <input
                                type="text" 
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nhập username..."
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Mật khẩu</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>
                                <FontAwesomeIcon icon={faLock} />
                            </span>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu..."
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className={styles.loginBtn}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <FontAwesomeIcon icon={faCircleNotch} spin /> Đang xử lý...
                            </>
                        ) : 'Đăng nhập'}
                    </button>
                </form>
                
                <div className={styles.footer}>
                    <span>© 2025 Attendance System</span>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;