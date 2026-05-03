import React from 'react';
import { Descriptions } from 'antd';

const InfoTab = ({ user }) => {
  if (!user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <Descriptions column={1} bordered size="middle" style={{ marginTop: 16 }}>
      <Descriptions.Item label="Tên người dùng"><strong>{user.username}</strong></Descriptions.Item>
      <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
      <Descriptions.Item label="Ngày tham gia">{formatDate(user.created_at)}</Descriptions.Item>
      <Descriptions.Item label="ID Tài khoản">#None</Descriptions.Item>
    </Descriptions>
  );
};

export default InfoTab;