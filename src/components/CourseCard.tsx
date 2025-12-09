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
    >
      <Link to={link} className="group block">
        <div className="relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-xl transition-shadow duration-300">
          {/* Image Container */}
          <div className="relative h-64 overflow-hidden">
            <motion.img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Title Overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="bg-white/95 backdrop-blur-sm px-6 py-4 rounded-lg text-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                <h3 className="text-foreground mb-1">{title}</h3>
                <p className="text-muted-foreground text-sm">{subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
