// Seed data for content initialization
import * as kv from './kv_store.tsx';

export async function seedClasses() {
  const clasesIniciacion = {
    id: 'clases-iniciacion',
    title: 'Iniciación a la Cerámica',
    subtitle: 'Tu primer paso en el mundo de la cerámica',
    type: 'class',
    description: 'Clase diseñada especialmente para principiantes. No necesitas experiencia previa, solo ganas de crear y experimentar con tus manos.',
    content: '<h3>¿Qué aprenderás?</h3><ul><li>Introducción a las propiedades del barro</li><li>Técnicas básicas de modelado manual</li><li>Construcción de pellizco (pinch pot)</li><li>Placas y churros (coil building)</li><li>Texturizado y decoración</li><li>Proceso de secado y cocción</li><li>Introducción a los esmaltes</li></ul><h3>Información práctica</h3><p><strong>Duración:</strong> 4 sesiones de 2 horas (1 mes)</p><p><strong>Horarios disponibles:</strong></p><ul><li>Lunes 18:00 - 20:00</li><li>Miércoles 10:00 - 12:00</li><li>Sábados 11:00 - 13:00</li></ul><p><strong>Grupos reducidos:</strong> Máximo 8 personas por clase</p><p>Al finalizar el curso, habrás creado entre 4-6 piezas únicas y tendrás las bases para continuar tu camino cerámico.</p>',
    price: 120,
    duration: '4 sesiones de 2 horas',
    image: 'https://images.unsplash.com/photo-1615220368787-d9d6f5e4f54b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWdpbm5lciUyMHBvdHRlcnl8ZW58MXx8fHwxNzY1MTUwMjg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    visible: true,
    featured: true,
  };
  await kv.set('content:clases-iniciacion', clasesIniciacion);

  const clasesRegular = {
    id: 'clases-regular-modelado',
    title: 'Clases Regulares de Modelado',
    subtitle: 'Desarrolla tu estilo personal',
    type: 'class',
    description: 'Para quienes ya tienen experiencia o han completado la iniciación. Desarrolla tu estilo personal y profundiza en técnicas cerámicas avanzadas.',
    content: '<h3>Modalidades</h3><p><strong>Nivel Intermedio</strong><br>Perfecciona las técnicas básicas y aprende nuevas formas de construcción. Experimentación con texturas, engobes y decoración.</p><p><strong>Nivel Avanzado</strong><br>Proyectos complejos, esculturas, piezas de gran formato. Desarrollo de tu lenguaje artístico personal.</p><h3>¿Qué incluye?</h3><ul><li>4 sesiones mensuales de 2,5 horas</li><li>Acceso a todas las herramientas del estudio</li><li>Uso ilimitado de arcilla durante las sesiones</li><li>Asesoramiento personalizado</li><li>Todas las hornadas incluidas</li><li>Biblioteca de técnicas y recursos</li><li>Comunidad de ceramistas</li></ul><h3>Información práctica</h3><p><strong>Horarios:</strong></p><ul><li>Martes 10:00 - 12:30 o 18:00 - 20:30</li><li>Jueves 10:00 - 12:30 o 18:00 - 20:30</li><li>Viernes 10:00 - 12:30</li></ul><p><strong>Compromiso mínimo:</strong> 3 meses (con opción a continuar mes a mes después)</p><p><strong>Grupos:</strong> Máximo 8 personas</p>',
    price: 140,
    duration: 'Mensual - 4 sesiones de 2.5h',
    image: 'https://images.unsplash.com/photo-1737564483280-15481c31608a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcG90dGVyeSUyMGhhbmRzJTIwd29ya3Nob3B8ZW58MXx8fHwxNzY1MTUwMjg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    visible: true,
    featured: true,
  };
  await kv.set('content:clases-regular-modelado', clasesRegular);

  const clasesTorno = {
    id: 'clases-torno',
    title: 'Modelado con Torno',
    subtitle: 'Aprende el arte del torno cerámico',
    type: 'class',
    description: 'El torno es una de las técnicas más fascinantes de la cerámica. Requiere paciencia, práctica y dedicación, pero los resultados son increíblemente gratificantes.',
    content: '<h3>Niveles</h3><p><strong>Torno Iniciación (4 semanas)</strong><br>Fundamentos del centrado, apertura y levantado de paredes. Cilindros, cuencos básicos y acabados.<br><strong>Precio:</strong> 160€</p><p><strong>Torno Intermedio (mensual)</strong><br>Formas más complejas, jarras, platos, teteras. Torneado de piezas grandes y refinamiento técnico.<br><strong>Precio:</strong> 150€/mes</p><p><strong>Torno Avanzado (mensual)</strong><br>Juegos de piezas, formas asimétricas, técnicas japonesas, nerikomi en torno.<br><strong>Precio:</strong> 150€/mes</p><h3>¿Qué incluye?</h3><ul><li>Sesiones de 2,5 horas</li><li>Torno individual por persona</li><li>Arcilla ilimitada durante la sesión</li><li>Herramientas especializadas</li><li>Seguimiento personalizado</li><li>Todas las cocciones incluidas</li></ul><h3>Horarios</h3><ul><li>Lunes 18:00 - 20:30</li><li>Miércoles 10:00 - 12:30 o 18:00 - 20:30</li><li>Sábados 16:00 - 18:30</li></ul><p><strong>Grupos ultra-reducidos:</strong> Máximo 4 personas (2 tornos compartidos)</p>',
    price: 160,
    duration: '4 sesiones (iniciación) o mensual',
    image: 'https://images.unsplash.com/photo-1595351298005-4d29bb980ce3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwd2hlZWwlMjBjZXJhbWljc3xlbnwxfHx8fDE3NjUwODY1NTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    visible: true,
    featured: true,
  };
  await kv.set('content:clases-torno', clasesTorno);
}

