import api from './api'; // Đảm bảo đường dẫn import api.js chính xác

export const topicService = {
  // 1. Lấy danh sách Topics
  getAll: async (skip = 0, limit = 100, isFeatured = null) => {
    let url = `/topics/?skip=${skip}&limit=${limit}`;
    if (isFeatured !== null) {
      url += `&is_featured=${isFeatured}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // 2. Lấy Thống kê số lượng theo mảng ID
  getBulkStats: async (topicIds) => {
    const response = await api.post('/topics/bulk-stats', {
      topic_ids: topicIds
    });
    return response.data;
  },

  // 3. Lấy 1 Topic theo Slug (Bao gồm Categories Root bên trong)
  getWithRootCategories: async (slug) => {
    const response = await api.get(`/topics/slug/${slug}/root-categories`);
    return response.data;
  },

  // 4. Lấy 1 Topic theo Slug (Bao gồm Categories bên trong)
  getBySlug: async (slug) => {
    const response = await api.get(`/topics/slug/${slug}`);
    return response.data;
  },
  

  // 5. Các API Admin (Thêm, Sửa, Xóa)
  create: async (data) => {
    const response = await api.post('/topics/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/topics/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/topics/${id}`);
    return response.data;
  }
};