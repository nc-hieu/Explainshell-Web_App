import api from './api';

export const userService = {
  // Lấy danh sách tất cả người dùng (Admin)
  getAll: async (skip = 0, limit = 100) => {
    const response = await api.get(`/users/?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Lấy thông tin 1 user theo ID (Admin)
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Cập nhật thông tin user (Admin có thể đổi cả role)
  update: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Xóa user (Admin)
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};
