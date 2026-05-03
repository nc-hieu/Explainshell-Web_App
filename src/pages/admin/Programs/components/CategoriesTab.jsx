import React, { useState, useEffect } from 'react';
import { Form, Button, TreeSelect, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { categoryService } from '../../../../services/category.service';
import { programService } from '../../../../services/program.service'; 
import { getImageUrl } from '../../../../utils/helpers'; 

// Nhận thêm prop filterCategoryId
const CategoriesTab = ({ editingProgram, setEditingProgram, fetchPrograms, filterCategoryId }) => {
  const [formCategories] = Form.useForm();
  const [categoriesTree, setCategoriesTree] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [parentMap, setParentMap] = useState({});
  const [itemMapData, setItemMapData] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  // LOGIC ĐIỀN DỮ LIỆU TỰ ĐỘNG
  useEffect(() => {
    // Chỉ chạy logic khi dữ liệu cây danh mục đã được tải xong (itemMapData có dữ liệu)
    if (Object.keys(itemMapData).length === 0) return;

    if (editingProgram) {
      // Trường hợp 1: Lệnh đã có sẵn danh mục (sửa lệnh cũ)
      if (editingProgram.categories && editingProgram.categories.length > 0) {
        const defaultCategories = editingProgram.categories.map(c => {
          const labelContent = (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {c.icon_url && (
                <img 
                  src={getImageUrl(c.icon_url)} 
                  alt="icon" 
                  style={{ width: '16px', height: '16px', objectFit: 'contain' }} 
                />
              )}
              <span>{c.name}</span>
            </div>
          );
          return { value: c.id, label: labelContent };
        });
        formCategories.setFieldsValue({ category_ids: defaultCategories });
      } 
      // Trường hợp 2: Lệnh MỚI (chưa có danh mục nào) VÀ người dùng đang bật bộ lọc ngoài bảng
      else if (filterCategoryId) {
        const selectedSet = new Set();
        let currentId = filterCategoryId;
        
        // Vòng lặp truy ngược: Lấy ID hiện tại, tìm Cha của nó, tiếp tục tìm Cha của Cha...
        while (currentId) {
          selectedSet.add(currentId);
          currentId = parentMap[currentId];
        }

        // Chuyển đổi Set ID thành định dạng mà Ant Design TreeSelect yêu cầu
        const autoFilledCategories = Array.from(selectedSet).map(id => ({
          value: id,
          label: itemMapData[id]?.title || ''
        }));

        formCategories.setFieldsValue({ category_ids: autoFilledCategories });
      } 
      // Trường hợp 3: Lệnh mới, không có bộ lọc nào được chọn
      else {
        formCategories.setFieldsValue({ category_ids: [] });
      }
    }
  }, [editingProgram, formCategories, filterCategoryId, itemMapData, parentMap]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll(0, 100);
      const items = Array.isArray(data) ? data : data.items || [];
      const itemMap = {}; 
      const tree = [];
      const pMap = {}; 
      
      items.forEach(i => { 
        const titleContent = (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {i.icon_url && (
              <img 
                src={getImageUrl(i.icon_url)} 
                alt="icon" 
                style={{ width: '16px', height: '16px', objectFit: 'contain' }} 
              />
            )}
            <span>{i.name}</span>
          </div>
        );

        itemMap[i.id] = { ...i, key: i.id, value: i.id, title: titleContent, children: [] }; 
        if (i.parent_id) {
            pMap[i.id] = i.parent_id; 
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
      setParentMap(pMap); 
      setItemMapData(itemMap); 
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
      const rawCategoryIds = values.category_ids || [];
      const categoryIds = rawCategoryIds.map(item => typeof item === 'object' ? item.value : item);

      const updatedProgram = await programService.assignCategories(editingProgram.id, categoryIds);
      
      if (setEditingProgram) {
        setEditingProgram(updatedProgram || { ...editingProgram, categories: rawCategoryIds.map(c => ({ id: c.value || c, name: c.label || '' })) });
      }

      if (fetchPrograms) {
        fetchPrograms();
      }
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
        getValueFromEvent={(value, labelList, extra) => {
          if (!value) return [];
          const selectedSet = new Set(value.map(item => item.value));

          if (extra.checked && extra.triggerValue) {
            let currentId = extra.triggerValue;
            while (currentId) {
              const parentId = parentMap[currentId];
              if (parentId) {
                selectedSet.add(parentId);
              }
              currentId = parentId; 
            }
          }
          return Array.from(selectedSet).map(id => ({
            value: id,
            label: itemMapData[id]?.title || ''
          }));
        }}
      >
        <TreeSelect 
          treeData={categoriesTree} 
          treeCheckable={true} 
          treeCheckStrictly={true} 
          showCheckedStrategy={TreeSelect.SHOW_ALL} 
          placeholder="Vui lòng chọn danh mục (có thể chọn nhiều)..."
          style={{ width: '100%' }} 
          allowClear
          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
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