// src/components/common/RichTextViewer/CodeBlockExtension.jsx
import React, { useState } from 'react';
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from '@tiptap/react';
import CodeBlock from '@tiptap/extension-code-block';
import { Button, Tooltip } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { copyToClipboard } from '../../../utils/helpers';

const CodeBlockComponent = ({ node }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const success = await copyToClipboard(node.textContent);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Lỗi khi copy:', err);
    }
  };

  return (
    <NodeViewWrapper className="custom-code-block">
      <div className="copy-btn-container">
        <Tooltip title={copied ? 'Copied!' : 'Copy'}>
          <Button
            className="code-copy-btn"
            size="small"
            type="text"
            icon={copied ? <CheckOutlined style={{ color: '#52c41a' }}/> : <CopyOutlined style={{ color: '#8b949e' }} />}
            onClick={handleCopy}
          />
        </Tooltip>
      </div>
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
};

export const CodeBlockWithCopy = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent);
  },
});