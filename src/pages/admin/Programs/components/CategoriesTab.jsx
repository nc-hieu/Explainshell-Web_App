import React, { useState, useEffect } from 'react';
import { Form, Button, TreeSelect, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { categoryService } from '../../../../services/category.service';
import { programService } from '../../../../services/program.service'; 

const CategoriesTab = ({ editingProgram }) => {
  const [formCategories] = Form.useForm();
  const [categoriesTree, setCategoriesTree] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State mới để phục vụ logic tự chọn cấp cha
  const [parentMap, setParentMap] = useState({});
  const [itemMapData, setItemMapData] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editingProgram) {
      if (editingProgram.categories && editingProgram.categories.length > 0) {
        // Do bật treeCheckStrictly, Antd yêu cầu value phải là mảng object: [{ value: 1, label: 'Name' }]
        const defaultCategories = editingProgram.categories.map(c => ({
          value: c.id,
          label: c.name // Đảm bảo object category từ API có trường name
        }));
        formCategories.setFieldsValue({ category_ids: defaultCategories });
      } else {
        formCategories.setFieldsValue({ category_ids: [] });
      }
    }
  }, [editingProgram, formCategories]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll(0, 100);
      const items = Array.isArray(data) ? data : data.items || [];
      const itemMap = {}; 
      const tree = [];
      const pMap = {}; // Khởi tạo map lưu trữ quan hệ Con -> Cha
      
      items.forEach(i => { 
        itemMap[i.id] = { ...i, key: i.id, value: i.id, title: i.name, children: [] }; 
        if (i.parent_id) {
            pMap[i.id] = i.parent_id; // Ghi nhận Cha của ID này
        }
      });
      
      items.forEach(i => {
        if (i.parent_id && itemMap[i.parent_id]) {
            itemMap[i.parent_id].children.push(itemMap[i.id]);
        } else {
            tree.push(itemMap[i.id]);
        }
      });

      setCategoriesTree(tree);
      setParentMap(pMap); // Lưu vào state
      setItemMapData(itemMap); // Lưu vào state để lấy label hiển thị khi tự động check
    } catch (e) {
      console.error('Lỗi tải danh mục:', e);
      message.error('Không thể tải danh sách danh mục!');
    }
  };

  const handleSaveCategories = async (values) => {
    if (!editingProgram || !editingProgram.id) {
      message.error('Lỗi: Không tìm thấy ID của Lệnh đang sửa!');
      return;
    }

    setLoading(true);
    try {
      // Do dùng treeCheckStrictly, values.category_ids giờ là mảng Object. 
      // Ta cần bóc tách để lấy mảng ID thuần túy gửi xuống Backend.
      const rawCategoryIds = values.category_ids || [];
      const categoryIds = rawCategoryIds.map(item => typeof item === 'object' ? item.value : item);

      await programService.assignCategories(editingProgram.id, categoryIds);
      message.success('Đã cập nhật danh mục cho lệnh thành công!');
    } catch (error) {
      console.error("Lỗi khi lưu danh mục:", error);
      if (error.response && error.response.data && error.response.data.detail) {
        message.error(error.response.data.detail);
      } else {
        message.error('Có lỗi xảy ra khi lưu danh mục!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={formCategories} layout="vertical" onFinish={handleSaveCategories}>
      <Form.Item 
        name="category_ids" 
        label="Chọn Danh mục cho lệnh này"
        // Sử dụng getValueFromEvent để can thiệp vào logic khi người dùng check/uncheck
        getValueFromEvent={(value, labelList, extra) => {
          if (!value) return [];
          
          // Tạo một Set chứa các ID hiện đang được chọn
          const selectedSet = new Set(value.map(item => item.value));

          // Nếu hành động là "Check" (chọn thêm) một danh mục
          if (extra.checked && extra.triggerValue) {
            let currentId = extra.triggerValue;
            
            // Chạy vòng lặp duyệt ngược lên để tự động thêm các cấp Cha, Ông...
            while (currentId) {
              const parentId = parentMap[currentId];
              if (parentId) {
                selectedSet.add(parentId);
              }
              currentId = parentId; // Tiếp tục gán để tìm lên cấp cao hơn
            }
          }

          // Trả về format [{ value, label }] để TreeSelect hiển thị đúng thẻ Tag
          return Array.from(selectedSet).map(id => ({
            value: id,
            label: itemMapData[id]?.title || ''
          }));
        }}
      >
        <TreeSelect 
          treeData={categoriesTree} 
          treeCheckable={true} 
          treeCheckStrictly={true} // BẬT CÁI NÀY: Ngắt liên kết chọn Cha tự chọn Con
          showCheckedStrategy={TreeSelect.SHOW_ALL} 
          placeholder="Vui lòng chọn danh mục (có thể chọn nhiều)..."
          style={{ width: '100%' }} 
          allowClear
        />
      </Form.Item>
      
      <Button 
        type="primary" 
        htmlType="submit" 
        icon={<SaveOutlined />}
        loading={loading}
      >
        Lưu Danh Mục
      </Button>
    </Form>
  );
};

export default CategoriesTab;