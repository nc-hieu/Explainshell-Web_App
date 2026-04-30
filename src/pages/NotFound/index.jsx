import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom'; // 1. Thêm import này

const App = () => {
  const navigate = useNavigate(); // 2. Khai báo hàm navigate ở đây

  return (
    <Result
      status="404"
      title="404"
      subTitle="Xin lỗi, Trang bạn tìm không tồn tại!"
      extra={
        <Button type="primary" onClick={() => navigate("/")}>
          Quay Lại Trang Chủ
        </Button>
      }
    />
  );
};

export default App;
