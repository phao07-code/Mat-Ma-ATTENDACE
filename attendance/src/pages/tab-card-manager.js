import styles from '../styles/tab-card-manager.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEdit, faTrash, faUsers } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState, useRef } from 'react'
import { getAllUser, addUser, editUser, deleteUser, getUserByIdCard } from './api/networking' // Đã thêm getUserByIdCard
import { convertDateTime, getDateTime } from './api/convert-time'

// --- MODAL THÊM MỚI (ĐÃ SỬA: KIỂM TRA THẺ TỒN TẠI NGAY KHI QUÉT) ---
const ModalAdd = (props) => {
    const [cardId, setCardId] = useState("");
    const [userName, setUserName] = useState("");
    const [maSinhVien, setMaSinhVien] = useState("");
    const [isChecking, setIsChecking] = useState(false); // Thêm trạng thái kiểm tra

    // 💡 LOGIC QUAN TRỌNG: Cập nhật cardId và kiểm tra thẻ khi thẻ mới được quét
    useEffect(() => {
        // Chỉ xử lý nếu modal đang mở và có ID thẻ mới được quét
        if (props.show && props.cardIdAdd && !isChecking) {
            
            setCardId(props.cardIdAdd);
            
            // 💡 THÊM LOGIC KIỂM TRA THẺ KHI QUÉT LẠI
            const checkCardOnScan = async (id) => {
                setIsChecking(true);
                
                // Kiểm tra xem ID thẻ vừa quét đã tồn tại chưa
                const checkRes = await getUserByIdCard(id);
                
                if (checkRes && checkRes.length > 0) {
                    // Thẻ đã tồn tại: Hiển thị thông báo
                    alert(`Thẻ ${id} đã tồn tại trong hệ thống. Thẻ này thuộc về: ${checkRes[0].username} (MSSV: ${checkRes[0].maSinhVien}). Vui lòng quét thẻ khác.`);
                    setCardId(""); // Xóa ID thẻ khỏi input để người dùng quét lại thẻ khác
                }
                
                setIsChecking(false);
            };

            checkCardOnScan(props.cardIdAdd);
        }
    }, [props.cardIdAdd, props.triggerNewCardAdd, props.show]);

    // Reset form khi mở modal
    useEffect(() => {
        if (props.show) {
            setUserName("");
            setMaSinhVien("");
            setCardId(""); // Đảm bảo ID thẻ được reset khi mở modal mới
            // Nếu đã có thẻ được quét trước khi mở modal, điền luôn
            if (props.cardIdAdd) setCardId(props.cardIdAdd);
        }
    }, [props.show]);

    async function Save() {
        if (!cardId) return alert("Vui lòng quét thẻ để lấy mã thẻ!");
        if (!maSinhVien.trim() || !userName.trim()) return alert("Vui lòng nhập Mã sinh viên và Họ tên!");

        // Kiểm tra xem thẻ đã tồn tại chưa (Logic kiểm tra an toàn)
        const checkRes = await getUserByIdCard(cardId);
        if (checkRes && checkRes.length > 0) {
            return alert("Lỗi: Thẻ RFID này đã tồn tại trong hệ thống!");
        }

        const data = { 
            id_card: cardId, 
            username: userName.trim(), 
            maSinhVien: maSinhVien.trim(), 
            create_time: getDateTime() 
        };

        const res = await addUser(data);

        if (res === true) {
            alert("Thêm sinh viên thành công!");
            onCanelClick(); 
            props.handSaveSuccess();
        } else {
            const msg = res?.message || "Thêm thất bại!";
            if (msg.includes("Mã sinh viên")) alert("Lỗi: Mã sinh viên đã tồn tại!");
            else if (msg.includes("id_card")) alert("Lỗi: Thẻ RFID đã được dùng!");
            else alert("Lỗi: " + msg);
        }
    }

    function onCanelClick() {
        setCardId(""); setUserName(""); setMaSinhVien(""); 
        props.handleClose();
    }

    return (
        <div className={styles.modalOverlay} style={{ display: props.show ? 'flex' : 'none' }}>
            <div className={styles.modalList}>
                <div className={styles.modalHeaderList}>
                    <h3>Thêm sinh viên mới</h3>
                    <button className={styles.closeBtnList} onClick={onCanelClick}>×</button>
                </div>
                <div className={styles.modalBodyList}>
                    <div className={styles.field}>
                        <label>ID Card <span style={{color: '#ef4444', fontSize: '0.8rem'}}>{cardId ? '(Đã quét)' : '(Quét thẻ để nhập)'}</span></label>
                        <input 
                            value={cardId || (isChecking ? "Đang kiểm tra..." : "Đang chờ quét thẻ...")} 
                            disabled 
                            style={{ fontWeight: 'bold', color: cardId ? '#10b981' : '#64748b' }}
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Mã sinh viên</label>
                        <input value={maSinhVien} onChange={(e) => setMaSinhVien(e.target.value)} placeholder="VD: 20210001" />
                    </div>
                    <div className={styles.field}>
                        <label>Họ và tên</label>
                        <input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Nhập họ tên" />
                    </div>
                </div>
                <div className={styles.modalFooterList}>
                    <button className={styles.btnCancelList} onClick={onCanelClick}>Hủy</button>
                    <button className={styles.btnSaveList} onClick={Save} disabled={isChecking}>Lưu</button>
                </div>
            </div>
        </div>
    )
}

