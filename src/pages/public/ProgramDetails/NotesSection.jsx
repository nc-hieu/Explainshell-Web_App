import React from 'react';
import { Typography, Card, Space, Tag } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import RichTextViewer from '../../../components/common/RichTextViewer';

const { Title, Paragraph } = Typography;

const NotesSection = ({ notes }) => {
  if (!notes || notes.length === 0) return null;

  return (
    <div className="notes-section">
      <Title level={3} className="group-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BookOutlined style={{ color: 'var(--color-primary)' }} />
        Ghi chú & Mẹo hay (Notes & Tips)
      </Title>
       
      <div className="notes-list-wrapper">
        {notes.map(note => (
          <React.Fragment key={note.id}>
            {note.content && note.content.trim() !== "" && (
              <Card size="small" className="notes-card">
                <Space className="notes-tags-wrapper" wrap>
                  {note.title && (
                    <Tag color="purple" variant="outlined" className="notes-tag">
                      {note.title}
                    </Tag>
                  )}
                </Space>
                {note.content ? (
                  <RichTextViewer className="notes-desc" content={note.content} />
                ) : (
                  <Paragraph className="notes-desc">
                    Chưa có mô tả cho lệnh này.
                  </Paragraph>
                )}
              </Card>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default NotesSection;