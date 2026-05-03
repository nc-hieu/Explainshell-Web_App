import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { List, Card, Spin, Typography, Button, Space } from 'antd';
import { ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import { programService } from '../../../services/program.service';
import LiveSearchBar from '../../../components/common/LiveSearchBar';
import DOMPurify from 'dompurify';



const { Title, Text, Paragraph } = Typography;

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const keyword = searchParams.get('q') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (keyword) {
      fetchSearchResults();
    }
  }, [keyword]);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      // Gọi API tìm kiếm
      const data = await programService.search(keyword);
      // Đảm bảo data là một mảng (tuỳ thuộc cấu trúc trả về của FastAPI)
      setResults(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', marginTop: '20px' }}>
    
      <LiveSearchBar size="large" className="custom-search-bar" />

      <Title level={3}>
        Kết quả tìm kiếm cho: <Text type="danger">"{keyword}"</Text>
      </Title>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" tip="Đang tìm kiếm lệnh..." />
        </div>
      ) : (
        <List
          itemLayout="vertical"
          // size="large"
          dataSource={results}
          locale={{ 
            emptyText: (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Title level={3}>Ôi không! 😥</Title>
                    <p>Hệ thống của chúng tôi chưa có dữ liệu cho lệnh: <Text type="danger">"{keyword}"</Text></p>
                    <p>Chúng tôi sẽ cố gắng cập nhật sớm nhất có thể.</p>
                </div>
            )
        }}
          renderItem={(item) => (
            <List.Item key={item.id}>

              <Space vertical size="large" style={{ width: '100%', textAlign: 'left', borderRadius: '8px', borderLeft: '6px solid var(--color-primary)'}}>
              <Card 
              hoverable 
              onClick={() => navigate(`/programs/${item.slug}`)}
              title={
                <Title level={4} style={{ color: 'var(--color-primary)' }}>
                  {item.name}
                </Title>
              }
              extra={
                <Button type="primary" size="middle" icon={<SearchOutlined />}></Button>
              }>
                
                {item.description ? (
                  <div 
                    className="tiptap-content" 
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.description) }} 
                  />
                ) : (
                  <Paragraph type="secondary">
                    Chưa có mô tả cho lệnh này.
                  </Paragraph>
                )}

              </Card>
            </Space>
            </List.Item>
          )}
        />
      )}
      <br></br>
    </div>
  );
};

export default SearchResults;