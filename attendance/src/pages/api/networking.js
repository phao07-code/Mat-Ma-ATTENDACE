// src/pages/api/networking.js

const baseURL = 'http://127.0.0.1:42600/api'

// ----------------------------------------------------
// 💡 Cấu hình chung cho FETCH
// ----------------------------------------------------
const defaultFetchOptions = (method = 'GET', data = null) => {
    const options = {
        method: method,
        credentials: 'include', // QUAN TRỌNG: Gửi cookie session
        headers: {}
    };

    if (method !== 'GET' && data !== null) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
    }
    return options;
};

// ----------------------------------------------------
// HISTORY API
// ----------------------------------------------------

async function getAllHistory() {
    const res = await fetch(`${baseURL}/history/all`, defaultFetchOptions('GET'));
    const resJson = await res.json();
    return resJson?.result?.status === 'success' ? resJson.result.data : null;
}

async function getHistory(limit) {
    const res = await fetch(`${baseURL}/history/get/${limit}`, defaultFetchOptions('GET'));
    const resJson = await res.json();
    return resJson?.result?.status === 'success' ? resJson.result.data : null;
}

async function getHistoryById(data) {
    const res = await fetch(`${baseURL}/history/get-by-id/${data.id_card}/${data.from}/${data.to}`, defaultFetchOptions('GET'));
    const resJson = await res.json();
    return resJson?.result?.status === 'success' ? resJson.result.data : null;
}

async function filterHistory(data) {
    const res = await fetch(`${baseURL}/history/filter/${data.from}/${data.to}/${data.sort}`, defaultFetchOptions('GET'));
    const resJson = await res.json();
    return resJson?.result?.status === 'success' ? resJson.result.data : null;
}

async function addHistory(data) {
    try {
        const res = await fetch(`${baseURL}/history/add`, defaultFetchOptions('POST', data));
        const json = await res.json();
        console.log("addHistory response:", json); 
        return json;
    } catch (err) {
        console.error("Lỗi addHistory:", err);
        return { result: { status: 'error', message: 'Lỗi kết nối' } };
    }
}

async function updateHistory(data) {
    try {
        const res = await fetch(`${baseURL}/history/update`, defaultFetchOptions('PUT', data));
        const json = await res.json();
        console.log("updateHistory response:", json);
        return json;
    } catch (err) {
        console.error("Lỗi updateHistory:", err);
        return { result: { status: 'error', message: 'Lỗi kết nối' } };
    }
}

// ----------------------------------------------------
// USER API
// ----------------------------------------------------

async function getAllUser() {
    const res = await fetch(`${baseURL}/user/all/`, defaultFetchOptions('GET'));
    const resJson = await res.json();
    return resJson?.result?.status === 'success' ? resJson.result.data : null;
}

async function getUserByIdCard(idCard) {
    const res = await fetch(`${baseURL}/user/get-by-id-card/${idCard}`, defaultFetchOptions('GET'));
    const resJson = await res.json();
    return resJson?.result?.status === 'success' ? resJson.result.data : null;
}

async function addUser(data) {
    const res = await fetch(`${baseURL}/user/add/`, defaultFetchOptions('POST', data));
    const resJson = await res.json();
    return resJson; 
}

async function editUser(data) {
    const res = await fetch(`${baseURL}/user/update/`, defaultFetchOptions('PUT', data));
    const resJson = await res.json();
    return resJson;
}

async function deleteUser(id) {
    const res = await fetch(`${baseURL}/user/delete/${id}`, defaultFetchOptions('DELETE'));
    const resJson = await res.json();
    return resJson;
}

// ----------------------------------------------------
// ADMIN API
// ----------------------------------------------------

async function adminLogin(credentials) {
    try {
        const res = await fetch(`${baseURL}/login`, defaultFetchOptions('POST', credentials));
        return await res.json(); 
    } catch (err) {
        console.error("Lỗi adminLogin:", err);
        return { success: false, message: 'Lỗi kết nối mạng hoặc server không phản hồi.' };
    }
}

async function adminCheckAuth() {
    try {
        const res = await fetch(`${baseURL}/check-auth`, defaultFetchOptions('GET'));
        return await res.json();
    } catch (err) {
        console.error("Lỗi adminCheckAuth:", err);
        return { isLoggedIn: false, message: 'Lỗi kết nối mạng.' };
    }
}

async function adminLogout() {
    try {
        const res = await fetch(`${baseURL}/logout`, defaultFetchOptions('POST'));
        return await res.json();
    } catch (err) {
        console.error("Lỗi adminLogout:", err);
        return { success: false, message: 'Lỗi kết nối mạng hoặc server.' };
    }
}

