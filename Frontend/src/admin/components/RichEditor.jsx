import { useMemo, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import toast from 'react-hot-toast';
import 'react-quill-new/dist/quill.snow.css';
import { uploadFile } from './Fields.jsx';
import { img, errMsg } from '../../lib/api.js';

export default function RichEditor({ value, onChange }) {
  const ref = useRef(null);
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [2, 3, 4, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'code-block'],
        [{ align: [] }],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      handlers: {
        image() {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            try {
              const m = await uploadFile(file);
              const editor = ref.current.getEditor();
              const range = editor.getSelection(true);
              editor.insertEmbed(range.index, 'image', img(m.url));
            } catch (e) { toast.error(errMsg(e)); }
          };
          input.click();
        },
      },
    },
  }), []);
  return <ReactQuill ref={ref} theme="snow" value={value} onChange={onChange} modules={modules} />;
}
