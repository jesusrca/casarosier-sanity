import { Plus } from 'lucide-react';
import { SectionEditor } from './SectionEditor';

interface SectionsContainerProps {
  sections: any[];
  onChange: (sections: any[]) => void;
}

const SECTION_TYPES = [
  { id: 'hero', name: 'Hero / Banner', description: 'Imagen de fondo con título' },
  { id: 'class-layout', name: 'Layout de Clase/Taller', description: 'Diseño con galería + info + precios' },
  { id: 'text', name: 'Texto', description: 'Contenido de texto simple' },
  { id: 'pricing', name: 'Precios', description: 'Tabla de precios con includes' },
  { id: 'list', name: 'Lista', description: 'Grid de items' },
  { id: 'about', name: 'Sobre Nosotros', description: 'Texto con galería de imágenes' },
  { id: 'courses', name: 'Cursos/Servicios', description: 'Grid de cursos con enlaces' },
  { id: 'courses2', name: 'Cursos/Servicios 2', description: 'Segundo bloque de cursos' },
  { id: 'banner', name: 'Banner Clickeable', description: 'Imagen + título + texto con enlace' },
];

export function SectionsContainer({ sections, onChange }: SectionsContainerProps) {
  const handleAddSection = (type: string) => {
    const newSection = {
      id: `section-${Date.now()}`,
      type,
    };
    onChange([...sections, newSection]);
  };

  const handleUpdateSection = (index: number, updatedSection: any) => {
    const newSections = [...sections];
    newSections[index] = updatedSection;
    onChange(newSections);
  };

  const handleDeleteSection = (index: number) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    onChange(newSections);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < sections.length) {
      [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
      onChange(newSections);
    }
  };

  return (
    <div className="space-y-6">
      {sections.length === 0 ? (
        <div className="text-center py-8 bg-foreground/5 rounded-lg border-2 border-dashed border-foreground/20">
          <p className="text-foreground/60 mb-4">No hay secciones todavía</p>
          <p className="text-sm text-foreground/50 mb-4">Agrega una sección para comenzar</p>
        </div>
      ) : (
        sections.map((section, index) => (
          <SectionEditor
            key={section.id || index}
            section={section}
            onChange={(updated) => handleUpdateSection(index, updated)}
            onDelete={() => handleDeleteSection(index)}
            onMoveUp={() => handleMoveSection(index, 'up')}
            onMoveDown={() => handleMoveSection(index, 'down')}
            canMoveUp={index > 0}
            canMoveDown={index < sections.length - 1}
          />
        ))
      )}

      {/* Add Section Dropdown */}
      <div className="bg-white border-2 border-dashed border-foreground/20 rounded-lg p-4">
        <p className="text-sm mb-3">Agregar nueva sección:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {SECTION_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => handleAddSection(type.id)}
              className="flex items-center gap-2 p-3 bg-foreground/5 hover:bg-primary hover:text-white rounded-lg transition-colors text-left group"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium">{type.name}</div>
                <div className="text-xs opacity-70 group-hover:opacity-100">{type.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}