import api from './api';

export const favoriteService = {
  // Check xem đã yêu thích chưa (Dùng ở trang ProgramDetails)
  check: async (programId) => {
    const response = await api.get(`/favorites/program/${programId}/check`);
    return response.data;
  },

  // Bật/Tắt yêu thích (Dùng ở trang ProgramDetails)
  toggle: async (programId) => {
    const response = await api.post(`/favorites/program/${programId}/toggle`);
    return response.data;
  },

  // ---------------- CÁC API MỚI CHO TRANG PROFILE ----------------

  // Lấy danh sách yêu thích của User hiện tại (hỗ trợ phân trang bằng skip và limit)
  getMyFavorites: async (skip = 0, limit = 50) => {
    const response = await api.get(`/favorites/me?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Bỏ yêu thích 1 lệnh trực tiếp trong Tab Yêu thích
  removeFavorite: async (programId) => {
    const response = await api.delete(`/favorites/program/${programId}`);
    return response.data;
  }
};