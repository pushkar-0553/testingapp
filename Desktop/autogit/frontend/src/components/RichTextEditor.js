import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import TurndownService from 'turndown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, Eye, EyeOff,
  Undo, Redo, Palette, FileCode, X
} from 'lucide-react';
import 'highlight.js/styles/github-dark.css';

const lowlight = createLowlight(common);

const MenuBar = ({ editor, onClose }) => {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setColor = () => {
    const color = window.prompt('Enter color (e.g., #ff0000):');
    if (color) {
      editor.chain().focus().setColor(color).run();
    }
  };

  return (
    <div className="border-b border-gray-300 bg-white sticky top-0 z-10">
      <div className="flex items-center justify-between p-2">
        <div className="flex flex-wrap gap-1">
          {/* Text Formatting */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('code') ? 'bg-gray-200' : ''}`}
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* Headings */}
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* Lists */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
            title="Block Quote"
          >
            <Quote className="h-4 w-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
            title="Code Block"
          >
            <FileCode className="h-4 w-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* Insert */}
          <button
            onClick={addLink}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
            title="Insert Link"
          >
            <LinkIcon className="h-4 w-4" />
          </button>

          <button
            onClick={addImage}
            className="p-2 rounded hover:bg-gray-100"
            title="Insert Image"
          >
            <ImageIcon className="h-4 w-4" />
          </button>

          <button
            onClick={setColor}
            className="p-2 rounded hover:bg-gray-100"
            title="Text Color"
          >
            <Palette className="h-4 w-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* Undo/Redo */}
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-30"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded hover:bg-gray-100"
          title="Close Editor"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

const RichTextEditor = ({ initialContent = '', onSave, onClose }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [markdown, setMarkdown] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-screen p-8',
      },
    },
  });

  const convertToMarkdown = () => {
    if (!editor) return '';
    const html = editor.getHTML();
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });
    return turndownService.turndown(html);
  };

  const handleSave = () => {
    const md = convertToMarkdown();
    setMarkdown(md);
    onSave(md);
  };

  const togglePreview = () => {
    if (!showPreview) {
      const md = convertToMarkdown();
      setMarkdown(md);
    }
    setShowPreview(!showPreview);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <MenuBar editor={editor} onClose={onClose} />

      <div className="flex-1 overflow-hidden flex">
        {/* Editor */}
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} overflow-y-auto border-r border-gray-200`}>
          <EditorContent editor={editor} />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="w-1/2 overflow-y-auto bg-gray-50 p-8">
            <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Toolbar */}
      <div className="border-t border-gray-300 bg-white p-4 flex items-center justify-between">
        <button
          onClick={togglePreview}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          {showPreview ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
          >
            Save as Markdown
          </button>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
