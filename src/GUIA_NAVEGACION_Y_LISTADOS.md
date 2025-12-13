# Guía de Navegación y Páginas de Listado

## 📋 Resumen de Cambios

Se han implementado mejoras significativas en la navegación y el sistema de listados de Casa Rosier:

### 1. **Sistema de Menú Flexible** ✅
Los items del menú principal ahora pueden tener o no tener link, incluso cuando tienen submenús.

**Comportamiento:**
- **Desktop**: Si un item tiene link, es clickeable. Si tiene submenú, aparece al hacer hover.
- **Móvil**: Si tiene link + submenú, muestra ambos (el link principal y el botón "+" para expandir).
- **Sin link**: Solo muestra el submenú desplegable.

**Dónde configurar:**
- Admin > Gestión del Menú
- El campo "Ruta" ahora es opcional para items con submenú
- Placeholder: "Ruta (opcional)" cuando hay submenú

---

### 2. **Páginas de Listado con Ordenamiento** ✅

Se han creado páginas de listado profesionales para:

#### **📚 Clases** (`/clases`)
- Muestra todas las clases disponibles
- Grid responsive: 1 columna (móvil) → 2 columnas (tablet) → 3 columnas (desktop)
- Tarjetas con imagen, título, subtítulo, descripción corta y precio
- **Ordenamiento**: Más recientes ↔ Más antiguos

**Archivo**: `/pages/ClasesListing.tsx`

#### **🎨 Workshops** (`/workshops`)
- Misma estructura que Clases
- Grid responsive con tarjetas profesionales
- **Ordenamiento**: Más recientes ↔ Más antiguos

**Archivo**: `/pages/WorkshopsListing.tsx`

#### **📝 Blog** (`/blog`)
- Diseño mejorado coherente con el resto de la web
- Tarjetas con aspecto ratio 4:3
- Placeholder visual cuando no hay imagen destacada
- **Ordenamiento**: Más recientes ↔ Más antiguos
- Metadata: Fecha y autor

**Archivo**: `/pages/Blog.tsx` (mejorado)

---

### 3. **Diseño Mejorado del Blog** ✅

#### **Página de Listado (`/blog`)**
- Hero con título en texto (no imagen)
- Grid 3 columnas con tarjetas mejoradas
- Bordes sutiles y transiciones suaves
- Hover effects profesionales
- Botón de ordenamiento visible y accesible

#### **Página Individual (`/blog/:slug`)**
- **Hero estándar** de Casa Rosier con imagen destacada del post
- Título y excerpt como subtitle en el hero
- Contenido **directamente sobre el fondo** de la página (sin tarjeta blanca)
- **Diseño minimalista y moderno**:
  - Espaciado generoso y limpio
  - Metadata con iconos destacados (fecha y autor)
  - Tipografía legible y espaciada
- Mejor tipografía y espaciado
- Botón "Volver arriba" en el footer del artículo
- Estilos mejorados para:
  - Blockquotes con fondo semitransparente
  - Código inline y bloques con bordes
  - Imágenes con sombras sutiles
  - Listas con mejor espaciado
  - Enlaces con subrayado offset
  - Separadores horizontales

**Archivo**: `/pages/BlogPost.tsx` (mejorado)

---

## 🎯 Criterio de Ordenamiento

### **Por defecto: Más recientes primero**
- Los usuarios ven primero el contenido más nuevo
- Ideal para mantener la frescura del contenido

### **Opción alternativa: Más antiguos primero**
- Útil para ver contenido histórico
- Permite recorrer cronológicamente las publicaciones

### **Cómo funciona:**
1. Se ordena por fecha de creación (`createdAt`)
2. Botón de toggle visible en la esquina superior derecha
3. Iconos visuales: `SortDesc` (↓) y `SortAsc` (↑)
4. Estado persistente durante la sesión

---

## 📐 Estructura de Tarjetas

### **Diseño Común para Todas las Páginas de Listado:**

```
┌────────────────────────────────┐
│                                │
│   [Imagen o Placeholder]       │ ← Aspecto 4:3
│                                │
├────────────────────────────────┤
│ 📅 Fecha    👤 Autor           │ ← Metadata
│                                │
│ Título de la Clase/Post        │ ← h3, 2 líneas max
│ Subtítulo (si existe)          │ ← Texto primario
│                                │
│ Descripción breve que explica  │ ← 3 líneas max
│ de qué trata el contenido...   │
│                                │
│ ────────────────────────────   │ ← Separador (si hay precio)
│ 120€ /mes                      │ ← Precio (clases/workshops)
│                                │
│ Ver detalles →                 │ ← CTA
└────────────────────────────────┘
```

### **Efectos Visuales:**
- **Hover**: Sombra elevada + escala de imagen
- **Transiciones**: Suaves (300-500ms)
- **Bordes**: `border-border` sutiles
- **Espaciado**: Generoso y consistente

---

## 🗂️ Estructura de Archivos

```
/pages/
  ├── ClasesListing.tsx       ← Listado de clases (NUEVO)
  ├── WorkshopsListing.tsx    ← Listado de workshops (NUEVO)
  ├── Blog.tsx                ← Listado de blog (MEJORADO)
  ├── BlogPost.tsx            ← Post individual (MEJORADO)
  ├── DynamicContentPage.tsx  ← Páginas individuales /clases/:slug
  ├── ClaseExample.tsx        ← Ejemplo de diseño (referencia)
  └── ...
```

---

## 🔗 Rutas Actualizadas

```javascript
// LISTADOS (con ordenamiento)
/clases              → ClasesListing
/workshops           → WorkshopsListing  
/blog                → Blog (mejorado)

// PÁGINAS INDIVIDUALES
/clases/:slug        → DynamicContentPage
/workshops/:slug     → DynamicContentPage
/blog/:slug          → BlogPost (mejorado)
```

---

## 🎨 Coherencia de Diseño

### **Paleta de Colores:**
- Background: `#F3F2EF` (beige claro)
- Primary: `#FF5100` (naranja)
- Border: Tonos tierra sutiles
- Hover: Transiciones suaves

### **Tipografía:**
- Tamaños centralizados en `/styles/globals.css`
- **NO** usar clases de Tailwind para font-size, font-weight o line-height
- Usar solo las etiquetas HTML: `<h1>`, `<h2>`, `<h3>`, `<p>`, etc.

### **Espaciado:**
- Secciones: `py-16 lg:py-24`
- Contenedores: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Grid gaps: `gap-8`

---

## 🚀 Navegación Ideal

### **Flujo del Usuario:**

1. **Entrada** → `/` (Home)
2. **Exploración** → `/clases` o `/workshops` (Listados)
3. **Detalle** → `/clases/iniciacion-ceramica` (Individual)
4. **Conversión** → Formulario de inscripción

### **Menú Principal:**

```
Inicio
Clases (/clases) +
  ├─ Iniciación a la cerámica
  ├─ Regular de modelado
  └─ Modelado con torno
Workshops (solo submenú) +
  ├─ Esmaltes online
  ├─ Esmaltes Barcelona
  └─ Laboratorio Cerámico
Blog (/blog)
```

---

## ✅ Checklist de Navegación

- [x] Menú flexible (con/sin link)
- [x] Listado de Clases con ordenamiento
- [x] Listado de Workshops con ordenamiento
- [x] Blog mejorado con ordenamiento
- [x] BlogPost con diseño elevado
- [x] Rutas actualizadas en App.tsx
- [x] Coherencia visual en todas las páginas
- [x] Responsive design completo
- [x] Transiciones y efectos sutiles
- [x] SEO optimizado

---

## 📱 Responsive Design

### **Breakpoints:**
- **Móvil**: < 768px → 1 columna
- **Tablet**: 768px - 1024px → 2 columnas
- **Desktop**: > 1024px → 3 columnas

### **Comportamiento Móvil:**
- Menú hamburguesa con animaciones
- Tarjetas apiladas verticalmente
- Botones de ordenamiento adaptados
- Imágenes responsive

---

## 🔧 Cómo Agregar Contenido

### **Para agregar una nueva clase:**
1. Admin > Gestión de Contenido
2. Crear nuevo contenido tipo "Clase"
3. Rellenar: Título, slug, descripción, precio, imagen
4. Publicar (visible = true)
5. **Aparecerá automáticamente** en `/clases`

### **Para agregar un nuevo workshop:**
1. Mismo proceso, tipo "Workshop"
2. Aparecerá automáticamente en `/workshops`

### **Para agregar un post de blog:**
1. Admin > Gestión de Blog
2. Crear nuevo post
3. Aparecerá automáticamente en `/blog`

---

## 🎯 Próximos Pasos Recomendados

1. **Filtros adicionales**: Por nivel, duración, precio
2. **Búsqueda**: Barra de búsqueda en listados
3. **Paginación**: Si hay muchos items (>12)
4. **Tags/Categorías**: Para mejor organización
5. **Compartir social**: Botones en BlogPost
6. **Comentarios**: Sistema de comentarios en blog
7. **Newsletter**: Suscripción al blog

---

## 📞 Soporte

Si tienes dudas sobre la navegación o los listados:
- Revisa `/ADMIN_GUIDE.md` para gestión de contenido
- Revisa `/ANALISIS_Y_MEJORAS.md` para arquitectura técnica
- Consulta este archivo para flujos de navegación

---

**Última actualización**: Diciembre 2024
**Versión**: 2.0 - Sistema de Listados y Navegación Mejorada