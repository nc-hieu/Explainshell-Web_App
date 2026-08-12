// src/components/common/RichTextViewer/index.jsx
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CodeBlockWithCopy } from './CodeBlockExtension';
import './RichTextViewer.scss';

const RichTextViewer = ({ content, className = '' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }), // tắt codeBlock mặc định, tránh trùng tên node
      CodeBlockWithCopy,
    ],
    content,
    editable: false,
  });

  useEffect(() => {
    if (!editor || content === undefined) return;
    if (content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className={`tiptap-content rich-text-viewer ${className}`}>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextViewer;