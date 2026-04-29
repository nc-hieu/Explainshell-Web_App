import axios from 'axios';

// 1. Khởi tạo một instance của Axios với URL gốc
const api = axios.create({
  // Lấy URL từ biến môi trường chúng ta vừa tạo ở file .env
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Can thiệp vào Request trước khi gửi đi (Để gắn Token)
api.interceptors.request.use(
  (config) => {
    // Lấy token từ Local Storage (sẽ được lưu khi đăng nhập thành công)
    const token = localStorage.getItem('access_token');
    
    // Nếu có token, gắn nó vào Header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// // 3. Can thiệp vào Response khi Backend trả dữ liệu về (Để xử lý lỗi chung)
// api.interceptors.response.use(
//   (response) => {
//     // Trả về trực tiếp dữ liệu nếu gọi thành công
//     return response; 
//   },
//   (error) => {
//     // Bắt lỗi 401 (Unauthorized) - Thường do sai token hoặc token hết hạn
//     if (error.response && error.response.status === 401) {
//       console.error("Token không hợp lệ hoặc đã hết hạn. Yêu cầu đăng nhập lại.");
//       localStorage.removeItem('access_token'); // Xóa token cũ
      
//       // Chuyển hướng người dùng về trang đăng nhập
//       // Lưu ý: Dùng window.location cho an toàn khi nằm ngoài React Component
//       if (window.location.pathname !== '/admin/login') {
//         window.location.href = '/admin/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

api.interceptors.request.use(
  (config) => {
    // Bảo Axios lấy chìa khóa từ ngăn 'access_token'
    const token = localStorage.getItem('access_token'); 
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Bắt lỗi 401 thông minh
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;

      // Dọn dẹp sạch sẽ ngăn 'access_token' khi bị lỗi 401
      localStorage.removeItem('access_token'); 

      if (!currentPath.includes('/login') && !currentPath.includes('/auth')) {
        if (currentPath.startsWith('/admin')) {
          window.location.href = '/admin/login';
        } else {
          window.location.href = '/auth';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
