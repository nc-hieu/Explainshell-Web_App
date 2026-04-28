import React, { useState, useEffect } from 'react';
import { List, Popconfirm, Button, Typography, message, Tooltip } from 'antd';
import { DeleteOutlined, CodeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { historyService } from '../../../../services/history.service';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const HistoryTab = () => {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchHistories();
  }, []);

  const fetchHistories = async () => {
    setLoadingHistory(true);
    try {
      const data = await historyService.getAll();
      const sortedData = Array.isArray(data) ? data.reverse() : (data.items || []).reverse();
      setHistoryList(sortedData);
    } catch (error) {
      message.error('Không thể tải lịch sử tìm kiếm!');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDeleteAllHistories = async () => {
    try {
      await historyService.deleteAll();
      message.success('Đã xóa toàn bộ lịch sử!');
      setHistoryList([]);
    } catch (error) {
      message.error('Lỗi khi xóa toàn bộ lịch sử!');
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      await historyService.delete(id);
      message.success('Đã xóa lịch sử!');
      fetchHistories();
    } catch (error) {
      message.error('Lỗi khi xóa!');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    // Format gọn gàng: "15:30 - 25/12/2026"
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} - ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  return (
    <div style={{ marginTop: 16 }}>
      {/* Nút Xóa Tất Cả */}
      {historyList.length > 0 && (
        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <Popconfirm 
            title="Bạn có chắc chắn muốn xóa toàn bộ lịch sử?" 
            onConfirm={handleDeleteAllHistories} 
            okText="Xóa hết" 
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />}>Xóa tất cả lịch sử</Button>
          </Popconfirm>
        </div>
      )}
      
      {/* Danh sách Lịch sử (Đã custom lại cấu trúc HTML để nằm trên 1 dòng) */}
      <List
        loading={loadingHistory}
        dataSource={historyList}
        locale={{ emptyText: 'Chưa có lịch sử tìm kiếm nào.' }}
        renderItem={(item) => (
          <div className="history-list-item">
            {/* Cột trái: Icon + Lệnh + Mô tả */}
            <div className="history-content">
              <div className="history-icon-box">
                <CodeOutlined />
              </div>
              <a className="history-command" onClick={() => navigate(`/programs/${item.command_text}`)}>
                {item.command_text}
              </a>
              <span className="history-desc">
                - {item.explanation || 'Không có mô tả'}
              </span>
            </div>

            {/* Cột phải: Thời gian + Nút xóa */}
            <Tooltip title={formatDate(item.created_at)}>
              <div className="history-time">
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {formatDate(item.created_at)}
              </div>
            </Tooltip>
            
            <Popconfirm title="Xóa dòng này?" onConfirm={() => handleDeleteHistory(item.id)}>
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </div>
        )}
      />
    </div>
  );
};

export default HistoryTab;