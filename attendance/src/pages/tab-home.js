import { useEffect, useState, useMemo, useRef } from 'react'
import styles from '../styles/tab-home.module.css'
import { convertDateTime, getCurrentDate, getDateTime } from './api/convert-time'
// Import đầy đủ các hàm API từ networking
import { getHistory, addHistory, getHistoryById, updateHistory, getUserByIdCard, filterHistory } from './api/networking' 

const TabHome = ({ trigger, cardId: propCardId, triggerNewCard, wsSend, globalSearch = "" }) => {
    // --- STATE QUẢN LÝ DỮ LIỆU ---
    // Mặc định chọn ngày hiện tại
    const [dateFilter, setDateFilter] = useState(getCurrentDate().split(' ')[0]);
    
    // Dữ liệu hiển thị trong bảng (đã lọc theo ngày)
    const [dateFilteredData, setDateFilteredData] = useState([]); 
    
    // Thông tin thẻ vừa quét
    const [cardId, setCardId] = useState("--");
    const [maSinhVien, setMaSinhVien] = useState("--");
    const [userName, setUserName] = useState("--");
    const [timeCreate, setTimeCreate] = useState("--");
    
    const [isLoading, setIsLoading] = useState(false);

    // --- 1. LOGIC TẢI LỊCH SỬ (GIỐNG CODE CŨ NHƯNG CÓ LỌC NGÀY) ---
    
    // Tải dữ liệu khi mở tab hoặc thay đổi ngày lọc
    useEffect(() => {
        loadHistory(); 
    }, [trigger, dateFilter]); 

    const loadHistory = async () => {
        setIsLoading(true);
        // Lọc theo ngày đang chọn
        const dataFilterPayload = {
            from: `${dateFilter} 00:00:00`,
            to: `${dateFilter} 23:59:59`,
            sort: "DESC"
        };

        try {
            const res = await filterHistory(dataFilterPayload);
            if (res && Array.isArray(res)) {
                setDateFilteredData(res); 
            } else {
                setDateFilteredData([]);
            }
        } catch (err) {
            console.error("Lỗi load lịch sử:", err);
            setDateFilteredData([]);
        } finally {
            setIsLoading(false);
        }
    };

    // --- 2. LOGIC XỬ LÝ THẺ (SỬA ĐỂ NHẬN THẺ LIÊN TỤC) ---

    // 💡 SỬ DỤNG useEffect LẮNG NGHE triggerNewCard ĐỂ XỬ LÝ MỌI LẦN QUÉT
    // (Thay vì chỉ lắng nghe propCardId thay đổi)
    useEffect(() => {
        // Chỉ xử lý nếu có ID thẻ hợp lệ (khác 0 hoặc null)
        if (propCardId && propCardId !== 0) {
            checkExistCardId(propCardId);
        }
    }, [propCardId, triggerNewCard]); // 💡 Quan trọng: Thêm triggerNewCard vào dependency

    const checkExistCardId = async (currentCardId) => {
        try {
            const res = await getUserByIdCard(currentCardId);
            if (res && res.length > 0) {
                const user = res[0];
                // Cập nhật giao diện thông tin thẻ
                setCardId(currentCardId);
                setMaSinhVien(user.maSinhVien || "--");
                setUserName(user.username || "--");
                setTimeCreate(convertDateTime(user.create_time));
                
                // Gửi tên người dùng (Xác nhận hợp lệ, còi kêu 1 tiếng)
                wsSend((user.username || "").normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
                
                // Kiểm tra trạng thái và ghi lịch sử
                await checkSateHistory(currentCardId);
            } else {
                
                wsSend("Thẻ không tồn tại"); 
                alert("Thẻ không tồn tại");
                resetCardInfo();
            }
        } catch (err) {
            console.error("Lỗi kiểm tra thẻ:", err);
            alert("Lỗi kết nối server!");
            resetCardInfo();
        }
    };

    const resetCardInfo = () => {
        setCardId("--"); setMaSinhVien("--"); setUserName("--"); setTimeCreate("--");
    };

    // Hàm xử lý reload lại dữ liệu sau khi ghi thành công
    const handleReloadHistory = () => {
        const scanDate = getCurrentDate().split(' ')[0];
        // Nếu ngày quét khác ngày đang xem, chuyển sang ngày quét
        if (scanDate !== dateFilter) {
            setDateFilter(scanDate); 
        } else {
            // Nếu cùng ngày, tải lại dữ liệu
            loadHistory(); 
        }
    }

    const addHistoryData = async (currentCardId) => {
        // Lấy lại thông tin user để đảm bảo chính xác
        const userRes = await getUserByIdCard(currentCardId);
        if (!userRes || userRes.length === 0) return;

        const data = {
            id_card: currentCardId,
            maSinhVien: userRes[0].maSinhVien || null,
            date_time_in: getDateTime(),
            date_time_out: null
        };

        const success = await addHistory(data);
        if (success) handleReloadHistory();
    };

    const checkSateHistory = async (currentCardId) => {
        // Kiểm tra lịch sử trong ngày hôm nay để xác định vào/ra
        const payload = { 
            id_card: currentCardId, 
            from: `${getCurrentDate()} 00:00:00`, 
            to: `${getCurrentDate()} 23:59:59` 
        };
        const res = await getHistoryById(payload);

        if (res && res.length > 0) {
            // Nếu bản ghi mới nhất đã có giờ ra -> Tạo lượt vào mới
            if (res[0].date_time_out) {
                await addHistoryData(currentCardId);
            } else {
                // Nếu chưa có giờ ra -> Cập nhật giờ ra (Checkout)
                const updateData = [{ date_time_out: getDateTime() }, res[0].id];
                const success = await updateHistory(updateData);
                if (success) handleReloadHistory();
            }
        } else {
            // Chưa có bản ghi nào trong ngày -> Tạo lượt vào mới
            await addHistoryData(currentCardId);
        }
    };

    // --- 3. LỌC DỮ LIỆU HIỂN THỊ (THEO globalSearch) ---
    const filteredData = useMemo(() => {
        let displayData = dateFilteredData;

        if (globalSearch.trim()) {
            const term = globalSearch.toLowerCase();
            displayData = dateFilteredData.filter(item =>
                (item.maSinhVien && item.maSinhVien.toLowerCase().includes(term)) ||
                (item.username && item.username.toLowerCase().includes(term))
            );
        }
        
        // Sắp xếp giảm dần theo thời gian vào
        return displayData.sort((a, b) => new Date(b.date_time_in) - new Date(a.date_time_in));
    }, [globalSearch, dateFilteredData]);


    // --- 4. RENDER GIAO DIỆN (GIỮ NGUYÊN GIAO DIỆN MỚI) ---
    return (
        <div className={styles.container}>
            {/* THÔNG TIN THẺ */}
            <div className={styles.cardSection}>
                <div className={styles.cardHeader}><h2>Thông tin thẻ</h2></div>
                <div className={styles.cardBody}>
                    <div className={styles.infoRow}><span className={styles.label}>ID Card</span><span className={styles.value}>{cardId}</span></div>
                    <div className={styles.infoRow}><span className={styles.label}>Mã sinh viên</span><span className={styles.value}>{maSinhVien}</span></div>
                    <div className={styles.infoRow}><span className={styles.label}>Họ và Tên</span><span className={styles.value}>{userName}</span></div>
                    <div className={styles.infoRow}><span className={styles.label}>Thời gian tạo</span><span className={styles.value}>{timeCreate}</span></div>
                </div>
            </div>

            {/* BẢNG SỰ KIỆN */}
            <div className={styles.tableSection}>
                <div className={styles.tableHeader}>
                    <div className={styles.headerContent}>
                        <h2>Thông tin sự kiện</h2>
                        <div className={styles.dateFilterGroup}>
                            <label className={styles.dateLabel}>Chọn Ngày:</label>
                            <input 
                                type="date" 
                                value={dateFilter} 
                                onChange={(e) => setDateFilter(e.target.value)}
                                className={styles.dateInput}
                            />
                        </div>
                        <span className={styles.recordCount}>Tổng: {filteredData.length} bản ghi</span>
                    </div>
                </div>
                <div className={styles.tableWrapper}>
                    {isLoading ? (
                         <div className={styles.loadingRow}>
                            <span className={styles.spinner}></span>
                            Đang tải...
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className={styles.emptyState}>
                            {globalSearch.trim() ? 
                                `Không tìm thấy sinh viên phù hợp trong ngày ${dateFilter}` : 
                                `Chưa có dữ liệu điểm danh cho ngày ${dateFilter}`
                            }
                        </div>
                    ) : (
                        <table className={styles.modernTable}>
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>ID Card</th>
                                    <th>Mã sinh viên</th>
                                    <th>Họ và Tên</th>
                                    <th>Thời gian vào</th>
                                    <th>Thời gian ra</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td>{item.id_card}</td>
                                        <td>{item.maSinhVien || '--'}</td>
                                        <td>{item.username || '--'}</td>
                                        <td>{item.date_time_in ? convertDateTime(item.date_time_in) : '--'}</td>
                                        <td>{item.date_time_out ? convertDateTime(item.date_time_out) : '--'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TabHome