import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, List, ListOrdered, Link2, Image as ImageIcon, Eraser, Code, Heading2, Heading3 } from 'lucide-react';
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
  const [showHtml, setShowHtml] = useState(false);
  const [htmlCode, setHtmlCode] = useState('');

  // Sincronizar valor inicial
  useEffect(() => {
    if (editorRef.current && !isFocused) {
      const normalizedValue = normalizeHTML(value || '');
      if (editorRef.current.innerHTML !== normalizedValue) {
        editorRef.current.innerHTML = normalizedValue;
      }
    }
  }, [value, isFocused]);

  // Normalizar HTML para evitar inconsistencias
  const normalizeHTML = (html: string): string => {
    if (!html) return '';
    
    // Crear un elemento temporal para limpiar el HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Limpiar atributos no deseados y elementos vacíos
    const cleanElement = (element: HTMLElement) => {
      const children = Array.from(element.children);
      children.forEach((child) => {
        if (child instanceof HTMLElement) {
          // Remover atributos data-* no deseados
          Array.from(child.attributes).forEach(attr => {
            if (attr.name.startsWith('data-')) {
              child.removeAttribute(attr.name);
            }
          });
          
          // NO remover listas ni sus elementos
          if (child.tagName === 'UL' || child.tagName === 'OL') {
            // Preservar listas, solo limpiar sus hijos
            cleanElement(child);
            return;
          }
          
          if (child.tagName === 'LI') {
            // Preservar elementos de lista
            cleanElement(child);
            return;
          }
          
          // Remover párrafos vacíos o solo con espacios
          if (child.tagName === 'P' && (!child.textContent?.trim() || child.innerHTML === '<br>')) {
            child.remove();
            return;
          }
          
          // Remover divs vacíos
          if (child.tagName === 'DIV' && !child.textContent?.trim()) {
            child.remove();
            return;
          }
          
          // Remover múltiples BRs consecutivos (max 1)
          if (child.tagName === 'BR') {
            let nextSibling = child.nextSibling;
            while (nextSibling && nextSibling.nodeName === 'BR') {
              const toRemove = nextSibling;
              nextSibling = nextSibling.nextSibling;
              toRemove.remove();
            }
          }
          
          // Recursivo
          cleanElement(child);
        }
      });
    };
    
    cleanElement(temp);
    
    // Limpiar el HTML resultante
    let cleanedHtml = temp.innerHTML;
    
    // Eliminar párrafos vacíos que queden
    cleanedHtml = cleanedHtml.replace(/<p[^>]*>\s*<\/p>/gi, '');
    cleanedHtml = cleanedHtml.replace(/<p[^>]*><br><\/p>/gi, '');
    
    // Eliminar múltiples <br> consecutivos
    cleanedHtml = cleanedHtml.replace(/(<br\s*\/?>){2,}/gi, '<br>');
    
    return cleanedHtml;
  };

  const handleInput = () => {
    if (editorRef.current) {
      const normalized = normalizeHTML(editorRef.current.innerHTML);
      onChange(normalized);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Detectar si estamos dentro de una lista
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    let node = range.startContainer;
    
    // Verificar si estamos dentro de un LI
    let isInList = false;
    let currentNode: Node | null = node;
    while (currentNode && currentNode !== editorRef.current) {
      if (currentNode.nodeName === 'LI' || currentNode.nodeName === 'UL' || currentNode.nodeName === 'OL') {
        isInList = true;
        break;
      }
      currentNode = currentNode.parentNode;
    }
    
    // Si estamos en una lista, dejar que el navegador maneje el Enter
    if (isInList) {
      // No prevenir default, dejar que funcione naturalmente
      setTimeout(() => handleInput(), 10);
      return;
    }
    
    // Al presionar Enter fuera de listas, crear un nuevo párrafo limpio
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // Crear un nuevo párrafo
      const p = document.createElement('p');
      const br = document.createElement('br');
      p.appendChild(br);
      
      // Insertar el nuevo párrafo
      range.deleteContents();
      range.insertNode(p);
      
      // Mover el cursor al nuevo párrafo
      const newRange = document.createRange();
      newRange.setStart(p, 0);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
      
      handleInput();
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    // Para comandos de lista, no normalizar inmediatamente
    const isListCommand = command === 'insertUnorderedList' || command === 'insertOrderedList';
    
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    
    if (isListCommand) {
      // Para listas, solo actualizar el contenido sin normalizar
      setTimeout(() => {
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      }, 10);
    } else {
      setTimeout(() => handleInput(), 10);
    }
  };

  const formatBlock = (tag: string) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    
    document.execCommand('formatBlock', false, tag);
    editorRef.current?.focus();
    setTimeout(() => handleInput(), 10);
  };

  const addLink = () => {
    const selection = window.getSelection();
    if (!selection) return;
    
    const selectedText = selection.toString();
    let range: Range | null = null;
    
    if (selectedText && selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    }
    
    if (!selectedText || !range) {
      const linkText = window.prompt('Texto del enlace:');
      if (!linkText) return;
      
      const url = window.prompt('URL del enlace:');
      if (!url) return;
      
      const link = `<a href="${url}">${linkText}</a>&nbsp;`;
      execCommand('insertHTML', link);
    } else {
      const savedRange = range.cloneRange();
      const url = window.prompt('URL del enlace:');
      if (!url) return;
      
      selection.removeAllRanges();
      selection.addRange(savedRange);
      execCommand('createLink', url);
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

  const clearFormatting = () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const selectedContent = range.extractContents();
    
    // Obtener solo el texto plano
    const textContent = selectedContent.textContent || '';
    
    // Crear un nodo de texto limpio
    const textNode = document.createTextNode(textContent);
    
    // Insertar el texto limpio
    range.insertNode(textNode);
    
    // Seleccionar el texto recién insertado
    const newRange = document.createRange();
    newRange.selectNodeContents(textNode);
    selection.removeAllRanges();
    selection.addRange(newRange);
    
    setTimeout(() => handleInput(), 10);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    const text = e.clipboardData.getData('text/plain');
    
    // Siempre pegar como texto sin formato
    document.execCommand('insertText', false, text);
    setTimeout(() => handleInput(), 10);
  };

  const toggleHtmlView = () => {
    if (!showHtml) {
      if (editorRef.current) {
        setHtmlCode(editorRef.current.innerHTML);
      }
    } else {
      if (editorRef.current) {
        const normalized = normalizeHTML(htmlCode);
        editorRef.current.innerHTML = normalized;
        onChange(normalized);
      }
    }
    setShowHtml(!showHtml);
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlCode(e.target.value);
  };

  return (
    <div className="rich-text-editor border border-foreground/20 rounded-lg overflow-hidden bg-white">
      {/* Toolbar simplificada */}
      <div className="border-b border-foreground/20 bg-[#F3F2EF] p-2 flex flex-wrap gap-1">
        {/* Headings - solo H2 y H3 */}
        <button
          type="button"
          onClick={() => formatBlock('h2')}
          className="p-2 rounded hover:bg-white/50 transition-colors text-foreground/70 flex items-center gap-1"
          title="Título 2"
        >
          <Heading2 size={18} />
        </button>
        <button
          type="button"
          onClick={() => formatBlock('h3')}
          className="p-2 rounded hover:bg-white/50 transition-colors text-foreground/70 flex items-center gap-1"
          title="Título 3"
        >
          <Heading3 size={18} />
        </button>
        <button
          type="button"
          onClick={() => formatBlock('p')}
          className="p-2 rounded hover:bg-white/50 transition-colors text-foreground/70 text-sm font-medium"
          title="Párrafo normal"
        >
          P
        </button>

        <div className="w-px bg-foreground/20 mx-1" />

        {/* Text formatting - solo básicos */}
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

        <div className="w-px bg-foreground/20 mx-1" />

        {/* Clear Formatting */}
        <button
          type="button"
          onClick={clearFormatting}
          className="p-2 rounded hover:bg-white/50 transition-colors text-foreground/70"
          title="Borrar formato (selecciona texto primero)"
        >
          <Eraser size={18} />
        </button>

        <div className="w-px bg-foreground/20 mx-1" />

        {/* Toggle HTML View */}
        <button
          type="button"
          onClick={toggleHtmlView}
          className={`p-2 rounded transition-colors ${showHtml ? 'bg-primary/10 text-primary' : 'hover:bg-white/50 text-foreground/70'}`}
          title="Ver/Editar HTML"
        >
          <Code size={18} />
        </button>
      </div>

      {/* Editor Content */}
      <div 
        className="bg-white overflow-y-auto"
        style={{ minHeight: height, maxHeight: '500px' }}
      >
        {!showHtml ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="focus:outline-none p-4"
            style={{ minHeight: height }}
            data-placeholder={placeholder}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <textarea
            value={htmlCode}
            onChange={handleHtmlChange}
            className="w-full p-4 font-mono text-sm border-0 focus:outline-none resize-none"
            style={{ minHeight: height, maxHeight: '500px' }}
            placeholder="Código HTML..."
          />
        )}
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
          line-height: 1.7;
          color: #333;
          font-size: 16px;
        }
        
        .rich-text-editor [contenteditable]:focus {
          outline: none;
        }
        
        /* Estilos estandarizados para headings */
        .rich-text-editor [contenteditable] h2 {
          font-size: 1.75em;
          font-weight: 700;
          margin: 1.2em 0 0.6em 0;
          line-height: 1.3;
          color: #1a1a1a;
        }
        
        .rich-text-editor [contenteditable] h3 {
          font-size: 1.4em;
          font-weight: 600;
          margin: 1em 0 0.5em 0;
          line-height: 1.4;
          color: #1a1a1a;
        }
        
        /* Párrafos con espaciado consistente */
        .rich-text-editor [contenteditable] p {
          margin: 0 0 1em 0;
          line-height: 1.7;
          font-size: 16px;
        }
        
        .rich-text-editor [contenteditable] p:last-child {
          margin-bottom: 0;
        }
        
        /* Listas con espaciado consistente */
        .rich-text-editor [contenteditable] ul,
        .rich-text-editor [contenteditable] ol {
          padding-left: 1.5rem;
          margin: 1em 0;
        }
        
        .rich-text-editor [contenteditable] ul {
          list-style-type: disc;
        }
        
        .rich-text-editor [contenteditable] ol {
          list-style-type: decimal;
        }
        
        .rich-text-editor [contenteditable] li {
          margin: 0.3em 0;
          line-height: 1.7;
        }
        
        /* Enlaces con estilo de marca */
        .rich-text-editor [contenteditable] a {
          color: #FF5100;
          text-decoration: underline;
        }
        
        .rich-text-editor [contenteditable] a:hover {
          text-decoration: none;
        }
        
        /* Imágenes responsivas */
        .rich-text-editor [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5em 0;
          display: block;
        }
        
        /* Negrita e itálica */
        .rich-text-editor [contenteditable] strong,
        .rich-text-editor [contenteditable] b {
          font-weight: 700;
        }
        
        .rich-text-editor [contenteditable] em,
        .rich-text-editor [contenteditable] i {
          font-style: italic;
        }
        
        /* Limitar BRs consecutivos */
        .rich-text-editor [contenteditable] br + br {
          display: none;
        }
        
        /* Remover estilos inline no deseados */
        .rich-text-editor [contenteditable] font,
        .rich-text-editor [contenteditable] span[style] {
          font-size: inherit !important;
          font-family: inherit !important;
        }
      `}</style>
    </div>
  );
}