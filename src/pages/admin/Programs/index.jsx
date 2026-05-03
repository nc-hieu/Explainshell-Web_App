import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Drawer, Tabs, Popconfirm, message, Tag, Input, TreeSelect } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { programService } from '../../../services/program.service';
import { categoryService } from '../../../services/category.service'; 

// 1. Import thêm hàm lấy đường dẫn ảnh
import { getImageUrl } from '../../../utils/helpers';

// Import các Tab
import GeneralTab from './components/GeneralTab';
import CategoriesTab from './components/CategoriesTab';
import OptionsTab from './components/OptionsTab';
import GroupsTab from './components/GroupsTab';
import ExamplesTab from './components/ExamplesTab';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State quản lý tìm kiếm và bộ lọc
  const [searchText, setSearchText] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState(null); 
  const [categoriesTree, setCategoriesTree] = useState([]); 

  // State quản lý Drawer
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    fetchPrograms();
    fetchCategoriesForFilter(); 
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

  const fetchCategoriesForFilter = async () => {
    try {
      const data = await categoryService.getAll(0, 100);
      const items = Array.isArray(data) ? data : data.items || [];
      const itemMap = {}; 
      const tree = [];
      
      items.forEach(i => { 
        // Bổ sung hiển thị icon trong bộ lọc TreeSelect ngoài bảng
        const titleContent = (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {i.icon_url && (
              <img 
                src={getImageUrl(i.icon_url)} 
                alt="icon" 
                style={{ width: '16px', height: '16px', objectFit: 'contain' }} 
              />
            )}
            <span>{i.name}</span>
          </div>
        );

        itemMap[i.id] = { ...i, key: i.id, value: i.id, title: titleContent, children: [] }; 
      });
      items.forEach(i => {
        if (i.parent_id && itemMap[i.parent_id]) {
            itemMap[i.parent_id].children.push(itemMap[i.id]);
        } else {
            tree.push(itemMap[i.id]);
        }
      });
      setCategoriesTree(tree);
    } catch (e) {
      console.error('Lỗi tải danh mục cho bộ lọc:', e);
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

  // --- LOGIC LỌC DỮ LIỆU TÌM KIẾM & DANH MỤC ---
  const filteredPrograms = programs.filter(program => {
    const searchLower = searchText.toLowerCase();
    const nameMatch = program.name?.toLowerCase().includes(searchLower);
    const descMatch = program.description?.toLowerCase().includes(searchLower);
    const textMatch = nameMatch || descMatch;

    const categoryMatch = filterCategoryId 
      ? program.categories?.some(cat => cat.id === filterCategoryId)
      : true; 

    return textMatch && categoryMatch;
  });

  const tabItems = [
    { key: '1', label: 'Thông tin chung', children: <GeneralTab editingProgram={editingProgram} setEditingProgram={setEditingProgram} fetchPrograms={fetchPrograms} /> },
    { 
      key: '2', 
      label: 'Danh mục', 
      disabled: !editingProgram, 
      children: <CategoriesTab 
                  editingProgram={editingProgram} 
                  setEditingProgram={setEditingProgram} 
                  fetchPrograms={fetchPrograms} 
                  filterCategoryId={filterCategoryId} 
                /> 
    },
    { key: '3', label: 'Cờ lệnh (Options)', disabled: !editingProgram, children: <OptionsTab editingProgram={editingProgram} /> },
    { key: '4', label: 'Nhóm cờ (Groups)', disabled: !editingProgram, children: <GroupsTab editingProgram={editingProgram} /> },
    { key: '5', label: 'Ví dụ (Examples)', disabled: !editingProgram, children: <ExamplesTab editingProgram={editingProgram} /> }
  ];

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{color: 'var(--color-primary, #fbbf24)', margin: 0}}>Quản lý Lệnh (Programs)</h2>
        
        <Space>
          <TreeSelect
            style={{ width: 400 }}
            treeData={categoriesTree}
            placeholder="Lọc theo danh mục..."
            allowClear
            treeDefaultExpandAll
            onChange={(value) => setFilterCategoryId(value)}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
          />

          <Input.Search
            placeholder="Tìm kiếm tên, mô tả..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 350 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNewProgram}>
            Thêm lệnh mới
          </Button>
        </Space>
      </div>

      <Table 
        columns={[
          { title: 'Tên Lệnh', dataIndex: 'name', key: 'name', render: text => <strong>{text}</strong> },
          { title: 'Slug', dataIndex: 'slug', key: 'slug', render: (slug) => <Tag color="blue">{slug}</Tag> },
          { 
            title: 'Danh mục', dataIndex: 'categories', key: 'categories',
            // 2. Cập nhật giao diện cột Danh mục
            render: (categories) => (
              <Space wrap>
                {categories && categories.length > 0 ? (
                  categories.map(cat => (
                    <Tag 
                      color="purple" 
                      key={cat.id} 
                      // Sử dụng flex để căn giữa icon và text
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px' }}
                    >
                      {cat.icon_url && (
                        <img 
                          src={getImageUrl(cat.icon_url)} 
                          alt="icon" 
                          style={{ width: '14px', height: '14px', objectFit: 'contain' }} 
                        />
                      )}
                      <span>{cat.name}</span>
                    </Tag>
                  ))
                ) : (
                  <span style={{ color: 'var(--text-muted, gray)' }}>Chưa gán</span>
                )}
              </Space>
            )
          },
          { title: 'Thời gian tạo', dataIndex: 'created_at', key: 'created_at', render: (date) => <span style={{ color: 'var(--text-secondary, #9ca3af)' }}>{formatDate(date)}</span> },
          { title: 'Thời gian sửa', dataIndex: 'updated_at', key: 'updated_at', render: (date) => <span style={{ color: 'var(--text-secondary, #9ca3af)' }}>{formatDate(date)}</span> },
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