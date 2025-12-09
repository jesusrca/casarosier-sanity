# 📚 Guía de Administración - Casa Rosier CMS

## 🎯 Introducción

Bienvenido al sistema de administración de contenidos de Casa Rosier. Este CMS te permite gestionar fácilmente todo el contenido del sitio web, incluyendo clases, workshops, blog y configuración SEO.

---

## 🔐 Acceso al Panel de Administración

### URL de acceso
```
https://tu-dominio.com/admin/login
```

### Primera vez

Para crear tu cuenta de administrador, necesitas usar el endpoint de registro. Abre la consola del navegador (F12) y ejecuta:

```javascript
fetch('https://tu-proyecto.supabase.co/functions/v1/make-server-0ba58e95/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@casarosier.com',
    password: 'tu-contraseña-segura',
    name: 'Administrador'
  })
})
  .then(r => r.json())
  .then(data => console.log(data));
```

**⚠️ IMPORTANTE:** Guarda estas credenciales de forma segura.

---

## 📋 Gestión de Contenido (Clases y Workshops)

### Crear Nueva Clase/Workshop

1. **Accede a "Contenido"** en el menú lateral
2. **Haz clic en "Crear nuevo"**
3. **Completa la información:**

#### Pestaña: Información Básica

- **Tipo:** Clase o Workshop
- **Título:** Nombre descriptivo (ej: "Iniciación a la Cerámica")
- **Subtítulo:** Frase corta que describe el curso
- **Descripción:** Explicación detallada del contenido
- **Precio:** Costo en euros
- **Duración:** Texto libre (ej: "4 clases de 2 horas")
- **Visible:** Marca esta casilla para publicar en el sitio web

**Imágenes:**
- Añade URLs de imágenes de Unsplash o propias
- La primera imagen será la principal
- Las siguientes aparecen como miniaturas

**¿Qué incluye?:**
- Añade elementos uno por uno (ej: "Material (arcilla)", "Hornadas", etc.)

#### Pestaña: Contenido

- **¿Qué aprenderás?:** Descripción del aprendizaje
- **¿Quién puede participar?:** Requisitos y público objetivo
- **Formas de pago:** Métodos aceptados

#### Pestaña: SEO

- **Meta Título:** Título para buscadores (máx. 60 caracteres)
- **Meta Descripción:** Resumen para buscadores (máx. 160 caracteres)
- **Palabras clave:** Separadas por comas

💡 **Tip:** Si dejas los campos SEO vacíos, se generarán automáticamente desde el título y descripción.

4. **Guarda** tu clase/workshop

### Editar Contenido Existente

1. En la lista de contenido, haz clic en el **ícono de editar** (lápiz)
2. Modifica los campos necesarios
3. Guarda los cambios

### Ocultar/Mostrar Contenido

- Desactiva "Visible en el sitio web" para ocultarlo sin eliminarlo
- Útil para contenido temporal o en borrador

### Eliminar Contenido

1. Haz clic en el **ícono de eliminar** (basura)
2. Confirma la eliminación
3. ⚠️ **Esta acción no se puede deshacer**

---

## ✍️ Gestión de Blog

### Crear Nuevo Post

1. **Accede a "Blog"** en el menú lateral
2. **Haz clic en "Nuevo post"**
3. **Completa la información:**

- **Título:** Título del artículo
- **Extracto:** Resumen breve (se muestra en la lista)
- **Contenido:** Texto completo del artículo (soporta Markdown básico)
- **Imagen destacada:** URL de la imagen principal
- **Autor:** Nombre del autor
- **Publicar:** Marca para que sea visible públicamente

4. **Guarda** el post

### Formato del Contenido

El contenido soporta Markdown básico:

```markdown
# Título principal
## Subtítulo

**Texto en negrita**
*Texto en cursiva*

- Lista item 1
- Lista item 2

[Enlace](https://ejemplo.com)
```

### Editar Post

1. Haz clic en el **ícono de editar**
2. Modifica el contenido
3. Guarda los cambios

### Borrador vs Publicado

- **Borrador:** No visible en el sitio web
- **Publicado:** Visible en `/blog`

---

## ⚙️ Configuración del Sitio

### Acceso

1. **Accede a "Ajustes"** en el menú lateral
2. Modifica la configuración global del sitio

### Secciones

#### Información General

- **Nombre del Sitio:** Casa Rosier
- **Descripción del Sitio:** Descripción breve

#### SEO Global

Configuración que se aplica a todas las páginas por defecto:

