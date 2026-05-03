import React, { useState, useEffect } from 'react';
import { AutoComplete, Input, Typography } from 'antd';
import { SearchOutlined, ClockCircleOutlined, CodeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import './RichTextEditor.scss';


// Chú ý: Cập nhật lại đường dẫn import cho đúng với thư mục hiện tại của bạn
import { useDebounce } from '../../hooks/useDebounce';
import { programService } from '../../services/program.service';
import { historyService } from '../../services/history.service';
import { useAuthStore } from '../../store/authStore'; 

const { Text } = Typography;

// Nhận vào các props: size, style, className và initialValue (giá trị mặc định)
const LiveSearchBar = ({ size = 'middle', style, className, initialValue = '' }) => {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  // State quản lý ô tìm kiếm
  const [searchText, setSearchText] = useState(initialValue);
  const [options, setOptions] = useState([]);

  const debouncedSearchTerm = useDebounce(searchText, 300);

  // Đồng bộ searchText nếu initialValue thay đổi từ bên ngoài (Dùng cho trang SearchResults)
  useEffect(() => {
    setSearchText(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      handleLiveSearch(debouncedSearchTerm);
    } else {
      fetchSearchHistory();
    }
  }, [debouncedSearchTerm, token]);

  const fetchSearchHistory = async () => {
    if (!token) {
      setOptions([]);
      return;
    }
    try {
      const historyData = await historyService.getUniqueRecent(5);
      const items = Array.isArray(historyData) ? historyData : (historyData.items || []);
      if (items.length > 0) {
        const recentHistory = items.reverse().slice(0, 5);
        const historyOptions = recentHistory.map(h => ({
          value: h.command_text,
          label: (
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <ClockCircleOutlined style={{ marginRight: 8 }} />
              <span>{h.command_text}</span>
            </div>
          ),
        }));
        setOptions([{ label: <Text type="secondary" strong>Tìm kiếm gần đây</Text>, options: historyOptions }]);
      } else {
        setOptions([]);
      }
    } catch (e) {
      setOptions([]);
    }
  };

  const handleLiveSearch = async (keyword) => {
    try {
      const data = await programService.getAll();
      const items = Array.isArray(data) ? data : (data.items || []);
      const filtered = items.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()));

      const searchOptions = filtered.slice(0, 5).map(program => ({
        value: program.slug,
        label: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CodeOutlined style={{ marginRight: 8, color: 'var(--color-primary)' }} />
            <strong>{program.name}</strong> 
            <span style={{ marginLeft: 8, color: 'gray', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {<div 
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(program.description) }} 
              /> || 'Không có mô tả'}
            </span>
          </div>
        ),
      }));

      setOptions(searchOptions.length > 0 ? [{ label: <Text type="secondary" strong>Gợi ý lệnh hệ thống</Text>, options: searchOptions }] : []);
    } catch (e) {
      setOptions([]);
    }
  };

  const handleSearchSubmit = (value) => {
    if (!value.trim()) return;
    navigate(`/search?q=${encodeURIComponent(value.trim())}`);
  };

  const handleSelectOption = (value) => {
    navigate(`/programs/${value}`);
  };

  return (
    <AutoComplete
      popupMatchSelectWidth={true}
      style={{ width: '100%', textAlign: 'left', ...style }}
      options={options}
      onSelect={handleSelectOption}
      onSearch={(text) => setSearchText(text)}
      value={searchText}
    >
      <Input.Search
        placeholder="Ví dụ: tar -xvf archive.tar.gz"
        allowClear
        enterButton={<SearchOutlined />}
        size={size}
        onSearch={handleSearchSubmit}
        className={className}
      />
    </AutoComplete>
  );
};

export default LiveSearchBar;