import React, { useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { generateSlug } from '../../../../utils/helpers';
import { programService } from '../../../../services/program.service';

const GeneralTab = ({ editingProgram, setEditingProgram, fetchPrograms }) => {
  const [formGeneral] = Form.useForm();

  // Đổ dữ liệu vào Form khi người dùng chọn Sửa một lệnh
  useEffect(() => {
    if (editingProgram) {
      formGeneral.setFieldsValue(editingProgram);
    } else {
      formGeneral.resetFields();
    }
  }, [editingProgram, formGeneral]);

  const handleSaveGeneral = async (values) => {
    try {
      const finalSlug = values.slug ? values.slug : generateSlug(values.name);
      const submitData = { ...values, slug: finalSlug };

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
      // Kiểm tra xem lỗi có phải do Backend trả về (có e.response) và có trường 'detail' hay không
      if (e.response && e.response.data && e.response.data.detail) {
        // Hiển thị trực tiếp thông báo lỗi từ FastAPI (VD: "Slug này đã tồn tại trong hệ thống.")
        message.error(e.response.data.detail);
      } else {
        // Thông báo dự phòng cho các lỗi khác (Mất mạng, Server sập 500...)
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
            formGeneral.setFieldsValue({ slug: generateSlug(e.target.value) });
          }}
        />
      </Form.Item>
      
      <Form.Item name="slug" label="Slug">
        <Input placeholder="Tự động tạo (vd: tar, ls-command)" />
      </Form.Item>

      <Form.Item name="description" label="Mô tả">
        <Input.TextArea rows={4} placeholder="Nhập mô tả về lệnh..." />
      </Form.Item>
      
      <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
        Lưu Thông Tin
      </Button>
    </Form>
  );
};

export default GeneralTab;