// --- MODAL SỬA (Giữ nguyên) ---
const ModalEdit = (props) => {
    const [newCardID, setNewCardID] = useState('');
    const [newUserName, setNewUserName] = useState('');
    const [newMaSinhVien, setNewMaSinhVien] = useState('');

    useEffect(() => {
        if (props.dataRow) {
            setNewCardID(props.dataRow.id_card || '');
            setNewUserName(props.dataRow.username || '');
            setNewMaSinhVien(props.dataRow.maSinhVien || '');
        }
    }, [props.dataRow]);

    async function Save() {
        if (!newCardID.trim() || !newUserName.trim() || !newMaSinhVien.trim()) return alert("Vui lòng nhập đầy đủ!");

        const dataToUpdate = { 
            id_card: newCardID.trim(), 
            username: newUserName.trim(), 
            maSinhVien: newMaSinhVien.trim() 
        };
        const res = await editUser([dataToUpdate, props.dataRow.id]);

        if (res === true) {
            alert("Cập nhật thành công!");
            props.handSaveSuccess();
        } else {
            const msg = res?.message || "Cập nhật thất bại!";
            if (msg.includes("Mã sinh viên")) alert("Lỗi: Mã sinh viên đã tồn tại!");
            else if (msg.includes("id_card")) alert("Lỗi: Thẻ RFID đã được dùng!");
            else alert("Lỗi: " + msg);
        }
    }

    return (
        <div className={styles.modalOverlay} style={{ display: props.dataRow ? 'flex' : 'none' }}>
            <div className={styles.modalList}>
                <div className={styles.modalHeaderList}>
                    <h3>Chỉnh sửa thông tin</h3>
                    <button className={styles.closeBtnList} onClick={() => props.handSaveSuccess()}>×</button>
                </div>
                <div className={styles.modalBodyList}>
                    <div className={styles.field}>
                        <label>ID Card</label>
                        <input value={newCardID} onChange={(e) => setNewCardID(e.target.value)} />
                    </div>
                    <div className={styles.field}>
                        <label>Mã sinh viên</label>
                        <input value={newMaSinhVien} onChange={(e) => setNewMaSinhVien(e.target.value)} />
                    </div>
                    <div className={styles.field}>
                        <label>Họ và tên</label>
                        <input value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
                    </div>
                </div>
                <div className={styles.modalFooterList}>
                    <button className={styles.btnCancelList} onClick={() => props.handSaveSuccess()}>Hủy</button>
                    <button className={styles.btnSaveList} onClick={Save}>Lưu</button>
                </div>
            </div>
        </div>
    )
}

