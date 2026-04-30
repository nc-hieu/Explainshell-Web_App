# Explainshell - Web App (Frontend)

Đây là giao diện người dùng (Frontend) của dự án Explainshell Clone, nơi người dùng có thể tra cứu, đọc hiểu các câu lệnh shell phức tạp, đồng thời tích hợp trang Admin để quản lý dữ liệu.

## 🚀 Công nghệ sử dụng
* **Core:** ReactJS (với Vite giúp khởi động và build siêu tốc).
* **UI/Component Library:** Ant Design (Giao diện đẹp, chuyên nghiệp, hỗ trợ tốt cho Admin Dashboard).
* **Styling:** SCSS (SASS) cho các tuỳ chỉnh CSS phức tạp.
* **Routing:** React Router DOM (Quản lý chuyển trang).
* **Containerization:** Docker (Đóng gói và triển khai ứng dụng mượt mà).

---

## 🐳 Hướng dẫn chạy dự án với Docker (Khuyên dùng khi triển khai)

Dự án đã được tích hợp `Dockerfile`. Bạn không cần cài đặt Node.js trên máy, chỉ cần có Docker là có thể chạy được ngay.

### 1. Build Docker Image
Mở Terminal tại thư mục gốc của dự án và chạy lệnh sau để đóng gói ứng dụng:
```Bash
docker build -t exsh-webapp .
```
### 2. Chạy Docker Container
Sau khi quá trình build hoàn tất, khởi chạy ứng dụng bằng lệnh:
```Bash
docker run -idt \ 
-p 5173:5173 \
--name explainshell-frontend \
-e VITE_API_URL=http://192.168.1.10:8000/api/v1 \     #Thay thành IP của API Server
exsh-webapp
```
Bây giờ, bạn hãy mở trình duyệt và truy cập vào: http://localhost:5173


### 📂 Cấu trúc thư mục chính
- src/assets: Hình ảnh, font chữ và các file tĩnh.
- src/components: Các UI component dùng chung (Nút bấm, Input, Modal...).
- src/pages: Các trang chính (Trang chủ tra cứu, Trang Admin...).
- src/services: Chứa các hàm gọi API kết nối với Backend.
- src/styles: Chứa các file SCSS định dạng giao diện tổng thể.
- src/App.jsx & main.jsx: Điểm khởi chạy của ứng dụng React.
- Dockerfile: Cấu hình đóng gói môi trường Docker.


### ✨ Tính năng chính
- Giao diện tra cứu câu lệnh shell trực quan.
- Trang Admin Panel cho phép nhập và quản lý dữ liệu: Programs, Options, Man Pages.
- Thiết kế Responsive hoạt động tốt trên nhiều kích thước màn hình.
