import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';

export function ServiceStatus() {
  const [showWarning, setShowWarning] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if there are console errors related to database
    const originalError = console.error;
    let errorCount = 0;
    
    console.error = (...args) => {
      const message = args.join(' ');
      if (
        message.includes('Database temporarily unavailable') ||
        message.includes('Cloudflare') ||
        message.includes('<!DOCTYPE')
      ) {
        errorCount++;
        if (errorCount >= 2 && !dismissed) {
          setShowWarning(true);
        }
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, [dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setShowWarning(false);
  };

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
        >
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Servicio temporalmente lento
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Algunos contenidos pueden tardar en cargar. Estamos trabajando para resolver esto.
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="ml-3 flex-shrink-0 text-yellow-400 hover:text-yellow-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
