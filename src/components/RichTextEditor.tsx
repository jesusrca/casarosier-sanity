import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link2, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { uploadAPI } from '../utils/api';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export function RichTextEditor({ value, onChange, placeholder = 'Escribe aquí...', height = '200px' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isFocused && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value, isFocused]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const addLink = () => {
    // Guardar la selección antes de que el prompt la borre
    const selection = window.getSelection();
    if (!selection) return;
    
    const selectedText = selection.toString();
    let range: Range | null = null;
    
    if (selectedText && selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    }
    
    if (!selectedText || !range) {
      // Si no hay texto seleccionado, pedir el texto del enlace
      const linkText = window.prompt('Texto del enlace:');
      if (!linkText) return;
      
      const url = window.prompt('URL del enlace:');
      if (!url) return;
      
      // Insertar el enlace con el texto
      const link = `<a href="${url}" style="color: #FF5100; text-decoration: underline;">${linkText}</a>&nbsp;`;
      execCommand('insertHTML', link);
    } else {
      // Si hay texto seleccionado, guardar el rango
      const savedRange = range.cloneRange();
      
      // Pedir la URL
      const url = window.prompt('URL del enlace:');
      if (!url) return;
      
      // Restaurar la selección
      selection.removeAllRanges();
      selection.addRange(savedRange);
      
      // Crear el enlace
      execCommand('createLink', url);
      
      // Aplicar estilos al enlace creado
      setTimeout(() => {
        if (editorRef.current) {
          const links = editorRef.current.querySelectorAll('a');
          links.forEach(link => {
            link.style.color = '#FF5100';
            link.style.textDecoration = 'underline';
          });
        }
      }, 10);
    }
  };

  const addImage = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const response = await uploadAPI.uploadImage(file);
        execCommand('insertImage', response.url);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error al subir la imagen. Por favor intenta de nuevo.');
      }
    };
  };

  return (
    <div className="rich-text-editor border border-foreground/20 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b border-foreground/20 bg-[#F3F2EF] p-2 flex flex-wrap gap-1">
        {/* Text formatting */}
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-2 rounded hover:bg-white/50 transition-colors text-foreground/70"
          title="Negrita"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-2 rounded hover:bg-white/50 transition-colors text-foreground/70"
          title="Cursiva"
        >
          <Italic size={18} />
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="p-2 rounded hover:bg-white/50 transition-colors text-foreground/70"
          title="Subrayado"
        >
          <Underline size={18} />
        </button>

        <div className="w-px bg-foreground/20 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-2 rounded hover:bg-white/50 transition-colors text-foreground/70"
          title="Lista con viñetas"
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="p-2 rounded hover:bg-white/50 transition-colors text-foreground/70"
          title="Lista numerada"
        >
          <ListOrdered size={18} />
        </button>

        <div className="w-px bg-foreground/20 mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => execCommand('justifyLeft')}
          className="p-2 rounded hover:bg-white/50 transition-colors text-foreground/70"
          title="Alinear izquierda"
        >
          <AlignLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyCenter')}
          className="p-2 rounded hover:bg-white/50 transition-colors text-foreground/70"
          title="Centrar"
        >
          <AlignCenter size={18} />
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyRight')}
          className="p-2 rounded hover:bg-white/50 transition-colors text-foreground/70"
          title="Alinear derecha"
        >
          <AlignRight size={18} />
        </button>

        <div className="w-px bg-foreground/20 mx-1" />

        {/* Link and Image */}
        <button
          type="button"
          onClick={addLink}
          className="p-2 rounded hover:bg-white/50 transition-colors text-foreground/70"
          title="Insertar enlace"
        >
          <Link2 size={18} />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-2 rounded hover:bg-white/50 transition-colors text-foreground/70"
          title="Insertar imagen"
        >
          <ImageIcon size={18} />
        </button>
      </div>

      {/* Editor Content */}
      <div 
        className="bg-white overflow-y-auto"
        style={{ minHeight: height, maxHeight: '500px' }}
      >
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="prose prose-sm max-w-none focus:outline-none p-4"
          style={{ minHeight: height }}
          data-placeholder={placeholder}
        />
      </div>

      <style>{`
        .rich-text-editor [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: rgba(0, 0, 0, 0.4);
          pointer-events: none;
          position: absolute;
        }
        .rich-text-editor [contenteditable] {
          min-height: ${height};
        }
        .rich-text-editor [contenteditable]:focus {
          outline: none;
        }
        .rich-text-editor [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .rich-text-editor [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .rich-text-editor [contenteditable] h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .rich-text-editor [contenteditable] ul,
        .rich-text-editor [contenteditable] ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .rich-text-editor [contenteditable] ul {
          list-style-type: disc;
        }
        .rich-text-editor [contenteditable] ol {
          list-style-type: decimal;
        }
        .rich-text-editor [contenteditable] li {
          margin: 0.25rem 0;
        }
        .rich-text-editor [contenteditable] a {
          color: #FF5100;
          text-decoration: underline;
        }
        .rich-text-editor [contenteditable] a:hover {
          text-decoration: none;
        }
        .rich-text-editor [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        .rich-text-editor [contenteditable] p {
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
}