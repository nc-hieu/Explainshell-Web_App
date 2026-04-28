import React, { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, theme, FloatButton, Switch } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import router from './routes'; // Import router 

// Import file biến CSS chúng ta vừa tạo
import './styles/variables.scss'; 

const App = () => {
  // State quản lý Theme. Mặc định cho là Dark Mode (true), bạn có thể đổi thành false để mặc định Light Mode
  const [isDarkMode, setIsDarkMode] = useState(true); 

  // Mỗi khi state isDarkMode thay đổi, tự động gắn thuộc tính data-theme vào thẻ <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

  // (Tùy chọn) Hàm này sau này bạn có thể truyền xuống Header để làm nút Bật/Tắt
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    // ConfigProvider là "Phù thủy" của Ant Design, nó ghi đè toàn bộ style mặc định
    <ConfigProvider
      theme={{
        // 1. Chuyển đổi thuật toán thuật toán sáng/tối của Ant Design
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        
        // 2. Ghi đè màu sắc cốt lõi (Màu Vàng Cam chủ đạo)
        token: {
          colorPrimary: '#fbbf24', 
          // colorPrimary: isDarkMode ? '#161a24' : '#f3f4f6', 
          fontFamily: "'Inter', system-ui, sans-serif",
          borderRadius: 8, // Bo góc nhè nhẹ cho nút bấm và ô input
          // colorTextLightSolid: '#000000',
        },
      
        // 3. Ghi đè màu của các Component cụ thể (Layout) để khớp với SCSS của ta
        components: {
          Layout: {
            headerBg: isDarkMode ? '#161a24' : '#ffffff',
            siderBg: isDarkMode ? '#161a24' : '#ffffff',
            bodyBg: isDarkMode ? '#161a24' : '#f3f4f6',
          },
          Card: {
            colorBgContainer: isDarkMode ? '#1c1e26' : '#ffffff',
          },
          Button: {
          // Cách 2: Tác động riêng biệt và chi tiết cho Button
          colorTextLightSolid: isDarkMode ? '#ffffff' : '#000000',
        },
        }
      }}
    >
    
      <RouterProvider router={router} />
        
        {/* Nút bấm nổi (Floating Button) chuyển đổi Theme */}
        {/* Cụm Switch nằm ở góc trái */}
      <FloatButton.Group 
        shape="circle" 
        style={{ right: 24, bottom: 24 }} // Đặt ở góc dưới bên phải
      >
        {/* Nút Đổi giao diện */}
        <FloatButton 
          icon={isDarkMode ? <MoonOutlined /> : <SunOutlined />} 
          onClick={toggleTheme} 
          tooltip={`Giao diện: ${isDarkMode ? 'Tối' : 'Sáng'}`}
        />
        
        {/* Nút Lên đầu trang (tự động ẩn hiện khi cuộn chuột) */}
        <FloatButton.BackTop 
          visibilityHeight={200} // Cuộn xuống 200px thì nút mới hiện
          tooltip="Lên đầu trang" 
        />
      </FloatButton.Group>
          </ConfigProvider>
  );
};

export default App;