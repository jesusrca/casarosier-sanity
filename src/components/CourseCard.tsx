import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface CourseCardProps {
  title: string;
  subtitle: string;
  image: string;
  link?: string;
  index: number;
}

export function CourseCard({ title, subtitle, image, link = '#', index }: CourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link to={link} className="block">
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden rounded-lg">
          <motion.img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          />
        </div>
        
        {/* Text Content Below Image */}
        <div className="mt-4 text-center">
          <h3 className="mb-1">{title}</h3>
          <p className="text-foreground/60 text-sm mb-2">{subtitle}</p>
          <span className="text-sm text-primary group-hover:underline">Ver más</span>
        </div>
      </Link>
    </motion.div>
  );
}