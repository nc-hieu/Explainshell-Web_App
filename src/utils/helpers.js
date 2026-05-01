/**
 * Hàm chuyển đổi chuỗi bất kỳ (có dấu tiếng Việt) thành dạng slug (đường dẫn tĩnh)
 * Ví dụ: "Hướng dẫn cài đặt Docker" => "huong-dan-cai-dat-docker"
 */
export const generateSlug = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()                     // Chuyển thành chữ thường
    .normalize('NFD')                  // Chuẩn hóa Unicode để tách dấu ra khỏi chữ cái
    .replace(/[\u0300-\u036f]/g, '')   // Xóa các dấu
    .replace(/[đĐ]/g, 'd')             // Thay thế chữ Đ/đ thành d
    .replace(/([^0-9a-z-\s])/g, '')    // Xóa tất cả các ký tự đặc biệt (chỉ giữ lại chữ, số, gạch nối và khoảng trắng)
    .replace(/(\s+)/g, '-')            // Thay khoảng trắng bằng dấu gạch nối
    .replace(/-+/g, '-')               // Xóa các dấu gạch nối liên tiếp (vd: a---b thành a-b)
    .replace(/^-+|-+$/g, '');          // Xóa dấu gạch nối ở đầu và cuối chuỗi
};


//Hàm xử lý đường dẫn ảnh đồng nhất cho toàn bộ dự án
export const getImageUrl = (path) => {
  if (!path) return null;

  // Nếu path đã là một link hoàn chỉnh (vd: copy link từ Google), thì giữ nguyên
  if (path.startsWith('http')) return path;

  // 1. Lấy API_URL từ biến môi trường (Ví dụ: http://10.0.12.12:8080/api/v1)
  const apiUrl = import.meta.env.VITE_API_URL || '';

  // 2. Cắt bỏ đuôi '/api/v1' để lấy Base URL gốc của server (http://10.0.12.12:8080)
  // Lưu ý: Nếu sau này bạn đổi version API thành /api/v2, bạn chỉ cần sửa regex hoặc chuỗi replace ở đây
  const baseUrl = apiUrl.replace(/\/api\/v\d+$/, ''); 

  // 3. Đảm bảo path bắt đầu bằng dấu gạch chéo '/' để tránh lỗi thiếu dấu (vd: 8080uploads)
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
};