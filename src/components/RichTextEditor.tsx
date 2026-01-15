import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useEffect } from 'react';
import { uploadAPI } from '../utils/api';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Link2,
  Image as ImageIcon,
  Video,
  Code,
  Heading2,
  Type
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Escribe aquí...', 
  height = '300px' 
}: RichTextEditorProps) {
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        // Excluir link del StarterKit para evitar duplicados
        link: false,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:no-underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none',
      },
    },
  });

  // Sincronizar valor externo con el editor usando useEffect
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  const addImage = useCallback(async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;

      try {
        const response = await uploadAPI.uploadImage(file);
        editor.chain().focus().setImage({ src: response.url }).run();
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error al subir la imagen. Por favor intenta de nuevo.');
      }
    };
  }, [editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL:', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addVideo = useCallback(() => {
    if (!editor) return;

    const url = window.prompt('Pega el código HTML del iframe (ej: Google Maps, YouTube):\n\nPara YouTube:\n1. Ve al video\n2. Clic en Compartir → Insertar\n3. Copia el código <iframe>...\n\nPara Google Maps:\n1. Busca la ubicación\n2. Clic en Compartir → Insertar un mapa\n3. Copia el código <iframe>...');
    
    if (!url) return;

    // Insertar el HTML directamente
    editor.commands.insertContent(url);
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor-wrapper" style={{ position: 'relative', zIndex: 10 }}>
      {/* Toolbar */}
      <div className="editor-toolbar">
        {/* Text Type */}
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={editor.isActive('paragraph') ? 'is-active' : ''}
            title="Normal"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
            title="Título 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
        </div>

        {/* Text Format */}
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
            title="Negrita"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
            title="Cursiva"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'is-active' : ''}
            title="Tachado"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
        </div>

        {/* Lists */}
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
            title="Lista con viñetas"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
            title="Lista numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* Alignment */}
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
            title="Alinear a la izquierda"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
            title="Centrar"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
            title="Alinear a la derecha"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        {/* Media */}
        <div className="toolbar-group">
          <button
            type="button"
            onClick={addLink}
            className={editor.isActive('link') ? 'is-active' : ''}
            title="Agregar enlace"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={addImage}
            title="Agregar imagen"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={addVideo}
            title="Insertar HTML/iframe"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="editor-content-wrapper" style={{ minHeight: height, maxHeight: '500px' }}>
        <EditorContent editor={editor} />
      </div>

      <style>{`
        .rich-text-editor-wrapper {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.2);
          border-radius: 0.5rem;
          overflow: visible;
        }

        .editor-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding: 0.5rem;
          background: #F3F2EF;
          border-bottom: 1px solid rgba(0, 0, 0, 0.2);
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          position: relative;
          z-index: 100;
        }

        .toolbar-group {
          display: flex;
          gap: 0.25rem;
          padding: 0 0.25rem;
          border-right: 1px solid rgba(0, 0, 0, 0.1);
        }

        .toolbar-group:last-child {
          border-right: none;
        }

        .editor-toolbar button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          padding: 0.25rem;
          border: none;
          background: transparent;
          color: #666;
          cursor: pointer;
          border-radius: 0.25rem;
          transition: all 0.2s;
        }

        .editor-toolbar button:hover {
          background: rgba(255, 81, 0, 0.1);
          color: #FF5100;
        }

        .editor-toolbar button.is-active {
          background: rgba(255, 81, 0, 0.15);
          color: #FF5100;
        }

        .editor-content-wrapper {
          overflow-y: auto;
          overflow-x: hidden;
          padding: 1rem;
        }

        .editor-content-wrapper .tiptap {
          outline: none;
          min-height: ${height};
          max-height: calc(500px - 3rem);
        }

        /* Placeholder */
        .editor-content-wrapper .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(0, 0, 0, 0.4);
          pointer-events: none;
          height: 0;
        }

        /* Typography */
        .editor-content-wrapper .tiptap h2 {
          font-size: 1.75em;
          font-weight: 700;
          margin: 1em 0 0.5em 0;
          line-height: 1.3;
          color: #1a1a1a;
        }

        .editor-content-wrapper .tiptap h3 {
          font-size: 1.4em;
          font-weight: 600;
          margin: 0.8em 0 0.4em 0;
          line-height: 1.4;
          color: #1a1a1a;
        }

        .editor-content-wrapper .tiptap p {
          margin-bottom: 1em;
          line-height: 1.7;
          color: #333;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        /* Lists */
        .editor-content-wrapper .tiptap ul,
        .editor-content-wrapper .tiptap ol {
          padding-left: 1.5em;
          margin-bottom: 1em;
        }

        .editor-content-wrapper .tiptap li {
          margin-bottom: 0.3em;
          line-height: 1.7;
        }

        /* Links */
        .editor-content-wrapper .tiptap a {
          color: #FF5100;
          text-decoration: underline;
          cursor: pointer;
        }

        .editor-content-wrapper .tiptap a:hover {
          text-decoration: none;
        }

        /* Images */
        .editor-content-wrapper .tiptap img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1em 0;
          display: block;
        }

        .editor-content-wrapper .tiptap img.ProseMirror-selectednode {
          outline: 3px solid #FF5100;
        }

        /* Image Alignment */
        .editor-content-wrapper .tiptap img[style*="text-align: center"] {
          margin-left: auto;
          margin-right: auto;
        }
        
        .editor-content-wrapper .tiptap img[style*="text-align: right"] {
          margin-left: auto;
          margin-right: 0;
        }
        
        .editor-content-wrapper .tiptap img[style*="text-align: left"] {
          margin-right: auto;
          margin-left: 0;
        }

        /* Iframes/Videos */
        .editor-content-wrapper .tiptap iframe {
          max-width: 100%;
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 0.5rem;
          margin: 1.5em 0;
          border: none;
        }

        /* Text Alignment */
        .editor-content-wrapper .tiptap [style*="text-align: center"] {
          text-align: center;
        }

        .editor-content-wrapper .tiptap [style*="text-align: right"] {
          text-align: right;
        }

        .editor-content-wrapper .tiptap [style*="text-align: left"] {
          text-align: left;
        }

        /* Strong/Bold */
        .editor-content-wrapper .tiptap strong {
          font-weight: 700;
        }

        /* Emphasis/Italic */
        .editor-content-wrapper .tiptap em {
          font-style: italic;
        }

        /* Strike */
        .editor-content-wrapper .tiptap s {
          text-decoration: line-through;
        }
      `}</style>
    </div>
  );
}