# Sử dụng image Node.js phiên bản nhẹ (alpine)
FROM node:20-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy package.json và package-lock.json (nếu có) vào trước
COPY package*.json ./

# Cài đặt các thư viện Node.js
RUN npm install

# Copy toàn bộ mã nguồn còn lại vào container
COPY . .

# Vite mặc định chạy ở cổng 5173
EXPOSE 5173

# Chạy server Vite và mở rộng kết nối (--host) để máy thật có thể truy cập được
CMD ["npm", "run", "dev", "--", "--host"]
