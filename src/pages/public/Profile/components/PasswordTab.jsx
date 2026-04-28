import React from 'react';
import { Form, Input, Button, message } from 'antd';

const PasswordTab = () => {
  const handleChangePassword = (values) => {
    console.log("Dữ liệu đổi mật khẩu:", values);
    message.success("Tính năng đổi mật khẩu đang được hoàn thiện!");
  };

  return (
    <div style={{ maxWidth: 400, marginTop: 16 }}>
      <Form layout="vertical" onFinish={handleChangePassword}>
        <Form.Item name="old_password" label="Mật khẩu hiện tại" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}>
          <Input.Password placeholder="Nhập mật khẩu hiện tại" />
        </Form.Item>
        <Form.Item name="new_password" label="Mật khẩu mới" rules={[{ required: true, min: 6, message: 'Mật khẩu mới phải từ 6 ký tự' }]}>
          <Input.Password placeholder="Nhập mật khẩu mới" />
        </Form.Item>
        <Button type="primary" htmlType="submit">Xác nhận đổi mật khẩu</Button>
      </Form>
    </div>
  );
};

export default PasswordTab;