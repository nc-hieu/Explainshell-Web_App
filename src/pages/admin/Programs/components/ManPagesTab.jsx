import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Popconfirm, message, Tag, Select, InputNumber, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { manPageService } from '../../../../services/manPage.service';
import { osDistributionService } from '../../../../services/osDistribution.service';
import RichTextEditor from '../../../../components/common/RichTextEditor';
import { getImageUrl } from '../../../../utils/helpers'; 

const ManPagesTab = ({ editingProgram }) => {
  const [manPagesList, setManPagesList] = useState([]);
  const [distroList, setDistroList] = useState([]); // State lưu danh sách Distro
  const [loadingManPages, setLoadingManPages] = useState(false);

  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [editingManPage, setEditingManPage] = useState(null);
  const [formGroup] = Form.useForm();
  
  useEffect(() => {
    if (editingProgram?.id) {
      fetchManPages(editingProgram.id);
    }
  }, [editingProgram]);

  //Fetch Data
  const fetchManPages = async (programId) => {
    setLoadingManPages(true);
    try {
      // Dùng Promise.all để gọi 2 API song song, giúp trang tải nhanh hơn
      const [manpageData, distroData] = await Promise.all([
        manPageService.getByProgram(programId),
        osDistributionService.getAll()
      ]);
      const distro = Array.isArray(distroData) ? distroData : distroData.items || [];
      const manpage = Array.isArray(manpageData) ? manpageData : manpageData.items || [];
      setDistroList(distro);
      setManPagesList(manpage);
      
    } catch (e) {
      message.error('Lỗi tải ManPages!');
    } finally {
      setLoadingManPages(false);
    }
  };

  const handleOpenGroupModal = (manPages = null) => {
    setEditingManPage(manPages);
    if (manPages) {
      formGroup.setFieldsValue({
      ...manPages,
      distro_id: manPages.os_id || manPages.os?.id 
    });
    } else {
      formGroup.resetFields();
    }
    setIsGroupModalVisible(true);
  };

const handleDeleteManpage = async (manPageId) => {
    try {
      await manPageService.delete(manPageId);
      message.success('Đã xóa ManPage cờ!');
      fetchManPages(editingProgram.id);
    } catch (error) {
      message.error('Lỗi khi xóa ManPage!');
    }
  };

  const handleSaveGroup = async (values) => {
    try {
      console.log("Data: ", values);
      const submitData = { ...values, program_id: editingProgram.id, os_id: values.distro_id };
      if (editingManPage){
        await manPageService.update(editingManPage.id, submitData);
        message.success('Cập nhật ManPage thành công!');
      } else {
        await manPageService.create(submitData);
        message.success('Thêm ManPage mới thành công!');
      }
      setIsGroupModalVisible(false);
      fetchManPages(editingProgram.id);
    } catch (e) {
      message.error('Lỗi lưu ManPage!');
    }
  };

  //Add dữ liệu vào table
  const maPagesColumns = [
    { title: 'Distribution', 
      render: (_, record) => {
      return(
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {record.os?.icon_url && (
            <img 
              src={getImageUrl(record.os.icon_url)} 
              alt="icon" 
              style={{ width: '20px', height: '20px', objectFit: 'contain' }} 
            />)}
          <span>{record.os?.name}</span>
        </div>
      )
    }},
    {title: 'Nội Dung',
      render: (record) => {
      return record.content ? (<Tag color="green">Có Nội Dung</Tag>) : (<Tag color="red">Không</Tag>)
    }},
    { title: 'Link', dataIndex: 'source_url' },
    {
      title: 'Hành động',
      width: '15%',
      render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleOpenGroupModal(r)}>Sửa</Button>
          <Popconfirm title="Xóa ghi chú này?" onConfirm={() => handleDeleteManpage(r.id)}>
            <Button danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];


  return(
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenGroupModal(null)}>
          Thêm ManPage
        </Button>
      </div>

      <Table 
        size="small" 
        dataSource={manPagesList} 
        rowKey="id" 
        loading={loadingManPages} 
        columns={maPagesColumns} 
        pagination={{ pageSize: 10 }}
      />

      <Modal 
        title={editingManPage ? "Sửa ManPage" : "Thêm ManPage Mới"} 
        width={800}
        open={isGroupModalVisible} 
        onCancel={() => setIsGroupModalVisible(false)} 
        footer={null}
      >
        <Form form={formGroup} layout="vertical" onFinish={handleSaveGroup}>
          <Form.Item name="distro_id" label="Distro (Bắt buộc)" rules={[{ required: true, message: 'Chọn Distribution!' }]}>
            <Select allowClear placeholder="Chọn Distro ...">
              {distroList.map(distro => (
                <Select.Option key={distro.id} value={distro.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {distro.icon_url && (
                    <img 
                      src={getImageUrl(distro.icon_url)} 
                      alt="icon" 
                      style={{ width: '20px', height: '20px', objectFit: 'contain' }} 
                    />
                  )}
                  <span>{distro.name}</span>
                </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>    

          <Row gutter={16}> {/* gutter={16} tạo khoảng cách giữa 2 cột */}
            {/* Cột 1: Section (Chiếm 8/24 tương đương 1/3 hàng) */}
            <Col span={8}>
              <Form.Item 
                name="section" 
                label="Section (Tùy Chọn)"
                rules={[
                  { type: 'number', message: 'Vui lòng nhập số!' }
                ]}
              >
                <InputNumber 
                  placeholder="VD: 1 (Từ 1 đến 8)" 
                  style={{ width: '100%' }} 
                  min={1}                  
                  max={8}               
                />
              </Form.Item>
            </Col>
            {/* Cột 2: Link ManPages (Chiếm 16/24 tương đương 2/3 hàng) */}
            <Col span={16}>
              <Form.Item 
                name="source_url" 
                label="Link ManPages" 
                rules={[{ required: true, message: 'Nhập Link!' }]}
              >
                <Input placeholder="https://..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="content" label="Mô tả (Tùy Chọn)">
            <RichTextEditor />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={() => setIsGroupModalVisible(false)} style={{ marginRight: 8 }}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu Nhóm</Button>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
}

export default ManPagesTab;