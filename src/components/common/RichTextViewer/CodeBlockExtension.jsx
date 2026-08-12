// src/components/common/RichTextViewer/CodeBlockExtension.jsx
import React, { useState } from 'react';
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from '@tiptap/react';
import CodeBlock from '@tiptap/extension-code-block';
import { Button, Tooltip } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback cho HTTP / IP LAN không an toàn
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'absolute';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  textArea.remove();
}

const CodeBlockComponent = ({ node }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyText(node.textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
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