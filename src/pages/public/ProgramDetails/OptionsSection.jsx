import React from 'react';
import { Card, Space, Tag, Typography, Tooltip } from 'antd';
import { StarFilled } from '@ant-design/icons';
import ExamplesSection from './ExamplesSection';
import RichTextViewer from '../../../components/common/RichTextViewer';

const { Paragraph } = Typography;

const OptionsSection = ({ opt, allExamples }) => {
  const optionExamples = allExamples?.filter(e => e.option_id === opt.id) || [];

  return (
    <Card size="small" className="option-card">
      <div className="option-header-row">
        <Space className="option-tags-left" wrap size={6}>
          {opt.short_name && <Tag color="magenta" className="option-tag">{opt.short_name}</Tag>}
          {opt.long_name && <Tag color="cyan" className="option-tag">{opt.long_name}</Tag>}
          {opt.takes_value && <Tag color="blue" className="takes-val-tag">&lt;value&gt;</Tag>}
        </Space>

        <Space className="option-status-right" size={6}>
          {opt.is_featured && (
            <Tooltip title="Tùy chọn hay được sử dụng">
              <Tag color="gold" icon={<StarFilled style={{ color: '#eab308' }} />} className="status-tag featured-tag">
                Phổ biến
              </Tag>
            </Tooltip>
          )}
          {opt.is_deprecated && (
            <Tooltip title="Tùy chọn đã cũ, không còn khuyến khích">
              <Tag color="default" className="status-tag deprecated-tag">
                Đã cũ
              </Tag>
            </Tooltip>
          )}
        </Space>
      </div>

      {opt.description ? (
        <RichTextViewer className="option-desc" content={opt.description} />
      ) : (
        <Paragraph className="option-desc" type="secondary" style={{ fontStyle: 'italic' }}>
          Chưa có mô tả cho tùy chọn này.
        </Paragraph>
      )}

      <ExamplesSection examplesList={optionExamples} title="Examples" />
    </Card>
  );
};

export default OptionsSection;