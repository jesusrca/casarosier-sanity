/**
 * Genera un slug válido a partir de un texto
 * - Convierte a minúsculas
 * - Reemplaza espacios con guiones
 * - Elimina acentos y caracteres especiales
 * - Solo permite letras, números y guiones
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Reemplazar acentos y caracteres especiales
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Reemplazar espacios y guiones bajos con guiones
    .replace(/\s+/g, '-')
    .replace(/_+/g, '-')
    // Eliminar caracteres no alfanuméricos excepto guiones
    .replace(/[^\w\-]+/g, '')
    // Reemplazar múltiples guiones con uno solo
    .replace(/\-\-+/g, '-')
    // Eliminar guiones al inicio y al final
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
