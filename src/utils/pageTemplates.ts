export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  sections: any[];
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'blank',
    name: 'Página en Blanco',
    description: 'Una página vacía para comenzar desde cero',
    sections: [],
  },
  {
    id: 'home',
    name: 'Página de Inicio',
    description: 'Plantilla con hero, descripción y cursos destacados',
    sections: [
      {
        id: 'hero',
        type: 'hero',
        title: 'Casa Rosier',
        subtitle: 'Taller de cerámica en Barcelona',
        image: '',
      },
      {
        id: 'about',
        type: 'about',
        title: 'Sobre Nosotros',
        content: 'Escribe aquí la descripción de tu estudio...',
        images: [],
      },
      {
        id: 'courses',
        type: 'courses',
        titleLine1: 'CURSOS Y',
        titleLine2: 'WORKSHOPS',
      },
      {
        id: 'courses2',
        type: 'courses2',
        titleLine1: 'MÁS',
        titleLine2: 'OPCIONES',
      },
      {
        id: 'banner',
        type: 'banner',
        title: '',
        description: '',
        image: '',
        link: '',
      },
    ],
  },
  {
    id: 'studio',
    name: 'El Estudio',
    description: 'Plantilla para presentar el estudio con hero e imágenes',
    sections: [
      {
        id: 'hero',
        type: 'hero',
        title: 'El Estudio',
        subtitle: 'Nuestro espacio creativo',
        image: '',
      },
      {
        id: 'about',
        type: 'about',
        title: 'Sobre El Estudio',
        content: 'Describe tu estudio aquí...',
        images: [],
      },
      {
        id: 'facilities',
        type: 'text',
        title: 'Instalaciones',
        content: 'Describe las instalaciones del estudio...',
      },
    ],
  },
  {
    id: 'private-workshop',
    name: 'Taller para Grupos / Evento Privado',
    description: 'Plantilla para talleres grupales con precios y tipos de eventos',
    sections: [
      {
        id: 'hero',
        type: 'hero',
        title: 'Taller para Grupos',
        subtitle: 'Experiencias cerámicas únicas',
        image: '',
      },
      {
        id: 'main-content',
        type: 'class-layout',
        title: 'TALLER PARA GRUPOS',
        subtitle: '',
        description: 'Organiza un evento único en nuestro taller de cerámica. Perfecto para team building, despedidas, celebraciones y eventos corporativos.\n\nUna experiencia creativa donde tu grupo aprenderá técnicas de modelado en arcilla en un ambiente relajado y divertido.',
        images: [],
        price: 'Desde 350€',
        priceSubtitle: 'Grupo de 6-8 personas · 2,5 horas',
        includes: [
          'Alquiler privado del estudio',
          'Instructor profesional dedicado',
          'Todos los materiales y herramientas',
          'Arcilla para cada participante',
          'Cocción de las piezas',
          'Esmaltado básico',
        ],
        extras: [
          { name: 'Catering con vinos y aperitivos', price: '+150€' },
          { name: 'Persona adicional (más de 8)', price: '+45€/persona' },
          { name: 'Hora extra de taller', price: '+120€/hora' },
        ],
        schedule: [
          {
            day: 'Entre semana',
            slots: [
              { time: 'Mañanas (10:00-13:00)', availablePlaces: null },
              { time: 'Tardes (16:00-19:00)', availablePlaces: null },
            ],
          },
          {
            day: 'Fines de semana',
            slots: [
              { time: 'Sábados (10:00-13:00)', availablePlaces: null },
              { time: 'Domingos (10:00-13:00)', availablePlaces: null },
            ],
          },
        ],
        showPlaces: false,
        ctaText: 'Solicitar presupuesto',
        ctaLink: 'https://wa.me/34633788860?text=Hola,%20me%20gustaría%20información%20sobre%20talleres%20grupales',
      },
      {
        id: 'event-types',
        type: 'list',
        title: 'Tipos de Eventos',
        items: [
          {
            title: 'Team Building Empresarial',
            description: 'Perfecta actividad para equipos de trabajo que buscan fortalecer lazos en un ambiente creativo.',
          },
          {
            title: 'Despedidas de Soltero/a',
            description: 'Una alternativa original y divertida para celebrar con amigos.',
          },
          {
            title: 'Cumpleaños y Celebraciones',
            description: 'Celebra tu día especial creando piezas únicas de cerámica.',
          },
          {
            title: 'Eventos Corporativos',
            description: 'Impresiona a tus clientes o celebra logros del equipo con una experiencia memorable.',
          },
        ],
      },
      {
        id: 'additional-info',
        type: 'text',
        title: 'Información Adicional',
        content: 'Las reservas deben hacerse con al menos 2 semanas de antelación. El pago se realiza por adelantado para confirmar la reserva.\n\nPolítica de cancelación: cancelaciones con más de 7 días de antelación tienen reembolso del 100%. Cancelaciones con menos de 7 días no tienen reembolso.',
      },
    ],
  },
  {
    id: 'simple-page',
    name: 'Página Simple',
    description: 'Plantilla básica con hero y contenido de texto',
    sections: [
      {
        id: 'hero',
        type: 'hero',
        title: 'Título de la Página',
        subtitle: 'Subtítulo descriptivo',
        image: '',
      },
      {
        id: 'content',
        type: 'text',
        title: 'Contenido Principal',
        content: 'Escribe aquí el contenido de tu página...',
      },
    ],
  },
  {
    id: 'gallery',
    name: 'Galería / Portfolio',
    description: 'Plantilla con hero y galería de imágenes',
    sections: [
      {
        id: 'hero',
        type: 'hero',
        title: 'Galería',
        subtitle: 'Nuestros trabajos',
        image: '',
      },
      {
        id: 'gallery',
        type: 'about',
        title: 'Nuestros Trabajos',
        content: 'Descripción de tus trabajos...',
        images: [],
      },
    ],
  },
  {
    id: 'giftcard',
    name: 'Tarjeta de Regalo',
    description: 'Plantilla para página de tarjetas de regalo',
    sections: [
      {
        id: 'hero',
        type: 'hero',
        title: 'estudio Cerámica',
        subtitle: 'creativa en Barcelona',
        image: '',
      },
      {
        id: 'giftcard-info',
        type: 'class-layout',
        title: 'TARJETA DE REGALO CASA ROSIER',
        subtitle: '',
        description: 'Regala una experiencia única en nuestro taller de cerámica.\\n\\nNuestras tarjetas regalo son perfectas para cumpleaños, aniversarios o cualquier ocasión especial. El destinatario podrá elegir entre nuestras clases, workshops o usarla para compras en el estudio.',
        images: [],
        price: 'Desde 50€',
        priceSubtitle: 'Elige el importe que desees',
        includes: [
          'Tarjeta digital personalizada',
          'Válida para cualquier clase o workshop',
          'Válida por 12 meses desde la compra',
          'Transferible a otra persona',
          'Opción de tarjeta física (+5€)',
        ],
        extras: [],
        schedule: [],
        showPlaces: false,
        ctaText: 'Comprar Tarjeta Regalo',
        ctaLink: 'https://wa.me/34633788860?text=Hola,%20me%20gustaría%20comprar%20una%20tarjeta%20regalo',
      },
      {
        id: 'giftcard-amounts',
        type: 'list',
        title: 'Importes Disponibles',
        items: [
          {
            title: '50€',
            description: 'Perfecta para probar una clase de iniciación o comprar materiales.',
          },
          {
            title: '100€',
            description: 'Ideal para un workshop completo o varias clases.',
          },
          {
            title: '200€',
            description: 'Para un curso completo o múltiples workshops.',
          },
          {
            title: 'Importe Personalizado',
            description: 'Elige el importe que prefieras, a partir de 30€.',
          },
        ],
      },
      {
        id: 'how-it-works',
        type: 'text',
        title: '¿Cómo Funciona?',
        content: '1. **Elige el importe** - Selecciona el valor de la tarjeta regalo\n\n2. **Personaliza** - Añade un mensaje especial para el destinatario\n\n3. **Recibe tu tarjeta** - Te enviaremos la tarjeta digital por email en máximo 24h\n\n4. **Regala** - Comparte la tarjeta con quien quieras\n\n5. **Reserva** - El destinatario puede reservar su clase cuando quiera',
      },
      {
        id: 'additional-info',
        type: 'text',
        title: 'Información Adicional',
        content: '**Validez:** 12 meses desde la fecha de compra\n\n**Uso:** Válida para cualquier clase, workshop o compra en el estudio\n\n**Transferible:** Puede regalarse o transferirse a otra persona\n\n**Tarjeta física:** Disponible por 5€ adicionales con entrega en Barcelona\n\n**Reembolsos:** Las tarjetas regalo no son reembolsables pero sí transferibles',
      },
    ],
  },
];

export function getTemplateById(id: string): PageTemplate | undefined {
  return PAGE_TEMPLATES.find(t => t.id === id);
}