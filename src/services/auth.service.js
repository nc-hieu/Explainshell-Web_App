import api from './api';

export const authService = {
  // 1. Đăng nhập chung (Lấy Token)
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  // 2. Lấy thông tin User hiện tại (Dùng chung cho cả User và Admin)
  getMe: async () => {
    const response = await api.get('/users/me'); 
    return response.data;
  },

  // 3. Đăng ký tài khoản (Dành cho Public)
  register: async (userData) => {
    const response = await api.post('/users/signup', {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      is_active: true,
      roles: 'user'
    });
    return response.data;
  }
};