import api from './api';

export const historyService = {
  // Lấy toàn bộ lịch sử của người dùng hiện tại (Token tự động lo việc định danh)
  getAll: async () => {
    const response = await api.get('/histories/me');
    return response.data;
  },

  // Lấy lịch sử của người dùng hiện tại mà không lặp lại (Token tự động lo việc định danh)
  getUniqueRecent: async (count) => {
    const response = await api.get(`/histories/me/recent-unique?limit=${count}`);
    return response.data;
  },

  // ==========================================
  // ADMIN APIs
  // ==========================================

  // Lấy toàn bộ lịch sử của hệ thống (Admin)
  getAllAdmin: async (skip = 0, limit = 100) => {
    const response = await api.get(`/histories/?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Lấy danh sách histories theo status (Admin)
  getByStatus: async (status, params = {}) => {
    const queryParams = new URLSearchParams({ status, ...params });
    const response = await api.get(`/histories/by-status?${queryParams.toString()}`);
    return response.data;
  },

  // Lấy thống kê tổng số theo status (Admin)
  getStatusSummary: async (fromDate = null, toDate = null) => {
    const queryParams = new URLSearchParams();
    if (fromDate) queryParams.append('from_date', fromDate);
    if (toDate) queryParams.append('to_date', toDate);
    const queryString = queryParams.toString();
    const response = await api.get(`/histories/status-summary${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  // Thêm một lịch sử mới
  create: async (data) => {
    // data có dạng: { command_text: "tar", explanation: "Lưu trữ file" }
    const response = await api.post('/histories/', data);
    return response.data;
  },

  // (Tùy chọn) Xóa một lịch sử nếu
  delete: async (id) => {
    const response = await api.delete(`/histories/${id}`);
    return response.data;
  },

  // (Tùy chọn) Xóa toàn bộ lịch sử
  deleteAll: async () => {
    const response = await api.delete('/histories/me/clear');
    return response.data;
  }
};