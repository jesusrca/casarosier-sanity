import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import logoImage from "figma:asset/28612bd890b3dcd85d8f93665d63bdc17b7bfea3.png";

interface ComingSoonProps {
  title: string;
}

export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/20 to-background px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl"
      >
        <motion.img
          src={logoImage}
          alt="Casa Rosier"
          className="h-24 w-auto mx-auto mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        />
        <h1 className="text-4xl lg:text-5xl mb-6">{title}</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Estamos trabajando en esta sección. Pronto estará disponible.
        </p>
        <Link to="/">
          <motion.button
            className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Volver al inicio
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
