import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Select } from 'antd'; // Import thêm Select
import { SaveOutlined } from '@ant-design/icons';
import { generateSlug } from '../../../../utils/helpers';
import { programService } from '../../../../services/program.service';
import { topicService } from '../../../../services/topic.service'; // Import thêm topicService
import RichTextEditor from '../../../../components/common/RichTextEditor';

const GeneralTab = ({ editingProgram, setEditingProgram, fetchPrograms }) => {
  const [formGeneral] = Form.useForm();
  
  // State lưu danh sách Topic lấy từ API
  const [topics, setTopics] = useState([]);

  // 1. Fetch dữ liệu Topics khi component được mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await topicService.getAll(0, 100);
        setTopics(Array.isArray(data) ? data : data.items || []);
      } catch (error) {
        message.error('Không thể tải danh sách Chủ đề!');
      }
    };
    fetchTopics();
  }, []);

  // 2. Đổ dữ liệu vào Form khi người dùng chọn Sửa một lệnh
  useEffect(() => {
    if (editingProgram) {
      formGeneral.setFieldsValue(editingProgram);
      // Xóa trắng ô helper topic khi edit lệnh cũ (vì ta chỉ dùng nó để gen slug lúc tạo/sửa tay)
      formGeneral.setFieldsValue({ helper_topic_id: null }); 
    } else {
      formGeneral.resetFields();
    }
  }, [editingProgram, formGeneral]);

  // --- HÀM HỖ TRỢ TẠO SLUG THÔNG MINH ---
  const generateAndSetSlug = (topicId, programName) => {
    if (!programName) {
      formGeneral.setFieldsValue({ slug: '' });
      return;
    }
    
    let textToSlug = programName;
    
    // Nếu có chọn Topic, tìm tên Topic đó và nối vào trước tên lệnh
    if (topicId) {
      const selectedTopic = topics.find(t => t.id === topicId);
      if (selectedTopic) {
        textToSlug = `${selectedTopic.name} ${programName}`;
      }
    }

    formGeneral.setFieldsValue({ slug: generateSlug(textToSlug) });
  };

  const handleSaveGeneral = async (values) => {
    try {
      // LOẠI BỎ field phụ 'helper_topic_id' ra khỏi cục data gửi đi (vì DB không có trường này)
      const { helper_topic_id, ...restValues } = values;

      const finalSlug = restValues.slug ? restValues.slug : generateSlug(restValues.name);
      const submitData = { ...restValues, slug: finalSlug };

      if (editingProgram) {
        const saved = await programService.update(editingProgram.id, submitData);
        setEditingProgram(saved); 
        message.success('Cập nhật thông tin chung thành công!');
      } else {
        const saved = await programService.create(submitData);
        setEditingProgram(saved); 
        message.success('Tạo thành công! Bây giờ bạn có thể thêm các thông tin khác.');
      }
      fetchPrograms(); // Tải lại bảng chính bên ngoài
    } catch (e) { 
      if (e.response && e.response.data && e.response.data.detail) {
        message.error(e.response.data.detail);
      } else {
        message.error('Lỗi khi lưu thông tin chung!'); 
      }
      console.error("Chi tiết lỗi:", e);
    }
  };

  return (
    <Form form={formGeneral} layout="vertical" onFinish={handleSaveGeneral}>
      <Form.Item 
        name="name" 
        label="Tên Lệnh" 
        rules={[{ required: true, message: 'Vui lòng nhập tên lệnh!' }]}
      >
        <Input 
          placeholder="Ví dụ: tar, ls..." 
          onChange={(e) => {
            // Khi gõ tên lệnh, lấy giá trị topic đang được chọn hiện tại
            const currentTopicId = formGeneral.getFieldValue('helper_topic_id');
            generateAndSetSlug(currentTopicId, e.target.value);
          }}
        />
      </Form.Item>
      
      {/* Ô chọn Topic chỉ dùng để hỗ trợ tạo Slug, nằm ngay trên Slug */}
      <Form.Item 
        name="helper_topic_id" 
        label="Chủ đề (Hỗ trợ tạo Slug)"
        tooltip="Chỉ dùng để nối tên chủ đề vào trước Slug (VD: linux-tar). Không lưu vào cấu hình gốc của Lệnh."
      >
        <Select 
          placeholder="Chọn Chủ đề (Tùy chọn)" 
          allowClear
          showSearch
          optionFilterProp="children"
          onChange={(topicId) => {
            // Khi đổi Topic, lấy giá trị tên lệnh hiện tại
            const currentProgramName = formGeneral.getFieldValue('name');
            generateAndSetSlug(topicId, currentProgramName);
          }}
        >
          {topics.map(topic => (
            <Select.Option key={topic.id} value={topic.id}>
              {topic.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="slug" label="Slug">
        <Input placeholder="Tự động tạo (vd: tar, ls-command)" />
      </Form.Item>

      <Form.Item name="description" label="Mô tả">
        <RichTextEditor />
      </Form.Item>
      
      <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
        Lưu Thông Tin
      </Button>
    </Form>
  );
};

export default GeneralTab;