import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi } from 'lucide-react';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);
  const [showBackOnlineNotice, setShowBackOnlineNotice] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineNotice(false);
      setShowBackOnlineNotice(true);
      setTimeout(() => setShowBackOnlineNotice(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineNotice(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showOfflineNotice && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] bg-red-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3"
        >
          <WifiOff className="w-5 h-5" />
          <div>
            <p className="font-semibold">Sin conexión a Internet</p>
            <p className="text-sm text-white/90">Comprueba tu conexión de red</p>
          </div>
        </motion.div>
      )}
      
      {showBackOnlineNotice && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3"
        >
          <Wifi className="w-5 h-5" />
          <div>
            <p className="font-semibold">Conexión restaurada</p>
            <p className="text-sm text-white/90">Ya estás de vuelta online</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
