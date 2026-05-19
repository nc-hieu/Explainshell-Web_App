import React, { useState, useEffect } from 'react';
import { Typography, Breadcrumb, Input, Spin, Row, Col, Card, Empty, Space, Tag, Button } from 'antd';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { categoryService } from '../../../services/category.service';
import { programService } from '../../../services/program.service';
import { topicService } from '../../../services/topic.service';
import { getImageUrl } from '../../../utils/helpers';
import DOMPurify from 'dompurify';

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
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  const [programsData, setProgramsData] = useState([]); // Lưu mảng lệnh siêu nhẹ
  const [showPrograms, setShowPrograms] = useState(false); // Trạng thái đóng/mở danh sách lệnh
  const [programSkip, setProgramSkip] = useState(0); // Quản lý vị trí phân trang
  const [hasMorePrograms, setHasMorePrograms] = useState(true); // Kiểm tra xem còn lệnh để tải không
  const PROGRAM_LIMIT = 20; // Mỗi lần tải thêm 20 lệnh


  // Lấy state từ React Router (Nơi chứa lịch sử đường dẫn danh mục cha)
  const location = useLocation();
  const breadcrumbTrail = location.state?.breadcrumbTrail || [];

  useEffect(() => {
    // if (topic_slug) {
    //   fetchRootCategories();
    // }

    if (topic_slug) {
      fetchRootCategories();
      // Reset trạng thái danh sách lệnh khi thay đổi topic_slug trên URL
      setProgramsData([]);
      setShowPrograms(false);
      setProgramSkip(0);
      setHasMorePrograms(true);
      setSearchCategoryText('');
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

  // // Logic lọc tìm kiếm: Chỉ giữ lại các category có tên khớp với chữ đang gõ
  // const filteredCategories = categoryData.filter(cat => 
  //   cat.name.toLowerCase().includes(searchCategoryText.toLowerCase())
  // );

  // --- HÀM TẢI DANH SÁCH LỆNH SIÊU NHẸ (PHÂN TRANG) ---
  const fetchTopicPrograms = async (currentSkip = 0) => {
    if (currentSkip === 0) setLoadingPrograms(true);
    try {
      // Gọi lên API tiện ích siêu nhẹ của bạn: GET /api/v1/programs/topic/{topic_slug}
      const newData = await programService.getByTopic(topic_slug, currentSkip, PROGRAM_LIMIT);
      const items = Array.isArray(newData) ? newData : [];
      
      if (items.length < PROGRAM_LIMIT) {
        setHasMorePrograms(false); // Nếu mảng trả về ít hơn LIMIT nghĩa là server đã hết lệnh
      } else {
        setHasMorePrograms(true);
      }

      if (currentSkip === 0) {
        setProgramsData(items);
      } else {
        // Nối mảng dữ liệu mới vào mảng dữ liệu cũ (Infinite Roll/Load More)
        setProgramsData(prev => [...prev, ...items]);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách lệnh hệ sinh thái:", error);
    } finally {
      setLoadingPrograms(false);
    }
  };

  // Xử lý sự kiện khi click vào nút Ẩn/Hiện toàn bộ danh sách câu lệnh
  const handleTogglePrograms = () => {
    const nextState = !showPrograms;
    setShowPrograms(nextState);
    
    // Nếu chuyển sang trạng thái HIỆN và mảng dữ liệu hiện tại chưa có gì -> Tiến hành gọi API lần đầu
    if (nextState && programsData.length === 0) {
      fetchTopicPrograms(0);
    }
  };

  // Xử lý khi nhấn nút "Tải thêm lệnh..."
  const handleLoadMorePrograms = () => {
    const nextSkip = programSkip + PROGRAM_LIMIT;
    setProgramSkip(nextSkip);
    fetchTopicPrograms(nextSkip);
  };

  // --- LOGIC LỌC TÌM KIẾM ĐA NĂNG ĐỒNG BỘ ---
  // 1. Lọc danh mục cha
  const filteredCategories = categoryData.filter(cat => 
    cat.name.toLowerCase().includes(searchCategoryText.toLowerCase())
  );

  // 2. Lọc danh sách câu lệnh phẳng từ từ điển
  const filteredPrograms = programsData.filter(prog => 
    prog.name.toLowerCase().includes(searchCategoryText.toLowerCase()) ||
    (prog.description && prog.description.toLowerCase().includes(searchCategoryText.toLowerCase()))
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
          {/* <Input.Search
            placeholder={`Tìm kiếm danh mục trong ${topicData.name}...`}
            allowClear
            size="large"
            enterButton={<SearchOutlined />}
            value={searchCategoryText}
            onChange={(e) => setSearchCategoryText(e.target.value)}
            style={{ width: '100%', maxWidth: '350px' }}
          /> */}
          {/* Ô tìm kiếm đa năng: Tự động đổi placeholder dựa trên trạng thái đóng/mở danh sách lệnh */}
          <Input.Search
            placeholder={showPrograms ? `Tìm lệnh trong từ điển A-Z ${topicData.name}...` : `Tìm danh mục trong ${topicData.name}...`}
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
      {!showPrograms && (
        <>
          <Title level={4} className="section-title" style={{color: 'var(--color-primary)' }}>
              <FolderOpenOutlined /> Danh Mục thuộc {topicData.name}
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
        </>)}
        

      {/* 4. HIỂN THỊ TỪ ĐIỂN CÂU LỆNH PHẲNG A-Z (TƯƠNG TỰ LOGIC MẪU CỦA BẠN) */}
      <div style={{ marginTop: 32 }}>
        
        {/* THANH ĐIỀU KHIỂN ĐÓNG/MỞ DANH SÁCH LỆNH */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: '1px solid var(--border-color)', 
          paddingBottom: '12px', 
          marginBottom: '16px' 
        }}>
          <Title level={4} style={{ margin: 0, color: 'var(--color-primary)'}}>
            <CodeOutlined /> Từ điển toàn bộ câu lệnh {topicData.name} (A-Z)
          </Title>

          <Button 
            type="dashed" 
            icon={showPrograms ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={handleTogglePrograms}
            style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
          >
            {showPrograms ? 'Ẩn từ điển lệnh' : 'Hiển thị từ điển câu lệnh'}
          </Button>
        </div>
        
        {/* RENDER CÓ ĐIỀU KIỆN THEO STATE showPrograms */}
        {showPrograms ? (
          <div>
            {loadingPrograms ? (
              <div style={{ textAlign: 'center', padding: '30px' }}>
                <Spin tip="Đang truy vấn kho dữ liệu câu lệnh siêu nhẹ..." />
              </div>
            ) : filteredPrograms.length > 0 ? (
              <div>
                {filteredPrograms.map(prog => (
                  <div 
                    key={prog.slug || prog.name} 
                    className="program-list-item"  
                    // Điều hướng phẳng tuyệt đối sang trang chi tiết Lệnh dựa trên topic_slug hiện tại
                    onClick={() => navigate(`/programs/${prog.slug || prog.name}`)}
                  >
                    <div className="program-icon">
                      <CodeOutlined />
                    </div>
                    <div>
                      <div className="program-title">
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

                {/* NÚT TẢI THÊM LỆNH PHÂN TRANG (Chỉ hiện khi lọc tìm kiếm rỗng và API báo còn data) */}
                {hasMorePrograms && searchCategoryText.trim() === "" && (
                  <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '16px' }}>
                    <Button 
                      icon={<ArrowDownOutlined />} 
                      onClick={handleLoadMorePrograms}
                      loading={loadingPrograms}
                    >
                      Tải thêm câu lệnh...
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Empty description="Không tìm thấy câu lệnh nào trong hệ sinh thái khớp với từ khóa" />
            )}
          </div>
        ) : (
          // Thông báo nhỏ khi đang đóng trạng thái từ điển lệnh
          programsData.length === 0 && (
             <div style={{ textAlign: 'center', color: 'gray', padding: '12px 0', fontStyle: 'italic' }}>
               Mẹo: Bạn có thể bật nút góc phải để tra cứu nhanh danh sách phẳng tất cả các lệnh thuộc {topicData.name}.
             </div>
          )
        )}
      </div>
    </div>
    
  );
};

export default TopicDetails;