// --- MAIN COMPONENT (Giữ nguyên) ---
const TabCardManager = ({ trigger, cardIdAdd, triggerNewCardAdd, globalSearch = "" }) => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [showModalAdd, setShowModalAdd] = useState(false);
    const [dataRow, setDataRow] = useState(null); // Dùng cho Modal Edit

    useEffect(() => {
        getCardManager();
    }, [trigger]);

    const getCardManager = async () => {
        const res = await getAllUser();
        if (res) {
            setData(res);
            setFilteredData(res);
        }
    };

    // LỌC + ĐẾM THEO globalSearch
    useEffect(() => {
        if (!globalSearch.trim()) {
            setFilteredData(data);
            return;
        }

        const term = globalSearch.toLowerCase();
        const filtered = data.filter(item =>
            (item.maSinhVien && item.maSinhVien.toLowerCase().includes(term)) ||
            (item.username && item.username.toLowerCase().includes(term))
        );
        setFilteredData(filtered);
    }, [globalSearch, data]);

    const handSaveSuccess = () => {
        setShowModalAdd(false);
        setDataRow(null); // Đóng modal edit
        getCardManager();
    };

    const handEditClick = (row) => {
        setDataRow(row); // Mở modal edit
    };

    const handDeleteClick = async (row) => {
        if (window.confirm(`Xóa sinh viên: ${row.username} (MSSV: ${row.maSinhVien || 'N/A'})?`)) {
            const res = await deleteUser(row.id);
            if (res) {
                alert("Xóa thành công!");
                getCardManager();
            } else {
                alert("Xóa thất bại!");
            }
        }
    };

    const totalStudents = data.length;
    const displayedStudents = filteredData.length;

    return (
        <div className={styles.container}>
            {/* HEADER */}
            <div className={styles.header}>
                <div className={styles.titleWithCount}>
                    <h2>Danh sách</h2>
                    <div className={styles.studentCount}>
                        <FontAwesomeIcon icon={faUsers} className={styles.countIcon} />
                        {globalSearch ? (
                            <span>Tìm thấy <strong>{displayedStudents}</strong> trong <strong>{totalStudents}</strong> sinh viên</span>
                        ) : (
                            <span>Tổng cộng: <strong>{totalStudents}</strong> sinh viên</span>
                        )}
                    </div>
                </div>
                <div className={styles.controls}>
                    <button className={styles.addBtn} onClick={() => setShowModalAdd(true)}>
                        <FontAwesomeIcon icon={faPlus} /> Thêm mới
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Mã sinh viên</th>
                            <th>Họ và tên</th>
                            <th>ID Card</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="6" className={styles.empty}>
                                    {globalSearch ? "Không tìm thấy sinh viên phù hợp" : "Chưa có sinh viên nào"}
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{index + 1}</td>
                                    <td><strong>{item.maSinhVien || '--'}</strong></td>
                                    <td>{item.username}</td>
                                    <td><code>{item.id_card}</code></td>
                                    <td>{convertDateTime(item.create_time)}</td>
                                    <td className={styles.actions}>
                                        <button className={styles.btnEdit} onClick={() => handEditClick(item)} title="Sửa">
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button className={styles.btnDelete} onClick={() => handDeleteClick(item)} title="Xóa">
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODALS */}
            <ModalAdd 
                show={showModalAdd} 
                handleClose={() => setShowModalAdd(false)} 
                cardIdAdd={cardIdAdd} 
                triggerNewCardAdd={triggerNewCardAdd} 
                handSaveSuccess={handSaveSuccess} 
            />
            {dataRow && <ModalEdit dataRow={dataRow} handSaveSuccess={handSaveSuccess} />}
        </div>
    )
}

export default TabCardManager