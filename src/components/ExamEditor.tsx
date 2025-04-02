import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface ExamEditorProps {
  initialValue: string;
  onChange: (content: string) => void;
}

export function ExamEditor({ initialValue, onChange }: ExamEditorProps) {
  const [content, setContent] = useState(initialValue);

  const handleChange = (value: string) => {
    setContent(value);
    onChange(value); // Notify parent of the change
  };

  return (
    <div className="exam-editor">
      <ReactQuill
        value={content}
        onChange={handleChange}
        modules={ExamEditor.modules}
        formats={ExamEditor.formats}
        placeholder="Enter exam content (e.g., instructions, notes)..."
      />
    </div>
  );
}

// Quill configuration for toolbar and formats
ExamEditor.modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'], // Remove formatting
  ],
};

ExamEditor.formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'link',
  'image',
];