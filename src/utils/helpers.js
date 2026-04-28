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