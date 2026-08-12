import React from 'react';
import { Card, Space, Tag, Typography } from 'antd';
import ExamplesSection from './ExamplesSection';
import RichTextViewer from '../../../components/common/RichTextViewer';


const { Paragraph } = Typography;

const OptionsSection = ({ opt, allExamples }) => {
  const optionExamples = allExamples?.filter(e => e.option_id === opt.id) || [];
  
  return (
    <Card size="small" className="option-card">
      <Space className="option-tags-wrapper" wrap>
        {opt.short_name && <Tag color="magenta" className="option-tag">{opt.short_name}</Tag>}
        {opt.long_name && <Tag color="cyan" className="option-tag">{opt.long_name}</Tag>}
        {opt.is_featured && <Tag color="gold">Nổi bật</Tag>}
        {opt.is_deprecated && <Tag color="red">Đã cũ</Tag>}
      </Space>
      
      {opt.description ? (
        <RichTextViewer className="option-desc" content={opt.description} />
      ) : (
        <Paragraph className="option-desc">
          Chưa có mô tả cho lệnh này.
        </Paragraph>
      )}
    
      <ExamplesSection examplesList={optionExamples} title="Ví Dụ" />
    </Card>
  );
};

export default OptionsSection;