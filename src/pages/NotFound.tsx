import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-6xl lg:text-8xl mb-4 text-primary">404</h1>
        <h2 className="text-2xl lg:text-4xl mb-6">Página no encontrada</h2>
        <p className="text-lg text-foreground/70 mb-8 max-w-md mx-auto">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Home size={20} />
          Volver al inicio
        </Link>
      </motion.div>
    </div>
  );
}
