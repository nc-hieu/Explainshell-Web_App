import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Input, Space, Tag, Spin, Empty } from 'antd';
import { SearchOutlined, FolderOpenOutlined, CodeOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { topicService } from '../../../services/topic.service';
import { getImageUrl } from '../../../utils/helpers';

// Import CSS từ thư mục Categories để dùng chung style (Card, Grid, Header...)
import './Topics.scss'; 

const { Title, Text } = Typography;

const Topics = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchFeaturedTopics();
  }, []);

  const fetchFeaturedTopics = async () => {
    setLoading(true);
    try {
      // 1. Gọi API lấy danh sách Topics (Lấy số lượng lớn)
      const data = await topicService.getAll(0, 100);
      const items = Array.isArray(data) ? data : (data.items || []);
      
      // LỌC: Chỉ giữ lại các Topic được đánh dấu là Nổi bật (is_featured = true)
      const featuredTopics = items.filter(topic => topic.is_featured === true);

      if (featuredTopics.length > 0) {
        // 2. Gom tất cả ID lại để gọi API Bulk Stats của Topics
        const topicIds = featuredTopics.map(t => t.id);
        const stats = await topicService.getBulkStats(topicIds);
        
        // 3. Chuyển mảng stats thành dạng Object để dễ tra cứu
        const statsMap = {};
        if (Array.isArray(stats)) {
          stats.forEach(s => {
            statsMap[s.topic_id] = s;
          });
        }

        // 4. Ghép chỉ số Stats vào từng topic
        const mergedTopics = featuredTopics.map(t => ({
          ...t,
          stats: statsMap[t.id] || { categories_count: 0, programs_count: 0 }
        }));

        setTopics(mergedTopics);
      } else {
        setTopics([]);
      }
    } catch (error) {
      console.error("Lỗi tải chủ đề:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logic lọc tìm kiếm theo chữ gõ trên thanh Search
  const filteredTopics = topics.filter(topic => 
    topic.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (topic.description && topic.description.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <div className="topic-page">
      
      {/* KHU VỰC HEADER VÀ TÌM KIẾM */}
      <div className="header-section">
        <Title level={2} style={{ color: 'var(--text-primary)' }}>
          <AppstoreOutlined style={{ marginRight: 12, color: 'var(--color-primary)' }} />
          Thư Viện
        </Title>
        <Text type="secondary" style={{ fontSize: '1.1rem' }}>
          Khám phá và tìm hiểu các câu lệnh thông qua các hệ sinh thái lớn
        </Text>
        
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
          <Input.Search
            placeholder="Tìm kiếm chủ đề (VD: linux, docker, git...)"
            allowClear
            size="large"
            enterButton={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* KHU VỰC HIỂN THỊ LƯỚI TOPICS */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" tip="Đang tải danh sách chủ đề..." />
        </div>
      ) : filteredTopics.length > 0 ? (
        <Row gutter={[24, 24]}>
          {filteredTopics.map(topic => (
            <Col xs={24} sm={12} md={8} key={topic.id}>
              
              {/* Card Topic, bấm vào sẽ chuyển sang trang TopicDetails (VD: /linux/categories) */}
              <Card 
                className="topic-card" 
                onClick={() => navigate(`/${topic.slug}/categories`)} 
                bordered={false}
              >
                <div>
                  {topic.icon_url ? (
                    <img 
                      src={getImageUrl(topic.icon_url)} 
                      alt={`Icon của ${topic.name}`} 
                      style={{ width: '50px', height: '50px', objectFit: 'contain' }} 
                    />
                  ) : (
                    // Tránh dùng lại FolderOpenOutlined, dùng AppstoreOutlined cho cấp Topic
                    <AppstoreOutlined className="card-icon" style={{ fontSize: '32px', color: 'var(--color-primary)' }} />
                  )}
                </div>

                <div className="card-title" style={{ marginTop: '16px' }}>
                  {topic.name}
                </div>
                <div className="card-desc">
                  {topic.description || 'Chưa có mô tả cho chủ đề này.'}
                </div>
                
                {/* Khu vực hiển thị Tag Thống kê */}
                <Space wrap>
                  {topic.stats.categories_count > 0 && (
                    <Tag color="cyan">
                      <FolderOpenOutlined style={{ marginRight: 4 }} />
                      {topic.stats.categories_count} danh mục
                    </Tag>
                  )}
                  {topic.stats.programs_count > 0 && (
                    <Tag color="geekblue">
                      <CodeOutlined style={{ marginRight: 4 }} />
                      {topic.stats.programs_count} lệnh
                    </Tag>
                  )}
                  
                  {topic.stats.categories_count === 0 && topic.stats.programs_count === 0 && (
                    <Tag color="default">Chưa có dữ liệu</Tag>
                  )}
                </Space>
              </Card>

            </Col>
          ))}
        </Row>
      ) : (
        <Empty description="Không tìm thấy chủ đề nổi bật nào" />
      )}
    </div>
  );
};

export default Topics;