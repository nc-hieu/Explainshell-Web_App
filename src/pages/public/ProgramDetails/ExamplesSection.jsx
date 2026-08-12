import React from 'react';
import { Typography, Space, Tag, Divider } from 'antd';
import { TagOutlined } from '@ant-design/icons';
import RichTextViewer from '../../../components/common/RichTextViewer';


const { Text } = Typography;

const ExamplesSection = ({ examplesList, title = "Ví Dụ" }) => {
  if (!examplesList || examplesList.length === 0) return null;
  
  return (
    <div className="example-box">
      <Text strong className="example-title">
        <TagOutlined /> {title}
      </Text>
      <Space orientation="vertical" size="medium" style={{ width: '100%' }}>
        {examplesList.map(ex => (
          <div key={ex.id}>
            {examplesList.length !== 1 && 
              <Divider size="small" variant="dashed" style={{ borderColor: '#7cb305' }} dashed />
            }
            <Tag color="geekblue" className="example-cmd-tag">{ex.command_line}</Tag>
            <br />
            {ex.explanation && (
              <div>
                <RichTextViewer className="example-decs" content={ex.explanation} />
              </div> 
            )}
          </div>
        ))}
      </Space>
    </div>
  );
};

export default ExamplesSection;