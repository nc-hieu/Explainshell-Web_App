import api from './api';

export const optionService = {
  // Lấy danh sách cờ của một Program cụ thể
  getByProgram: async (programId) => {
    const response = await api.get(`/options/program/${programId}`);
    return response.data;
  },
  
  // Thêm cờ mới
  create: async (programId, data) => {
    const response = await api.post(`/options/program/${programId}`, data);
    return response.data;
  },
  
  update: async (optionId, data) => {
    const response = await api.put(`/options/${optionId}`, data);
    return response.data;
  },
  
  // Xóa cờ
  delete: async (id) => {
    const response = await api.delete(`/options/${id}`);
    return response.data;
  }
};