// ----------------------------------------------------
// 💡 HÀM TẢI FILE CSV
// ----------------------------------------------------
async function downloadCSV(filter = {}) {
    try {
        const queryParams = new URLSearchParams(filter).toString();
        const res = await fetch(`${baseURL}/export/csv?${queryParams}`, defaultFetchOptions('GET'));
        
        if (!res.ok) {
            console.error("Lỗi server khi tải CSV:", res.status, res.statusText);
            return false;
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        
        let dateString = new Date().toISOString().slice(0,10);

        if (filter.from && filter.to) {
            const dateFrom = filter.from.length >= 10 ? filter.from.substring(0, 10) : '';
            const dateTo = filter.to.length >= 10 ? filter.to.substring(0, 10) : '';

            if (dateFrom && dateTo) {
                if (dateFrom === dateTo) {
                    dateString = dateFrom;
                } else {
                    dateString = `${dateFrom}_den_${dateTo}`;
                }
            }
        }

        const fileName = `Bao_cao_diem_danh_${dateString}.csv`;
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        a.remove();
        window.URL.revokeObjectURL(url);
        
        return true;
    } catch (err) {
        console.error("Lỗi download CSV:", err);
        return false;
    }
}

// ----------------------------------------------------
// 💡 HÀM MỚI: CHAT VỚI AI
// ----------------------------------------------------
/**
 * Gửi câu hỏi đến Chatbot AI và nhận câu trả lời.
 * @param {string} question - Câu hỏi của người dùng.
 * @returns {Promise<string>} Câu trả lời từ AI.
 */
async function chatWithAI(question) {
    try {
        // Gửi request POST đến endpoint /api/ai/chat
        const res = await fetch(`${baseURL}/ai/chat`, defaultFetchOptions('POST', { question }));
        
        // Chuyển đổi phản hồi sang JSON
        const json = await res.json();
        
        // Kiểm tra xem backend có trả về thành công không
        if (json.success) {
            return json.answer;
        } else {
            return json.message || "Xin lỗi, server đang bận. Vui lòng thử lại sau.";
        }
    } catch (err) {
        console.error("Lỗi Chat AI:", err);
        return "Lỗi kết nối. Vui lòng kiểm tra mạng.";
    }
}

// ----------------------------------------------------

export {
    getAllHistory,
    getHistory,
    getHistoryById,
    filterHistory,
    addHistory,
    updateHistory,
    getAllUser,
    getUserByIdCard,
    addUser,
    editUser,
    deleteUser,
    adminLogin,
    adminCheckAuth,
    adminLogout,
    downloadCSV,
    // 💡 EXPORT HÀM MỚI
    chatWithAI 
}
// import axios from 'axios';

// var baseURL = 'http://113.161.240.83:42600/api/'

// const axios_mysql = axios.create({
//     baseURL: baseURL,
//     headers: { "Access-Control-Allow-Origin": "*", 'Access-Control-Allow-Credentials': true },
//     timeout: 5000,
//     withCredentials: true,
//     crossDomain: true
// });

// async function getAllHistory() {
//     const res = await axios_mysql.get(`history/all`)
//     const resJson = await res.json()
//     if (resJson.result.status === 'success') {
//         return resJson.result.data
//     }
//     else {
//         return null
//     }
// }

// async function getHistory(limit) {
//     const res = await axios_mysql.get(`history/get/${limit}`)
//     if (res.data.result.status === 'success') {
//         return res.data.result.data
//     }
//     else {
//         return null
//     }
// }

// async function getHistoryById(data) {
//     const res = await axios_mysql.get(`history/get-by-id/${data.id_card}/${data.from}/${data.to}`)
//     if (res.data.result.status === 'success') {
//         return res.data.result.data
//     }
//     else {
//         return null
//     }
// }

// async function filterHistory(data) {
//     const res = await axios_mysql.get(`history/filter/${data.from}/${data.to}/${data.sort}`)
//     if (res.data.result.status === 'success') {
//         return res.data.result.data
//     }
//     else {
//         return null
//     }
// }

// async function addHistory(data) {
//     const res = await axios_mysql.post(`history/add`, data)
//     if (res.data.result.status === 'success') {
//         return true
//     }
//     else {
//         return false
//     }
// }

// async function updateHistory(data) {
//     const res = await axios_mysql.put(`history/update`, data)
//     if (res.data.result.status === 'success') {
//         return true
//     }
//     else {
//         return false
//     }
// }

// async function getAllUser() {
//     const res = await axios_mysql.get(`user/all/`)
//     if (res.data.result.status === 'success') {
//         return res.data.result.data
//     }
//     else {
//         return null
//     }
// }

// async function getUserByIdCard(idCard) {
//     const res = await axios_mysql.get(`user/get-by-id-card/${idCard}`)
//     if (res.data.result.status === 'success') {
//         return res.data.result.data
//     }
//     else {
//         return null
//     }
// }

// async function addUser(data) {
//     const res = await axios_mysql.post(`user/add/`, data)
//     if (res.data.result.status === 'success') {
//         return true
//     }
//     else {
//         return false
//     }
// }

// async function editUser(data) {
//     const res = await axios_mysql.put(`user/update/`, data)
//     if (res.data.result.status === 'success') {
//         return true
//     }
//     else {
//         return false
//     }
// }

// async function deleteUser(id) {
//     const res = await axios_mysql.delete(`user/delete/${id}`)
//     if (res.data.result.status === 'success') {
//         return true
//     }
//     else {
//         return false
//     }
// }

// export {
//     getAllHistory,
//     getHistory,
//     getHistoryById,
//     filterHistory,
//     addHistory,
//     updateHistory,
//     getAllUser,
//     getUserByIdCard,
//     addUser,
//     editUser,
//     deleteUser
// }