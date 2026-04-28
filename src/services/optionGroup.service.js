import api from './api';

export const optionGroupService = {
  getByProgram: async (programId) => {
    const response = await api.get(`/option-groups/program/${programId}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post(`/option-groups/program/${data.program_id}`, data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/option-groups/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/option-groups/${id}`);
    return response.data;
  }
};