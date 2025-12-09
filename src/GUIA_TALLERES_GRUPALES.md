# 📋 Guía: Cómo Agregar la Página de Talleres Grupales

## Opción 1: Crear desde el Administrador (RECOMENDADO)

### Paso 1: Acceder al Administrador
1. Ve a `/admin` en tu navegador
2. Inicia sesión con tus credenciales
3. Haz clic en **"Páginas Personalizadas"** en el menú lateral

### Paso 2: Crear Nueva Página
1. Haz clic en el botón **"+ Nueva Página"** (arriba a la derecha)
2. Se abrirá un selector de plantillas

### Paso 3: Seleccionar Plantilla
1. Elige la plantilla **"Taller para Grupos / Evento Privado"**
   - Esta plantilla ya incluye todas las secciones necesarias:
     - Hero (título y imagen de fondo)
     - Introducción
     - Precios e incluye
     - Tipos de eventos
     - Horarios y reservas

### Paso 4: Completar Información Básica
1. **Título**: "Talleres Grupales" o "Taller para Grupos"
2. **Slug**: Se generará automáticamente como `talleres-grupales`
   - Puedes cambiarlo si quieres (ej: `espacios-privados`, `eventos-privados`)
3. **Visible**: Marca como visible cuando esté lista para publicar

### Paso 5: Editar Secciones

#### Sección Hero:
- **Título**: "Taller para Grupos"
- **Subtítulo**: "Experiencias cerámicas únicas"
- **Imagen de fondo**: Sube una imagen desde tu computadora

#### Sección Introducción:
- Escribe la descripción del servicio de talleres grupales

#### Sección Precios:
- **Precio**: "Desde 350€"
- **Subtítulo**: "Grupo de 6-8 personas · 2,5 horas"
- **Incluye**: Agrega los ítems incluidos
- **Extras**: Agrega los servicios opcionales con sus precios

#### Sección Tipos de Eventos:
- Agrega los diferentes tipos de eventos:
  - Team Building Empresarial
  - Despedidas de Soltero/a
  - Cumpleaños y Celebraciones
  - Eventos Familiares
  - Eventos Corporativos

#### Sección Horarios:
- Agrega información sobre disponibilidad y cómo reservar

### Paso 6: SEO
1. **Meta Título**: "Talleres Grupales - Casa Rosier Barcelona"
2. **Meta Descripción**: "Experiencias cerámicas únicas para grupos, empresas y celebraciones. Team building, despedidas, cumpleaños. Desde 350€."
3. **Keywords**: "talleres grupales, cerámica Barcelona, team building, eventos privados"

### Paso 7: Guardar y Publicar
1. Haz clic en **"Guardar Cambios"**
2. La página estará disponible en: `tu-dominio.com/talleres-grupales`

---

## Opción 2: Agregar al Menú de Navegación

Una vez creada la página, agrégala al menú:

### Paso 1: Ir a Gestor de Menú
1. En el administrador, haz clic en **"Menú"**

### Paso 2: Agregar al Submenú de "Reservas Privadas"
1. Encuentra el menú **"Reservas Privadas"**
2. Haz clic en **"+ Agregar Submenú"**
3. Completa:
   - **Título**: "Taller para Grupos"
   - **Ruta**: `/talleres-grupales` (o el slug que hayas elegido)
   - **Orden**: 1
4. Guarda los cambios

---

## Opción 3: Usar la Página Actual (Espacios Privados)

Si prefieres usar la página actual que ya está creada:

### La página `/espacios-privados` ya existe y tiene:
- ✅ Layout de 2 columnas (40% imágenes / 60% contenido)
- ✅ Galería de imágenes interactiva
- ✅ Sección de precios con incluye y opcionales
- ✅ Horarios flexibles con el componente ScheduleDisplay
- ✅ Acordeones con tipos de eventos
- ✅ Información adicional y política de cancelación
- ✅ Diseño responsive para móvil, tablet y desktop
- ✅ Animaciones sutiles

### Para editar esta página:
1. Ve a `/admin/pages`
2. Busca la página "Espacios Privados"
3. Haz clic en editar
4. Modifica el contenido según necesites

---

## 🎨 Personalización Avanzada

### Cambiar los Horarios
Si necesitas cambiar los horarios que aparecen en la página:

1. Edita el archivo `/pages/EspaciosPrivados.tsx`
2. Busca la constante `schedules` (línea 11-28)
3. Modifica los días y horarios:

```typescript
const schedules: DaySchedule[] = [
  {
    day: 'Entre semana',
    slots: [
      { time: 'Mañanas (10:00-13:00)', availablePlaces: null },
      { time: 'Tardes (16:00-19:00)', availablePlaces: null },
    ],
  },
  // ... más días
];
```

### Cambiar las Imágenes por Defecto
En el mismo archivo, busca `defaultImages` (línea 62-67) y cambia las URLs.

### Modificar el Precio
Busca la sección de pricing (línea 153-220) y modifica:
- Precio base
- Descripción (cantidad de personas, duración)
- Items incluidos
- Servicios opcionales

---

## 📱 Enlaces Útiles

- **WhatsApp**: El botón "Solicitar presupuesto" abre WhatsApp en: +34 633788860
- **Email de contacto**: info@casarosierceramica.com

Puedes cambiar estos enlaces en el código si necesitas actualizar el número o email.

---

## ✨ Ventajas de la Plantilla Actual

La plantilla de **Taller para Grupos** (que usa `/pages/EspaciosPrivados.tsx`) es muy similar a la de Clases e incluye:

1. **Diseño consistente** con el resto del sitio
2. **Responsive** para todos los dispositivos
3. **Galería interactiva** de imágenes
4. **SEO optimizado** con meta tags
5. **Componente de horarios reutilizable** (ScheduleDisplay)
6. **Acordeones** para organizar información
7. **Animaciones sutiles** con Motion
8. **Colores de marca** (#F3F2EF, #FF5100 y tonos tierra)

---

## 🆘 Soporte

Si necesitas ayuda adicional:
- Revisa el archivo `/ADMIN_GUIDE.md` para más información sobre el administrador
- Los templates están en `/utils/pageTemplates.ts`
- Las páginas dinámicas se renderizan en `/pages/DynamicPage.tsx`
