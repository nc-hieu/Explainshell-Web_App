# Explainshell - Web App (Frontend)

Đây là giao diện người dùng (Frontend) của dự án Explainshell Clone, nơi người dùng có thể tra cứu, đọc hiểu các câu lệnh shell phức tạp, đồng thời tích hợp trang Admin để quản lý dữ liệu.

## 🚀 Công nghệ sử dụng
* **Core:** ReactJS (với Vite giúp khởi động và build siêu tốc).
* **UI/Component Library:** Ant Design (Giao diện đẹp, chuyên nghiệp, hỗ trợ tốt cho Admin Dashboard).
* **Styling:** SCSS (SASS) cho các tuỳ chỉnh CSS phức tạp.
* **Routing:** React Router DOM (Quản lý chuyển trang).

## 🛠 Hướng dẫn Cài đặt & Chạy dự án (Ubuntu)

### 1. Cài đặt các gói phụ thuộc (Dependencies)
Mở Terminal tại thư mục `Web_App` và chạy:
```bash
npm install
```
###2. Cấu hình biến môi trường
Tạo một file .env ở thư mục gốc của Web_App và cấu hình đường dẫn gọi tới Backend (API_Server):
```bash
VITE_API_BASE_URL=[http://127.0.0.1:8000/api/v1](http://127.0.0.1:8000/api/v1)
```

###3. Chạy Server ở chế độ phát triển (Development)
```bash
npm run dev
```
Mở trình duyệt và truy cập vào đường dẫn Vite cung cấp (thường là http://localhost:5173).

###4. Build để đưa lên mạng (Production)
```bash
npm run build
```
Mã nguồn sau khi tối ưu sẽ được đặt trong thư mục dist.


##📂 Cấu trúc thư mục chính
- src/assets: Hình ảnh, font chữ và các file tĩnh.
- src/components: Các UI component dùng chung (Nút bấm, Input, Modal...).
- src/pages: Các trang chính (Trang chủ tra cứu, Trang Admin...).
- src/services: Chứa các hàm gọi API kết nối với Backend.
- src/styles: Chứa các file SCSS định dạng giao diện tổng thể.
- src/App.jsx & main.jsx: Điểm khởi chạy của ứng dụng React.


##✨ Tính năng chính
- Giao diện tra cứu câu lệnh shell trực quan.
- Trang Admin Panel cho phép nhập và quản lý dữ liệu: Programs, Options, Man Pages.
- Thiết kế Responsive hoạt động tốt trên nhiều kích thước màn hình.
