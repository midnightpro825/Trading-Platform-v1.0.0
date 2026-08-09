import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ============================================================
// AUTH & USER
// ============================================================
export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const register = async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get('/user/profile');
    return response.data;
};

export const updateProfile = async (data) => {
    const response = await api.put('/user/profile', data);
    return response.data;
};

export const changePassword = async (data) => {
    const response = await api.put('/user/password', data);
    return response.data;
};

// ============================================================
// BALANCE
// ============================================================
export const getBalance = async (userId) => {
    const response = await api.get(`/balance${userId ? `?userId=${userId}` : ''}`);
    return response.data;
};

export const requestDeposit = async (data) => {
    const response = await api.post('/balance/deposit', data);
    return response.data;
};

// ============================================================
// ADMIN - USERS
// ============================================================
export const getUsers = async () => {
    const response = await api.get('/admin/users');
    return response.data;
};

export const getUserDetails = async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
};

export const updateUserStatus = async (id, isActive) => {
    const response = await api.put(`/admin/users/${id}/status`, { is_active: isActive });
    return response.data;
};

export const updateUserRole = async (id, role) => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
};

export const updateUserBalance = async (id, data) => {
    const response = await api.post(`/admin/users/${id}/balance`, data);
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
};

// ============================================================
// ADMIN - KYC
// ============================================================
export const getKYCRequests = async () => {
    const response = await api.get('/admin/kyc');
    return response.data;
};

export const getPendingKYC = async () => {
    const response = await api.get('/admin/kyc/pending');
    return response.data;
};

export const approveKYC = async (id) => {
    const response = await api.put(`/admin/kyc/${id}/approve`);
    return response.data;
};

export const rejectKYC = async (id, reason) => {
    const response = await api.put(`/admin/kyc/${id}/reject`, { reason });
    return response.data;
};

// ============================================================
// ADMIN - DEPOSITS
// ============================================================
export const getDeposits = async (status) => {
    const response = await api.get(`/admin/deposits${status ? `?status=${status}` : ''}`);
    return response.data;
};

export const getPendingDeposits = async () => {
    const response = await api.get('/admin/deposits/pending');
    return response.data;
};

export const approveDeposit = async (id) => {
    const response = await api.put(`/admin/deposits/${id}/approve`);
    return response.data;
};

export const rejectDeposit = async (id, reason) => {
    const response = await api.put(`/admin/deposits/${id}/reject`, { reason });
    return response.data;
};

// ============================================================
// ADMIN - WITHDRAWALS
// ============================================================
export const getWithdrawals = async (status) => {
    const response = await api.get(`/admin/withdrawals${status ? `?status=${status}` : ''}`);
    return response.data;
};

export const getPendingWithdrawals = async () => {
    const response = await api.get('/admin/withdrawals/pending');
    return response.data;
};

export const approveWithdrawal = async (id, txHash) => {
    const response = await api.put(`/admin/withdrawals/${id}/approve`, { tx_hash: txHash });
    return response.data;
};

export const rejectWithdrawal = async (id, reason) => {
    const response = await api.put(`/admin/withdrawals/${id}/reject`, { reason });
    return response.data;
};

// ============================================================
// ADMIN - ORDERS
// ============================================================
export const getOrders = async () => {
    const response = await api.get('/admin/orders');
    return response.data;
};

export const cancelOrder = async (id) => {
    const response = await api.delete(`/admin/orders/${id}`);
    return response.data;
};

// ============================================================
// ADMIN - MARKETS
// ============================================================
export const getMarkets = async () => {
    const response = await api.get('/admin/markets');
    return response.data;
};

export const createMarket = async (data) => {
    const response = await api.post('/admin/markets', data);
    return response.data;
};

export const updateMarket = async (id, data) => {
    const response = await api.put(`/admin/markets/${id}`, data);
    return response.data;
};

export const updateMarketStatus = async (id, status) => {
    const response = await api.put(`/admin/markets/${id}/status`, { status });
    return response.data;
};

export const deleteMarket = async (id) => {
    const response = await api.delete(`/admin/markets/${id}`);
    return response.data;
};

// ============================================================
// ADMIN - TRANSACTIONS
// ============================================================
export const getTransactions = async () => {
    const response = await api.get('/admin/transactions');
    return response.data;
};

// ============================================================
// ADMIN - SETTINGS
// ============================================================
export const getSettings = async () => {
    const response = await api.get('/admin/settings');
    return response.data;
};

export const updateSettings = async (data) => {
    const response = await api.put('/admin/settings', data);
    return response.data;
};

// ============================================================
// ADMIN - STATS
// ============================================================
export const getAdminStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
};

// ============================================================
// ADMIN - LOGS
// ============================================================
export const getAdminLogs = async (limit = 100) => {
    const response = await api.get(`/admin/logs?limit=${limit}`);
    return response.data;
};

// ============================================================
// ADMIN - REFERRALS
// ============================================================
export const getReferrals = async () => {
    const response = await api.get('/admin/referrals');
    return response.data;
};

// ============================================================
// ADMIN - NOTIFICATIONS
// ============================================================
export const sendBroadcast = async (data) => {
    const response = await api.post('/admin/notifications/broadcast', data);
    return response.data;
};

export default api;