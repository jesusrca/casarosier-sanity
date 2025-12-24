import { motion } from 'motion/react';
import svgPaths from "../imports/svg-gvi2gibf3l";

export function LoadingScreen() {
  const fillColor = "#1E130F";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: '#F3F2EF' }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="relative w-80 h-40">
        {/* Logo con animación de dibujo */}
        <svg 
          className="w-full h-full" 
          viewBox="0 0 595 290" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradiente para el efecto de llenado */}
            <linearGradient id="fillGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <motion.stop
                offset="0%"
                stopColor={fillColor}
                stopOpacity="1"
                animate={{ offset: ["0%", "100%"] }}
                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
              />
              <motion.stop
                offset="0%"
                stopColor={fillColor}
                stopOpacity="0.1"
                animate={{ offset: ["0%", "100%"] }}
                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
              />
            </linearGradient>
            
            {/* Máscara para el efecto de revelación */}
            <mask id="revealMask">
              <motion.rect
                x="0"
                y="0"
                width="595"
                height="290"
                fill="white"
                initial={{ x: -595 }}
                animate={{ x: 0 }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 0.3
                }}
              />
            </mask>
          </defs>
          
          {/* Logo base con opacidad muy baja */}
          <g opacity="0.1">
            <path clipRule="evenodd" d={svgPaths.p3835a700} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p2e53c080} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p399b4780} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p360f0800} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p2fa1cd80} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p11066000} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.pa87e500} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p10df8ff0} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p21f88f00} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p15904f80} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p2950b000} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p2aade300} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p2262f520} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p34816d70} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p2819b780} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p24e0b00} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p1a431800} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p26589500} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p2283e800} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p3d5a480} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p3e6753f2} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.pf2ba280} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p9bd9180} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p3c351400} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p13407400} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p29d24c80} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p36607700} fill={fillColor} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p25e49e00} fill={fillColor} fillRule="evenodd" />
          </g>

          {/* Logo revelándose con máscara */}
          <g mask="url(#revealMask)">
            <path clipRule="evenodd" d={svgPaths.p3835a700} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p2e53c080} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p399b4780} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p360f0800} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p2fa1cd80} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p11066000} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.pa87e500} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p10df8ff0} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p21f88f00} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p15904f80} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p2950b000} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p2aade300} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p2262f520} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p34816d70} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p2819b780} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p24e0b00} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p1a431800} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p26589500} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p2283e800} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p3d5a480} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p3e6753f2} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.pf2ba280} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p9bd9180} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p3c351400} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p13407400} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p29d24c80} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p36607700} fill="url(#fillGradient)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p25e49e00} fill="url(#fillGradient)" fillRule="evenodd" />
          </g>
        </svg>

        {/* Texto sutil debajo */}
        <motion.p
          className="text-center text-sm mt-8"
          style={{ color: '#1E130F', opacity: 0.4 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Cargando experiencia...
        </motion.p>
      </div>
    </motion.div>
  );
}