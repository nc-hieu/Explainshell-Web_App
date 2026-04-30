import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Spin, Result, Button } from 'antd';

const AdminProtectedRoute = () => {
  // Lấy state từ Zustand (Giả sử bạn đang dùng authStore như các phần trước)
  const { user, token, isAuthLoading } = useAuthStore();

  // 1. Nếu hệ thống đang gọi API lấy thông tin user (F5 lại trang), hiển thị màn hình chờ
  if (isAuthLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Đang kiểm tra quyền truy cập..." />
      </div>
    );
  }

  // 2. Nếu không có token (Chưa đăng nhập), ép chuyển hướng về trang đăng nhập Admin
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // 3. Nếu đã đăng nhập nhưng không phải Admin, hiển thị màn hình báo lỗi (hoặc đẩy về trang chủ)
  if (user && user.roles !== 'admin') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Result
          status="403"
          title="403 Forbidden"
          subTitle="Xin lỗi, bạn không có quyền truy cập vào khu vực Quản trị viên."
          extra={
            <Button type="primary" onClick={() => window.location.href = '/'}>
              Về Trang chủ
            </Button>
          }
        />
      </div>
    );
  }

  // 4. Nếu thỏa mãn mọi điều kiện (Là Admin), cho phép render các trang con bên trong
  return <Outlet />;
};

export default AdminProtectedRoute;