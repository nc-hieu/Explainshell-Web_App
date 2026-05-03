import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Popconfirm, Tag, message, Select, Switch, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { optionService } from '../../../../services/option.service';
import { optionGroupService } from '../../../../services/optionGroup.service';
import RichTextEditor from '../../../../components/common/RichTextEditor';

const { Text } = Typography;

const OptionsTab = ({ editingProgram }) => {
  const [optionsList, setOptionsList] = useState([]);
  const [groupsList, setGroupsList] = useState([]); // State lưu danh sách nhóm cờ
  const [loadingOptions, setLoadingOptions] = useState(false);
  
  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [formOption] = Form.useForm();

  // Khi Tab mở lên, tải cả Options và Groups cùng lúc
  useEffect(() => {
    if (editingProgram?.id) {
      fetchData(editingProgram.id);
    }
  }, [editingProgram]);

  const fetchData = async (programId) => {
    setLoadingOptions(true);
    try {
      // Dùng Promise.all để gọi 2 API song song, giúp trang tải nhanh hơn
      const [optsData, grpsData] = await Promise.all([
        optionService.getByProgram(programId),
        optionGroupService.getByProgram(programId)
      ]);

      const grps = Array.isArray(grpsData) ? grpsData : grpsData.items || [];
      setGroupsList(grps);

      let opts = Array.isArray(optsData) ? optsData : optsData.items || [];
      
      // SẮP XẾP: Đưa các cờ cùng group lại gần nhau (Các cờ không có group (0 hoặc null) sẽ nằm trên cùng)
      opts.sort((a, b) => {
        const groupA = a.group_id || 0;
        const groupB = b.group_id || 0;
        return groupA - groupB;
      });

      setOptionsList(opts);
    } catch (e) {
      message.error('Lỗi tải dữ liệu cờ lệnh và nhóm!');
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleOpenOptionModal = (option = null) => {
    setEditingOption(option);
    if (option) {
      // Đổ dữ liệu vào Form
      formOption.setFieldsValue({
        ...option,
        group_id: option.group_id === 0 ? null : option.group_id // Nếu bằng 0 thì chuyển về null để Select hiển thị trống
      });
    } else {
      formOption.resetFields();
      // Gán giá trị mặc định khi Thêm mới
      formOption.setFieldsValue({
        is_featured: false,
        is_deprecated: false,
        group_id: null
      });
    }
    setIsOptionModalVisible(true);
  };

  const handleDeleteOption = async (optionId) => {
    try {
      await optionService.delete(optionId);
      message.success('Đã xóa cờ lệnh!');
      fetchData(editingProgram.id);
    } catch (error) {
      message.error('Lỗi khi xóa cờ lệnh!');
    }
  };

  const handleSaveOption = async (values) => {
    try {
      // Chuẩn hóa dữ liệu theo đúng JSON format bạn yêu cầu
      const submitData = {
        short_name: values.short_name || "",
        long_name: values.long_name || "",
        description: values.description || "",
        is_deprecated: values.is_deprecated || false,
        is_featured: values.is_featured || false,
        group_id: values.group_id || null  // Nếu không chọn nhóm, gửi null lên Backend
      };

      if (editingOption) {
        // Truyền programId và optionId vào hàm update
        await optionService.update(editingOption.id, submitData);
        message.success('Cập nhật cờ lệnh thành công!');
      } else {
        // Truyền programId vào hàm create
        await optionService.create(editingProgram.id, submitData);
        message.success('Thêm cờ lệnh mới thành công!');
      }
      setIsOptionModalVisible(false);
      fetchData(editingProgram.id); // Tải lại bảng để xem sắp xếp mới
    } catch (e) {
      // Bắt lỗi từ FastAPI (nếu có)
      if (e.response && e.response.data && e.response.data.detail) {
        message.error(e.response.data.detail);
      } else {
        message.error('Lỗi khi lưu cờ lệnh!');
      }
    }
  };

  const optionColumns = [
    {
      title: 'Tên Cờ',
      width: '20%',
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Space>
            {r.short_name && <Tag color="magenta">{r.short_name}</Tag>}
            {r.long_name && <Tag color="cyan">{r.long_name}</Tag>}
          </Space>
        </Space>
      )
    },
    { 
      title: 'Nhóm (Group)', 
      dataIndex: 'group_id',
      width: '25%',
      render: (groupId) => {
        if (!groupId || groupId === 0) return <Text type="secondary">Không có nhóm</Text>;
        const group = groupsList.find(g => g.id === groupId);
        return group ? <Tag color="purple">{group.title}</Tag> : <Tag>#{groupId}</Tag>;
      }
    },
    { 
      title: 'Mô tả', 
      // dataIndex: 'description' 
      render: (description) => {
        return description ? (<Tag color="green">Có Nội Dung</Tag>) : (<Tag color="red">Không</Tag>)
      }
    },
    {
      title: 'Trạng thái',
      width: '15%',
      render: (_, r) => (
        /* Hiển thị tag Nổi bật hoặc Đã cũ ngay dưới tên cờ */
        <Space style={{ marginTop: 4 }}>
            {r.is_featured && <Tag color="gold">Nổi bật</Tag>}
            {r.is_deprecated && <Tag color="red">Đã cũ</Tag>}
          </Space>
      )
    },
    {
      title: 'Hành động',
      width: '15%',
      render: (_, r) => (
        <Space>
          <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => handleOpenOptionModal(r)}></Button>
          <Popconfirm title="Xóa cờ này?" onConfirm={() => handleDeleteOption(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenOptionModal(null)}>
          Thêm Cờ Mới
        </Button>
      </div>
      
      <Table 
        size="small" 
        dataSource={optionsList} 
        rowKey="id" 
        loading={loadingOptions} 
        columns={optionColumns} 
        pagination={{ pageSize: 8 }} // Tăng số lượng hiển thị vì có phân nhóm rồi
      />

      <Modal 
        title={editingOption ? "Sửa Cờ" : "Thêm Cờ Mới"} 
        open={isOptionModalVisible} 
        onCancel={() => setIsOptionModalVisible(false)} 
        footer={null}
        destroyOnClose
      >
        <Form form={formOption} layout="vertical" onFinish={handleSaveOption}>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item name="short_name" label="Cờ ngắn (VD: -x)" style={{ flex: 1 }}>
              <Input placeholder="-x" />
            </Form.Item>
            <Form.Item name="long_name" label="Cờ dài (VD: --extract)" style={{ flex: 2 }}>
              <Input placeholder="--extract" />
            </Form.Item>
          </div>

          <Form.Item name="group_id" label="Thuộc Nhóm cờ (Group)">
            <Select allowClear placeholder="Chọn nhóm cờ (Tùy chọn)...">
              {groupsList.map(grp => (
                <Select.Option key={grp.id} value={grp.id}>{grp.title}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Nhập mô tả!' }]}>
            <RichTextEditor />
          </Form.Item>

          <div style={{ display: 'flex', gap: '24px', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
            <Form.Item name="is_featured" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Switch checkedChildren="Nổi bật" unCheckedChildren="Bình thường" />
            </Form.Item>
            
            <Form.Item name="is_deprecated" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Switch checkedChildren="Đã cũ (Bỏ mẫu)" unCheckedChildren="Đang dùng" />
            </Form.Item>
          </div>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={() => setIsOptionModalVisible(false)} style={{ marginRight: 8 }}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu Cờ</Button>
          </Form.Item>

        </Form>
      </Modal>
    </div>
  );
};

export default OptionsTab;