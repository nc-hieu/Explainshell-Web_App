import api from './api';

export const osDistributionService = {
  getAll: async (skip = 0, limit = 100) => {
    let url = `/os-distributions/?skip=${skip}&limit=${limit}`;
    const response = await api.get(url);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post(`/os-distributions/`, data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/os-distributions/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/os-distributions/${id}`);
    return response.data;
  }
};