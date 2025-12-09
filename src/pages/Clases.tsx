import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Hero } from '../components/Hero';
import { ScheduleDisplay, DaySchedule } from '../components/ScheduleDisplay';
import { AccordionSection } from '../components/AccordionSection';

// Horarios - Fácil de actualizar
const schedules: DaySchedule[] = [
  {
    day: 'Martes',
    slots: [
      { time: '16:00 a 18:00', availablePlaces: 3 },
      { time: '18:30 a 20:30', availablePlaces: 2 },
    ],
  },
  {
    day: 'Jueves',
    slots: [
      { time: '10:00 a 12:00', availablePlaces: 2 },
      { time: '16:30 a 18:30', availablePlaces: 4 },
      { time: '19:00 a 21:00', availablePlaces: 2 },
    ],
  },
  {
    day: 'Viernes',
    slots: [
      { time: '10:00 a 12:00', availablePlaces: 4 },
    ],
  },
];

export function Clases() {
  const [images, setImages] = useState([
    "https://images.unsplash.com/photo-1753164726967-fa2c13494fc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwY2xhc3MlMjBwZW9wbGV8ZW58MXx8fHwxNzY1MTUwMjg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1737564483280-15481c31608a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcG90dGVyeSUyMGhhbmRzJTIwd29ya3Nob3B8ZW58MXx8fHwxNzY1MTUwMjg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1668840306122-526500331070?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwY2VyYW1pYyUyMGJvd2wlMjBjbGF5fGVufDF8fHx8MTc2NTE1MDI4OHww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1595351298005-4d29bb980ce3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwd2hlZWwlMjBjZXJhbWljc3xlbnwxfHx8fDE3NjUwODY1NTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  ]);

  const handleImageClick = (thumbnailIndex: number) => {
    const newImages = [...images];
    // Intercambiar la imagen principal (index 0) con la miniatura clickeada (thumbnailIndex + 1)
    const temp = newImages[0];
    newImages[0] = newImages[thumbnailIndex + 1];
    newImages[thumbnailIndex + 1] = temp;
    setImages(newImages);
  };

  const handleInscribirse = () => {
    // Scroll to form
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleConsultar = () => {
    window.open('https://wa.me/34633788860', '_blank');
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <Hero
        backgroundImage="https://images.unsplash.com/photo-1660958639203-cbc9bb56955b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwdmFzZSUyMG1pbmltYWx8ZW58MXx8fHwxNzY1MTQ4MzMxfDA&ixlib=rb-4.1.0&q=80&w=1080"
        title="estudio Cerámica"
        subtitle="creativa en Barcelona"
      />

      {/* Main Content */}
      <section className="py-12 sm:py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 sm:gap-12 lg:gap-16">
            {/* Left Column - Images (40%) */}
            <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-8 lg:self-start w-full">
              <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg w-full">
                <AnimatePresence initial={false}>
                  <motion.img
                    key={images[0]}
                    src={images[0]}
                    alt="Clase de cerámica"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-3 gap-3 sm:gap-4 w-full"
              >
                {images.slice(1).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Cerámica detalle ${index + 1}`}
                    onClick={() => handleImageClick(index)}
                    className="w-full h-24 sm:h-32 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </motion.div>
            </div>

            {/* Right Column - Content (60%) */}
            <div className="space-y-6 sm:space-y-8 w-full min-w-0">
              <div>
                <h2 className="mb-4 sm:mb-6">CLASES MENSUALES</h2>
                <p className="text-base sm:text-lg leading-relaxed mb-3 sm:mb-4 text-foreground/80 text-center break-words">
                  De forma a las ideas mientras descubres cada secreto de la cerámica.
                </p>
                <p className="text-sm sm:text-base leading-relaxed mb-3 sm:mb-4 text-foreground/80 break-words">
                  Este espacio es para quienes quieren aprender creando. Podrás trabajar tus propias 
                  ideas con la arcilla, elegir el método que mejor encaje con tu nivel y curiosidad, 
                  y descubrir las técnicas de la cerámica.
                </p>
                <p className="text-sm sm:text-base leading-relaxed mb-3 sm:mb-4 text-foreground/80 break-words">
                  También podrás aprovechar las clases de modelado manual y las prácticas básicas de 
                  torno junto a composiciones cerámicas con esmaltes y colores. Además, trabajarás con 
                  diferentes tipos de arcilla según tus proyectos. Así, podrás construir desde figuras 
                  hasta técnicas gráficas, texturas o ejercicios de serigrafía.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-foreground/80 break-words">
                  Nuestro objetivo es que experimentes cada detalle: composiciones, colores, la arcilla. Que 
                  desarrolles tu identidad y te unas a un ambiente colectivo que apuesta por el aprendizaje 
                  tranquilo de cada material y la maestría dentro de cada proceso.
                </p>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full overflow-hidden">
                <p className="text-lg sm:text-xl text-primary mb-2">
                  Precio por 4 Clases
                </p>
                <p className="text-xl sm:text-2xl mb-4 sm:mb-6">120€/mes</p>

                <div className="space-y-3 mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg">Incluye</h3>
                  <ul className="space-y-2 text-sm sm:text-base text-foreground/80">
                    <li className="flex items-start">
                      <span className="mr-2 flex-shrink-0">•</span>
                      <span className="break-words">Engobes y esmaltes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 flex-shrink-0">•</span>
                      <span className="break-words">Hornadas</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <motion.button
                    onClick={handleInscribirse}
                    className="flex-1 bg-primary text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base whitespace-nowrap"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Inscribirse
                  </motion.button>
                  <motion.button
                    onClick={handleConsultar}
                    className="flex-1 border-2 border-primary text-primary px-4 sm:px-6 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors text-sm sm:text-base whitespace-nowrap"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Consultar
                  </motion.button>
                </div>
              </div>

              {/* Schedule Display */}
              <ScheduleDisplay 
                schedules={schedules}
                description="El curso consta de 4 clases de 2 horas cada una, una vez por semana."
              />
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h3 className="text-xl mb-3">¿QUÉ APRENDERÁS?</h3>
              
              <p className="text-base leading-relaxed text-foreground/80">
                Este curso está abierto a todos, sin importar tu nivel de experiencia. Si tienes 
                curiosidad por la cerámica o deseas expandir tus habilidades artísticas, este es tu 
                espacio ideal para comenzar.
              </p>

              <AccordionSection title="Aprenderás a trabajar con:" defaultOpen={false}>
                <div className="space-y-4">
                  <AccordionSection title="Clase 01 | Técnica de pellizco">
                    <p className="text-base text-foreground/80">
                      Lorem fistrum por la gloria de mi madre esse jarl aliqua llevame al 
                      sircoo. De la pradera ullamco qué dise usteer está la cosa muy malar.
                    </p>
                  </AccordionSection>
                  
                  <AccordionSection title="Clase 02 | Planchas" defaultOpen={true}>
                    <p className="text-base text-foreground/80">
                      Lorem fistrum por la gloria de mi madre esse jarl aliqua llevame al 
                      sircoo. De la pradera ullamco qué dise usteer está la cosa muy malar.
                    </p>
                  </AccordionSection>
                  
                  <AccordionSection title="Clase 03 | Churros">
                    <p className="text-base text-foreground/80">
                      Lorem fistrum por la gloria de mi madre esse jarl aliqua llevame al 
                      sircoo. De la pradera ullamco qué dise usteer está la cosa muy malar.
                    </p>
                  </AccordionSection>
                </div>
              </AccordionSection>

              <div className="pt-4">
                <h3 className="text-xl mb-3">¿QUIÉN PUEDE PARTICIPAR?</h3>
                <p className="text-base text-foreground/80 leading-relaxed">
                  Este curso está abierto para todos, sin importar tu nivel de experiencia. Si tienes 
                  curiosidad por la cerámica o deseas expandir tus habilidades artísticas, este es tu 
                  espacio ideal para comenzar.
                </p>
              </div>

              <div className="pt-4">
                <h3 className="text-xl mb-3">FORMAS DE PAGO</h3>
                <p className="text-base text-foreground/80">
                  Transferencia bancaria, tarjeta de crédito, efectivo o Bizum.
                </p>
              </div>

              <div className="pt-6">
                <motion.button
                  onClick={handleInscribirse}
                  className="w-full bg-primary text-white px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors text-base"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Inscribirse
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h3 className="text-xl mb-3">INFORMACIÓN ADICIONAL</h3>
              <div className="space-y-4">
                <p className="text-base leading-relaxed text-foreground/80">
                  Cualquier consulta o información adicional que necesites me puedes escribir al 
                  WhatsApp <a href="https://wa.me/34633788860" className="text-primary hover:underline">+34 633788860</a> o a nuestro{' '}
                  <a href="mailto:info@casarosierceramica.com" className="text-primary hover:underline">info@casarosierceramica.com</a>
                </p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1673436765901-6327d8030e38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwc3R1ZGlvJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2NTE1MDI4OHww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Estudio"
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}