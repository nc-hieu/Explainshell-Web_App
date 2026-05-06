import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Typography, Breadcrumb, Input, Spin, Row, Col, Card, Empty, Space, Tag, Button } from 'antd';
import { 
  HomeOutlined, 
  AppstoreOutlined, 
  FolderOpenOutlined, 
  CodeOutlined,
  SearchOutlined,
  EyeOutlined,         
  EyeInvisibleOutlined 
} from '@ant-design/icons';
import { categoryService } from '../../../services/category.service';
import { getImageUrl } from '../../../utils/helpers';
import DOMPurify from 'dompurify';

// Import cả 2 file CSS (để dùng chung style thẻ Card to cho Linux)
import './CategoryDetails.scss';
import './Categories.scss'; 

const { Title, Text, Paragraph } = Typography;

const CategoryDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  // KIỂM TRA: Xem danh mục hiện tại có phải là "linux" không
  const isLinuxCategory = slug === 'linux';

  // Lấy state từ React Router (Nơi chứa lịch sử đường dẫn danh mục cha)
  const location = useLocation();
  const breadcrumbTrail = location.state?.breadcrumbTrail || [];

  const [loading, setLoading] = useState(false);
  const [categoryData, setCategoryData] = useState(null);
  const [searchProgramText, setSearchProgramText] = useState('');

  // MỚI: State quản lý việc ẩn/hiện danh sách câu lệnh (mặc định là false -> Ẩn)
  const [showPrograms, setShowPrograms] = useState(false);

  // Gọi API mỗi khi slug trên URL thay đổi
  useEffect(() => {
    if (slug) {
      fetchCategoryDetails(slug);
      setSearchProgramText(''); // Xóa text tìm kiếm khi chuyển trang
      isLinuxCategory ? setShowPrograms(false) : setShowPrograms(true);
      // setShowPrograms(true); // Reset lại trạng thái ẩn lệnh khi chuyển sang danh mục khác
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
    {/* Thêm class categories-page ĐỘNG nếu là Linux để nó nhận diện được SCSS của trang Categories tổng */},
    <div className={`category-details-page ${isLinuxCategory ? 'categories-page' : ''}`}>
      
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
          <Title level={2} 
            style={{ 
              margin: 0, color: 'var(--text-primary)',
              display: 'flex',          // Kích hoạt Flexbox
              alignItems: 'center',
              gap: '12px'
            }}>
            {categoryData.icon_url ? (
              // Nếu CÓ icon_url: Hiển thị hình ảnh
              <img 
                src={getImageUrl(categoryData.icon_url)} 
                alt={`Icon của ${categoryData.name}`} 
                style={{ width: '36px', height: '36px', objectFit: 'contain' }}
              />) : (
                // Nếu KHÔNG có icon_url: Hiển thị icon thư mục mặc định của Ant Design
              <FolderOpenOutlined style={{ color: 'var(--color-primary)' }} />
            )}            
            {categoryData.name}
          </Title>
          
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

      {/* Description */}
      <div>
        {categoryData.description && (
          <Paragraph className="desc-header" type="secondary" style={{ marginTop: 12, fontSize: '1.1rem' }}>
            {categoryData.description}
          </Paragraph>
        )}
      </div>

      {/* 3. HIỂN THỊ DANH MỤC CON */}
      {subcategories.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Title level={4} className="section-title">
            <FolderOpenOutlined /> Danh mục con
          </Title>
          {/* Thay đổi khoảng cách cột (gutter) tùy thuộc vào giao diện nào đang hiển thị */}
          <Row gutter={isLinuxCategory ? [24, 24] : [16, 16]}>
            {subcategories.map(sub => (
              // <Col xs={24} sm={12} md={isLinuxCategory ? 8 : 12} key={sub.id}>
              <Col xs={24} sm={12} md={8} key={sub.id}>
                
                {/* LOGIC HIỂN THỊ: NẾU LÀ LINUX -> HIỆN CARD BỰ (Categories) */}
                {isLinuxCategory ? (
                  <Card 
                    className="category-card" 
                    onClick={() => handleSubcategoryClick(sub)}
                    bordered={false}
                  >
                    <div>
                      {sub.icon_url ? (
                        <img 
                          src={getImageUrl(sub.icon_url)} 
                          alt={`Icon của ${sub.name}`} 
                          style={{ width: '50px', height: '50px', objectFit: 'contain' }} 
                        />
                      ) : (
                        <FolderOpenOutlined className="card-icon" style={{ fontSize: '32px', color: 'var(--color-primary)' }} />
                      )}
                    </div>

                    <div className="card-title" style={{ marginTop: '16px' }}>{sub.name}</div>
                    <div className="card-desc">{sub.description || 'Chưa có mô tả cho danh mục này.'}</div>
                    
                    {sub.stats && (
                      <Space wrap>
                        {sub.stats.subcategories_count > 0 && (
                          <Tag color="cyan">
                            <FolderOpenOutlined style={{ marginRight: 4 }} /> {sub.stats.subcategories_count} danh mục
                          </Tag>
                        )}
                        {sub.stats.programs_count > 0 && (
                          <Tag color="geekblue">
                            <CodeOutlined style={{ marginRight: 4 }} /> {sub.stats.programs_count} lệnh
                          </Tag>
                        )}
                        {sub.stats.subcategories_count === 0 && sub.stats.programs_count === 0 && (
                          <Tag color="default">Chưa có dữ liệu</Tag>
                        )}
                      </Space>
                    )}
                  </Card>
                ) : (
                  
                  /* LOGIC HIỂN THỊ: NẾU KHÔNG PHẢI LINUX -> HIỆN CARD NHỎ, NẰM NGANG (Mặc định) */
                  <Card 
                    className="subcategory-card" 
                    size="small"
                    onClick={() => handleSubcategoryClick(sub)}
                    bordered={false}
                    style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      {sub.icon_url ? (
                        <img 
                          src={getImageUrl(sub.icon_url)} 
                          alt={`Icon của ${sub.name}`} 
                          style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                        />
                      ) : (
                        <FolderOpenOutlined style={{ fontSize: '24px', color: 'var(--color-primary)' }} />
                      )}           
                      <Text strong style={{ fontSize: '1rem' }}>{sub.name}</Text>
                    </div>
                          
                    {sub.stats && (
                      <Space wrap>
                        {sub.stats.subcategories_count > 0 && (
                          <Tag color="cyan">
                            <FolderOpenOutlined style={{ marginRight: 4 }} /> {sub.stats.subcategories_count} danh mục
                          </Tag>
                        )}
                        {sub.stats.programs_count > 0 && (
                          <Tag color="geekblue">
                            <CodeOutlined style={{ marginRight: 4 }} /> {sub.stats.programs_count} lệnh
                          </Tag>
                        )}
                        {sub.stats.subcategories_count === 0 && sub.stats.programs_count === 0 && (
                          <Tag color="default">Chưa có dữ liệu</Tag>
                        )}
                      </Space>
                    )}
                  </Card>
                )}

              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* 4. HIỂN THỊ DANH SÁCH LỆNH (PROGRAMS) */}
      <div style={{ marginTop: 32 }}>
        
        {/* NÚT ĐIỀU KHIỂN ẨN/HIỆN LỆNH */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: '1px solid var(--border-color)', 
          paddingBottom: '12px', 
          marginBottom: '16px' 
        }}>
          <Title level={4} style={{ margin: 0 }}>
            <CodeOutlined /> Danh sách câu lệnh
          </Title>

          {/* Chỉ hiện nút bấm nếu danh mục này thực sự có chứa câu lệnh */}
          {programs.length > 0 && (
            <Button 
              type="dashed" 
              icon={showPrograms ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => setShowPrograms(!showPrograms)}
              style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
            >
              {showPrograms ? 'Ẩn danh sách' : `Hiển thị ${programs.length} câu lệnh`}
            </Button>
          )}
        </div>
        
        {/* RENDER CÓ ĐIỀU KIỆN (Chỉ hiện khi showPrograms là true) */}
        {showPrograms ? (
          <div>
            {programs.length === 0 ? (
              <Empty description="Danh mục này chưa có câu lệnh nào" />
            ) : filteredPrograms.length > 0 ? (
              <div>
                {filteredPrograms.map(prog => (
                  <div key={prog.id} className="program-list-item"  onClick={() => navigate(`/programs/${prog.slug || prog.name}`)}>
                    <div className="program-icon">
                      <CodeOutlined />
                    </div>
                    <div>
                      <div 
                        className="program-title"
                        // onClick={() => navigate(`/programs/${prog.slug || prog.name}`)}
                      >
                        {prog.name}
                      </div>
                      {prog.description ? (
                        <div
                          className="tiptap-content program-desc" 
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(prog.description) }} 
                          style={{ 
                            display: '-webkit-box', 
                            WebkitLineClamp: 2, 
                            WebkitBoxOrient: 'vertical', 
                            textAlign: 'left',
                            overflow: 'hidden' 
                          }}
                        />
                      ) : (
                        <Paragraph className="program-desc">
                          Chưa có mô tả cho lệnh này.
                        </Paragraph>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="Không tìm thấy câu lệnh nào khớp với từ khóa" />
            )}
          </div>
        ) : (
          // THÔNG BÁO KHI ĐANG ẨN (NẾU KHÔNG CÓ LỆNH THÌ HIỆN EMPTY)
          programs.length === 0 && (
             <Empty description="Danh mục này chưa có câu lệnh nào" />
          )
        )}

      </div>

    </div>
  );
};

export default CategoryDetails;