import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Typography, Card, Spin, Space, Tag, Button, Empty, Dropdown, message } from 'antd';
import { ArrowLeftOutlined, BookOutlined, DownOutlined } from '@ant-design/icons';
import { BorderBeam } from 'antd';
import DOMPurify from 'dompurify';

// Import Services & Store
import { programService } from '../../../services/program.service';
import { noteService } from '../../../services/note.service';
import { historyService } from '../../../services/history.service';
import { useAuthStore } from '../../../store/authStore';

// Import Component dùng chung
import LiveSearchBar from '../../../components/common/LiveSearchBar';
import FavoriteButton from '../../../components/common/FavoriteButton';
import { getImageUrl } from '../../../utils/helpers'; 
import './ProgramDetails.scss'; 

// Import các Component con 
import ExamplesSection from './ExamplesSection';
import OptionsSection from './OptionsSection';
import NotesSection from './NotesSection';

const { Title, Text, Paragraph } = Typography;

const ProgramDetails = () => {
  const { token } = useAuthStore();
  const { program_slug } = useParams(); 
  const navigate = useNavigate();

  const savedSlugRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [programData, setProgramData] = useState(null);
  const [notes, setNotes] = useState([]);
  
  useEffect(() => {
    if (program_slug) {
      fetchCommandExplanation(program_slug);
    }
  }, [program_slug]);

  //=== Fetch Data - Program ===
  const fetchCommandExplanation = async (programSlug) => {
    setLoading(true);
    try {
      const data = await programService.getDetailsBySlug(programSlug);
      setProgramData(data);

      if (data && token && savedSlugRef.current !== data.program_slug) {
        savedSlugRef.current = data.program_slug; 
        historyService.create({
          command_text: data.program_slug || data.name,
          explanation: data.description 
        }).catch(err => console.error("Lỗi lưu lịch sử ngầm:", err)); 
      }

      if (data?.id) {
        const notesData = await noteService.getByProgram(data.id);
        setNotes(Array.isArray(notesData) ? notesData : []);
      }
    } catch (error) {
      setProgramData(null); 
    } finally {
      setLoading(false);
    }
  };
  //=== END Fetch Data - Program ===
  

  //=== Logic ManPages ===
  const manPagesData = programData?.man_pages || [];
  const items = manPagesData.map((manpage, index) => ({
    // label: manpage.os?.name || 'Unknown OS',
    label: 
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {manpage.os?.icon_url && (
          <img 
            src={getImageUrl(manpage.os?.icon_url)} 
            alt="icon" 
            style={{ width: '20px', height: '20px', objectFit: 'contain' }} 
          />)}
        <span>{manpage.os?.name || 'Unknown OS'}</span>
      </div>,
    key: manpage.source_url || `empty-url-${index}`,
  }));

  const handleMenuMPClick = (e) => {
    const targetUrl = e.key;
    if (targetUrl && !targetUrl.startsWith('empty-url')) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      message.warning('Không có đường dẫn Manpage cho hệ điều hành này.');
    }
  };

  const manPageProps = {
    items,
    onClick: handleMenuMPClick,
  };
  //=== END Logic ManPages ===


  //=== Loading Page ===
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }
  //=== END Loading Page ===
 

  //=== Logic khi không tìm thấy dữ Program ===
  if (!programData) {
    return (
      <div className="explain-container status-container error">
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="back-btn">Quay lại</Button>
        <Title level={3}>Không tìm thấy lệnh!</Title>
        <p>Hệ thống không có dữ liệu cho lệnh: <strong>{program_slug}</strong></p>
      </div>
    );
  }
  //=== END Logic khi không tìm thấy dữ Program ===

  const allExamples = programData.examples || [];
  const generalExamples = allExamples.filter(e => !e.group_id && !e.option_id);
  const ungroupedOptions = programData.options?.filter(o => !o.group_id || !programData.option_groups?.some(g => g.id === o.group_id)) || [];

  return (
    <div className="explain-container">
      <div className="search-bar" >
          <LiveSearchBar size="large" className="custom-search-bar" initialValue={programData.name} />
      </div>
      
      {/* 1. THÔNG TIN LỆNH CHUNG */}    
      <BorderBeam 
        lineWidth={2} 
        size={250}
        color={[
          { color: '#22c55e', percent: 0 },
          { color: '#a3e635', percent: 54 },
          { color: '#facc15', percent: 100 },
        ]}
      >
        <Card 
          className="program-card"
          title={
            <div className="pc-space-left">
              <Space>
                <BookOutlined style={{ color: 'var(--color-primary)' , fontSize: '28px' }} />
                <Title level={2} className="program-title" style={{ margin: 0 }}>{programData.name}</Title>
              </Space>

              <div className="pc-space-right">
                <div>
                  <Dropdown menu={manPageProps} placement="bottomRight">
                    <Button icon={<DownOutlined />} iconPlacement="end" >
                      ManPages
                    </Button>
                  </Dropdown>
                </div>
                
                {/* GẮN NÚT YÊU THÍCH VÀO GÓC PHẢI THẺ CARD */}
                <div className="program-favorite-btn">
                  <FavoriteButton programId={programData.id} />
                </div>
              </div>
            </div>
          }
        >
          {programData.categories && programData.categories.length > 0 && (
            <Space className="category-tags-wrapper" wrap>
              {programData.categories.map(cat => 
                <Link key={cat.id} to={`/${cat.topic?.slug}/categories/${cat.slug}`} style={{ textDecoration: 'none' }}>
                  <Tag color="purple">{cat.name}</Tag>
                </Link>
              )}
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
          <br />
          {/* ========Description======== */}

          <ExamplesSection examplesList={generalExamples} title="Ví Dụ" />
        </Card>
      </BorderBeam>

      {/* 2. HIỂN THỊ CÁC CỜ KHÔNG THUỘC NHÓM NÀO */}
      {ungroupedOptions.length > 0 && (
        <div className="group-section">
          <Title level={3} className="group-title">Options</Title>
          <div className="group-options-wrapper">
            {ungroupedOptions.map(opt => (
              <OptionSection key={opt.id} opt={opt} allExamples={allExamples} />
            ))}
          </div>
        </div>
      )}

      {(!programData.options || programData.options.length === 0) && (
        <Empty description="Lệnh này chưa được cập nhật Options!" />
      )}

      {/* 3. HIỂN THỊ THEO TỪNG NHÓM (OPTION GROUPS) */}
      {programData.option_groups?.map(group => {
        const groupOptions = programData.options?.filter(o => o.group_id === group.id) || [];
        const groupExamples = allExamples.filter(e => e.group_id === group.id && !e.option_id);
        
        return (
          <div key={group.id} className="group-section">
            <Title level={3} className="group-title">{group.title}</Title>
            
            {group.description && group.description.trim() !== "" && (
              <div 
                className="group-desc tiptap-content" 
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(group.description) }} 
              />
            )}
            
            <ExamplesSection examplesList={groupExamples} title="Ví Dụ" />
            
            <div className="group-options-wrapper">
              {groupOptions.length > 0 ? (
                groupOptions.map(opt => <OptionsSection key={opt.id} opt={opt} allExamples={allExamples} />)
              ) : (
                <Text type="secondary" italic>Nhóm này chưa có options nào.</Text>
              )}
            </div>
          </div>
        );
      })}

      {/* 4. HIỂN THỊ DANH SÁCH GHI CHÚ */}
      <NotesSection notes={notes} />
    </div>
  );
};

export default ProgramDetails;