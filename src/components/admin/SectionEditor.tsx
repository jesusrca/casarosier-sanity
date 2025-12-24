import { motion } from 'motion/react';
import { Trash2, ChevronUp, ChevronDown, Plus, Minus } from 'lucide-react';
import { ImageUploader } from '../ImageUploader';
import { useContent } from '../../contexts/ContentContext';

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
  // Cargar las tarjetas de regalo desde el contexto
  const { giftCards } = useContent();

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
      'gift-cards': 'Tarjetas Regalo',
      text: 'Texto',
      pricing: 'Tabla de Precios',
      list: 'Lista de Items',
      about: 'Sobre Nosotros (con imágenes)',
      courses: 'Cursos / Servicios',
      courses2: 'Cursos / Servicios 2',
      banner: 'Banner Clickeable',
      team: 'Equipo / Profesores',
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
                Sección con título, subtítulo, descripción e imagen
              </p>
            </div>

            {/* Título */}
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
              <label className="block text-sm mb-2">Subtítulo</label>
              <input
                type="text"
                value={section.subtitle || ''}
                onChange={(e) => updateField('subtitle', e.target.value)}
                placeholder="Subtítulo del taller"
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

            {/* Imagen */}
            <div>
              <label className="block text-sm mb-2">Imagen</label>
              <ImageUploader
                currentImage={section.image || ''}
                onImageSelect={(url) => updateField('image', url)}
                label="Imagen principal"
                aspectRatio="16:9"
              />
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
              <label className="block text-sm mb-2">Título (opcional)</label>
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Título de la sección"
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

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

        {/* Team Section */}
        {section.type === 'team' && (
          <>
            <div>
              <label className="block text-sm mb-2">Título de la sección (opcional)</label>
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="NUESTRO EQUIPO"
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm mb-3">Miembros del Equipo / Profesores</label>
              {(section.members || []).map((member: any, index: number) => (
                <div key={index} className="mb-6 p-4 border-2 border-foreground/20 rounded-lg bg-foreground/5">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium">Profesor {index + 1}</span>
                    <button
                      onClick={() => removeArrayItem('members', index)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Photo */}
                  <div className="mb-3">
                    <ImageUploader
                      currentImage={member.photo || ''}
                      onImageSelect={(url) => updateArrayItem('members', index, { ...member, photo: url })}
                      label="Foto del profesor"
                      aspectRatio="1:1"
                    />
                  </div>

                  {/* Name */}
                  <div className="mb-3">
                    <label className="block text-xs mb-1">Nombre</label>
                    <input
                      type="text"
                      value={member.name || ''}
                      onChange={(e) => updateArrayItem('members', index, { ...member, name: e.target.value })}
                      placeholder="Nombre del profesor"
                      className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Role */}
                  <div className="mb-3">
                    <label className="block text-xs mb-1">Cargo / Especialidad</label>
                    <input
                      type="text"
                      value={member.role || ''}
                      onChange={(e) => updateArrayItem('members', index, { ...member, role: e.target.value })}
                      placeholder="ej: Ceramista especializada en torno"
                      className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-xs mb-1">Biografía</label>
                    <textarea
                      value={member.bio || ''}
                      onChange={(e) => updateArrayItem('members', index, { ...member, bio: e.target.value })}
                      placeholder="Escribe la biografía del profesor..."
                      rows={4}
                      className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('members', { name: '', role: '', bio: '', photo: '' })}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Agregar profesor
              </button>
            </div>
          </>
        )}

        {/* Gift Cards Section */}
        {section.type === 'gift-cards' && (
          <>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-2 text-primary">Tarjetas Regalo</h4>
              <p className="text-sm text-foreground/60">
                Crea y gestiona las tarjetas regalo disponibles. Cada tarjeta muestra título, descripción, número de clases, personas y precio.
              </p>
            </div>

            <div>
              <label className="block text-sm mb-2">Título de la sección (opcional)</label>
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="TARJETAS REGALO"
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Subtítulo de la sección (opcional)</label>
              <input
                type="text"
                value={section.subtitle || ''}
                onChange={(e) => updateField('subtitle', e.target.value)}
                placeholder="Regalo una experiencia única"
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm mb-3">Tarjetas Regalo</label>
              {(section.giftCards || []).map((card: any, index: number) => (
                <div key={index} className="mb-6 p-4 border-2 border-foreground/20 rounded-lg bg-foreground/5">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium">Tarjeta {index + 1}</span>
                    <button
                      onClick={() => removeArrayItem('giftCards', index)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Título */}
                  <div className="mb-3">
                    <label className="block text-xs mb-1">Título de la tarjeta</label>
                    <input
                      type="text"
                      value={card.title || ''}
                      onChange={(e) => updateArrayItem('giftCards', index, { ...card, title: e.target.value })}
                      placeholder="TARJETA REGALO"
                      className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Imagen */}
                  <div className="mb-3">
                    <ImageUploader
                      currentImage={card.image || ''}
                      onImageSelect={(url) => updateArrayItem('giftCards', index, { ...card, image: url })}
                      label="Imagen de la tarjeta"
                      aspectRatio="16:9"
                    />
                  </div>

                  {/* Descripción */}
                  <div className="mb-3">
                    <label className="block text-xs mb-1">Descripción</label>
                    <textarea
                      value={card.description || ''}
                      onChange={(e) => updateArrayItem('giftCards', index, { ...card, description: e.target.value })}
                      placeholder="una tarjeta en elegante sobre rustico con un vale personalizado con el monto que elijas."
                      rows={3}
                      className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Número de Clases */}
                  <div className="mb-3">
                    <label className="block text-xs mb-1">Número de clases</label>
                    <input
                      type="text"
                      value={card.classes || ''}
                      onChange={(e) => updateArrayItem('giftCards', index, { ...card, classes: e.target.value })}
                      placeholder="1 clase"
                      className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Personas */}
                  <div className="mb-3">
                    <label className="block text-xs mb-1">Personas</label>
                    <input
                      type="text"
                      value={card.people || ''}
                      onChange={(e) => updateArrayItem('giftCards', index, { ...card, people: e.target.value })}
                      placeholder="1 persona"
                      className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Precio */}
                  <div className="mb-3">
                    <label className="block text-xs mb-1">Precio (solo número, sin €)</label>
                    <input
                      type="number"
                      value={card.price || ''}
                      onChange={(e) => updateArrayItem('giftCards', index, { ...card, price: e.target.value })}
                      placeholder="45"
                      className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* CTA Opcional */}
                  <div className="border-t border-foreground/20 pt-3 mt-3">
                    <label className="block text-xs mb-2 text-foreground/60">Botón de Acción (opcional)</label>
                    
                    {/* Texto del botón */}
                    <div className="mb-3">
                      <label className="block text-xs mb-1">Texto del botón</label>
                      <input
                        type="text"
                        value={card.ctaText || ''}
                        onChange={(e) => updateArrayItem('giftCards', index, { ...card, ctaText: e.target.value })}
                        placeholder="Comprar ahora"
                        className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>

                    {/* Tipo de enlace */}
                    <div className="mb-3">
                      <label className="block text-xs mb-1">Tipo de enlace</label>
                      <select
                        value={card.ctaLinkType || 'url'}
                        onChange={(e) => updateArrayItem('giftCards', index, { ...card, ctaLinkType: e.target.value, ctaLink: '' })}
                        className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
                      >
                        <option value="url">URL externa</option>
                        <option value="gift-card">Página de tarjeta de regalo</option>
                      </select>
                    </div>

                    {/* Campo según el tipo seleccionado */}
                    {card.ctaLinkType === 'gift-card' ? (
                      <div>
                        <label className="block text-xs mb-1">Seleccionar tarjeta de regalo</label>
                        <select
                          value={card.ctaLink || ''}
                          onChange={(e) => updateArrayItem('giftCards', index, { ...card, ctaLink: e.target.value })}
                          className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
                        >
                          <option value="">-- Seleccionar tarjeta --</option>
                          {/* Cargar tarjetas de regalo desde el contexto */}
                          {giftCards && giftCards.length > 0 ? (
                            giftCards
                              .filter((gc: any) => gc.visible) // Solo mostrar tarjetas visibles
                              .map((giftCard: any) => (
                                <option key={giftCard.id} value={`/tarjeta-regalo/${giftCard.slug}`}>
                                  {giftCard.title}
                                </option>
                              ))
                          ) : (
                            <option value="" disabled>No hay tarjetas de regalo creadas</option>
                          )}
                        </select>
                        <p className="text-xs text-foreground/50 mt-1">
                          💡 Las tarjetas se cargan del gestor de Gift Cards (solo visibles)
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs mb-1">URL del enlace</label>
                        <input
                          type="text"
                          value={card.ctaLink || ''}
                          onChange={(e) => updateArrayItem('giftCards', index, { ...card, ctaLink: e.target.value })}
                          placeholder="https://ejemplo.com o /ruta-interna"
                          className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                        <p className="text-xs text-foreground/50 mt-1">
                          💡 Usa URL completa (https://) o ruta interna (/pagina)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('giftCards', { 
                  title: 'TARJETA REGALO', 
                  description: '', 
                  classes: '', 
                  people: '', 
                  price: '',
                  ctaText: '',
                  ctaLink: ''
                })}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Agregar tarjeta regalo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}