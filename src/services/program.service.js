import api from './api';

export const programService = {
  // Lấy danh sách lệnh
  getAll: async (skip = 0, limit = 100) => {
    const response = await api.get(`/programs/?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Thêm lệnh mới
  create: async (data) => {
    const response = await api.post('/programs/', data);
    return response.data;
  },
  
  // Cập nhật lệnh
  update: async (id, data) => {
    const response = await api.put(`/programs/${id}`, data);
    return response.data;
  },
  
  // Xóa lệnh
  delete: async (id) => {
    const response = await api.delete(`/programs/${id}`);
    return response.data;
  },

  // Tìm kiếm lệnh
  search: async (query) => {
    // Lưu ý: Cấu hình params 'keyword' hay 'q' tùy thuộc vào Backend FastAPI của bạn quy định.
    // Ở đây tôi đang giả định backend dùng ?keyword=...
    const response = await api.get(`/programs/search`, { params: { query } });
    console.log("API Search Response:", response.data); // Debug: Xem dữ liệu trả về từ API
    return response.data;
  },

  // Lấy chi tiết lệnh (bao gồm options, categories...) Theo ID
  getDetails: async (id) => {
    const response = await api.get(`/programs/${id}/details`);
    return response.data;
  },

    // Lấy chi tiết lệnh (bao gồm options, categories...) Theo Slug
  getDetailsBySlug: async (slug) => {
    const response = await api.get(`/programs/slug/${slug}/details`);
    return response.data;
  },

  assignCategories: async (programId, categoryIds) => {
    const response = await api.put(`/program-categories/${programId}`, {
      category_ids: categoryIds
    });
    return response.data;
  }
};

