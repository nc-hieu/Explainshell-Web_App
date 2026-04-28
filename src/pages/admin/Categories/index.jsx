import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, message, Tag, Modal, Form, Input, TreeSelect } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { generateSlug } from '../../../utils/helpers';
import { categoryService } from '../../../services/category.service';

const Categories = () => {
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  // Các State mới cho việc Thêm/Sửa
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll(0, 100);
      const treeData = buildTree(data);
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

  // --- CÁC HÀM XỬ LÝ FORM ---
  const handleAddNew = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCategory(record);
    form.setFieldsValue(record); // Đổ dữ liệu cũ vào Form
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

  const handleFormSubmit = async (values) => {
    try {
    // Nếu mảng values.slug trống, dùng hàm generateSlug để tạo lại từ name
    const finalSlug = values.slug ? values.slug : generateSlug(values.name);
    
    const submitData = {
      ...values,
      slug: finalSlug, 
      parent_id: values.parent_id || null, 
    };

      if (editingCategory) {
        await categoryService.update(editingCategory.id, submitData);
        message.success('Cập nhật danh mục thành công!');
      } else {
        await categoryService.create(submitData);
        message.success('Thêm danh mục mới thành công!');
      }
      setIsModalVisible(false);
      fetchCategories(); // Tải lại cây dữ liệu
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu dữ liệu!');
    }
  };

  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      width: '35%',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: '25%',
      render: (slug) => <Tag color="blue">{slug}</Tag>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa danh mục này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{color: '#fbbf24'}}>Quản lý Danh mục (Categories)</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          Thêm danh mục
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={categories} 
        loading={loading}
        pagination={false}
      />

      {/* MODAL THÊM/SỬA DANH MỤC */}
      <Modal
        title={editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Form.Item
            name="name"
            label="Tên Danh Mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input 
              placeholder="Ví dụ: File Management" 
              onChange={(e) => {
                // Khi người dùng gõ Tên, tự động điền vào ô Slug
                form.setFieldsValue({ slug: generateSlug(e.target.value) });
              }} 
            />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug (Đường dẫn tĩnh)"
            // Đã bỏ rules required đi để không báo lỗi màu đỏ nếu người dùng vô tình xóa trắng
          >
            <Input placeholder="Tự động sinh hoặc nhập tùy chỉnh (vd: file-management)" />
          </Form.Item>

          <Form.Item
            name="parent_id"
            label="Danh mục cha"
            tooltip="Bỏ trống nếu đây là danh mục gốc lớn nhất."
          >
            {/* TreeSelect tự động nhận cấu trúc có mảng 'children' mà chúng ta đã làm ở Phần 1 */}
            <TreeSelect
              style={{ width: '100%' }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={categories}
              placeholder="Chọn danh mục cha (tùy chọn)"
              treeDefaultExpandAll
              allowClear
              // Giúp Ant Design hiểu trường nào hiển thị chữ, trường nào lấy ID
              fieldNames={{ label: 'name', value: 'id', children: 'children' }} 
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả cho danh mục này..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Lưu lại
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;