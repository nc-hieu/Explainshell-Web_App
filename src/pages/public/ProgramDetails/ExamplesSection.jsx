import React, { useState } from 'react';
import { Typography, Tooltip, Button, message } from 'antd';
import { TagOutlined, CopyOutlined, CheckOutlined } from '@ant-design/icons';
import RichTextViewer from '../../../components/common/RichTextViewer';
import { copyToClipboard } from '../../../utils/helpers';

const { Text } = Typography;

const ExampleItem = ({ ex, showDivider }) => {
  const [copied, setCopied] = useState(false);

  const hasCommand = ex.command_line && ex.command_line.trim() !== "";
  const hasExplanation = ex.explanation && ex.explanation.trim() !== "";

  // Nếu cả command_line và explanation đều rỗng thì không render gì
  if (!hasCommand && !hasExplanation) return null;

  const handleCopy = async (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (hasCommand) {
      const success = await copyToClipboard(ex.command_line);
      if (success) {
        setCopied(true);
        message.success('Đã sao chép câu lệnh!');
        setTimeout(() => setCopied(false), 2000);
      } else {
        message.error('Không thể tự động sao chép câu lệnh!');
      }
    }
  };

  return (
    <div className="example-item">
      {showDivider && <div className="example-divider" />}
      {hasCommand && (
        <div className="example-cmd-wrapper">
          <code className="example-cmd-code">{ex.command_line}</code>
          <Tooltip title={copied ? "Đã chép!" : "Sao chép câu lệnh"}>
            <Button
              type="text"
              size="small"
              icon={copied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
              onClick={handleCopy}
              className="example-copy-btn"
            />
          </Tooltip>
        </div>
      )}
      {hasExplanation && (
        <div className="example-desc-wrapper" style={{ marginTop: hasCommand ? '3px' : '0' }}>
          <RichTextViewer className="example-desc" content={ex.explanation} />
        </div>
      )}
    </div>
  );
};

const ExamplesSection = ({ examplesList, title = "Examples" }) => {
  if (!examplesList || examplesList.length === 0) return null;

  const validExamples = examplesList.filter(
    ex => (ex.command_line && ex.command_line.trim() !== '') || (ex.explanation && ex.explanation.trim() !== '')
  );

  if (validExamples.length === 0) return null;

  return (
    <div className="example-box">
      <div className="example-header">
        <TagOutlined className="example-header-icon" />
        <Text strong className="example-title">{title}</Text>
      </div>
      <div className="example-list">
        {validExamples.map((ex, index) => (
          <ExampleItem key={ex.id || index} ex={ex} showDivider={index > 0} />
        ))}
      </div>
    </div>
  );
};

export default ExamplesSection;