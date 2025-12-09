import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { menuAPI, settingsAPI } from '../utils/api';
import heroBackgroundImage from "figma:asset/cf3b622b1e53dff197470df428faee1c6f268025.png";
import logoImage from "figma:asset/2dacc970a5a37325400c034e8aab058b32fcf649.png";
import heroTextImage from "figma:asset/00083d30bea445cb191f41f57aa132965c193e0d.png";

interface SubMenuItem {
  name: string;
  path: string;
  order?: number;
}

interface MenuItem {
  name: string;
  path?: string;
  submenu?: SubMenuItem[];
  order?: number;
}

export function HeroHome() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mainMenuItems, setMainMenuItems] = useState<MenuItem[]>([]);
  const [heroImages, setHeroImages] = useState({
    desktop: heroBackgroundImage,
    mobile: heroBackgroundImage
  });

  // Load menu and settings from API
  useEffect(() => {
    loadMenu();
    loadHeroImages();
  }, []);

  const loadHeroImages = async () => {
    try {
      const response = await settingsAPI.getSettings();
      if (response.settings) {
        setHeroImages({
          desktop: response.settings.heroImageDesktop || heroBackgroundImage,
          mobile: response.settings.heroImageMobile || heroBackgroundImage
        });
      }
    } catch (error) {
      console.log('Settings not found, using default images');
    }
  };

  const loadMenu = async () => {
    try {
      const response = await menuAPI.getMenu();
      if (response.menu?.items) {
        // Sort items by order
        const sortedItems = [...response.menu.items].sort((a, b) => (a.order || 0) - (b.order || 0));
        // Sort submenu items
        sortedItems.forEach(item => {
          if (item.submenu) {
            item.submenu.sort((a: SubMenuItem, b: SubMenuItem) => (a.order || 0) - (b.order || 0));
          }
        });
        setMainMenuItems(sortedItems);
      }
    } catch (error) {
      console.log('Menu not found, using default menu');
      // Set default menu items
      setMainMenuItems([
        { name: 'Inicio', path: '/', order: 0 },
        {
          name: 'Clases',
          order: 1,
          submenu: [
            { name: 'Iniciación a la cerámica', path: '/clases/iniciacion', order: 0 },
            { name: 'Regular de modelado', path: '/clases', order: 1 },
            { name: 'Modelado con torno', path: '/clases/torno', order: 2 },
          ],
        },
        {
          name: 'Workshops',
          order: 2,
          submenu: [
            { name: 'Esmaltes online vía zoom', path: '/workshops/esmaltes-online', order: 0 },
            { name: 'Esmaltes Barcelona', path: '/workshops/esmaltes-barcelona', order: 1 },
            { name: 'Laboratorio Cerámico', path: '/workshops/laboratorio', order: 2 },
            { name: 'Método Seger', path: '/workshops/metodo-seger', order: 3 },
          ],
        },
        {
          name: 'Reservas Privadas',
          order: 3,
          submenu: [
            { name: 'Taller para grupos', path: '/espacios-privados', order: 0 },
          ],
        },
        { name: 'Tarjeta de regalo', path: '/tarjeta-regalo', order: 4 },
        { name: 'El Estudio', path: '/el-estudio', order: 5 },
        { name: 'Blog', path: '/blog', order: 6 },
        { name: 'Tiendita', path: '/tiendita', order: 7 },
      ]);
    }
  };

  const scrollToContent = () => {
    const nextSection = document.querySelector('#about-section');
    nextSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image - Desktop */}
      <div 
        className="hidden md:block absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroImages.desktop})`,
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Background Image - Mobile */}
      <div 
        className="md:hidden absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroImages.mobile})`,
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Header with Logo and Menu */}
      <div className="relative z-20 pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center mb-12 sm:mb-6 mt-8 sm:mt-0"
          >
            <Link to="/">
              <img 
                src={logoImage} 
                alt="Casa Rosier" 
                className="h-16 sm:h-20 w-auto"
              />
            </Link>
          </motion.div>

          {/* Navigation Menu */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden md:flex items-center justify-center gap-1"
          >
            {mainMenuItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.08 }}
                className="flex items-center relative"
                onMouseEnter={() => item.submenu && setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {item.path ? (
                  <Link
                    to={item.path}
                    className="text-white/90 hover:text-white px-3 lg:px-4 py-2 transition-colors duration-200 text-sm whitespace-nowrap"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <button
                    className="text-white/90 hover:text-white px-3 lg:px-4 py-2 transition-colors duration-200 text-sm whitespace-nowrap"
                  >
                    {item.name}
                    {item.submenu && <span className="ml-1">+</span>}
                  </button>
                )}
                
                {/* Dropdown Menu */}
                {item.submenu && (
                  <AnimatePresence>
                    {hoveredItem === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl overflow-hidden min-w-[220px] z-50"
                      >
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className="block px-5 py-3 text-secondary hover:bg-muted transition-colors duration-150 text-sm border-b border-border last:border-b-0"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                {index < mainMenuItems.length - 1 && (
                  <span className="text-white/40 text-sm hidden lg:inline ml-1">|</span>
                )}
              </motion.div>
            ))}
          </motion.nav>
        </div>
      </div>

      {/* Center Content - Hero Text */}
      <div className="relative z-10 flex items-center justify-center px-4" style={{ height: 'calc(100vh - 200px)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="w-full max-w-3xl"
        >
          <img 
            src={heroTextImage} 
            alt="estudio Cerámica creativa en Barcelona" 
            className="w-full h-auto"
          />
        </motion.div>
      </div>

      {/* Scroll Down Button */}
      <motion.button
        onClick={scrollToContent}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
        aria-label="Scroll down"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-12 h-12 rounded-full border-2 border-white/70 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ChevronDown className="text-white" size={24} />
        </motion.div>
      </motion.button>

      {/* Degradado blanco para transición al siguiente bloque */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#F3F2EF] z-20 pointer-events-none" />
    </section>
  );
}