import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, message, Tag, Modal, Form, Input, Upload, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { generateSlug, getImageUrl } from '../../../utils/helpers';
import { topicService } from '../../../services/topic.service';
import { uploadService } from '../../../services/upload.service'; // Import thêm uploadService

const Topics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const data = await topicService.getAll();
      setTopics(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      message.error('Không thể tải danh sách Chủ đề (Topics)!');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingTopic(null);
    form.resetFields();
    setFileList([]);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingTopic(record);
    form.setFieldsValue(record);
    if (record.icon_url) {
      setFileList([{
        uid: '-1',
        name: 'icon.png',
        status: 'done',
        url: getImageUrl(record.icon_url),
      }]);
    } else {
      setFileList([]);
    }
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await topicService.delete(id);
      message.success('Đã xóa Topic thành công!');
      fetchTopics();
    } catch (error) {
      message.error('Lỗi khi xóa Topic! Có thể Topic này đang chứa Danh mục.');
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ hỗ trợ tải lên file ảnh!');
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Hình ảnh phải nhỏ hơn 2MB!');
      return Upload.LIST_IGNORE;
    }
    return false; // Chặn AntD tự upload
  };

  const handleFormSubmit = async (values) => {
    try {
      setLoading(true); // Bật loading khi bắt đầu lưu/upload
      const finalSlug = values.slug ? values.slug : generateSlug(values.name);
      
      let iconUrl = editingTopic ? editingTopic.icon_url : null;
      
      // LOGIC UPLOAD ẢNH
      if (fileList.length > 0 && fileList[0].originFileObj) {
        try {
          const formData = new FormData();
          formData.append('file', fileList[0].originFileObj);
          
          // Gọi API Upload
          const uploadRes = await uploadService.uploadImage(formData);
          iconUrl = uploadRes.url;
        } catch (uploadError) {
          message.error('Lỗi khi tải ảnh lên!');
          setLoading(false);
          return; // Dừng lại nếu upload lỗi
        }
      } else if (fileList.length === 0) {
        // Nếu người dùng xóa ảnh
        iconUrl = null;
      }

      const submitData = {
        ...values,
        slug: finalSlug,
        icon_url: iconUrl,
        is_featured: values.is_featured || false // Xử lý Switch
      };

      if (editingTopic) {
        await topicService.update(editingTopic.id, submitData);
        message.success('Cập nhật Topic thành công!');
      } else {
        await topicService.create(submitData);
        message.success('Thêm Topic mới thành công!');
      }
      setIsModalVisible(false);
      fetchTopics();
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu dữ liệu!');
    } finally {
      setLoading(false); // Tắt loading dù thành công hay thất bại
    }
  };

  const columns = [
    {
      title: 'Icon', dataIndex: 'icon_url', width: 80,
      render: (url) => url ? <img src={getImageUrl(url)} alt="icon" style={{width: 30, height: 30, objectFit: 'contain'}} /> : '-'
    },
    {
      title: 'Tên Topic', dataIndex: 'name', 
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Slug', dataIndex: 'slug',
      render: (slug) => <Tag color="blue">{slug}</Tag>
    },
    {
      title: 'Nổi bật', dataIndex: 'is_featured', width: 100,
      render: (is_featured) => is_featured ? <Tag color="gold">Có</Tag> : <Tag color="default">Không</Tag>
    },
    {
      title: 'Mô tả', dataIndex: 'description'
    },
    {
      title: 'Hành động', key: 'action', width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Xóa Topic này?" onConfirm={() => handleDelete(record.id)}>
            <Button type="primary" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{color: 'var(--color-primary, #fbbf24)', margin: 0}}>Quản lý Chủ đề (Topics)</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          Thêm Topic
        </Button>
      </div>

      <Table columns={columns} dataSource={topics} loading={loading} rowKey="id" pagination={{ pageSize: 10 }} />

      <Modal
        title={editingTopic ? "Chỉnh sửa Topic" : "Thêm Topic mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit} initialValues={{ is_featured: false }}>
          <Form.Item label="Icon Topic">
            <Upload listType="picture-card" fileList={fileList} onChange={({ fileList }) => setFileList(fileList)} beforeUpload={beforeUpload} maxCount={1} accept="image/*">
              {fileList.length >= 1 ? null : <div><PlusOutlined /><div style={{ marginTop: 8 }}>Tải ảnh</div></div>}
            </Upload>
          </Form.Item>

          <Form.Item name="name" label="Tên Topic" rules={[{ required: true, message: 'Nhập tên Topic!' }]}>
            <Input onChange={(e) => form.setFieldsValue({ slug: generateSlug(e.target.value) })} />
          </Form.Item>

          <Form.Item name="slug" label="Slug">
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="is_featured" label="Topic Nổi Bật (Hiện trang chủ)" valuePropName="checked">
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
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

export default Topics;