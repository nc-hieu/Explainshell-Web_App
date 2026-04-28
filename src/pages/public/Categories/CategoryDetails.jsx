import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Typography, Breadcrumb, Input, Spin, Row, Col, Card, Empty, Space, Tag } from 'antd';
import { 
  HomeOutlined, 
  AppstoreOutlined, 
  FolderOpenOutlined, 
  CodeOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { categoryService } from '../../../services/category.service';

import './CategoryDetails.scss';

const { Title, Text, Paragraph } = Typography;

const CategoryDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  // Lấy state từ React Router (Nơi chứa lịch sử đường dẫn danh mục cha)
  const location = useLocation();
  const breadcrumbTrail = location.state?.breadcrumbTrail || [];

  const [loading, setLoading] = useState(false);
  const [categoryData, setCategoryData] = useState(null);
  const [searchProgramText, setSearchProgramText] = useState('');

  // Gọi API mỗi khi slug trên URL thay đổi
  useEffect(() => {
    if (slug) {
      fetchCategoryDetails(slug);
      setSearchProgramText(''); // Xóa text tìm kiếm khi chuyển trang
    }
  }, [slug]);

  const fetchCategoryDetails = async (catSlug) => {
    setLoading(true);
    try {
      // 1. Gọi API lấy chi tiết Danh mục hiện tại
      const data = await categoryService.getBySlug(catSlug);
      
      // 2. Nếu có danh mục con, gọi thêm API lấy thống kê (Bulk-stats)
      if (data.subcategories && data.subcategories.length > 0) {
        const subIds = data.subcategories.map(sub => sub.id);
        const stats = await categoryService.getBulkStats(subIds);
        
        const statsMap = {};
        if (Array.isArray(stats)) {
          stats.forEach(s => {
            statsMap[s.category_id] = s;
          });
        }

        // 3. Ghép số lượng vào mảng subcategories
        data.subcategories = data.subcategories.map(sub => ({
          ...sub,
          stats: statsMap[sub.id] || { subcategories_count: 0, programs_count: 0 }
        }));
      }

      setCategoryData(data);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết danh mục:", error);
      setCategoryData(null);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi bấm vào 1 Danh mục con
  const handleSubcategoryClick = (sub) => {
    // Lưu lại danh mục HIỆN TẠI vào lịch sử để truyền cho trang tiếp theo
    const newTrail = [
      ...breadcrumbTrail, 
      { title: categoryData.name, slug: categoryData.slug || categoryData.name }
    ];

    // Chuyển hướng kèm theo state
    navigate(`/categories/${sub.slug || sub.name}`, {
      state: { breadcrumbTrail: newTrail }
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" tip="Đang tải dữ liệu danh mục..." />
      </div>
    );
  }

  if (!categoryData) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Empty description="Không tìm thấy danh mục này" />
        <Link to="/categories" style={{ marginTop: 16, display: 'inline-block' }}>
          Quay lại danh sách Danh mục
        </Link>
      </div>
    );
  }

  // Lọc danh sách Lệnh (Programs) theo từ khóa tìm kiếm
  const programs = categoryData.programs || [];
  const filteredPrograms = programs.filter(p => 
    p.name.toLowerCase().includes(searchProgramText.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(searchProgramText.toLowerCase()))
  );

  const subcategories = categoryData.subcategories || [];

  return (
    <div className="category-details-page">
      
      {/* 1. THANH ĐIỀU HƯỚNG (BREADCRUMB) LŨY TIẾN */}
      <Breadcrumb className="page-header" items={[
        { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
        { title: <Link to="/categories"><AppstoreOutlined /> Danh mục</Link> },
        // Render tự động các danh mục cha từ lịch sử truyền sang
        ...breadcrumbTrail.map(crumb => ({
          title: <Link to={`/categories/${crumb.slug}`} state={{ breadcrumbTrail: breadcrumbTrail.slice(0, breadcrumbTrail.findIndex(c => c.slug === crumb.slug)) }}>{crumb.title}</Link>
        })),
        { title: categoryData.name } // Danh mục hiện tại
      ]} />

      {/* 2. HEADER CỦA DANH MỤC */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={2} style={{ margin: 0, color: 'var(--text-primary)' }}>
            <FolderOpenOutlined style={{ marginRight: 12, color: 'var(--color-primary)' }} />
            {categoryData.name}
          </Title>
          {categoryData.description && (
            <Paragraph type="secondary" style={{ fontSize: '1.1rem', marginTop: 8 }}>
              {categoryData.description}
            </Paragraph>
          )}
        </div>

        {/* Ô TÌM KIẾM LỆNH TRONG DANH MỤC NÀY */}
        <Input.Search
          placeholder={`Tìm kiếm lệnh trong ${categoryData.name}...`}
          allowClear
          size="large"
          enterButton={<SearchOutlined />}
          value={searchProgramText}
          onChange={(e) => setSearchProgramText(e.target.value)}
          style={{ width: '100%', maxWidth: '350px' }}
        />
      </div>

      {/* 3. HIỂN THỊ DANH MỤC CON VỚI THỐNG KÊ (STATS) */}
      {subcategories.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Title level={4} className="section-title">
            <FolderOpenOutlined /> Danh mục con
          </Title>
          <Row gutter={[16, 16]}>
            {subcategories.map(sub => (
              <Col xs={24} sm={12} md={8} key={sub.id}>
                <Card 
                  className="subcategory-card" 
                  size="small"
                  onClick={() => handleSubcategoryClick(sub)}
                  bordered={false}
                  style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <FolderOpenOutlined style={{ fontSize: '24px', color: 'var(--color-primary)' }} />
                    <Text strong style={{ fontSize: '1.2rem' }}>{sub.name}</Text>
                  </div>

                  {/* Hiển thị số lượng tương tự trang 1 */}
                  {sub.stats && (
                    <Space wrap>
                      {sub.stats.subcategories_count > 0 && (
                        <Tag color="cyan">
                          <FolderOpenOutlined style={{ marginRight: 4 }} />
                          {sub.stats.subcategories_count} danh mục
                        </Tag>
                      )}
                      {sub.stats.programs_count > 0 && (
                        <Tag color="geekblue">
                          <CodeOutlined style={{ marginRight: 4 }} />
                          {sub.stats.programs_count} câu lệnh
                        </Tag>
                      )}
                      {sub.stats.subcategories_count === 0 && sub.stats.programs_count === 0 && (
                        <Tag color="default">Chưa có dữ liệu</Tag>
                      )}
                    </Space>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* 4. HIỂN THỊ DANH SÁCH LỆNH (PROGRAMS) */}
      <div style={{ marginTop: 32 }}>
        <Title level={4} className="section-title">
          <CodeOutlined /> Danh sách câu lệnh
        </Title>
        
        {programs.length === 0 ? (
          <Empty description="Danh mục này chưa có câu lệnh nào" />
        ) : filteredPrograms.length > 0 ? (
          <div>
            {filteredPrograms.map(prog => (
              <div key={prog.id} className="program-list-item">
                <div className="program-icon">
                  <CodeOutlined />
                </div>
                <div>
                  <div 
                    className="program-title"
                    onClick={() => navigate(`/programs/${prog.slug || prog.name}`)}
                  >
                    {prog.name}
                  </div>
                  <div className="program-desc">
                    {prog.description || 'Chưa có mô tả chi tiết.'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty description="Không tìm thấy câu lệnh nào khớp với từ khóa" />
        )}
      </div>

    </div>
  );
};

export default CategoryDetails;