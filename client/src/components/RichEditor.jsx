import React, { useEffect } from 'react';

// TipTap
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// React Quill
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// EasyMDE (Markdown)
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';

/**
 * RichEditor supports 3 modes:
 *  - mode="tiptap"  => stores HTML in onChange
 *  - mode="quill"   => stores HTML in onChange
 *  - mode="markdown" => stores Markdown text in onChange
 *
 * Props:
 *  - mode: 'tiptap' | 'quill' | 'markdown'
 *  - value: string
 *  - onChange: (value) => void
 *  - className: optional string -> applied to EditorContent (tiptap) or wrapper (quill/md)
 *  - rows: optional number -> converted to minHeight (rows * 24px)
 *  - style: optional style object to merge with computed styles
 *  - ...rest: forwarded to EditorContent / wrapper
 */
export default function RichEditor({
  mode = 'tiptap',
  value = '',
  onChange,
  className = '',
  rows = 8,
  style = {},
  ...rest
}) {
  // compute minHeight from rows (1 row ~= 24px)
  const minHeight = rows && Number(rows) ? `${Number(rows) * 24}px` : undefined;
  const mergedStyle = { ...(minHeight ? { minHeight } : {}), ...style };

  // TipTap editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    onUpdate: ({ editor }) => {
      if (mode === 'tiptap') onChange?.(editor.getHTML());
    },
    editable: mode === 'tiptap'
  }, [mode]);

  useEffect(() => {
    // sync incoming value to tiptap editor if changed externally
    if (mode === 'tiptap' && editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, mode, editor]);

  if (mode === 'quill') {
    // ReactQuill accepts className and style on its container
    return (
      <div style={mergedStyle} className={className}>
        <ReactQuill theme="snow" value={value || ''} onChange={(v) => onChange?.(v)} {...rest} />
      </div>
    );
  }

  if (mode === 'markdown') {
    // EasyMDE renders inside its container; apply wrapper classes/styles
    return (
      <div style={mergedStyle} className={className}>
        <SimpleMDE
          value={value || ''}
          onChange={(v) => onChange?.(v)}
          options={{ spellChecker: false }}
          {...rest}
        />
      </div>
    );
  }

  // default tiptap
  // IMPORTANT: forward className + style to EditorContent so the editable area receives the Tailwind classes.
  return (
    <div className={`/* wrapper (optional) */`} style={{}}>
      <EditorContent
        editor={editor}
        className={className}      // <--- this is applied to the editable element
        style={mergedStyle}       // <--- inline minHeight or other style if provided
        {...rest}
      />
    </div>
  );
}
