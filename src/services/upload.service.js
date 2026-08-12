import api from './api';

export const uploadService = {
  uploadImage: async (formData) => {
    try {
      // Thêm tham số cấu hình headers vào request
      const response = await api.post('/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteImage: async (icon_url) => {
    try {
      // Thêm tham số cấu hình headers vào request
      const response = await api.delete(`/upload/${icon_url}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }, 
};
