import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Button, Space } from 'antd';
import { 
  BoldOutlined, 
  ItalicOutlined, 
  UnderlineOutlined, 
  StrikethroughOutlined, 
  CodeOutlined, 
  UnorderedListOutlined, 
  OrderedListOutlined 
} from '@ant-design/icons';

import './RichTextEditor.scss'; // File CSS chúng ta sẽ tạo ở Bước 3

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  // Helper function để làm nút của Ant Design nổi bật khi đang ở trạng thái active (VD: đang in đậm)
  const getBtnType = (format) => editor.isActive(format) ? 'primary' : 'default';

  return (
    <div className="tiptap-toolbar">
      <Space wrap>
        <Button size="small" type={getBtnType('bold')} icon={<BoldOutlined />} onClick={() => editor.chain().focus().toggleBold().run()} />
        <Button size="small" type={getBtnType('italic')} icon={<ItalicOutlined />} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <Button size="small" type={getBtnType('underline')} icon={<UnderlineOutlined />} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <Button size="small" type={getBtnType('strike')} icon={<StrikethroughOutlined />} onClick={() => editor.chain().focus().toggleStrike().run()} />
        
        {/* Nút chèn Code Block - Rất quan trọng cho Explainshell */}
        <Button size="small" type={getBtnType('codeBlock')} icon={<CodeOutlined />} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
        
        <Button size="small" type={getBtnType('bulletList')} icon={<UnorderedListOutlined />} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <Button size="small" type={getBtnType('orderedList')} icon={<OrderedListOutlined />} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      </Space>
    </div>
  );
};

// Component này nhận value và onChange từ Ant Design Form truyền vào
const RichTextEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content: value || '', // Đặt nội dung mặc định
    onUpdate: ({ editor }) => {
      // Mỗi khi người dùng gõ, xuất ra HTML và truyền lên Form của AntD
      onChange(editor.getHTML());
    },
  });

  // Đồng bộ dữ liệu khi bấm nút "Sửa" lệnh (Cập nhật value từ API vào Editor)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="tiptap-container">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="tiptap-editor-content" />
    </div>
  );
};

export default RichTextEditor;