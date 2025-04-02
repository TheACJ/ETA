import { useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from '../ui/Button';

interface ExamEditorProps {
  initialValue?: string;
  onChange: (content: string) => void;
  onSave: () => void;
}

export function ExamEditor({ initialValue = '', onChange, onSave }: ExamEditorProps) {
  const editorRef = useRef<any>(null);

  return (
    <div className="flex flex-col gap-4">
      <Editor
        apiKey="your-tinymce-api-key" // You'll need to get this from TinyMCE
        onInit={(evt, editor) => editorRef.current = editor}
        initialValue={initialValue}
        init={{
          height: 500,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
            'equation'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | equation | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
        }}
        onEditorChange={(content) => onChange(content)}
      />
      <div className="flex justify-end">
        <Button onClick={onSave}>Save Exam</Button>
      </div>
    </div>
  );
}