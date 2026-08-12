import React, { useState, useEffect } from 'react';
import { osDistributionService } from '../../../services/osDistribution.service';
import { uploadService } from '../../../services/upload.service';
import { Table, Button, Space, Popconfirm, message, Tag, Modal, Form, Input, Upload, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { generateSlug, getImageUrl, getFileName } from '../../../utils/helpers';

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

  const handleDelete = async (id, icon_url) => {
    try {
      if(icon_url){
        try{
          let file_name = getFileName(icon_url);
          await uploadService.deleteImage(file_name);
        }
        catch(error){
          message.error('Lỗi khi xóa icon!');
          return;
        }
      }
      await osDistributionService.delete(id);
      message.success('Đã xóa Distributisons thành công!');
      fetchDistros();
    } catch (error) {
      message.error('Lỗi khi xóa Distributisons!');
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
      setLoading(true);
      const finalSlug = values.slug ? values.slug : generateSlug(values.name);

      let iconUrl = editingDistro ? editingDistro.icon_url : null;

      // 1. Kiểm tra trạng thái thay đổi ảnh
      const isUploadingNewFile = fileList.length > 0 && fileList[0].originFileObj;
      const isDeletingFile = fileList.length === 0;

      // 2. LOGIC XÓA ẢNH CŨ (Nếu đang sửa, có ảnh cũ, và người dùng thay đổi ảnh)
      if (editingDistro && editingDistro.icon_url && (isUploadingNewFile || isDeletingFile)) {
        try {
          let old_file_name = getFileName(editingDistro.icon_url);
          await uploadService.deleteImage(old_file_name);
        } catch (error) {
          message.error('Lỗi khi xóa icon cũ trên hệ thống!');
          // Bỏ return nếu Vẫn tiếp tục thực hiện để không chặn luồng cập nhật
          return;
        }
      }

      // 3. LOGIC UPLOAD ẢNH MỚI
      if (isUploadingNewFile) {
        try {
          const formData = new FormData();
          formData.append('file', fileList[0].originFileObj);
          
          const uploadRes = await uploadService.uploadImage(formData);
          iconUrl = uploadRes.url;
        } catch (uploadError) {
          message.error('Lỗi khi tải ảnh mới lên!');
          setLoading(false);
          return; // Dừng lại nếu upload ảnh mới thất bại
        }
      } else if (isDeletingFile) {
        // Nếu người dùng xóa hẳn ảnh đi và không up ảnh mới
        iconUrl = null;
      }

      // 4. LƯU DỮ LIỆU
      const submitData = {
        ...values,
        slug: finalSlug,
        icon_url: iconUrl,
      };

      if (editingDistro) {
        await osDistributionService.update(editingDistro.id, submitData);
        message.success('Cập nhật Distributions thành công!');
      } else {
        await osDistributionService.create(submitData);
        message.success('Thêm Distributions mới thành công!');
      }
      setIsModalVisible(false);
      fetchDistros();
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu dữ liệu!');
      console.log(error);
    } finally {
      setLoading(false); 
    }
  };

  //Columns
  const columns = [
    {
      title: 'Icon', dataIndex: 'icon_url', width: 80,
      render: (url) => url ? <img src={getImageUrl(url)} alt="icon" style={{width: 30, height: 30, objectFit: 'contain'}} /> : '-'
    },
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
          <Popconfirm title="Xóa Distributisons này?" onConfirm={() => handleDelete(record.id, record.icon_url)}>
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

          <Form.Item label="Icon Distribution">
            <Upload listType="picture-card" fileList={fileList} onChange={({ fileList }) => setFileList(fileList)} beforeUpload={beforeUpload} maxCount={1} accept="image/*">
              {fileList.length >= 1 ? null : <div><PlusOutlined /><div style={{ marginTop: 8 }}>Tải ảnh</div></div>}
            </Upload>
          </Form.Item>

          <Form.Item name="name" label="Tên Distro" rules={[{ required: true, message: 'Nhập tên Distro!' }]}>
            <Input onChange={(e) => form.setFieldsValue({ slug: generateSlug(`distro-${e.target.value}`) })} />
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