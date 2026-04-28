import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { optionGroupService } from '../../../../services/optionGroup.service';

const GroupsTab = ({ editingProgram }) => {
  const [groupsList, setGroupsList] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formGroup] = Form.useForm();

  useEffect(() => {
    if (editingProgram?.id) {
      fetchGroups(editingProgram.id);
    }
  }, [editingProgram]);

  const fetchGroups = async (programId) => {
    setLoadingGroups(true);
    try {
      const data = await optionGroupService.getByProgram(programId);
      setGroupsList(Array.isArray(data) ? data : data.items || []);
    } catch (e) {
      message.error('Lỗi tải nhóm cờ!');
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleOpenGroupModal = (group = null) => {
    setEditingGroup(group);
    if (group) {
      formGroup.setFieldsValue(group);
    } else {
      formGroup.resetFields();
    }
    setIsGroupModalVisible(true);
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await optionGroupService.delete(groupId);
      message.success('Đã xóa nhóm cờ!');
      fetchGroups(editingProgram.id);
    } catch (error) {
      message.error('Lỗi khi xóa nhóm cờ!');
    }
  };

  const handleSaveGroup = async (values) => {
    try {
      const submitData = { ...values, program_id: editingProgram.id };
      if (editingGroup) {
        await optionGroupService.update(editingGroup.id, submitData);
        message.success('Cập nhật nhóm cờ thành công!');
      } else {
        await optionGroupService.create(submitData);
        message.success('Thêm nhóm cờ mới thành công!');
      }
      setIsGroupModalVisible(false);
      fetchGroups(editingProgram.id);
    } catch (e) {
      message.error('Lỗi lưu nhóm cờ!');
    }
  };

  const groupColumns = [
    { title: 'Tên Nhóm', dataIndex: 'title', render: text => <strong>{text}</strong> },
    { title: 'Mô tả', dataIndex: 'description' },
    {
      title: 'Hành động',
      render: (_, r) => (
        <Space>
          <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => handleOpenGroupModal(r)}>Sửa</Button>
          <Popconfirm title="Xóa nhóm này?" onConfirm={() => handleDeleteGroup(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenGroupModal(null)}>
          Thêm Nhóm Mới
        </Button>
      </div>
      
      <Table 
        size="small" 
        dataSource={groupsList} 
        rowKey="id" 
        loading={loadingGroups} 
        columns={groupColumns} 
        pagination={{ pageSize: 5 }}
      />

      <Modal 
        title={editingGroup ? "Sửa Nhóm" : "Thêm Nhóm Mới"} 
        open={isGroupModalVisible} 
        onCancel={() => setIsGroupModalVisible(false)} 
        footer={null}
      >
        <Form form={formGroup} layout="vertical" onFinish={handleSaveGroup}>
          <Form.Item name="title" label="Tên Nhóm" rules={[{ required: true, message: 'Nhập tên nhóm!' }]}>
            <Input placeholder="VD: Compression Options" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả nhóm cờ này..." />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={() => setIsGroupModalVisible(false)} style={{ marginRight: 8 }}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu Nhóm</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GroupsTab;