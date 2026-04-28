import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Drawer, Tabs, Popconfirm, message, Tag, Input } from 'antd'; // Import thêm Input
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { programService } from '../../../services/program.service';

// Import các Tab
import GeneralTab from './components/GeneralTab';
import CategoriesTab from './components/CategoriesTab';
import OptionsTab from './components/OptionsTab';
import GroupsTab from './components/GroupsTab';
import ExamplesTab from './components/ExamplesTab';

// Hàm hỗ trợ format thời gian
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State quản lý tìm kiếm
  const [searchText, setSearchText] = useState('');

  // State quản lý Drawer
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const data = await programService.getAll();
      setPrograms(Array.isArray(data) ? data : data.items || []);
    } catch (e) { 
      message.error('Không thể tải danh sách lệnh!'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleAddNewProgram = () => {
    setEditingProgram(null);
    setActiveTab('1'); 
    setIsDrawerVisible(true);
  };

  const handleEditProgram = (record) => {
    setEditingProgram(record);
    setActiveTab('1'); 
    setIsDrawerVisible(true);
  };

  const handleDeleteProgram = async (id) => {
    try {
      await programService.delete(id);
      message.success('Đã xóa lệnh thành công!');
      fetchPrograms();
    } catch (error) {
      message.error('Lỗi khi xóa lệnh!');
    }
  };

  // --- LOGIC LỌC DỮ LIỆU TÌM KIẾM ---
  // Lọc programs theo tên (name) hoặc mô tả (description) dựa trên searchText
  const filteredPrograms = programs.filter(program => {
    const searchLower = searchText.toLowerCase();
    const nameMatch = program.name?.toLowerCase().includes(searchLower);
    const descMatch = program.description?.toLowerCase().includes(searchLower);
    return nameMatch || descMatch;
  });

  const tabItems = [
    { key: '1', label: 'Thông tin chung', children: <GeneralTab editingProgram={editingProgram} setEditingProgram={setEditingProgram} fetchPrograms={fetchPrograms} /> },
    { key: '2', label: 'Danh mục', disabled: !editingProgram, children: <CategoriesTab editingProgram={editingProgram} /> },
    { key: '3', label: 'Cờ lệnh (Options)', disabled: !editingProgram, children: <OptionsTab editingProgram={editingProgram} /> },
    { key: '4', label: 'Nhóm cờ (Groups)', disabled: !editingProgram, children: <GroupsTab editingProgram={editingProgram} /> },
    { key: '5', label: 'Ví dụ (Examples)', disabled: !editingProgram, children: <ExamplesTab editingProgram={editingProgram} /> }
  ];

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{color: 'var(--color-primary, #fbbf24)', margin: 0}}>Quản lý Lệnh (Programs)</h2>
        
        {/* KHU VỰC CÔNG CỤ (TÌM KIẾM + THÊM MỚI) */}
        <Space>
          <Input.Search
            placeholder="Tìm kiếm theo tên hoặc mô tả..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNewProgram}>
            Thêm lệnh mới
          </Button>
        </Space>
      </div>

      <Table 
        columns={[
          { title: 'Tên Lệnh', dataIndex: 'name', key: 'name', render: text => <strong>{text}</strong> },
          { 
            title: 'Danh mục', dataIndex: 'categories', key: 'categories',
            render: (categories) => (
              <Space wrap>
                {categories && categories.length > 0 ? (
                  categories.map(cat => <Tag color="purple" key={cat.id}>{cat.name}</Tag>)
                ) : (
                  <span style={{ color: 'var(--text-muted, gray)' }}>Chưa gán</span>
                )}
              </Space>
            )
          },
          { title: 'Mô tả', dataIndex: 'description', key: 'description', ellipsis: true },
          { 
            title: 'Thời gian tạo', dataIndex: 'created_at', key: 'created_at',
            render: (date) => <span style={{ color: 'var(--text-secondary, #9ca3af)' }}>{formatDate(date)}</span>
          },
          { 
            title: 'Thời gian sửa', dataIndex: 'updated_at', key: 'updated_at',
            render: (date) => <span style={{ color: 'var(--text-secondary, #9ca3af)' }}>{formatDate(date)}</span>
          },
          {
            title: 'Hành động', key: 'action',
            render: (_, record) => (
              <Space size="middle">
                <Button type="primary" icon={<EditOutlined />} onClick={() => handleEditProgram(record)}>Sửa</Button>
                <Popconfirm title="Xóa lệnh này?" onConfirm={() => handleDeleteProgram(record.id)}>
                  <Button type="primary" danger icon={<DeleteOutlined />}>Xóa</Button>
                </Popconfirm>
              </Space>
            ),
          }
        ]} 
        // Thay thế dataSource từ programs thành mảng đã được lọc
        dataSource={filteredPrograms} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Drawer 
        title={editingProgram ? `Đang Chỉnh Sửa Lệnh: ${editingProgram.name}` : "Thêm lệnh mới"} 
        width={1050}
        onClose={() => setIsDrawerVisible(false)} 
        open={isDrawerVisible} 
        destroyOnClose
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Drawer>
    </div>
  );
};

export default Programs;  