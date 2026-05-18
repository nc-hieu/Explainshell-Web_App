import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, message, Tag, Modal, Form, Input, TreeSelect, Upload, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { generateSlug, getImageUrl } from '../../../utils/helpers';
import { categoryService } from '../../../services/category.service';
import { uploadService } from '../../../services/upload.service';
import { topicService } from '../../../services/topic.service';

const Categories = () => {
  const [categories, setCategories] = useState([]); 
  const [rawCategories, setRawCategories] = useState([]); 
  const [topicsList, setTopicsList] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isTopicDisabled, setIsTopicDisabled] = useState(false);
  
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchTopics(); 
  }, []);

  const fetchTopics = async () => {
    try {
      const data = await topicService.getAll(0, 100);
      setTopicsList(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      message.error('Không thể tải danh sách Chủ đề (Topics)!');
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll(0, 100);
      const items = Array.isArray(data) ? data : data.items || [];
      
      setRawCategories(items); 
      
      const treeData = buildTree(items);
      setCategories(treeData);
    } catch (error) {
      message.error('Không thể tải danh sách danh mục!');
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (items) => {
    const itemMap = {};
    const tree = [];

    items.forEach(item => {
      itemMap[item.id] = { ...item, key: item.id, children: [] }; 
    });

    items.forEach(item => {
      if (item.parent_id) {
        if (itemMap[item.parent_id]) {
          itemMap[item.parent_id].children.push(itemMap[item.id]);
        }
      } else {
        tree.push(itemMap[item.id]);
      }
    });

    const cleanEmptyChildren = (nodes) => {
      nodes.forEach(node => {
        if (node.children.length === 0) {
          delete node.children;
        } else {
          cleanEmptyChildren(node.children);
        }
      });
    };
    cleanEmptyChildren(tree);

    return tree;
  };

  // --- MỚI: HÀM XỬ LÝ TẠO SLUG THÔNG MINH ---
  // Kết hợp tên Topic và tên Danh mục để tạo Slug
  const handleAutoGenerateSlug = (currentTopicId, currentCategoryName) => {
    if (!currentCategoryName) {
      form.setFieldsValue({ slug: '' });
      return;
    }
    
    let textToSlug = currentCategoryName;
    
    // Nếu đã chọn Topic, tìm tên Topic đó và nối vào trước tên danh mục
    if (currentTopicId) {
      const selectedTopic = topicsList.find(t => t.id === currentTopicId);
      if (selectedTopic) {
        textToSlug = `${selectedTopic.name} ${currentCategoryName}`;
      }
    }

    form.setFieldsValue({ slug: generateSlug(textToSlug) });
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    form.resetFields();
    setFileList([]); 
    setIsTopicDisabled(false); 
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCategory(record);
    form.setFieldsValue(record); 
    
    if (record.parent_id) {
      setIsTopicDisabled(true);
    } else {
      setIsTopicDisabled(false);
    }

    const fullUrl = getImageUrl(record.icon_url);
    if (record.icon_url) {
      setFileList([{
        uid: '-1',
        name: 'icon.png',
        status: 'done',
        url: fullUrl,
      }]);
    } else {
      setFileList([]);
    }

    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await categoryService.delete(id);
      message.success('Đã xóa danh mục thành công!');
      fetchCategories();
    } catch (error) {
      message.error('Lỗi khi xóa danh mục! Có thể danh mục này đang chứa lệnh.');
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Bạn chỉ có thể tải lên file hình ảnh!');
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Hình ảnh phải nhỏ hơn 2MB!');
      return Upload.LIST_IGNORE;
    }
    return false; 
  };

  const handleFormSubmit = async (values) => {
    try {
      setLoading(true); 
      
      const finalSlug = values.slug ? values.slug : generateSlug(values.name);
      let iconUrl = editingCategory ? editingCategory.icon_url : null;

      if (fileList.length > 0 && fileList[0].originFileObj) {
        try {
          const formData = new FormData();
          formData.append('file', fileList[0].originFileObj);
          const uploadRes = await uploadService.uploadImage(formData); 
          iconUrl = uploadRes.url; 
        } catch (uploadError) {
           message.error('Lỗi khi tải ảnh lên!');
           setLoading(false);
           return; 
        }
      } else if (fileList.length === 0) {
        iconUrl = null;
      }
      
      const submitData = {
        ...values,
        slug: finalSlug, 
        parent_id: values.parent_id || null, 
        topic_id: values.topic_id || null, 
        icon_url: iconUrl 
      };

      if (editingCategory) {
        await categoryService.update(editingCategory.id, submitData);
        message.success('Cập nhật danh mục thành công!');
      } else {
        await categoryService.create(submitData);
        message.success('Thêm danh mục mới thành công!');
      }
      setIsModalVisible(false);
      fetchCategories(); 
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  const handleParentChange = (selectedParentId) => {
    if (selectedParentId) {
      const parentCat = rawCategories.find(c => c.id === selectedParentId);
      if (parentCat && parentCat.topic_id) {
        form.setFieldsValue({ topic_id: parentCat.topic_id });
        setIsTopicDisabled(true);
        
        // Gọi hàm auto gen slug khi topic thay đổi do chọn parent
        const currentName = form.getFieldValue('name');
        handleAutoGenerateSlug(parentCat.topic_id, currentName);
      }
    } else {
      setIsTopicDisabled(false);
    }
  };

  const columns = [
    {
      title: 'Icon', dataIndex: 'icon_url', key: 'icon_url', width: '10%',
      render: (url) => {
        const fullUrl = getImageUrl(url);
        return fullUrl ? <img src={fullUrl} alt="icon" style={{ width: 30, height: 30, objectFit: 'contain' }} /> : '-';
      },
    },
    { title: 'Tên danh mục', dataIndex: 'name', key: 'name', width: '25%', render: (text) => <strong>{text}</strong> },
    {
      title: 'Thuộc Topic', key: 'topic', width: '15%',
      render: (_, record) => record.topic ? <Tag color="cyan">{record.topic.name}</Tag> : <span style={{ color: 'gray' }}>-</span>,
    },
    { title: 'Slug', dataIndex: 'slug', key: 'slug', width: '20%', render: (slug) => <Tag color="blue">{slug}</Tag> },
    {
      title: 'Hành động', key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Bạn có chắc chắn muốn xóa danh mục này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
            <Button type="primary" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{color: 'var(--color-primary, #fbbf24)'}}>Quản lý Danh mục (Categories)</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          Thêm danh mục
        </Button>
      </div>

      <Table columns={columns} dataSource={categories} loading={loading} pagination={false} />

      <Modal
        title={editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item label="Icon Danh mục (Hiển thị ngoài trang chủ)">
            <Upload listType="picture-card" fileList={fileList} onChange={({ fileList: newFileList }) => setFileList(newFileList)} beforeUpload={beforeUpload} maxCount={1} accept="image/*">
              {fileList.length >= 1 ? null : <div><PlusOutlined /><div style={{ marginTop: 8 }}>Tải ảnh</div></div>}
            </Upload>
          </Form.Item>

          <Form.Item name="name" label="Tên Danh Mục" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}>
            <Input 
              placeholder="Ví dụ: File Management" 
              onChange={(e) => {
                const currentTopicId = form.getFieldValue('topic_id');
                handleAutoGenerateSlug(currentTopicId, e.target.value);
              }} 
            />
          </Form.Item>

          <Form.Item name="slug" label="Slug (Đường dẫn tĩnh)">
            <Input placeholder="Tự động sinh hoặc nhập tùy chỉnh (vd: file-management)" />
          </Form.Item>

          <Form.Item
            name="parent_id"
            label="Danh mục cha"
            tooltip="Bỏ trống nếu đây là danh mục gốc lớn nhất."
          >
            <TreeSelect
              style={{ width: '100%' }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={categories}
              placeholder="Chọn danh mục cha (tùy chọn)"
              treeDefaultExpandAll
              allowClear
              fieldNames={{ label: 'name', value: 'id', children: 'children' }} 
              onChange={handleParentChange} 
            />
          </Form.Item>

          <Form.Item
            name="topic_id"
            label="Thuộc Chủ đề (Topic)"
            rules={[{ required: true, message: 'Vui lòng chọn một Chủ đề!' }]}
            tooltip={isTopicDisabled ? "Chủ đề được tự động lấy theo Danh mục cha" : ""}
          >
            <Select 
              placeholder="Chọn Topic cho danh mục này" 
              allowClear
              showSearch
              optionFilterProp="children" 
              disabled={isTopicDisabled} 
              onChange={(val) => {
                // Gọi hàm auto gen slug khi topic thay đổi
                const currentName = form.getFieldValue('name');
                handleAutoGenerateSlug(val, currentName);
              }}
            >
              {topicsList.map(topic => (
                <Select.Option key={topic.id} value={topic.id}>
                  {topic.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Nhập mô tả cho danh mục này..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8 }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>Lưu lại</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;