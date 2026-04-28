import React from 'react';
import { Typography, Space, Button } from 'antd'; // <-- Import thêm Button
import { useNavigate } from 'react-router-dom';
import { AppstoreOutlined } from '@ant-design/icons'; // <-- Import thêm Icon

import LiveSearchBar from '../../../components/common/LiveSearchBar';

const { Title, Text } = Typography;

const Home = () => {
  const navigate = useNavigate();

  const handleQuickSearch = (value) => {
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  return (
    <div style={{ marginTop: '15vh', width: '100%', maxWidth: '800px', textAlign: 'center' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        <div>
          <Title level={1} style={{ fontSize: '3.5rem', marginBottom: 0, color: 'var(--text-primary)' }}>
            ExplainShell
          </Title>
          <Text style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
            Viết ra một câu lệnh để xem giải thích
          </Text>
          <br />
          <Text style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
            (Match command-line arguments to their help text)
          </Text>
        </div>

        <div style={{ marginTop: '20px' }}>
          <LiveSearchBar size="large" className="custom-search-bar" />
        </div>
        
        <Space size="middle" style={{ marginTop: '20px' }}>
          <Text style={{ color: 'var(--text-secondary)' }}>Thử các lệnh:</Text>
          <a onClick={() => handleQuickSearch('ls -la')}>ls -la</a>
          <a onClick={() => handleQuickSearch('docker run -it ubuntu')}>docker run -it ubuntu</a>
          <a onClick={() => handleQuickSearch('find . -type f -name "*.txt"')}>find</a>
        </Space>

        {/* --- NÚT DẪN SANG TRANG DANH MỤC --- */}
        <div style={{ marginTop: '40px' }}>
          <Button 
            type="dashed" 
            size="large" 
            icon={<AppstoreOutlined />}
            onClick={() => navigate('/categories')}
            style={{ 
              color: 'var(--color-primary)', 
              borderColor: 'var(--color-primary)',
              borderRadius: '8px',
              padding: '0 32px'
            }}
          >
            Khám phá thư viện lệnh theo Danh mục
          </Button>
        </div>

      </Space>
    </div>
  );
};

export default Home;