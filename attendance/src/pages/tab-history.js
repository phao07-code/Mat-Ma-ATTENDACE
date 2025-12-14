// src/pages/tab-history.js

import styles from '../styles/tab-history.module.css'
import { useState, useEffect } from 'react'
import { convertDateTime, getCurrentDate } from './api/convert-time'
// Import hàm downloadCSV
import { filterHistory, downloadCSV } from './api/networking' 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileExport } from '@fortawesome/free-solid-svg-icons' 

const TabHistory = ({ globalSearch = "" }) => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [dateFrom, setDateFrom] = useState(getCurrentDate());
    const [timeFrom, setTimeFrom] = useState("00:00");
    const [dateTo, setDateTo] = useState(getCurrentDate());
    const [timeTo, setTimeTo] = useState("23:59");
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false); 

    useEffect(() => {
        filterHistoryData();
    }, []);

    const filterHistoryData = async () => {
        setIsLoading(true);
        const dataFilter = {
            from: `${dateFrom} ${timeFrom}:00`,
            to: `${dateTo} ${timeTo}:59`,
            sort: "DESC"
        };

        try {
            const res = await filterHistory(dataFilter);
            if (res && Array.isArray(res)) {
                setData(res);
                setFilteredData(res);
            }
        } catch (err) {
            console.error("Lỗi lọc:", err);
            setData([]);
            setFilteredData([]);
        } finally {
            setIsLoading(false);
        }
    };

    // LỌC THEO globalSearch
    useEffect(() => {
        const term = globalSearch.toLowerCase();
        const filtered = data.filter(item =>
            (item.maSinhVien && item.maSinhVien.toLowerCase().includes(term)) ||
            (item.username && item.username.toLowerCase().includes(term))
        );
        setFilteredData(filtered);
    }, [globalSearch, data]);

    const onClickFilter = () => filterHistoryData();
    
    // 💡 HÀM XỬ LÝ XUẤT FILE (CÓ LỌC NGÀY)
    const handleExport = async () => {
        setIsExporting(true);

        // 1. Tạo bộ lọc từ state ngày giờ hiện tại
        const filterParams = {
            from: `${dateFrom} ${timeFrom}:00`,
            to: `${dateTo} ${timeTo}:59`
        };

        // 2. Gọi hàm download và truyền bộ lọc
        const success = await downloadCSV(filterParams);
        
        if (!success) {
            alert("Có lỗi khi tải file báo cáo!");
        }
        setIsExporting(false);
    };

    return (
        <div className={styles.historyContainer}>
            <div className={styles.filterBar}>
                <div className={styles.filterGroup}>
                    <label>Từ ngày</label>
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                    <input type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} />
                </div>
                <div className={styles.filterGroup}>
                    <label>Đến ngày</label>
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                    <input type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} />
                </div>
                
                <button className={styles.filterBtn} onClick={onClickFilter} disabled={isLoading}>
                    {isLoading ? 'Đang lọc...' : 'Lọc dữ liệu'}
                </button>

                {/* NÚT XUẤT CSV */}
                <button 
                    className={styles.filterBtn} 
                    onClick={handleExport}
                    disabled={isExporting}
                    style={{ marginLeft: '10px', background: '#10b981', borderColor: '#10b981' }} // Màu xanh lá
                >
                    {isExporting ? 'Đang tải...' : (
                        <>
                            <FontAwesomeIcon icon={faFileExport} style={{marginRight: '8px'}} />
                            Xuất Excel/CSV
                        </>
                    )}
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.historyTable}>
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
                        {isLoading ? (
                            <tr><td colSpan="6" className={styles.loading}>Đang tải...</td></tr>
                        ) : filteredData.length === 0 ? (
                            <tr><td colSpan="6" className={styles.empty}>Không tìm thấy dữ liệu</td></tr>
                        ) : (
                            filteredData.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{index + 1}</td>
                                    <td>{item.id_card}</td>
                                    <td>{item.maSinhVien || '--'}</td>
                                    <td>{item.username || '--'}</td>
                                    <td>{item.date_time_in ? convertDateTime(item.date_time_in) : '--'}</td>
                                    <td>{item.date_time_out ? convertDateTime(item.date_time_out) : '--'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TabHistory