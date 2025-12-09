import { useState, useRef } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, 
  Link as LinkIcon, Image as ImageIcon, Video, 
  Heading1, Heading2, Heading3, Quote, Code, Eye, FileText,
  ExternalLink, Scissors, Copy, AlignLeft, AlignCenter, AlignRight,
  Strikethrough, Table, X, Check, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageUploader } from './ImageUploader';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function RichTextEditor({ value, onChange, label = 'Contenido' }: RichTextEditorProps) {
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkOpenInNewTab, setLinkOpenInNewTab] = useState(true);
  const [videoUrl, setVideoUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [urlPreview, setUrlPreview] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const getSelectedText = () => {
    const textarea = textareaRef.current;
    if (!textarea) return '';
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    return value.substring(start, end);
  };

  const handleFormat = (format: string) => {
    switch (format) {
      case 'bold':
        insertAtCursor('**', '**');
        break;
      case 'italic':
        insertAtCursor('*', '*');
        break;
      case 'underline':
        insertAtCursor('<u>', '</u>');
        break;
      case 'strikethrough':
        insertAtCursor('~~', '~~');
        break;
      case 'h1':
        insertAtCursor('# ');
        break;
      case 'h2':
        insertAtCursor('## ');
        break;
      case 'h3':
        insertAtCursor('### ');
        break;
      case 'ul':
        insertAtCursor('- ');
        break;
      case 'ol':
        insertAtCursor('1. ');
        break;
      case 'quote':
        insertAtCursor('> ');
        break;
      case 'code':
        insertAtCursor('`', '`');
        break;
      case 'align-left':
        insertAtCursor('<div style="text-align: left">', '</div>');
        break;
      case 'align-center':
        insertAtCursor('<div style="text-align: center">', '</div>');
        break;
      case 'align-right':
        insertAtCursor('<div style="text-align: right">', '</div>');
        break;
      case 'table':
        insertAtCursor('\n| Columna 1 | Columna 2 | Columna 3 |\n|-----------|-----------|-----------||\n| Dato 1    | Dato 2    | Dato 3    |\n| Dato 4    | Dato 5    | Dato 6    |\n');
        break;
      case 'link':
        openLinkModal();
        break;
    }
  };

  const openLinkModal = () => {
    const selected = getSelectedText();
    setLinkText(selected);
    setLinkUrl('');
    setUrlPreview('');
    setShowLinkModal(true);
  };

  const handleInsertLink = () => {
    if (!linkUrl) return;

    const url = linkUrl.trim();
    const text = linkText.trim() || url;

    if (linkOpenInNewTab) {
      // HTML link with target="_blank"
      insertAtCursor(`<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`);
    } else {
      // Markdown link
      insertAtCursor(`[${text}](${url})`);
    }

    // Reset and close
    setLinkUrl('');
    setLinkText('');
    setUrlPreview('');
    setShowLinkModal(false);
  };

  const validateAndPreviewUrl = async (url: string) => {
    setLinkUrl(url);
    
    if (!url.trim()) {
      setUrlPreview('');
      return;
    }

    setIsValidatingUrl(true);
    
    // Simulate validation (you can add real URL validation here)
    setTimeout(() => {
      let preview = url;
      
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:')) {
        preview = 'https://' + url;
      }
      
      setUrlPreview(preview);
      setIsValidatingUrl(false);
    }, 300);
  };

  const handleImageSelect = (url: string) => {
    insertAtCursor(`\n![Descripción de la imagen](${url})\n`);
    setShowImageUploader(false);
  };

  const handleVideoInsert = () => {
    if (!videoUrl) return;
    
    // Extract YouTube video ID
    let videoId = '';
    if (videoUrl.includes('youtube.com/watch?v=')) {
      videoId = videoUrl.split('watch?v=')[1].split('&')[0];
    } else if (videoUrl.includes('youtu.be/')) {
      videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
    } else if (videoUrl.includes('youtube.com/embed/')) {
      videoId = videoUrl.split('embed/')[1].split('?')[0];
    }

    if (videoId) {
      insertAtCursor(`\n<div class="video-container"><iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>\n`);
    } else {
      // Generic video embed
      insertAtCursor(`\n<video controls width="100%"><source src="${videoUrl}" /></video>\n`);
    }
    
    setVideoUrl('');
    setShowVideoInput(false);
  };

  const handlePasteLink = async () => {
    try {
      const text = await navigator.clipboard.readText();
      validateAndPreviewUrl(text);
    } catch (error) {
      console.error('Error reading clipboard:', error);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm text-foreground/80">{label}</label>
      
      {/* Toolbar */}
      <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-2">
        <div className="flex flex-wrap gap-1">
          {/* Text Formatting */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleFormat('bold')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Negrita (Ctrl+B)"
            >
              <Bold size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('italic')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Cursiva (Ctrl+I)"
            >
              <Italic size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('underline')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Subrayado"
            >
              <Underline size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('strikethrough')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Tachado"
            >
              <Strikethrough size={18} />
            </button>
          </div>
          
          <div className="w-px h-8 bg-gray-300 mx-1" />
          
          {/* Headings */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleFormat('h1')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Título 1"
            >
              <Heading1 size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('h2')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Título 2"
            >
              <Heading2 size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('h3')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Título 3"
            >
              <Heading3 size={18} />
            </button>
          </div>
          
          <div className="w-px h-8 bg-gray-300 mx-1" />
          
          {/* Lists and Blocks */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleFormat('ul')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Lista con viñetas"
            >
              <List size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('ol')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Lista numerada"
            >
              <ListOrdered size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('quote')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Cita"
            >
              <Quote size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('code')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Código"
            >
              <Code size={18} />
            </button>
          </div>
          
          <div className="w-px h-8 bg-gray-300 mx-1" />
          
          {/* Alignment */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleFormat('align-left')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Alinear izquierda"
            >
              <AlignLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('align-center')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Alinear centro"
            >
              <AlignCenter size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('align-right')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Alinear derecha"
            >
              <AlignRight size={18} />
            </button>
          </div>
          
          <div className="w-px h-8 bg-gray-300 mx-1" />
          
          {/* Media and Links */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleFormat('link')}
              className="p-2 hover:bg-primary/10 bg-primary/5 text-primary rounded transition-colors"
              title="Insertar enlace"
            >
              <LinkIcon size={18} />
            </button>
            <button
              type="button"
              onClick={() => setShowImageUploader(!showImageUploader)}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Insertar imagen"
            >
              <ImageIcon size={18} />
            </button>
            <button
              type="button"
              onClick={() => setShowVideoInput(!showVideoInput)}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Insertar video de YouTube"
            >
              <Video size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('table')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Insertar tabla"
            >
              <Table size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Link Modal */}
      <AnimatePresence>
        {showLinkModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLinkModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 max-w-2xl w-full mx-4"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <LinkIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl">Insertar enlace</h3>
                      <p className="text-sm text-foreground/60">Pega o escribe la URL del enlace</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLinkModal(false)}
                    className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* URL Input */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">URL del enlace *</label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={linkUrl}
                          onChange={(e) => validateAndPreviewUrl(e.target.value)}
                          placeholder="https://ejemplo.com o pega aquí"
                          className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          autoFocus
                        />
                        {isValidatingUrl && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handlePasteLink}
                        className="px-4 py-3 bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors flex items-center gap-2"
                        title="Pegar desde portapapeles"
                      >
                        <Copy className="w-5 h-5" />
                        <span className="hidden sm:inline">Pegar</span>
                      </button>
                    </div>
                    {urlPreview && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Vista previa: <span className="font-mono">{urlPreview}</span>
                      </div>
                    )}
                  </div>

                  {/* Link Text */}
                  <div>
                    <label className="block text-sm mb-2">Texto del enlace (opcional)</label>
                    <input
                      type="text"
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      placeholder="Si está vacío, se mostrará la URL"
                      className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Options */}
                  <div className="flex items-center gap-3 p-3 bg-foreground/5 rounded-lg">
                    <input
                      type="checkbox"
                      id="newTab"
                      checked={linkOpenInNewTab}
                      onChange={(e) => setLinkOpenInNewTab(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="newTab" className="text-sm flex items-center gap-2 cursor-pointer">
                      <ExternalLink className="w-4 h-4" />
                      Abrir en nueva pestaña
                    </label>
                  </div>

                  {/* Preview */}
                  {linkUrl && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-xs text-foreground/60 mb-2">Vista previa del enlace:</p>
                      <a 
                        href={urlPreview || linkUrl} 
                        target={linkOpenInNewTab ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                        onClick={(e) => e.preventDefault()}
                      >
                        {linkText || linkUrl}
                        {linkOpenInNewTab && <ExternalLink className="w-3 h-3" />}
                      </a>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <motion.button
                    onClick={handleInsertLink}
                    disabled={!linkUrl}
                    className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{ scale: linkUrl ? 1.02 : 1 }}
                    whileTap={{ scale: linkUrl ? 0.98 : 1 }}
                  >
                    <Check className="w-5 h-5" />
                    Insertar enlace
                  </motion.button>
                  <button
                    onClick={() => setShowLinkModal(false)}
                    className="px-6 py-3 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Image Uploader */}
      {showImageUploader && (
        <div className="border border-gray-300 bg-white p-4 rounded-lg">
          <ImageUploader
            onImageSelect={handleImageSelect}
            label="Seleccionar imagen para insertar"
          />
          <button
            type="button"
            onClick={() => setShowImageUploader(false)}
            className="mt-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Video Input */}
      {showVideoInput && (
        <div className="border border-gray-300 bg-white p-4 rounded-lg">
          <label className="block text-sm mb-2">URL del video de YouTube</label>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-2"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleVideoInsert}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Insertar Video
            </button>
            <button
              type="button"
              onClick={() => {
                setShowVideoInput(false);
                setVideoUrl('');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-300">
        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'editor' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <FileText size={18} />
          <span>Editor</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'preview' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <Eye size={18} />
          <span>Vista Previa</span>
        </button>
      </div>

      {/* Text Area */}
      {activeTab === 'editor' && (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={16}
          className="w-full px-4 py-3 border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm leading-relaxed"
          placeholder="Escribe tu contenido aquí... (Markdown y HTML soportados)&#10;&#10;Atajos de teclado:&#10;• Ctrl+B = Negrita&#10;• Ctrl+I = Cursiva&#10;• Puedes usar Markdown o HTML"
        />
      )}

      {/* Preview */}
      {activeTab === 'preview' && (
        <div className="w-full min-h-[400px] px-6 py-4 border border-gray-300 rounded-b-lg bg-white prose prose-lg max-w-none">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            components={{
              // Custom rendering for HTML embedded in markdown
              p: ({ node, ...props }) => <p className="mb-4 text-foreground/80" {...props} />,
              h1: ({ node, ...props }) => <h1 className="text-4xl mb-4" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-3xl mb-3" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-2xl mb-3" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-primary pl-4 italic text-foreground/70 my-4" {...props} />
              ),
              code: ({ node, ...props }) => (
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a className="text-primary hover:underline" {...props} />
              ),
              img: ({ node, ...props }) => (
                <img className="rounded-lg shadow-md my-4 max-w-full" {...props} />
              ),
              table: ({ node, ...props }) => (
                <table className="border-collapse border border-gray-300 my-4 w-full" {...props} />
              ),
              th: ({ node, ...props }) => (
                <th className="border border-gray-300 px-4 py-2 bg-gray-100" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="border border-gray-300 px-4 py-2" {...props} />
              ),
            }}
          >
            {value || '*No hay contenido para previsualizar*'}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
