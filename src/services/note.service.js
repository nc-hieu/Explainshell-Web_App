import api from './api';

export const noteService = {
  // Lấy toàn bộ ghi chú của 1 Lệnh (Program)
  getByProgram: async (programId) => {
    const response = await api.get(`/notes/program/${programId}`);
    return response.data;
  },
  
  // Xem chi tiết 1 Ghi chú (Nếu cần)
  getById: async (id) => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  // Tạo Ghi chú mới
  create: async (data) => {
    const response = await api.post('/notes/', data);
    return response.data;
  },

  // Cập nhật Ghi chú
  update: async (id, data) => {
    const response = await api.put(`/notes/${id}`, data);
    return response.data;
  },

  // Xóa Ghi chú
  delete: async (id) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  }
};