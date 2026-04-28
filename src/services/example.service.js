import api from './api';

export const exampleService = {
  getByProgram: async (programId) => {
    const response = await api.get(`/examples/program/${programId}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post(`/examples/program/${data.program_id}`, data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/examples/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/examples/${id}`);
    return response.data;
  }
};