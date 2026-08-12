import api from './api';

export const manPageService = {
  getByProgram: async (programId) => {
    let url = `/man-pages/program/${programId}`;
    const response = await api.get(url);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post(`/man-pages/`, data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/man-pages/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/man-pages/${id}`);
    return response.data;
  }
};