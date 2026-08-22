import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Popconfirm, message, Typography, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { optionGroupService } from '../../../../services/optionGroup.service';
import { hasRichTextContent } from '../../../../utils/helpers';
import RichTextEditor from '../../../../components/common/RichTextEditor';

const { Text } = Typography;

const GroupsTab = ({ editingProgram }) => {
  const [groupsList, setGroupsList] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formGroup] = Form.useForm();

  useEffect(() => {
    if (editingProgram?.id) {
      setCurrentPage(1);
      fetchGroups(editingProgram.id);
    }
  }, [editingProgram]);

  const fetchGroups = async (programId) => {
    setLoadingGroups(true);
    try {
      const data = await optionGroupService.getByProgram(programId);
      setGroupsList(Array.isArray(data) ? data : data.items || []);
    } catch (e) {
      message.error('Lỗi tải Option Groups!');
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
      message.success('Đã xóa Option Groups!');
      fetchGroups(editingProgram.id);
    } catch (error) {
      message.error('Lỗi khi xóa Option Groups!');
    }
  };

  const handleSaveGroup = async (values) => {
    try {
      const submitData = { ...values, program_id: editingProgram.id };
      if (editingGroup) {
        await optionGroupService.update(editingGroup.id, submitData);
        message.success('Cập nhật Option Groups thành công!');
      } else {
        await optionGroupService.create(submitData);
        message.success('Thêm Option Groups mới thành công!');
      }
      setIsGroupModalVisible(false);
      fetchGroups(editingProgram.id);
    } catch (e) {
      message.error('Lỗi lưu Option Groups!');
    }
  };

  const groupColumns = [
    { title: 'Tên Option Groups', dataIndex: 'title', render: text => <>{text}</> },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      render: (description) => (
        hasRichTextContent(description) ? <Tag color="green">Có Nội Dung</Tag> : <Tag color="red">Không</Tag>
      )
    },
    {
      title: 'Hành động', width: 150,
      render: (_, r) => (
        <Space>
          {/* <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => handleOpenGroupModal(r)}>Sửa</Button>
          <Popconfirm title="Xóa nhóm này?" onConfirm={() => handleDeleteGroup(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm> */}

          <Button icon={<EditOutlined />} onClick={() => handleOpenGroupModal(r)}>Sửa</Button>
          <Popconfirm title="Xóa Option Group này?" onConfirm={() => handleDeleteGroup(r.id)}>
            <Button danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text type="secondary">Quản lý các Nhóm Options (Option Groups) giúp phân loại và gom nhóm cờ cho lệnh này.</Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenGroupModal(null)}>
          Thêm Option Groups
        </Button>
      </div>

      <Table
        size="small"
        dataSource={groupsList}
        rowKey="id"
        loading={loadingGroups}
        columns={groupColumns}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: groupsList.length,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} groups`,
          onChange: (page, newPageSize) => {
            setCurrentPage(page);
            setPageSize(newPageSize);
          }
        }}
      />

      <Modal
        title={editingGroup ? "Sửa Option Groups" : "Thêm Option Groups Mới"}
        width={800}
        open={isGroupModalVisible}
        onCancel={() => setIsGroupModalVisible(false)}
        footer={null}
      >
        <Form form={formGroup} layout="vertical" onFinish={handleSaveGroup}>
          <Form.Item name="title" label="Tên Option Groups" rules={[{ required: true, message: 'Nhập tên Option Groups!' }]}>
            <Input placeholder="VD: Compression Options" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <RichTextEditor />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={() => setIsGroupModalVisible(false)} style={{ marginRight: 8 }}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu Option Groups</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GroupsTab;