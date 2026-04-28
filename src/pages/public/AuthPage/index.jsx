import React, { useState } from 'react';
import { Card, Tabs, Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import { useAuthStore } from '../../../store/authStore';

const { Title } = Typography;

const AuthPage = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore(state => state.setToken);
  const fetchProfile = useAuthStore(state => state.fetchProfile);
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

 // Xử lý ĐĂNG NHẬP (Chỉ sửa import thành authService)
  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const data = await authService.login(values.username, values.password);
      setToken(data.access_token); 
      await fetchProfile(); 
      message.success('Đăng nhập thành công!');
      navigate('/'); 
    } catch (error) {
      message.error(error.response?.data?.detail || 'Sai tên đăng nhập hoặc mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý ĐĂNG KÝ (Bổ sung logic bắt lỗi)
  const handleRegister = async (values) => {
    setLoading(true);
    try {
      await authService.register(values);
      message.success('Đăng ký thành công! Hãy đăng nhập nhé.');
      setActiveTab('login'); 
    } catch (error) {
      // BỔ SUNG Ở ĐÂY: Báo lỗi nếu trùng email, trùng username...
      const errorMsg = error.response?.data?.detail || 'Có lỗi xảy ra khi đăng ký!';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card 
        style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '12px' }}
        styles={{ body: { padding: '32px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ color: 'var(--color-primary, #1890ff)', margin: 0 }}>
            Explainshell
          </Title>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          centered
          items={[
            {
              key: 'login',
              label: 'Đăng Nhập',
              children: (
                <Form layout="vertical" onFinish={handleLogin} style={{ marginTop: 16 }}>
                  <Form.Item name="username" rules={[{ required: true, message: 'Nhập Username!' }]}>
                    <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" size="large" />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: 'Nhập Mật khẩu!' }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                    Đăng Nhập
                  </Button>
                </Form>
              )
            },
            {
              key: 'register',
              label: 'Đăng Ký',
              children: (
                <Form layout="vertical" onFinish={handleRegister} style={{ marginTop: 16 }}>
                  <Form.Item name="username" rules={[{ required: true, message: 'Nhập Username!' }]}>
                    <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" size="large" />
                  </Form.Item>
                  <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}>
                    <Input prefix={<MailOutlined />} placeholder="Email của bạn" size="large" />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: 'Nhập Mật khẩu!' }, { min: 6, message: 'Mật khẩu ít nhất 6 ký tự!' }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                    Tạo Tài Khoản
                  </Button>
                </Form>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default AuthPage;