export async function seedWorkshops() {
  const workshopEsmaltesOnline = {
    id: 'workshop-esmaltes-online',
    title: 'Esmaltes Online vía Zoom',
    subtitle: 'Formación desde casa',
    type: 'workshop',
    slug: 'workshop/esmaltes-online',
    description: 'Workshop online intensivo sobre química y formulación de esmaltes cerámicos. Aprende a crear tus propios esmaltes y entender cómo funcionan.',
    content: '<h3>Programa del curso</h3><p><strong>Módulo 1:</strong> Fundamentos de química cerámica</p><p><strong>Módulo 2:</strong> Formulación de esmaltes y método Seger</p><p><strong>Módulo 3:</strong> Esmaltes específicos (transparentes, mates, colores)</p><p><strong>Módulo 4:</strong> Problemas y soluciones</p><h3>Incluye</h3><ul><li>4 sesiones en vivo de 2,5 horas</li><li>Manual digital completo (PDF)</li><li>Hojas de cálculo de formulación</li><li>Base de datos de 50+ recetas</li><li>Acceso a grupo privado de WhatsApp</li><li>Certificado de participación</li></ul><p><strong>Plataforma:</strong> Zoom (sesiones grabadas disponibles 30 días)</p><p><strong>Requisitos:</strong> Conocimientos básicos de cerámica recomendados</p>',
    price: 180,
    duration: '4 sesiones de 2.5h online',
    image: 'https://images.unsplash.com/photo-1668840306122-526500331070?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwY2VyYW1pYyUyMGJvd2wlMjBjbGF5fGVufDF8fHx8MTc2NTE1MDI4OHww&ixlib=rb-4.1.0&q=80&w=1080',
    visible: true,
    featured: true,
  };
  await kv.set('content:workshop-esmaltes-online', workshopEsmaltesOnline);

  const workshopEsmaltesBarcelona = {
    id: 'workshop-esmaltes-barcelona',
    title: 'Esmaltes Barcelona',
    subtitle: 'Workshop presencial fin de semana',
    type: 'workshop',
    slug: 'workshop/esmaltes-barcelona',
    description: 'Sumérgete en el fascinante mundo de los esmaltes cerámicos en nuestro estudio. Workshop intensivo de fin de semana con práctica hands-on.',
    content: '<h3>Programa</h3><p><strong>Sábado (10:00 - 14:00 y 15:30 - 18:30)</strong></p><ul><li>Mañana: Teoría de esmaltes, química básica, tipos</li><li>Tarde: Formulación práctica, testeos, aplicación</li></ul><p><strong>Domingo (10:00 - 14:00)</strong></p><ul><li>Análisis de resultados de horneada test</li><li>Ajustes y correcciones de fórmulas</li><li>Aplicación final en piezas</li></ul><h3>¿Qué incluye?</h3><ul><li>11 horas de formación intensiva</li><li>Todos los materiales (óxidos, fundentes, bases)</li><li>10 plaquetas de gres para testeo</li><li>3 piezas de gres biscochas para aplicar</li><li>Manual completo impreso</li><li>Recetario de 100+ esmaltes</li><li>Coffee break sábado y domingo</li><li>Hornada de todas las piezas</li><li>Certificado de asistencia</li></ul><p><strong>Plazas:</strong> Máximo 6 personas</p><p><strong>Nivel:</strong> Intermedio (requiere conocimientos básicos de cerámica)</p>',
    price: 280,
    duration: 'Fin de semana - 11 horas',
    image: 'https://images.unsplash.com/photo-1673436765901-6327d8030e38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwc3R1ZGlvJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2NTE1MDI4OHww&ixlib=rb-4.1.0&q=80&w=1080',
    visible: true,
    featured: true,
  };
  await kv.set('content:workshop-esmaltes-barcelona', workshopEsmaltesBarcelona);

  const workshopLaboratorio = {
    id: 'workshop-laboratorio-ceramico',
    title: 'Laboratorio Cerámico',
    subtitle: 'Experimentación avanzada',
    type: 'workshop',
    slug: 'workshop/laboratorio-ceramico',
    description: 'Para ceramistas que quieren llevar su trabajo al siguiente nivel. Un espacio de investigación y desarrollo de técnicas, materiales y procesos cerámicos.',
    content: '<h3>Áreas de experimentación</h3><p><strong>Pastas y arcillas:</strong> Formulación personalizada, chamotas, porcelanas coloreadas, paperclay</p><p><strong>Esmaltes avanzados:</strong> Cristalizaciones, óxidos en reducción, raku, lusters</p><p><strong>Superficies:</strong> Engobes vitrificados, terra sigillata, nerikomi</p><h3>Formato</h3><p>Intensivo de 3 días consecutivos (viernes tarde, sábado y domingo completos)</p><p><strong>Total:</strong> 21 horas de laboratorio intensivo</p><h3>¿Qué incluye?</h3><ul><li>Acceso completo al laboratorio y equipamiento</li><li>Materiales ilimitados para experimentación</li><li>Supervisión de ceramista profesional</li><li>Documentación fotográfica completa</li><li>15kg de diferentes arcillas</li><li>Múltiples hornadas (oxidación, reducción, raku)</li><li>Manual de experimentación</li><li>Comidas del sábado y domingo</li></ul><p><strong>Nivel:</strong> Avanzado (se requiere experiencia previa sólida)</p><p><strong>Plazas:</strong> Máximo 4 personas</p>',
    price: 420,
    duration: '3 días - 21 horas',
    image: 'https://images.unsplash.com/photo-1606675994883-98896ce5ad8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWJvcmF0b3J5JTIwY2VyYW1pY3N8ZW58MXx8fHwxNzY1MTUwMjg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    visible: true,
    featured: true,
  };
  await kv.set('content:workshop-laboratorio-ceramico', workshopLaboratorio);

  const workshopMetodoSeger = {
    id: 'workshop-metodo-seger',
    title: 'Método Seger',
    subtitle: 'Formulación científica de esmaltes',
    type: 'workshop',
    slug: 'workshop/metodo-seger',
    description: 'Workshop especializado en el Método Seger, la herramienta más poderosa para entender y crear esmaltes cerámicos desde una base científica.',
    content: '<h3>Programa</h3><p><strong>Día 1:</strong> Fundamentos - Química cerámica y óxidos</p><p><strong>Día 2:</strong> Cálculos y conversiones - Fórmula Seger práctica</p><p><strong>Día 3:</strong> Formulación creativa - Diseño desde cero</p><p><strong>Día 4:</strong> Aplicación y testeo</p><h3>Modalidades</h3><p><strong>Presencial Barcelona:</strong> 4 sesiones de 3h (sábados) - 220€</p><p><strong>Híbrido:</strong> 2 presenciales + 2 online - 190€</p><h3>Incluye</h3><ul><li>Manual completo del Método Seger (80 páginas)</li><li>Plantillas de cálculo en Excel</li><li>Acceso a software GlazeChem</li><li>10 testigos cerámicos</li><li>Materiales para preparar 5 esmaltes</li><li>Biblioteca de fórmulas Seger</li><li>Certificado oficial</li></ul><p><strong>Nivel:</strong> Intermedio/Avanzado</p><p><strong>Plazas:</strong> Máximo 8 personas</p>',
    price: 220,
    duration: '4 sesiones de 3h',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVtaXN0cnklMjBzY2llbmNlfGVufDF8fHx8MTc2NTE1MDI4OHww&ixlib=rb-4.1.0&q=80&w=1080',
    visible: true,
    featured: true,
  };
  await kv.set('content:workshop-metodo-seger', workshopMetodoSeger);
}