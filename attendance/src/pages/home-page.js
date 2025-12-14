import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
// Thêm icon faArrowRightFromBracket cho nút Đăng xuất
import { faHouse, faClockRotateLeft, faUsers, faCircleInfo, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons' 
import styles from '../styles/home-page.module.css'
import TabHome from './tab-home'
import TabHistory from './tab-history'
import TabInfo from './tab-info'
import TabCardManager from './tab-card-manager'
import React, { useEffect, useState, useRef } from 'react'

import LoginScreen from './login-screen' 
import * as api from './api/networking' 

// 💡 1. THÊM IMPORT CHATBOT (CHỈ THÊM DÒNG NÀY)
import AIChat from '../components/AIChat'; 

const ws = new WebSocket("ws://iot.coder96.com:1880/ws/attendance");

const HomePage = () => {
    const isSetting = useRef(false);

    // STATE CHO AUTHENTICATION
    const [isLoggedIn, setIsLoggedIn] = useState(null); 
    const [adminName, setAdminName] = useState('Admin'); 

    const [triggerTabHistory, setTriggerTabHistory] = useState(false);
    const [triggerTabCardManager, setTriggerTabCardManager] = useState(false);
    const [cardId, setCardId] = useState(0);
    const [triggerNewCard, setTriggerNewCard] = useState(false);
    const [cardIdAdd, setCardIdAdd] = useState(0);
    const [triggerNewCardAdd, setTriggerNewCardAdd] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
    const [globalSearch, setGlobalSearch] = useState("");

    // HÀM KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP
    const checkAuthentication = async () => {
        setIsLoggedIn(null); 
        try {
            const response = await api.adminCheckAuth();
            
            if (response.isLoggedIn) {
                setIsLoggedIn(true);
                setAdminName(response.admin?.name || 'Admin'); 
            } else {
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error("Lỗi kiểm tra Auth:", error);
            setIsLoggedIn(false);
        }
    };
    
    // HÀM ĐĂNG XUẤT
    const handleLogout = async () => {
        await api.adminLogout();
        setIsLoggedIn(false);
        setAdminName('Admin');
        setActiveTab('home'); 
        onClickHome();
    };

    // CALLBACK KHI ĐĂNG NHẬP THÀNH CÔNG
    const handleLoginSuccess = (name) => {
        setAdminName(name);
        setIsLoggedIn(true);
        onClickHome(); 
    };


    // EFFECT KIỂM TRA AUTH VÀ KẾT NỐI WEBSOCKET
    useEffect(() => {
        checkAuthentication(); 
        onClickHome(); 

        ws.onopen = () => console.log('Connected WebSocket');
        ws.onmessage = function (event) {
            if (!isSetting.current) {
                setCardId(event.data);
                setTriggerNewCard(prev => !prev);
            } else {
                setCardIdAdd(event.data);
                setTriggerNewCardAdd(prev => !prev);
            }
        };
    }, []);
    
    // CÁC HÀM XỬ LÝ CŨ GIỮ NGUYÊN
    const onClickHome = () => {
        isSetting.current = false;
        setTriggerTabHistory(prev => !prev);
    };

    const onClickCardManager = () => {
        isSetting.current = true;
        setTriggerTabCardManager(prev => !prev);
    };

    const wsSend = (message) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(message);
    };
    
    // LOGIC BẢO VỆ TRANG
    if (isLoggedIn === null) {
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px', color: '#555'}}>
                Đang kiểm tra phiên đăng nhập...
            </div>
        );
    }
    
    if (isLoggedIn === false) {
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />; 
    }

    // GIAO DIỆN CHÍNH
    return (
        <div className={styles.dashboardContainer}>
            {/* SIDEBAR - GIỮ NGUYÊN */}
            <div className={styles.sidebar}>
                <div className={styles.logoArea}>
                    <FontAwesomeIcon icon={faHouse} className={styles.logoIcon} />
                    <span className={styles.logoText}>MẬT MÃ ATTENDANCE</span>
                </div>
                <div className={styles.navMenu}>
                    <button className={`${styles.navItem} ${activeTab === 'home' ? styles.active : ''}`}
                        onClick={() => { setActiveTab('home'); onClickHome(); }}>
                        <FontAwesomeIcon icon={faHouse} className={styles.icon} /> Home
                    </button>
                    <button className={`${styles.navItem} ${activeTab === 'history' ? styles.active : ''}`}
                        onClick={() => setActiveTab('history')}>
                        <FontAwesomeIcon icon={faClockRotateLeft} className={styles.icon} /> History
                    </button>
                    <button className={`${styles.navItem} ${activeTab === 'cardmanager' ? styles.active : ''}`}
                        onClick={() => { setActiveTab('cardmanager'); onClickCardManager(); }}>
                        <FontAwesomeIcon icon={faUsers} className={styles.icon} /> Card Manager
                    </button>
                    <button className={`${styles.navItem} ${activeTab === 'info' ? styles.active : ''}`}
                        onClick={() => setActiveTab('info')}>
                        <FontAwesomeIcon icon={faCircleInfo} className={styles.icon} /> Thông tin
                    </button>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.sidebarFooter}>© 2025 Attendance System</div>
            </div>

            {/* MAIN CONTENT - GIỮ NGUYÊN */}
            <div className={styles.mainContent}>
                <div className={styles.globalSearchBar}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm bằng Mã sinh viên..."
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        className={styles.globalSearchInput}
                    />
                </div>

                <div className={styles.topHeader}>
                    <h1 className={styles.pageTitle}>
                        {activeTab === 'home' ? 'Trang chủ' :
                         activeTab === 'history' ? 'Lịch sử' :
                         activeTab === 'cardmanager' ? 'Quản lý' :
                         'Thông tin hệ thống'}
                    </h1>
                    <div className={styles.userProfile}>
                        <span className={styles.userName}>Chào, {adminName}</span>
                        <div className={styles.avatar}>A</div>
                        <button onClick={handleLogout} className={styles.logoutBtn} title="Đăng xuất">
                            <FontAwesomeIcon icon={faArrowRightFromBracket} />
                        </button>
                    </div>
                </div>

                <div className={styles.contentBody}>
                    <div style={{ display: activeTab === 'home' ? 'block' : 'none' }}>
                        <TabHome
                            trigger={triggerTabHistory}
                            triggerNewCard={triggerNewCard}
                            cardId={cardId}
                            wsSend={wsSend}
                            globalSearch={globalSearch}
                        />
                    </div>

                    <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
                        <TabHistory globalSearch={globalSearch} />
                    </div>

                    <div style={{ display: activeTab === 'cardmanager' ? 'block' : 'none' }}>
                        <TabCardManager
                            trigger={triggerTabCardManager}
                            cardIdAdd={cardIdAdd}
                            triggerNewCardAdd={triggerNewCardAdd}
                            globalSearch={globalSearch}
                        />
                    </div>

                    <div style={{ display: activeTab === 'info' ? 'block' : 'none' }}>
                        <TabInfo />
                    </div>
                </div>
            </div>

            {/* 💡 2. THÊM COMPONENT CHATBOT VÀO ĐÂY (Nổi trên cùng, không ảnh hưởng bố cục) */}
            {isLoggedIn && <AIChat />}
        </div>
    )
}

export default HomePage