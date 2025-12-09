import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Plus } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import logoImage from "figma:asset/28612bd890b3dcd85d8f93665d63bdc17b7bfea3.png";

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

export function ScrollHeader() {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileOpenSubmenu, setMobileOpenSubmenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { menuItems } = useContent();

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Detectar scroll para mostrar/ocultar header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Mostrar header después de 100px de scroll
      // Se mantiene visible tanto subiendo como bajando
      if (currentScrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
      setIsScrolled(currentScrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Cerrar menú móvil al cambiar de página
  useEffect(() => {
    setIsMenuOpen(false);
    setMobileOpenSubmenu(null);
  }, [location]);

  const toggleMobileSubmenu = (itemName: string) => {
    setMobileOpenSubmenu(mobileOpenSubmenu === itemName ? null : itemName);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : '-translate-y-full opacity-0'
      } ${
        isScrolled 
          ? 'bg-secondary/95 backdrop-blur-sm shadow-md' 
          : 'bg-secondary/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoImage} 
              alt="Casa Rosier" 
              className="h-10 w-auto hover:opacity-90 transition-opacity"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {menuItems.map((item, index) => (
              <div
                key={item.name}
                className="relative flex items-center"
                onMouseEnter={() => item.submenu && setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {item.path ? (
                  <Link
                    to={item.path}
                    className="text-white hover:text-white/80 px-3 transition-colors duration-200 relative group flex items-center gap-1 text-sm whitespace-nowrap"
                  >
                    {item.name}
                    {item.submenu && <span className="ml-1">+</span>}
                  </Link>
                ) : (
                  <button
                    className="text-white hover:text-white/80 px-3 transition-colors duration-200 relative group flex items-center gap-1 text-sm whitespace-nowrap"
                  >
                    {item.name}
                    {item.submenu && <span className="ml-1">+</span>}
                  </button>
                )}

                {/* Desktop Dropdown */}
                {item.submenu && (
                  <AnimatePresence>
                    {hoveredItem === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl overflow-hidden min-w-[220px]"
                      >
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className="block px-5 py-3 text-foreground hover:bg-muted transition-colors duration-150 text-sm border-b border-border last:border-b-0"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                {index < menuItems.length - 1 && (
                  <span className="text-white/40 text-sm ml-1">|</span>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Menu Button */}
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
            className="md:hidden bg-secondary/98 overflow-hidden border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-1">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {item.path ? (
                    <Link
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-white hover:text-white/80 transition-colors duration-200 py-2.5 px-2"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleMobileSubmenu(item.name)}
                        className="w-full flex items-center justify-between text-white hover:text-white/80 transition-colors duration-200 py-2.5 px-2"
                      >
                        <span>{item.name}</span>
                        <motion.div
                          animate={{ rotate: mobileOpenSubmenu === item.name ? 45 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Plus size={18} />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {mobileOpenSubmenu === item.name && item.submenu && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden bg-white/10 rounded-lg my-1"
                          >
                            {item.submenu.map((subItem) => (
                              <Link
                                key={subItem.path}
                                to={subItem.path}
                                onClick={() => {
                                  setIsMenuOpen(false);
                                  setMobileOpenSubmenu(null);
                                }}
                                className="block text-white/90 hover:text-white transition-colors duration-200 py-2.5 px-4 text-sm"
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}