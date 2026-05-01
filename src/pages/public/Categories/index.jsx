import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Input, Space, Tag, Spin, Empty } from 'antd';
import { SearchOutlined, FolderOpenOutlined, CodeOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../../services/category.service';
import { getImageUrl } from '../../../utils/helpers';

import './Categories.scss';

const { Title, Text } = Typography;

const Categories = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchRootCategories();
  }, []);

  const fetchRootCategories = async () => {
    setLoading(true);
    try {
      // 1. Gọi API lấy danh sách Root Categories
      const roots = await categoryService.getRoots();
      const rootsData = Array.isArray(roots) ? roots : (roots.items || []);

      if (rootsData.length > 0) {
        // 2. Gom tất cả ID lại để gọi API Bulk Stats
        const categoryIds = rootsData.map(c => c.id);
        const stats = await categoryService.getBulkStats(categoryIds);
        
        // 3. Chuyển mảng stats thành dạng Object (Map) để dễ tra cứu ({ "2": { subcategories_count: 1, programs_count: 3 } })
        const statsMap = {};
        if (Array.isArray(stats)) {
          stats.forEach(s => {
            statsMap[s.category_id] = s;
          });
        }

        // 4. Ghép chỉ số Stats vào từng category
        const mergedCategories = rootsData.map(c => ({
          ...c,
          stats: statsMap[c.id] || { subcategories_count: 0, programs_count: 0 }
        }));

        setCategories(mergedCategories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logic lọc tìm kiếm: Chỉ giữ lại các category có tên khớp với chữ đang gõ
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="categories-page">
      {/* KHU VỰC HEADER VÀ TÌM KIẾM */}
      <div className="header-section">
        <Title level={2} style={{ color: 'var(--text-primary)' }}>
          <AppstoreOutlined style={{ marginRight: 12, color: 'var(--color-primary)' }} />
          Danh mục Thư viện
        </Title>
        <Text type="secondary" style={{ fontSize: '1.1rem' }}>
          Khám phá và tìm hiểu các câu lệnh được phân loại theo từng chủ đề
        </Text>
        
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
          <Input.Search
            placeholder="Tìm kiếm danh mục (VD: network, docker...)"
            allowClear
            size="large"
            enterButton={<SearchOutlined />}
            // style={{ maxWidth: 500 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* KHU VỰC HIỂN THỊ LƯỚI DANH MỤC */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" tip="Đang tải danh mục..." />
        </div>
      ) : filteredCategories.length > 0 ? (
        <Row gutter={[24, 24]}>
          {filteredCategories.map(cat => (
            <Col xs={24} sm={12} md={8} key={cat.id}>
              {/* Card Danh mục, bấm vào sẽ chuyển sang trang chi tiết theo Slug */}
              <Card 
                className="category-card" 
                onClick={() => navigate(`/categories/${cat.slug}`)}
                bordered={false}
              >
                <div className="card-icon" >
                  {cat.icon_url ? (
                    // Nếu CÓ icon_url: Hiển thị hình ảnh
                    <img 
                      src={getImageUrl(cat.icon_url)} 
                      alt={`Icon của ${cat.name}`} 
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        marginRight: 12,
                        objectFit: 'contain' // Đảm bảo ảnh không bị méo
                      }} 
                    />
                  ) : (
                    // Nếu KHÔNG có icon_url: Hiển thị icon thư mục mặc định của Ant Design
                    <FolderOpenOutlined />
                  )}
                </div>

                <div className="card-title">
                  {cat.name}
                </div>
                <div className="card-desc">
                  {cat.description || 'Chưa có mô tả cho danh mục này.'}
                </div>
                
                {/* Khu vực hiển thị Tag Thống kê */}
                <Space wrap>
                  {cat.stats.subcategories_count > 0 && (
                    <Tag color="cyan">
                      <FolderOpenOutlined style={{ marginRight: 4 }} />
                      {cat.stats.subcategories_count} danh mục con
                    </Tag>
                  )}
                  {cat.stats.programs_count > 0 && (
                    <Tag color="geekblue">
                      <CodeOutlined style={{ marginRight: 4 }} />
                      {cat.stats.programs_count} câu lệnh
                    </Tag>
                  )}
                  
                  {/* Nếu không có gì thì hiện một tag xám */}
                  {cat.stats.subcategories_count === 0 && cat.stats.programs_count === 0 && (
                    <Tag color="default">Chưa có dữ liệu</Tag>
                  )}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description="Không tìm thấy danh mục nào phù hợp" />
      )}
    </div>
  );
};

export default Categories;