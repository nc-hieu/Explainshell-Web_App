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

/**
 * Hàm lấy tên file từ đường dẫn đầy đủ
 * @param {string} filePath - Đường dẫn file (Ví dụ: "/uploads/4a8b772455ac45fe8caba2fb53dc13ae.png")
 * @returns {string} - Tên file thuần túy (Ví dụ: "4a8b772455ac45fe8caba2fb53dc13ae.png")
 */
export const getFileName = (filePath) => {
  // Kiểm tra nếu đường dẫn rỗng hoặc không phải chuỗi thì trả về chuỗi rỗng
  if (!filePath || typeof filePath !== 'string') {
    return '';
  }

  // Cắt chuỗi thành mảng bởi dấu '/' và lấy phần tử cuối cùng
  return filePath.split('/').pop();
};

/**
 * Kiểm tra xem chuỗi / mã HTML từ RichTextEditor có nội dung thực tế hay không (tránh trường hợp chỉ có thẻ rỗng như <p></p>, <br>, khoảng trắng).
 */
export const hasRichTextContent = (htmlOrText) => {
  if (!htmlOrText || typeof htmlOrText !== 'string') return false;
  // Xóa các thẻ HTML, ký tự &nbsp; và khoảng trắng thừa
  const textOnly = htmlOrText.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return textOnly.length > 0;
};

/**
 * Sao chép văn bản vào bộ nhớ tạm (hỗ trợ cả Clipboard API và fallback execCommand cho HTTP / Mobile)
 * @param {string} text - Đoạn text cần sao chép
 * @returns {Promise<boolean>} - Trả về true nếu thành công, false nếu thất bại
 */
export const copyToClipboard = async (text) => {
  if (!text || typeof text !== 'string') return false;

  // 1. Thử dùng Clipboard API hiện đại
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API không khả dụng hoặc bị chặn quyền, dùng fallback:', err);
    }
  }

  // 2. Fallback dùng textarea + document.execCommand cho HTTP / Mobile / Trình duyệt chặn quyền
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 99999); // Dành cho iOS

    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (err) {
    console.error('Fallback copy thất bại:', err);
    return false;
  }
};