- **Meta Título por Defecto**
- **Meta Descripción por Defecto**
- **Palabras Clave por Defecto**
- **Imagen Open Graph:** Imagen que aparece al compartir en redes sociales

#### Contacto

- **Email de Contacto:** Para el formulario de contacto
- **Teléfono de Contacto:** WhatsApp y llamadas

---

## 🎨 Mejores Prácticas

### Imágenes

**Tamaños recomendados:**
- Imagen principal: 1200x800px mínimo
- Miniaturas: 600x600px mínimo
- Formato: JPG o PNG

**Fuentes:**
- Unsplash: Busca imágenes relacionadas con cerámica
- Imágenes propias: Sube a un servicio de hosting de imágenes

### SEO

**Títulos:**
- Máximo 60 caracteres
- Incluye palabras clave principales
- Evita caracteres especiales excesivos

**Descripciones:**
- Entre 120-160 caracteres
- Resume el contenido de forma atractiva
- Incluye llamada a la acción

**Palabras clave:**
- 5-10 palabras relevantes
- Incluye variaciones y sinónimos
- Específicas para Barcelona/España

### Contenido

**Clases y Workshops:**
- Título claro y descriptivo
- Precio exacto y actualizado
- Incluye toda la información necesaria
- Revisa ortografía antes de publicar

**Blog:**
- Publica regularmente (mínimo 1 vez al mes)
- Contenido original y de valor
- Usa imágenes relevantes
- Optimiza para SEO

---

## 🔍 SEO Avanzado

### Structured Data

El sitio genera automáticamente datos estructurados para:

- **Clases/Workshops:** Formato Course (Schema.org)
- **Blog:** Formato BlogPosting (Schema.org)
- **Organización:** LocalBusiness (Schema.org)

Esto mejora la visibilidad en Google y resultados enriquecidos.

### URLs Amigables

- **Clases:** `/clases/iniciacion`
- **Workshops:** `/workshops/esmaltes-barcelona`
- **Blog:** `/blog/titulo-del-post`

Las URLs se generan automáticamente desde los títulos.

### Sitemap

El sitio genera automáticamente:
- Meta tags Open Graph (Facebook, LinkedIn)
- Meta tags Twitter Card
- Canonical URLs
- Robots meta tags

---

## 🚨 Solución de Problemas

### No puedo iniciar sesión

1. Verifica que el email y contraseña son correctos
2. Asegúrate de tener cuenta creada
3. Revisa la consola del navegador (F12) para errores

### Los cambios no se reflejan

1. Verifica que el contenido está marcado como "Visible"
2. Limpia la caché del navegador (Ctrl+Shift+R)
3. Revisa que guardaste los cambios

### Error al guardar contenido

1. Verifica tu conexión a internet
2. Comprueba que todos los campos requeridos están completos
3. Revisa que las URLs de imágenes son válidas

### Imágenes no se muestran

1. Verifica que la URL es accesible
2. Comprueba que la URL empieza con `https://`
3. Usa URLs directas de imágenes (no páginas web)

---

## 📊 Recomendaciones de Contenido

### Clases Regulares

- Actualiza horarios mensualmente
- Indica plazas disponibles
- Destaca diferencias entre niveles
- Incluye testimonios en la descripción

### Workshops Especiales

- Anuncia con 2-3 semanas de anticipación
- Detalla materiales incluidos
- Especifica nivel de dificultad
- Añade galería de trabajos anteriores

### Blog

**Temas sugeridos:**
- Tutoriales paso a paso
- Entrevistas a ceramistas
- Proceso creativo de piezas
- Tips y trucos de cerámica
- Noticias del taller
- Eventos y exposiciones

---

## 🔒 Seguridad

**Buenas prácticas:**

1. ✅ Usa contraseñas fuertes y únicas
2. ✅ No compartas credenciales de admin
3. ✅ Cierra sesión al terminar
4. ✅ No uses redes WiFi públicas para administrar
5. ✅ Revisa el contenido antes de publicar

---

## 📞 Soporte

Si necesitas ayuda adicional:

- **Email:** info@casarosierceramica.com
- **WhatsApp:** +34 633788860

---

## 🎓 Recursos Adicionales

### Herramientas útiles

- **Unsplash:** https://unsplash.com (imágenes gratis)
- **TinyPNG:** https://tinypng.com (optimizar imágenes)
- **Google Keyword Planner:** Investigar palabras clave
- **Google Search Console:** Monitorear SEO

### Markdown Editor

Para practicar Markdown:
- https://dillinger.io
- https://stackedit.io

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0