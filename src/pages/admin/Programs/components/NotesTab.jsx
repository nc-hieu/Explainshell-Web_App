import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { noteService } from '../../../../services/note.service';
import RichTextEditor from '../../../../components/common/RichTextEditor';
import DOMPurify from 'dompurify';

const { Text } = Typography;

const NotesTab = ({ editingProgram }) => {
  const [notesList, setNotesList] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form] = Form.useForm();

  // Load danh sách ghi chú khi mở Tab của một Lệnh cụ thể
  useEffect(() => {
    if (editingProgram?.id) {
      fetchNotes(editingProgram.id);
    }
  }, [editingProgram]);

  const fetchNotes = async (programId) => {
    setLoading(true);
    try {
      const data = await noteService.getByProgram(programId);
      setNotesList(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Không thể tải danh sách Ghi chú!');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingNote(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingNote(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await noteService.delete(id);
      message.success('Đã xóa ghi chú thành công!');
      fetchNotes(editingProgram.id);
    } catch (error) {
      message.error('Lỗi khi xóa ghi chú!');
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      // Gắn thêm program_id vào cục data trước khi gửi đi
      const submitData = {
        ...values,
        program_id: editingProgram.id
      };

      if (editingNote) {
        await noteService.update(editingNote.id, submitData);
        message.success('Cập nhật ghi chú thành công!');
      } else {
        await noteService.create(submitData);
        message.success('Thêm ghi chú mới thành công!');
      }
      
      setIsModalVisible(false);
      fetchNotes(editingProgram.id);
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu ghi chú!');
    }
  };

  const columns = [
    {
      title: 'Tiêu đề Ghi chú',
      dataIndex: 'title',
      width: '30%',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      render: (content) => (
        // Chỉ hiển thị tối đa 2 dòng mô tả ở ngoài bảng cho gọn
        <div 
          style={{ 
            display: '-webkit-box', 
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical', 
            overflow: 'hidden' 
          }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} 
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Xóa ghi chú này?" onConfirm={() => handleDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Text type="secondary">Quản lý các Ghi chú, Mẹo hay (Tips), Lưu ý bảo mật... cho lệnh này.</Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          Thêm Ghi chú
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={notesList} 
        loading={loading} 
        rowKey="id" 
        pagination={{ pageSize: 10 }} 
      />

      <Modal
        title={editingNote ? "Chỉnh sửa Ghi chú" : "Thêm Ghi chú mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800} // Form hơi to ra một chút để chứa RichTextEditor cho thoải mái
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item 
            name="title" 
            label="Tiêu đề Ghi chú" 
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input placeholder="Ví dụ: Lưu ý quan trọng khi dùng cờ --force..." />
          </Form.Item>

          <Form.Item 
            name="content" 
            label="Nội dung" 
            rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
          >
            <RichTextEditor />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8 }}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu lại</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NotesTab;