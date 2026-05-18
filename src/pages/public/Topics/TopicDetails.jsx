import React, { useState, useEffect } from 'react';
import { Typography, Breadcrumb, Input, Spin, Row, Col, Card, Empty, Space, Tag, Button } from 'antd';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { categoryService } from '../../../services/category.service';
import { topicService } from '../../../services/topic.service';
import { getImageUrl } from '../../../utils/helpers';

import { 
  HomeOutlined, 
  AppstoreOutlined, 
  FolderOpenOutlined, 
  CodeOutlined,
  SearchOutlined,
  EyeOutlined,         
  EyeInvisibleOutlined 
} from '@ant-design/icons';

import './Topics.scss';
// import './TopicDetails.scss';

const { Title, Text, Paragraph } = Typography;

const TopicDetails = () => {
  const navigate = useNavigate();
  const {topic_slug} = useParams()
  
  const [loading, setLoading] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [topicData, setTopicData] = useState(null);
  const [searchCategoryText, setSearchCategoryText] = useState('');


  // Lấy state từ React Router (Nơi chứa lịch sử đường dẫn danh mục cha)
  const location = useLocation();
  const breadcrumbTrail = location.state?.breadcrumbTrail || [];

  useEffect(() => {
    if (topic_slug) {
      fetchRootCategories();
    }
  }, [topic_slug]);

  const fetchRootCategories = async () => {
    setLoading(true);
    try {
      // 1. Gọi API lấy danh sách Root Categories
      const topic = await topicService.getWithRootCategories(topic_slug);
      console.log("1", topic);
      console.log("2", topic.categories.length);

      if (topic?.categories?.length > 0)
      {
        const roots = topic.categories;
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
          setCategoryData(mergedCategories);
      }
        setTopicData(topic);
      } else {
        setTopicData(topic);
        setCategoryData([]);
      }
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi click vào Card Danh mục
  const handleSubcategoryClick = (sub) => {
    const newTrail = [
      ...breadcrumbTrail, 
      // Không cần đẩy Topic vào Trail vì Topic đã fix cứng ở Breadcrumb ngoài HTML rồi
    ];
    // Điều hướng sang trang Chi tiết Danh mục kèm lịch sử
    navigate(`/${topic_slug}/categories/${sub.slug || sub.name}`, {
      state: { breadcrumbTrail: newTrail }
    });
  };

  // Logic lọc tìm kiếm: Chỉ giữ lại các category có tên khớp với chữ đang gõ
  const filteredCategories = categoryData.filter(cat => 
    cat.name.toLowerCase().includes(searchCategoryText.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" tip="Đang tải dữ liệu danh mục..." />
      </div>
    );
  }

  if (!topicData) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Empty description="Không tìm thấy chủ đề này" />
        <Link to="/topics">Quay lại danh sách Chủ đề</Link>
      </div>
    );
  }

  return (
    
    <div className={"topic-details-page topic-page"}>
      
      {/* 1. THANH ĐIỀU HƯỚNG (BREADCRUMB) LŨY TIẾN */}

      <Breadcrumb className="page-header" items={[
        { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
        { title: <Link to="/topics"><AppstoreOutlined /> Thư viện</Link> },
        // Render tự động các danh mục cha từ lịch sử truyền sang
        ...breadcrumbTrail.map(crumb => ({
          title: <Link to={`/topics/${crumb.slug}`} state={{ breadcrumbTrail: breadcrumbTrail.slice(0, breadcrumbTrail.findIndex(c => c.slug === crumb.slug)) }}>{crumb.title}</Link>
        })),
        { title: `Chủ đề ${topicData.name}` } // Danh mục hiện tại
      ]} />

      {/* 2. HEADER CỦA DANH MỤC */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Title level={2} 
              style={{ 
                margin: 0, color: 'var(--text-primary)',
                display: 'flex',          // Kích hoạt Flexbox
                alignItems: 'center',
                gap: '12px'
              }}>
              {topicData.icon_url ? (
                // Nếu CÓ icon_url: Hiển thị hình ảnh
                <img 
                  src={getImageUrl(topicData.icon_url)} 
                  alt={`Icon của ${topicData.name}`} 
                  style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                />) : (
                  // Nếu KHÔNG có icon_url: Hiển thị icon thư mục mặc định của Ant Design
                <FolderOpenOutlined style={{ color: 'var(--color-primary)' }} />
              )}            
              {topicData.name}
            </Title>
          </div>  

          {/* Ô TÌM KIẾM LỆNH TRONG DANH MỤC NÀY */}
          <Input.Search
            placeholder={`Tìm kiếm danh mục trong ${topicData.name}...`}
            allowClear
            size="large"
            enterButton={<SearchOutlined />}
            value={searchCategoryText}
            onChange={(e) => setSearchCategoryText(e.target.value)}
            style={{ width: '100%', maxWidth: '350px' }}
          />
        </div>  
        {/* Description */}
        <div>
          {topicData.description && (
            // <Paragraph className="desc-header" type="secondary" style={{ marginTop: 12, fontSize: '1.1rem' }}>
            <Paragraph className="desc-header"  style={{ marginTop: 12, fontSize: '1rem' }}>
              {topicData.description}
            </Paragraph>
          )}
        </div>  
      </div>

      {/* 3. HIỂN THỊ DANH MỤC CON */}
      <Title level={4} className="section-title" style={{color: 'var(--color-primary)' }}>
            <FolderOpenOutlined /> Danh Mục
      </Title>
      {categoryData.length > 0 ? (
        <div style={{ marginTop: 24 }}>
          <Row gutter={[24, 24]}>
            {filteredCategories.map(sub => (
              <Col xs={24} sm={12} md={8} key={sub.id}>
                <Card 
                  className="topic-card" 
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
              </Col>
            ))}
          </Row>
        </div>
      ):(
        // THÔNG BÁO KHI ĐANG ẨN (NẾU KHÔNG CÓ LỆNH THÌ HIỆN EMPTY)
        <Empty description="Chủ đề hiện chưa có danh mục nào" />
      )}  
      
    </div>
  );
};

export default TopicDetails;