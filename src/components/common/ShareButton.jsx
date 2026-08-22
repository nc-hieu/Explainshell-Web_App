import React, { useState } from 'react';
import { Popover, QRCode, Input, Button, Tooltip, message, Space, Typography } from 'antd';
import { ShareAltOutlined, CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { copyToClipboard } from '../../utils/helpers';

const { Text } = Typography;

const ShareButton = ({ url, title = "Chia sẻ", size = '20px' }) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopy = async (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!shareUrl) return;

    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      message.success('Đã sao chép liên kết vào bộ nhớ tạm!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      message.error('Không thể tự động sao chép. Vui lòng bôi đen và copy từ ô link!');
    }
  };

  const popoverContent = (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 4px', maxWidth: '240px' }}
      onClick={(e) => e.stopPropagation()}
    >
      <Text strong style={{ marginBottom: '10px', fontSize: '0.9rem' }}>{title}</Text>

      <div style={{ background: '#ffffff', padding: '8px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        <QRCode
          value={shareUrl || 'https://explainshell.local'}
          size={140}
          bordered={false}
          errorLevel="M"
        />
      </div>

      <Text type="secondary" style={{ fontSize: '0.75rem', marginTop: '6px', marginBottom: '8px' }}>
        Quét mã QR để mở trên điện thoại
      </Text>

      <Space.Compact style={{ width: '100%' }}>
        <Input
          value={shareUrl}
          readOnly
          size="small"
          onClick={(e) => e.target.select()}
          style={{ fontSize: '0.78rem', cursor: 'pointer' }}
        />
        <Tooltip title={copied ? "Đã sao chép" : "Sao chép liên kết"}>
          <Button
            type="primary"
            size="small"
            icon={copied ? <CheckOutlined /> : <CopyOutlined />}
            onClick={handleCopy}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </Tooltip>
      </Space.Compact>
    </div>
  );

  return (
    <Popover
      content={popoverContent}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      arrow={{ pointAtCenter: true }}
    >
      <Tooltip title="Chia sẻ">
        <Button
          type="text"
          shape="circle"
          icon={<ShareAltOutlined style={{ color: 'var(--text-secondary)', fontSize: size }} />}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
      </Tooltip>
    </Popover>
  );
};

export default ShareButton;
