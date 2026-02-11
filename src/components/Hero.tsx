import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Menu, X, Plus } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { Logo } from './Logo';
import { fetchSettings } from '../utils/sanityQueries';
import heroTextImage from "figma:asset/00083d30bea445cb191f41f57aa132965c193e0d.png";
import heroBackgroundImage from "figma:asset/cf3b622b1e53dff197470df428faee1c6f268025.png";

interface HeroProps {
  backgroundImage?: string; // Ahora es opcional
  title: string;
  subtitle?: string;
  showScrollIndicator?: boolean;
  useTextTitle?: boolean;
  showWhiteGradient?: boolean;
  titleImage?: string;
  reducedHeight?: boolean;
}

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

export function Hero({ backgroundImage, title, subtitle, showScrollIndicator = true, useTextTitle = false, showWhiteGradient = false, titleImage, reducedHeight = false }: HeroProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileOpenSubmenu, setMobileOpenSubmenu] = useState<string | null>(null);
  const [isDarkBackground, setIsDarkBackground] = useState(true);
  const [heroImage, setHeroImage] = useState<string>(backgroundImage || heroBackgroundImage);
  const { menuItems } = useContent();

  console.log('🎭 Hero props recibidas:', { 
    backgroundImage, 
    title, 
    subtitle, 
    useTextTitle, 
    showScrollIndicator, 
    reducedHeight,
    heroImage 
  });

  // Cargar imagen de ajustes si no se proporciona backgroundImage
  useEffect(() => {
    const loadHeroImageFromSettings = async () => {
      // Si ya se pasó una backgroundImage, usarla y NO cargar de settings
      if (backgroundImage) {
        console.log('✅ Hero usando backgroundImage proporcionada:', backgroundImage);
        setHeroImage(backgroundImage);
        return; // IMPORTANTE: salir aquí para no hacer la llamada a settings
      }

      // Solo si NO hay backgroundImage, cargar de settings
      try {
        const response = await fetchSettings();
        if (response) {
          const isMobile = window.innerWidth < 768;
          
          // Usar imagen mobile o desktop según el tamaño de pantalla
          const settingsImage = isMobile 
            ? (typeof response.heroImageMobile === 'string' 
                ? response.heroImageMobile 
                : response.heroImageMobile)
            : (typeof response.heroImageDesktop === 'string' 
                ? response.heroImageDesktop 
                : response.heroImageDesktop);
          
          if (settingsImage) {
            console.log('🖼️ Hero cargando imagen desde ajustes:', settingsImage);
            setHeroImage(settingsImage);
          } else {
            console.log('📦 Usando imagen por defecto');
            setHeroImage(heroBackgroundImage);
          }
        } else {
          setHeroImage(heroBackgroundImage);
        }
      } catch (error) {
        console.log('⚠️ Error cargando imagen de ajustes, usando default:', error);
        setHeroImage(heroBackgroundImage);
      }
    };

    loadHeroImageFromSettings();
  }, [backgroundImage]);

  // Detect if background image is light or dark
  useEffect(() => {
    // Skip detection if no background image
    if (!heroImage) {
      setIsDarkBackground(true);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = heroImage;
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsDarkBackground(true);
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Sample the top portion where the menu is
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height / 4);
        const data = imageData.data;
        let r = 0, g = 0, b = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }
        
        const pixelCount = data.length / 4;
        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);
        
        // Calculate perceived brightness
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        setIsDarkBackground(brightness < 160);
      } catch (error) {
        // Silently default to dark background if detection fails
        setIsDarkBackground(true);
      }
    };

    img.onerror = () => {
      // Silently default to dark background if image fails to load
      setIsDarkBackground(true);
    };
  }, [heroImage]);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight * 0.65,
      behavior: 'smooth'
    });
  };

  const toggleMobileSubmenu = (itemName: string) => {
    setMobileOpenSubmenu(mobileOpenSubmenu === itemName ? null : itemName);
  };

  // Dynamic color classes based on background
  const textColor = isDarkBackground ? 'text-white/90 hover:text-white' : 'text-foreground/90 hover:text-foreground';
  const separatorColor = isDarkBackground ? 'text-white/40' : 'text-foreground/40';
  const mobileTextColor = isDarkBackground ? 'text-white hover:text-white/80' : 'text-foreground hover:text-foreground/80';
  const mobileSubmenuTextColor = isDarkBackground ? 'text-white/90 hover:text-white' : 'text-foreground/90 hover:text-foreground';
  const mobileBgColor = isDarkBackground ? 'bg-black/40' : 'bg-white/40';
  const mobileBorderColor = isDarkBackground ? 'border-white/10' : 'border-foreground/10';
  const mobileSubmenuBgColor = isDarkBackground ? 'bg-white/10' : 'bg-foreground/10';
  const scrollIndicatorColor = isDarkBackground ? 'border-white/70 text-white hover:bg-white/10' : 'border-foreground/70 text-foreground hover:bg-foreground/10';
  const headerGradient = isDarkBackground ? 'from-black/60' : 'from-white/60';

  return (
    <div className={`relative ${reducedHeight ? 'h-[50vh] min-h-[400px]' : 'h-[65vh] min-h-[500px]'} flex flex-col overflow-hidden`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
        {/* Degradado beige muy sutil y difuminado - Solo en desktop */}
        <div className="hidden md:block absolute inset-0 bg-gradient-to-b from-[#F3F2EF]/10 via-transparent to-[#E8E7E3]/15" />
      </div>

      {/* Header with Logo and Menu - Con fondo sólido para ser visible antes que la imagen */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-4 sm:pt-6 pb-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo y Menú en una sola línea */}
          <div className="flex justify-between items-center">
            {/* Logo a la izquierda */}
            <Link to="/" className="flex-shrink-0">
              <Logo 
                className="h-10 sm:h-12 lg:h-14 w-auto"
                isDark={isDarkBackground}
              />
            </Link>

            {/* Desktop Navigation Menu a la derecha */}
            <nav className="hidden md:flex items-center gap-1">
              {menuItems.map((item, index) => (
                <div
                  key={`desktop-hero-${item.name}-${index}`}
                  className="flex items-center relative"
                  onMouseEnter={() => item.submenu && setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {item.path ? (
                    <Link
                      to={item.path}
                      className={`${textColor} px-3 lg:px-4 transition-colors duration-200 text-sm whitespace-nowrap`}
                    >
                      {item.name}
                      {item.submenu && item.submenu.length > 0 && <span className="ml-1">+</span>}
                    </Link>
                  ) : (
                    <button
                      className={`${textColor} px-3 lg:px-4 transition-colors duration-200 text-sm whitespace-nowrap`}
                    >
                      {item.name}
                      {item.submenu && item.submenu.length > 0 && <span className="ml-1">+</span>}
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
                          className="absolute top-full left-0 mt-2 bg-white rounded-lg overflow-hidden min-w-[220px] z-50"
                        >
                          {item.submenu.map((subItem, subIndex) => (
                            <Link
                              key={`${subItem.path}-${subIndex}`}
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

                  {index < menuItems.length - 1 && (
                    <span className={`${separatorColor} text-sm hidden lg:inline ml-1`}>|</span>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile Menu Button a la derecha */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white p-2 hover:text-white/80 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`md:hidden ${mobileBgColor} backdrop-blur-sm overflow-hidden border-t ${mobileBorderColor} mt-3`}
            >
              <div className="px-4 py-4 space-y-1">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={`mobile-hero-${item.name}-${index}`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {/* Si tiene submenú, mostrar botón expandible (independiente de si tiene path) */}
                    {item.submenu ? (
                      <>
                        <div className="flex items-center gap-2">
                          {/* Si tiene path, mostrar también el link */}
                          {item.path && (
                            <Link
                              to={item.path}
                              onClick={() => setIsMenuOpen(false)}
                              className={`flex-1 ${mobileTextColor} transition-colors duration-200 py-2.5 px-2`}
                            >
                              {item.name}
                            </Link>
                          )}
                          {/* Botón para expandir submenú */}
                          <button
                            onClick={() => toggleMobileSubmenu(item.name)}
                            className={`${item.path ? '' : 'flex-1 justify-between'} flex items-center ${mobileTextColor} transition-colors duration-200 py-2.5 px-2`}
                          >
                            {!item.path && <span>{item.name}</span>}
                            <motion.div
                              animate={{ rotate: mobileOpenSubmenu === item.name ? 45 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Plus size={18} />
                            </motion.div>
                          </button>
                        </div>
                        <AnimatePresence>
                          {mobileOpenSubmenu === item.name && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className={`overflow-hidden ${mobileSubmenuBgColor} rounded-lg my-1`}
                            >
                              {item.submenu.map((subItem, subIndex) => (
                                <Link
                                  key={`${subItem.path}-${subIndex}`}
                                  to={subItem.path}
                                  onClick={() => {
                                    setIsMenuOpen(false);
                                    setMobileOpenSubmenu(null);
                                  }}
                                  className={`block ${mobileTextColor} transition-colors duration-200 py-2.5 px-4 text-sm opacity-90 hover:opacity-100`}
                                >
                                  {subItem.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      /* Si NO tiene submenú, solo mostrar link */
                      <Link
                        to={item.path || '/'}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block ${mobileTextColor} transition-colors duration-200 py-2.5 px-2`}
                      >
                        {item.name}
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      {/* Content - Title */}
      <div className="relative z-10 flex-1 flex items-center px-4">
        <div className="w-full max-w-7xl mx-auto relative z-10">
          <motion.div
            key={title}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            {useTextTitle ? (
              <div className="space-y-4 text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl text-white drop-shadow-2xl"
                    style={{ filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.5))' }}>
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xl md:text-2xl text-white/90 drop-shadow-lg"
                     style={{ filter: 'drop-shadow(0 2px 10px rgba(0, 0, 0, 0.5))' }}>
                    {subtitle}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex justify-start pl-4 sm:pl-6 lg:pl-8">
                <img 
                  src={titleImage || heroTextImage} 
                  alt={`${title} ${subtitle || ''}`}
                  loading="lazy"
                  className="w-[70%] md:w-[50%] lg:w-[40%] h-auto mx-auto"
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          aria-label="Scroll to content"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className={`w-12 h-12 rounded-full ${scrollIndicatorColor} flex items-center justify-center transition-colors cursor-pointer`}
          >
            <ChevronDown className={isDarkBackground ? 'text-white' : 'text-foreground'} size={24} />
          </motion.div>
        </button>
      )}

      {/* Degradado blanco para transición al siguiente bloque (solo en Home) */}
      {showWhiteGradient && (
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white z-20 pointer-events-none" />
      )}
    </div>
  );
}
