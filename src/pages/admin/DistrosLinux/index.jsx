import React, { useState, useEffect } from 'react';
import { osDistributionService } from '../../../services/osDistribution.service';
import { Table, Button, Space, Popconfirm, message, Tag, Modal, Form, Input, Upload, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { generateSlug } from '../../../utils/helpers';

const DistrosLinux = () => {
  const [distos, setDistros] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDistro, setEditingDistro] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  useEffect(()=>{
    fetchDistros();
  },[]);

  // Fetch Data 
  const fetchDistros = async () => {
    setLoading(true);
    try {
      const data = await osDistributionService.getAll();
      setDistros(Array.isArray(data) ? data : data.items || []);
    } catch (error){
      message.error('Không thể tải danh sách Distributisons!');
    } finally {
      setLoading(false);
    }
  }

  const handleAddNew = () => {
    setEditingDistro(null);
    form.resetFields();
    setFileList([]);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingDistro(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await osDistributionService.delete(id);
      message.success('Đã xóa Distributisons thành công!');
      fetchDistros();
    } catch (error) {
      message.error('Lỗi khi xóa Distributisons!');
    }
  };

const handleFormSubmit = async (values) => {
    try {
      setLoading(true); // Bật loading khi bắt đầu lưu/upload
      const finalSlug = values.slug ? values.slug : generateSlug(values.name);

      const submitData = {
        ...values,
        slug: finalSlug,
      };
      if (editingDistro) {
        await osDistributionService.update(editingDistro.id, submitData);
        message.success('Cập nhật Distributisons thành công!');
      } else {
        await osDistributionService.create(submitData);
        message.success('Thêm Distributisons mới thành công!');
      }
      setIsModalVisible(false);
      fetchDistros();
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu dữ liệu!');
    } finally {
      setLoading(false); // Tắt loading dù thành công hay thất bại
    }
  };

  //Columns
  const columns = [
    {
      title: 'Tên Distro', dataIndex: 'name',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Slug', dataIndex: 'slug',
      render: (slug) => <Tag color="blue">{slug}</Tag>
    },
    {
      title: 'Mô tả', dataIndex: 'description'
    },
    {
      title: 'Hành động', key: 'action', width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Xóa Distributisons này?" onConfirm={() => handleDelete(record.id)}>
            <Button type="primary" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
    
  return(
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{color: 'var(--color-primary, #fbbf24)', margin: 0}}>Quản lý Distros Linux</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          Thêm Distributisons
        </Button>
      </div>

      <Table columns={columns} dataSource={distos} loading={loading} rowKey="id" pagination={{ pageSize: 10 }} />

      <Modal
        title={editingDistro ? "Chỉnh sửa Distributisons" : "Thêm Distributisons mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item name="name" label="Tên Distro" rules={[{ required: true, message: 'Nhập tên Distro!' }]}>
            <Input onChange={(e) => form.setFieldsValue({ slug: generateSlug(e.target.value) })} />
          </Form.Item>

          <Form.Item name="slug" label="Slug">
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
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

export default DistrosLinux;