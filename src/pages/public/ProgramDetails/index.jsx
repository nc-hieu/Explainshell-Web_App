import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Card, Spin, Space, Tag, Button, Empty } from 'antd';
import { ArrowLeftOutlined, BookOutlined, CodeOutlined } from '@ant-design/icons';
import { programService } from '../../../services/program.service';
import { historyService } from '../../../services/history.service';
import { useAuthStore } from '../../../store/authStore';
import DOMPurify from 'dompurify';

// Import file SCSS và Component dùng chung
import './ProgramDetails.scss'; 
import LiveSearchBar from '../../../components/common/LiveSearchBar';
import FavoriteButton from '../../../components/common/FavoriteButton'; // <-- IMPORT NÚT YÊU THÍCH

const { Title, Text, Paragraph } = Typography;

const ProgramDetails = () => {
  const { token } = useAuthStore();
  const { slug } = useParams(); 
  const navigate = useNavigate();

  const savedSlugRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [programData, setProgramData] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchCommandExplanation(slug);
    }
  }, [slug]);

  const fetchCommandExplanation = async (programSlug) => {
    setLoading(true);
    try {
      const data = await programService.getDetailsBySlug(programSlug);
      setProgramData(data);

      if (data && token && savedSlugRef.current !== data.slug) {
        savedSlugRef.current = data.slug; 
        historyService.create({
          command_text: data.slug || data.name,
          explanation: data.description 
        }).catch(err => console.error("Lỗi lưu lịch sử ngầm:", err)); 
      }
    } catch (error) {
      setProgramData(null); 
    } finally {
      setLoading(false);
    }
  };

  // Render Examples=========================
  const renderExamples = (examplesList, title = "Ví dụ:") => {
    if (!examplesList || examplesList.length === 0) return null;
    return (
      <div className="example-box">
        <Text strong className="example-title">
          <CodeOutlined /> {title}
        </Text>
        <Space direction="vertical" style={{ width: '100%' }}>
          {examplesList.map(ex => (
            <div key={ex.id}>
              <hr/>
              <Tag color="geekblue" className="example-cmd-tag">{ex.command_line}</Tag>
              <br />
              {ex.explanation && 
              <div>
                <div 
                  className=" tiptap-content example-decs" 
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ex.explanation) }} 
                />
              </div> 
            }
             
            </div>
          ))}
        </Space>
      </div>
    );
  };
  // End Render Examples=========================

  // Render Option=========================
  const renderOption = (opt, allExamples) => {
    const optionExamples = allExamples?.filter(e => e.option_id === opt.id) || [];
    return (
      <Card key={opt.id} size="small" className="option-card">
        <Space className="option-tags-wrapper" wrap>
          {opt.short_name && <Tag color="blue" className="option-tag">{opt.short_name}</Tag>}
          {opt.long_name && <Tag color="cyan" className="option-tag">{opt.long_name}</Tag>}
          {opt.is_featured && <Tag color="gold">Nổi bật</Tag>}
          {opt.is_deprecated && <Tag color="red">Đã cũ</Tag>}
        </Space>
          {opt.description ? (
            <div 
              className="option-desc tiptap-content" 
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(opt.description) }} 
            />
          ) : (
            <Paragraph className="option-desc">
              Chưa có mô tả cho lệnh này.
            </Paragraph>
          )}
        {renderExamples(optionExamples, "Ví dụ:")}
      </Card>
    );
  };
  // Render Option=========================


  if (loading) return <div className="status-container"><Spin size="large" tip="Đang tải tài liệu lệnh..." /></div>;

  if (!programData) {
    return (
      <div className="explain-container status-container error">
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="back-btn">Quay lại</Button>
        <Title level={3}>Không tìm thấy lệnh!</Title>
        <p>Hệ thống không có dữ liệu cho lệnh: <strong>{slug}</strong></p>
      </div>
    );
  }

  const allExamples = programData.examples || [];
  const generalExamples = allExamples.filter(e => !e.group_id && !e.option_id);
  const ungroupedOptions = programData.options?.filter(o => !o.group_id || !programData.option_groups?.some(g => g.id === o.group_id)) || [];

  return (
    <div className="explain-container">
      <div style={{ marginBottom: '25px' }}>
          <LiveSearchBar size="large" className="custom-search-bar" initialValue={programData.slug} />
      </div>

      {/* 1. THÔNG TIN LỆNH CHUNG */}
      <Card 
        className="program-card"
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <BookOutlined style={{ color: '#fbbf24', fontSize: '28px' }} />
              <Title level={2} className="program-title" style={{ margin: 0 }}>{programData.name}</Title>
            </Space>
            
            {/* GẮN NÚT YÊU THÍCH VÀO GÓC PHẢI THẺ CARD */}
            <FavoriteButton programId={programData.id} />
          </div>
        }
      >
        {programData.categories && programData.categories.length > 0 && (
          <Space className="category-tags-wrapper" wrap>
            {programData.categories.map(cat => <Tag key={cat.id} color="purple">{cat.name}</Tag>)}
          </Space>
        )}
        
        {/* ========Description======== */}
        {programData.description ? (
          <div 
            className="description-text tiptap-content" 
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(programData.description) }} 
          />
        ) : (
          <Paragraph className="description-text">
            Chưa có mô tả cho lệnh này.
          </Paragraph>
        )}
        <hr></hr>
        <br></br>
        {/* ========Description======== */}

        {renderExamples(generalExamples, "Ví Dụ")}
      </Card>

      {/* 2. HIỂN THỊ THEO TỪNG NHÓM (OPTION GROUPS) */}
      {programData.option_groups?.map(group => {
          const groupOptions = programData.options?.filter(o => o.group_id === group.id) || [];
          const groupExamples = allExamples.filter(e => e.group_id === group.id && !e.option_id);
          return (
            <div key={group.id} className="group-section">
              <Title level={4} className="group-title">{group.title}</Title>
              {group.description && group.description.trim() !== "" && (
                <div 
                  className="group-desc tiptap-content" 
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(group.description) }} 
                />
              )}
              {renderExamples(groupExamples, `Ví dụ cho nhóm ${group.title}:`)}
              <div className="group-options-wrapper">
                {groupOptions.length > 0 ? groupOptions.map(opt => renderOption(opt, allExamples)) : <Text type="secondary" italic>Nhóm này chưa có options nào.</Text>}
              </div>
            </div>
          );
        })}

      {/* 3. HIỂN THỊ CÁC CỜ KHÔNG THUỘC NHÓM NÀO */}
      {ungroupedOptions.length > 0 && (
        <div className="group-section">
          <Title level={4} className="group-title">Các Options khác</Title>
          <div className="group-options-wrapper">
            {ungroupedOptions.map(opt => renderOption(opt, allExamples))}
          </div>
        </div>
      )}

      {(!programData.options || programData.options.length === 0) && (
        <Empty description="Lệnh này chưa được cập nhật các cờ lệnh." />
      )}
    </div>
  );
};

export default ProgramDetails;