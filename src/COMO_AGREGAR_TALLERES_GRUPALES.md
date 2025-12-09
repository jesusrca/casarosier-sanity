# 🎯 Cómo Agregar la Página de Talleres Grupales

## ✨ Opción 1: Usar la Página que Ya Existe (MÁS RÁPIDO)

### La página `/espacios-privados` ya está lista con todo lo que necesitas:

✅ **Ya está creada y funcionando**  
✅ Layout igual a la página de Clases  
✅ Galería de imágenes interactiva  
✅ Sección de precios con "incluye" y "opcionales"  
✅ Horarios flexibles  
✅ Tipos de eventos (Team Building, Despedidas, etc.)  
✅ Completamente responsive  

### Para verla:
1. Ve a: `tu-sitio.com/espacios-privados`
2. ¡Ya está funcionando! 🎉

### Para editarla desde el administrador:
1. Ve a `/admin`
2. Click en **"Páginas Personalizadas"**
3. Busca "Espacios Privados"
4. Click en **Editar** ✏️
5. Modifica el contenido que necesites

---

## 🆕 Opción 2: Crear una Nueva Página desde Cero

Si prefieres crear una página nueva:

### Paso 1: Ir al Administrador
```
1. Ve a /admin
2. Login
3. Click en "Páginas Personalizadas" (menú lateral)
```

### Paso 2: Crear Nueva Página
```
1. Click en "+ Nueva Página" (arriba a la derecha)
2. Verás un selector de plantillas
```

### Paso 3: Elegir Plantilla
```
Selecciona: "Taller para Grupos / Evento Privado"
```

Esta plantilla incluye:
- ✅ Hero con imagen de fondo
- ✅ Sección de introducción
- ✅ Precios e incluye
- ✅ Tipos de eventos
- ✅ Horarios y reservas

### Paso 4: Llenar los Datos

#### Información básica:
- **Título**: "Talleres Grupales"
- **Slug**: `talleres-grupales` (se genera automático)
- **Visible**: ✓ (marca el checkbox)

#### Secciones - Hero:
- Título: "Taller para Grupos"
- Subtítulo: "Experiencias cerámicas únicas"
- Imagen: Sube desde tu computadora 📷

#### Secciones - Precios:
- Precio: "Desde 350€"
- Subtítulo: "Grupo de 6-8 personas · 2,5 horas"
- Incluye: Lista de lo que incluye
- Extras: Servicios opcionales

#### SEO:
- Meta Título: "Talleres Grupales - Casa Rosier Barcelona"
- Meta Descripción: "Experiencias cerámicas únicas para grupos..."
- Keywords: "talleres grupales, cerámica Barcelona, team building"

### Paso 5: Guardar
```
Click en "Guardar Cambios"
```

Tu página estará en: `tu-sitio.com/talleres-grupales`

---

## 🔗 Agregar al Menú de Navegación

Una vez creada la página, agrégala al menú:

### Paso 1:
```
En el admin, click en "Menú"
```

### Paso 2:
```
Busca "Reservas Privadas"
Click en "+ Agregar Submenú"
```

### Paso 3:
```
Título: "Taller para Grupos"
Ruta: /talleres-grupales
Orden: 1
Guardar
```

---

## 📊 Diferencia entre las Opciones

| Característica | Espacios Privados (Ya existe) | Nueva Página |
|---|---|---|
| **Tiempo de setup** | ⚡ Inmediato | 🕐 15-30 min |
| **Diseño** | ✅ Ya optimizado | 🔧 Necesitas configurar |
| **Responsive** | ✅ Sí | ✅ Sí |
| **Personalizable** | ✅ Sí | ✅ Sí |
| **URL** | `/espacios-privados` | Tu eliges |

---

## 🎨 ¿Qué Incluye la Plantilla?

La plantilla de **Taller para Grupos** tiene exactamente el mismo diseño que la página de **Clases**:

### Layout:
```
┌─────────────────────────────┐
│  HERO (imagen + título)     │
├──────────────┬──────────────┤
│   IMÁGENES   │   CONTENIDO  │
│   (40%)      │   (60%)      │
│              │              │
│   [Img 1]    │  Descripción │
│              │              │
│   [2][3][4]  │  Precios     │
│              │              │
│              │  Horarios    │
└──────────────┴──────────────┘
```

### Elementos incluidos:
- 🖼️ Galería interactiva (1 grande + 3 miniaturas)
- 💰 Tarjeta de precios
- 📋 Listado "Incluye"
- ➕ Listado "Opcionales"
- 📅 Horarios flexibles
- 🎭 Tipos de eventos (acordeones)
- 📞 Botones de contacto (WhatsApp)
- 📱 100% Responsive

---

## 💡 Recomendación

### ⭐ USA LA OPCIÓN 1: "Espacios Privados"

**¿Por qué?**
- Ya está lista y funcionando
- Tiene el diseño optimizado
- Es fácil de editar desde el admin
- Puedes cambiarle el nombre si quieres

**Si necesitas cambiar el nombre:**
1. En el admin, edita la página
2. Cambia el título a "Talleres Grupales"
3. Cambia el slug si quieres
4. Guarda

¡Listo! 🎉

---

## 🆘 Ayuda Rápida

### ¿Cómo cambio las imágenes?
→ En el editor de la página, sección "Contenido", hay un botón para subir imágenes

### ¿Cómo cambio los precios?
→ En el editor de secciones, encuentra "pricing" y edita los valores

### ¿Cómo cambio los horarios?
→ En el código: `/pages/EspaciosPrivados.tsx`, líneas 11-28

### ¿Cómo cambio el número de WhatsApp?
→ En el código: `/pages/EspaciosPrivados.tsx`, línea 47

---

## 📚 Documentación Adicional

- **Guía completa del admin**: `/ADMIN_GUIDE.md`
- **Plantillas disponibles**: `/utils/pageTemplates.ts`
- **Guía detallada**: `/GUIA_TALLERES_GRUPALES.md`
