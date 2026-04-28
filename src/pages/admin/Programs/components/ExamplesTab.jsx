import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Popconfirm, Tag, Select, Radio, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { exampleService } from '../../../../services/example.service';
import { optionService } from '../../../../services/option.service';
import { optionGroupService } from '../../../../services/optionGroup.service';

const ExamplesTab = ({ editingProgram }) => {
  const [examplesList, setExamplesList] = useState([]);
  const [loadingExamples, setLoadingExamples] = useState(false);
  
  // Dữ liệu dùng cho các ô Select và hiển thị ở Bảng
  const [optionsList, setOptionsList] = useState([]);
  const [groupsList, setGroupsList] = useState([]);

  // State Modal và Form
  const [isExampleModalVisible, setIsExampleModalVisible] = useState(false);
  const [editingExample, setEditingExample] = useState(null);
  const [formExample] = Form.useForm();
  
  // State quản lý loại ví dụ đang được chọn trong Form
  const [targetType, setTargetType] = useState('program');

  useEffect(() => {
    if (editingProgram?.id) {
      fetchExamples(editingProgram.id);
      fetchDropdownData(editingProgram.id);
    }
  }, [editingProgram]);

  const fetchExamples = async (programId) => {
    setLoadingExamples(true);
    try {
      const data = await exampleService.getByProgram(programId);
      setExamplesList(Array.isArray(data) ? data : data.items || []);
    } catch (e) {
      message.error('Lỗi tải danh sách ví dụ!');
    } finally {
      setLoadingExamples(false);
    }
  };

  const fetchDropdownData = async (programId) => {
    try {
      const [opts, grps] = await Promise.all([
        optionService.getByProgram(programId),
        optionGroupService.getByProgram(programId)
      ]);
      setOptionsList(Array.isArray(opts) ? opts : opts.items || []);
      setGroupsList(Array.isArray(grps) ? grps : grps.items || []);
    } catch (e) {
      console.error("Lỗi khi tải dữ liệu cho dropdown", e);
    }
  };

  const handleOpenExampleModal = (example = null) => {
    setEditingExample(example);
    
    // Xác định xem ví dụ này (nếu đang sửa) thuộc loại nào để hiển thị Form cho đúng
    let initialTarget = 'program';
    if (example) {
      if (example.option_id) initialTarget = 'option';
      else if (example.group_id) initialTarget = 'group';
      
      formExample.setFieldsValue({
        ...example,
        target_type: initialTarget
      });
    } else {
      formExample.resetFields();
      formExample.setFieldsValue({ target_type: 'program' }); // Mặc định khi thêm mới
    }
    
    setTargetType(initialTarget);
    setIsExampleModalVisible(true);
  };

  const handleDeleteExample = async (exampleId) => {
    try {
      await exampleService.delete(exampleId);
      message.success('Đã xóa ví dụ!');
      fetchExamples(editingProgram.id);
    } catch (error) {
      message.error('Lỗi khi xóa ví dụ!');
    }
  };

  const handleSaveExample = async (values) => {
    try {
      // Xử lý dữ liệu chuẩn bị gửi lên API theo đúng logic của Database
      const submitData = {
        command_line: values.command_line,
        explanation: values.explanation,
        program_id: editingProgram.id,
        is_common: values.is_common ?? true, // Tạm gán mặc định là true nếu API yêu cầu
        // Nếu chọn program, ép cả 2 về null. Ngược lại, chỉ lấy id tương ứng.
        group_id: values.target_type === 'group' ? values.group_id : null,
        option_id: values.target_type === 'option' ? values.option_id : null,
      };

      if (editingExample) {
        await exampleService.update(editingExample.id, submitData);
        message.success('Cập nhật ví dụ thành công!');
      } else {
        await exampleService.create(submitData);
        message.success('Thêm ví dụ mới thành công!');
      }
      setIsExampleModalVisible(false);
      fetchExamples(editingProgram.id);
    } catch (e) {
      message.error('Lỗi lưu ví dụ!');
    }
  };

  // Cấu hình Bảng hiển thị
  const exampleColumns = [
    { 
      title: 'Phân loại', 
      key: 'target',
      width: '18%',
      render: (_, record) => {
        if (record.option_id) {
          // Tìm cờ trong mảng optionsList để lấy tên
          const opt = optionsList.find(o => o.id === record.option_id);
          const optName = opt ? (opt.short_name || opt.long_name) : `#${record.option_id}`;
          return <Tag color="orange">Cờ: {optName}</Tag>;
        }
        if (record.group_id) {
          // Tìm nhóm trong mảng groupsList để lấy tên
          const grp = groupsList.find(g => g.id === record.group_id);
          const grpName = grp ? grp.title : `#${record.group_id}`;
          return <Tag color="purple">Nhóm: {grpName}</Tag>;
        }
        return <Tag color="green">Lệnh chung</Tag>;
      }
    },
    { 
      title: 'Câu lệnh', 
      dataIndex: 'command_line', 
      render: text => <Tag color="geekblue">{text}</Tag> 
    },
    { 
      title: 'Giải thích', 
      dataIndex: 'explanation' 
    },
    {
      title: 'Hành động',
      width: '15%',
      render: (_, r) => (
        <Space>
          <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => handleOpenExampleModal(r)}></Button>
          <Popconfirm title="Xóa ví dụ này?" onConfirm={() => handleDeleteExample(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenExampleModal(null)}>
          Thêm Ví Dụ
        </Button>
      </div>
      
      <Table 
        size="small" 
        dataSource={examplesList} 
        rowKey="id" 
        loading={loadingExamples} 
        columns={exampleColumns} 
        pagination={{ pageSize: 5 }}
      />

      <Modal 
        title={editingExample ? "Sửa Ví dụ" : "Thêm Ví dụ Mới"} 
        open={isExampleModalVisible} 
        onCancel={() => setIsExampleModalVisible(false)} 
        footer={null}
        destroyOnClose
      >
        <Form form={formExample} layout="vertical" onFinish={handleSaveExample}>
          
          {/* Radio Button để chọn Loại Ví Dụ */}
          <Form.Item name="target_type" label="Ví dụ này giải thích cho:" rules={[{ required: true }]}>
            <Radio.Group onChange={(e) => setTargetType(e.target.value)} buttonStyle="solid">
              <Radio.Button value="program">Lệnh chung</Radio.Button>
              <Radio.Button value="group">Nhóm cờ</Radio.Button>
              <Radio.Button value="option">Cờ lệnh</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {/* Hiển thị Dropdown Chọn Nhóm nếu chọn loại Nhóm cờ */}
          {targetType === 'group' && (
            <Form.Item name="group_id" label="Chọn Nhóm cờ" rules={[{ required: true, message: 'Vui lòng chọn một nhóm cờ!' }]}>
              <Select placeholder="Chọn nhóm cờ...">
                {groupsList.map(grp => (
                  <Select.Option key={grp.id} value={grp.id}>{grp.title}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {/* Hiển thị Dropdown Chọn Cờ nếu chọn loại Cờ lệnh */}
          {targetType === 'option' && (
            <Form.Item name="option_id" label="Chọn Cờ lệnh" rules={[{ required: true, message: 'Vui lòng chọn một cờ lệnh!' }]}>
              <Select placeholder="Chọn cờ lệnh...">
                {optionsList.map(opt => (
                  <Select.Option key={opt.id} value={opt.id}>
                    {opt.short_name || opt.long_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item name="command_line" label="Câu lệnh ví dụ" rules={[{ required: true, message: 'Vui lòng nhập câu lệnh!' }]}>
            <Input placeholder="VD: tar -xvf archive.tar" />
          </Form.Item>
          
          <Form.Item name="explanation" label="Giải thích ý nghĩa" rules={[{ message: 'Vui lòng nhập giải thích!' }]}>
            <Input.TextArea rows={3} placeholder="Mô tả lệnh/cờ này làm gì..." />
          </Form.Item>
          
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={() => setIsExampleModalVisible(false)} style={{ marginRight: 8 }}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu Ví Dụ</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamplesTab;