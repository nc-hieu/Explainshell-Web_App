import api from './api';

export const categoryService = {
  // Lấy danh sách toàn bộ danh mục
  getAll: async (skip, limit) => {
    const response = await api.get(`/categories/?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Lấy danh sách danh mục gốc (Cấp 1)
  getRoots: async () => {
    const response = await api.get('/categories/roots');
    return response.data;
  },

  // Lấy thống kê số lượng cho nhiều danh mục cùng lúc
  getBulkStats: async (categoryIds) => {
    const response = await api.post('/categories/bulk-stats', {
      category_ids: categoryIds
    });
    return response.data;
  },

  // Lấy chi tiết danh mục theo Slug (Dành cho Trang 2 sắp tới)
  getBySlug: async (slug) => {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data;
  },
  
  // Thêm danh mục mới
  create: async (data) => {
    const response = await api.post('/categories/', data);
    return response.data;
  },
  
  // Cập nhật danh mục
  update: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
  
  // Xóa danh mục
  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};