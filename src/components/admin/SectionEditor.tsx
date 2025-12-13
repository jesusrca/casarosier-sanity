import { motion } from 'motion/react';
import { Trash2, ChevronUp, ChevronDown, Plus, Minus } from 'lucide-react';
import { ImageUploader } from '../ImageUploader';

interface SectionEditorProps {
  section: any;
  onChange: (section: any) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function SectionEditor({
  section,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: SectionEditorProps) {
  const updateField = (field: string, value: any) => {
    onChange({ ...section, [field]: value });
  };

  const updateArrayItem = (field: string, index: number, value: any) => {
    const array = [...(section[field] || [])];
    array[index] = value;
    onChange({ ...section, [field]: array });
  };

  const addArrayItem = (field: string, defaultValue: any) => {
    const array = [...(section[field] || []), defaultValue];
    onChange({ ...section, [field]: array });
  };

  const removeArrayItem = (field: string, index: number) => {
    const array = [...(section[field] || [])];
    array.splice(index, 1);
    onChange({ ...section, [field]: array });
  };

  const getSectionTypeName = (type: string) => {
    const types: Record<string, string> = {
      hero: 'Hero / Banner',
      'class-layout': 'Layout de Clase/Taller',
      text: 'Texto',
      pricing: 'Tabla de Precios',
      list: 'Lista de Items',
      about: 'Sobre Nosotros (con imágenes)',
      courses: 'Cursos / Servicios',
      courses2: 'Cursos / Servicios 2',
      banner: 'Banner Clickeable',
    };
    return types[type] || type;
  };

  return (
    <div className="bg-white border border-foreground/20 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-foreground/5 p-4 flex items-center justify-between border-b border-foreground/10">
        <h4 className="font-medium">{getSectionTypeName(section.type)}</h4>
        <div className="flex items-center gap-2">
          {canMoveUp && (
            <button
              onClick={onMoveUp}
              className="p-1 hover:bg-foreground/10 rounded"
              title="Mover arriba"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
          {canMoveDown && (
            <button
              onClick={onMoveDown}
              className="p-1 hover:bg-foreground/10 rounded"
              title="Mover abajo"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1 hover:bg-red-50 text-red-600 rounded"
            title="Eliminar sección"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Hero Section */}
        {section.type === 'hero' && (
          <>
            <div>
              <label className="block text-sm mb-2">Título</label>
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Subtítulo</label>
              <input
                type="text"
                value={section.subtitle || ''}
                onChange={(e) => updateField('subtitle', e.target.value)}
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <ImageUploader
              currentImage={section.image || ''}
              onImageSelect={(url) => updateField('image', url)}
              label="Imagen de fondo"
              aspectRatio="16:9"
            />
          </>
        )}

        {/* Class Layout Section */}
        {section.type === 'class-layout' && (
          <>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-2 text-primary">Layout de Clase/Taller</h4>
              <p className="text-sm text-foreground/60">
                Diseño de 2 columnas con galería de imágenes (izquierda) y contenido + precios (derecha)
              </p>
            </div>

            {/* Título y Subtítulo */}
            <div>
              <label className="block text-sm mb-2">Título</label>
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="TALLER PARA GRUPOS"
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Subtítulo (opcional)</label>
              <input
                type="text"
                value={section.subtitle || ''}
                onChange={(e) => updateField('subtitle', e.target.value)}
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm mb-2">Descripción</label>
              <textarea
                value={section.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                rows={6}
                placeholder="Descripción del taller o clase..."
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Imágenes de la Galería */}
            <div>
              <label className="block text-sm mb-2">Galería de Imágenes</label>
              <p className="text-xs text-foreground/60 mb-3">
                La primera imagen será la principal. Se mostrarán hasta 3 miniaturas clickeables.
              </p>
              {(section.images || []).map((image: string, index: number) => (
                <div key={index} className="mb-2">
                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <ImageUploader
                        currentImage={image}
                        onImageSelect={(url) => updateArrayItem('images', index, url)}
                        label={`Imagen ${index + 1}${index === 0 ? ' (Principal)' : ''}`}
                        compact={true}
                        aspectRatio="4:3"
                      />
                    </div>
                    <button
                      onClick={() => removeArrayItem('images', index)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded mt-6"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('images', '')}
                className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
              >
                <Plus className="w-4 h-4" />
                Agregar imagen
              </button>
            </div>

            <div className="border-t border-foreground/10 pt-4"></div>

            {/* Precio */}
            <div>
              <label className="block text-sm mb-2">Precio</label>
              <input
                type="text"
                value={section.price || ''}
                onChange={(e) => updateField('price', e.target.value)}
                placeholder="Desde 350€"
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Subtítulo del Precio</label>
              <input
                type="text"
                value={section.priceSubtitle || ''}
                onChange={(e) => updateField('priceSubtitle', e.target.value)}
                placeholder="Grupo de 6-8 personas · 2,5 horas"
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Incluye */}
            <div>
              <label className="block text-sm mb-2">Incluye</label>
              {(section.includes || []).map((item: string, index: number) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateArrayItem('includes', index, e.target.value)}
                    placeholder="Ej: Alquiler privado del estudio"
                    className="flex-1 px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => removeArrayItem('includes', index)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('includes', '')}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Agregar item
              </button>
            </div>

            {/* Extras/Opcionales */}
            <div>
              <label className="block text-sm mb-2">Extras / Opcionales</label>
              {(section.extras || []).map((extra: any, index: number) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={extra.name || ''}
                    onChange={(e) => updateArrayItem('extras', index, { ...extra, name: e.target.value })}
                    placeholder="Nombre del extra"
                    className="flex-1 px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={extra.price || ''}
                    onChange={(e) => updateArrayItem('extras', index, { ...extra, price: e.target.value })}
                    placeholder="+150€"
                    className="w-32 px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => removeArrayItem('extras', index)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('extras', { name: '', price: '' })}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Agregar extra
              </button>
            </div>

            <div className="border-t border-foreground/10 pt-4"></div>

            {/* Botón CTA */}
            <div>
              <label className="block text-sm mb-2">Texto del Botón</label>
              <input
                type="text"
                value={section.ctaText || ''}
                onChange={(e) => updateField('ctaText', e.target.value)}
                placeholder="Solicitar presupuesto"
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Enlace del Botón</label>
              <input
                type="text"
                value={section.ctaLink || ''}
                onChange={(e) => updateField('ctaLink', e.target.value)}
                placeholder="https://wa.me/..."
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Horarios */}
            <div>
              <label className="block text-sm mb-2">Horarios (JSON)</label>
              <p className="text-xs text-foreground/60 mb-2">
                Formato: array de objetos con "day" y "slots" (cada slot tiene "time" y opcionalmente "availablePlaces")
              </p>
              <textarea
                value={JSON.stringify(section.schedule || [], null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    updateField('schedule', parsed);
                  } catch (err) {
                    // Mantener el valor mientras se está editando
                  }
                }}
                rows={10}
                placeholder={`[\n  {\n    "day": "Entre semana",\n    "slots": [\n      { "time": "10:00-13:00", "availablePlaces": null }\n    ]\n  }\n]`}
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPlaces"
                checked={section.showPlaces !== false}
                onChange={(e) => updateField('showPlaces', e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="showPlaces" className="text-sm">
                Mostrar plazas disponibles
              </label>
            </div>
          </>
        )}

        {/* Text Section */}
        {section.type === 'text' && (
          <>
            <div>
              <label className="block text-sm mb-2">Título (opcional)</label>
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Contenido</label>
              <textarea
                value={section.content || ''}
                onChange={(e) => updateField('content', e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </>
        )}

        {/* Pricing Section */}
        {section.type === 'pricing' && (
          <>
            <div>
              <label className="block text-sm mb-2">Título</label>
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Precio</label>
              <input
                type="text"
                value={section.price || ''}
                onChange={(e) => updateField('price', e.target.value)}
                placeholder="Desde 350€"
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Subtítulo</label>
              <input
                type="text"
                value={section.subtitle || ''}
                onChange={(e) => updateField('subtitle', e.target.value)}
                placeholder="Grupo de 6-8 personas · 2,5 horas"
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Includes */}
            <div>
              <label className="block text-sm mb-2">Incluye</label>
              {(section.includes || []).map((item: string, index: number) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateArrayItem('includes', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => removeArrayItem('includes', index)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('includes', '')}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Agregar item
              </button>
            </div>

            {/* Extras */}
            <div>
              <label className="block text-sm mb-2">Extras (opcional)</label>
              {(section.extras || []).map((extra: any, index: number) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={extra.name || ''}
                    onChange={(e) => updateArrayItem('extras', index, { ...extra, name: e.target.value })}
                    placeholder="Nombre del extra"
                    className="flex-1 px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={extra.price || ''}
                    onChange={(e) => updateArrayItem('extras', index, { ...extra, price: e.target.value })}
                    placeholder="+150€"
                    className="w-32 px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => removeArrayItem('extras', index)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('extras', { name: '', price: '' })}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Agregar extra
              </button>
            </div>
          </>
        )}

        {/* List Section */}
        {section.type === 'list' && (
          <>
            <div>
              <label className="block text-sm mb-2">Título</label>
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Items</label>
              {(section.items || []).map((item: any, index: number) => (
                <div key={index} className="mb-4 p-4 border border-foreground/10 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">Item {index + 1}</span>
                    <button
                      onClick={() => removeArrayItem('items', index)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => updateArrayItem('items', index, { ...item, title: e.target.value })}
                    placeholder="Título"
                    className="w-full px-4 py-2 mb-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <textarea
                    value={item.description || ''}
                    onChange={(e) => updateArrayItem('items', index, { ...item, description: e.target.value })}
                    placeholder="Descripción"
                    rows={3}
                    className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ))}
              <button
                onClick={() => addArrayItem('items', { title: '', description: '' })}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Agregar item
              </button>
            </div>
          </>
        )}

        {/* About Section */}
        {section.type === 'about' && (
          <>
            <div>
              <label className="block text-sm mb-2">Contenido (usa \\n para separar párrafos)</label>
              <textarea
                value={section.content || ''}
                onChange={(e) => updateField('content', e.target.value)}
                rows={6}
                placeholder="Ya sea en clases mensuales o en talleres intensivos...\n\nTambién puedes crear un evento privado..."
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-foreground/60 mt-2">
                Usa \\n para separar párrafos
              </p>
            </div>

            <div>
              <label className="block text-sm mb-2">Imagen Principal</label>
              <p className="text-xs text-foreground/60 mb-2">Esta imagen grande se mostrará en la sección About de la página de inicio</p>
              <ImageUploader
                currentImage={section.mainImage || ''}
                onImageSelect={(url) => updateField('mainImage', url)}
                label="Imagen Principal"
                aspectRatio="3:4"
              />
            </div>
          </>
        )}

        {/* Courses Section */}
        {section.type === 'courses' && (
          <>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-3 text-primary">Título de la Sección (Dos Líneas)</h4>
              <p className="text-sm text-foreground/60 mb-3">El título se mostrará en dos líneas con una línea decorativa entre ellas</p>
              
              <div className="mb-3">
                <label className="block text-sm mb-2">Primera Línea (más pequeña)</label>
                <input
                  type="text"
                  value={section.titleLine1 || ''}
                  onChange={(e) => updateField('titleLine1', e.target.value)}
                  placeholder="CURSOS Y"
                  className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-center mb-3">
                <div className="w-32 h-[1px] bg-foreground/30"></div>
              </div>

              <div>
                <label className="block text-sm mb-2">Segunda Línea (más grande)</label>
                <input
                  type="text"
                  value={section.titleLine2 || ''}
                  onChange={(e) => updateField('titleLine2', e.target.value)}
                  placeholder="WORKSHOPS"
                  className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ℹ️ Los cursos se cargan automáticamente desde el gestor de Clases. Marca las clases/workshops con el checkbox "Mostrar en Home - Cursos" para que aparezcan aquí.
              </p>
            </div>
          </>
        )}

        {/* Courses Section 2 */}
        {section.type === 'courses2' && (
          <>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-3 text-primary">Título de la Sección (Dos Líneas)</h4>
              <p className="text-sm text-foreground/60 mb-3">El título se mostrará en dos líneas con una línea decorativa entre ellas</p>
              
              <div className="mb-3">
                <label className="block text-sm mb-2">Primera Línea (más pequeña)</label>
                <input
                  type="text"
                  value={section.titleLine1 || ''}
                  onChange={(e) => updateField('titleLine1', e.target.value)}
                  placeholder="MÁS"
                  className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-center mb-3">
                <div className="w-32 h-[1px] bg-foreground/30"></div>
              </div>

              <div>
                <label className="block text-sm mb-2">Segunda Línea (más grande)</label>
                <input
                  type="text"
                  value={section.titleLine2 || ''}
                  onChange={(e) => updateField('titleLine2', e.target.value)}
                  placeholder="OPCIONES"
                  className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                ℹ️ Los workshops se cargan automáticamente desde el gestor de Clases. Marca las clases/workshops con el checkbox "Mostrar en Home - Workshops" para que aparezcan aquí.
              </p>
            </div>
          </>
        )}

        {/* Banner Section */}
        {section.type === 'banner' && (
          <>
            <div>
              <label className="block text-sm mb-2">Imagen</label>
              <ImageUploader
                currentImage={section.image || ''}
                onImageSelect={(url) => updateField('image', url)}
                label="Imagen del banner"
              />
              <p className="text-xs text-foreground/60 mt-2">
                Imagen recomendada: 400x300px o similar, orientación horizontal
              </p>
            </div>
            
            <div>
              <label className="block text-sm mb-2">Título</label>
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Experiencia Cerámica Gift Card"
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Descripción</label>
              <textarea
                value={section.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Este cupón de regalo para taller ofrece una clase privada de cerámica..."
                rows={4}
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Enlace (opcional)</label>
              <input
                type="text"
                value={section.link || ''}
                onChange={(e) => updateField('link', e.target.value)}
                placeholder="/tarjeta-regalo"
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-foreground/60 mt-2">
                Deja vacío para que el banner no sea clickeable
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}