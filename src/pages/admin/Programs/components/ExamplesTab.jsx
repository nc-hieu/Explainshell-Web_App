import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Popconfirm, Tag, Select, Radio, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { exampleService } from '../../../../services/example.service';
import { optionService } from '../../../../services/option.service';
import { optionGroupService } from '../../../../services/optionGroup.service';
import { hasRichTextContent } from '../../../../utils/helpers';
import RichTextEditor from '../../../../components/common/RichTextEditor';

const { Text } = Typography;

const ExamplesTab = ({ editingProgram }) => {
  const [examplesList, setExamplesList] = useState([]);
  const [loadingExamples, setLoadingExamples] = useState(false);

  // State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
      setCurrentPage(1);
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
      message.error('Lỗi tải danh sách Example!');
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
      message.success('Đã xóa Example!');
      fetchExamples(editingProgram.id);
    } catch (error) {
      message.error('Lỗi khi xóa Example!');
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
        message.success('Cập nhật Examples thành công!');
      } else {
        await exampleService.create(submitData);
        message.success('Thêm Examples mới thành công!');
      }
      setIsExampleModalVisible(false);
      fetchExamples(editingProgram.id);
    } catch (e) {
      message.error('Lỗi lưu Examples!');
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
          return <Tag color="orange">[Option] {optName}</Tag>;
        }
        if (record.group_id) {
          // Tìm nhóm trong mảng groupsList để lấy tên
          const grp = groupsList.find(g => g.id === record.group_id);
          const grpName = grp ? grp.title : `#${record.group_id}`;
          return <Tag color="purple">[Group] {grpName}</Tag>;
        }
        return <Tag color="green">Lệnh chung</Tag>;
      }
    },
    {
      title: 'Câu lệnh / Chủ đề',
      dataIndex: 'command_line',
      render: (text) => (
        text && text.trim() ? <Tag color="geekblue">{text}</Tag> : <Tag color="red">Không Nội Dung</Tag>
      )
    },
    {
      title: 'Giải thích',
      dataIndex: 'explanation',
      render: (explanation) => (
        hasRichTextContent(explanation) ? <Tag color="green">Có Nội Dung</Tag> : <Tag color="red">Không Nội Dung</Tag>
      )
    },
    {
      title: 'Hành động',
      width: '15%',
      render: (_, r) => (
        <Space>
          {/* <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => handleOpenExampleModal(r)}></Button>
          <Popconfirm title="Xóa ví dụ này?" onConfirm={() => handleDeleteExample(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm> */}

          <Button icon={<EditOutlined />} onClick={() => handleOpenExampleModal(r)}>Sửa</Button>
          <Popconfirm title="Xóa Example này?" onConfirm={() => handleDeleteExample(r.id)}>
            <Button danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text type="secondary">Quản lý các Examples sử dụng thực tế cho command, option hoặc nhóm option.</Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenExampleModal(null)}>
          Thêm Example
        </Button>
      </div>

      <Table
        size="small"
        dataSource={examplesList}
        rowKey="id"
        loading={loadingExamples}
        columns={exampleColumns}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: examplesList.length,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} examples`,
          onChange: (page, newPageSize) => {
            setCurrentPage(page);
            setPageSize(newPageSize);
          }
        }}
      />

      <Modal
        title={editingExample ? "Sửa Example" : "Thêm Example Mới"}
        width={800}
        open={isExampleModalVisible}
        onCancel={() => setIsExampleModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={formExample} layout="vertical" onFinish={handleSaveExample}>

          {/* Radio Button để chọn Loại Ví Dụ */}
          <Form.Item name="target_type" label="Example này giải thích cho:" rules={[{ required: true }]}>
            <Radio.Group onChange={(e) => setTargetType(e.target.value)} buttonStyle="solid">
              <Radio.Button value="program">Base</Radio.Button>
              <Radio.Button value="option">Option</Radio.Button>
              <Radio.Button value="group">Option Group</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {/* Hiển thị Dropdown Chọn Nhóm nếu chọn loại Nhóm cờ */}
          {targetType === 'group' && (
            <Form.Item name="group_id" label="Chọn Option Group" rules={[{ required: true, message: 'Vui lòng chọn một nhóm cờ!' }]}>
              <Select placeholder="Chọn option group...">
                {groupsList.map(grp => (
                  <Select.Option key={grp.id} value={grp.id}>{grp.title}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {/* Hiển thị Dropdown Chọn Cờ nếu chọn loại Cờ lệnh */}
          {targetType === 'option' && (
            <Form.Item name="option_id" label="Chọn Option" rules={[{ required: true, message: 'Vui lòng chọn một option!' }]}>
              <Select placeholder="Chọn option...">
                {optionsList.map(opt => (
                  <Select.Option key={opt.id} value={opt.id}>
                    {opt.short_name || opt.long_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item name="command_line" label="Câu Lệnh Hoặc Chủ Đề">
            <Input placeholder="VD: tar -xvf archive.tar -or- Chủ đề..." />
          </Form.Item>

          <Form.Item name="explanation" label="Giải Thích" rules={[{ message: 'Vui lòng nhập giải thích!' }]}>
            <RichTextEditor />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={() => setIsExampleModalVisible(false)} style={{ marginRight: 8 }}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu Example</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamplesTab;