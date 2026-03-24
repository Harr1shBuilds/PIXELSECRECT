import { motion } from 'motion/react';

export function Logo({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const dimensions = {
    small: { container: 'w-12 h-12', icon: 24 },
    default: { container: 'w-20 h-20', icon: 40 },
    large: { container: 'w-32 h-32', icon: 64 },
  };

  const { container, icon } = dimensions[size];

  return (
    <motion.div
      animate={{
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`${container} relative`}
    >
      {/* Outer glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl blur-xl opacity-60" />
      
      {/* Main container */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-2xl shadow-orange-500/20 flex items-center justify-center overflow-hidden">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Pixel vault icon - stylized lock with pixels */}
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          {/* Lock body - pixelated style */}
          <motion.rect
            x="14"
            y="20"
            width="20"
            height="16"
            rx="2"
            fill="white"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          />
          
          {/* Lock shackle - pixelated */}
          <motion.path
            d="M 18 20 L 18 14 L 18 14 C 18 10.686 20.686 8 24 8 C 27.314 8 30 10.686 30 14 L 30 20"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="square"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          
          {/* Keyhole - with pixel effect */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <circle cx="24" cy="26" r="2.5" fill="#0E7490" />
            <rect x="22.5" y="26" width="3" height="5" rx="0.5" fill="#854d0e" />
          </motion.g>

          {/* Pixel decorations - corners */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          >
            <rect x="13" y="19" width="2" height="2" fill="#fb923c" />
            <rect x="33" y="19" width="2" height="2" fill="#fbbf24" />
            <rect x="13" y="36" width="2" height="2" fill="#fbbf24" />
            <rect x="33" y="36" width="2" height="2" fill="#fb923c" />
          </motion.g>

          {/* Binary data stream effect */}
          <motion.g
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: [0, 0.6, 0], y: -5 }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            <text x="10" y="42" fontSize="3" fill="#fb923c" fontFamily="monospace">10</text>
            <text x="36" y="42" fontSize="3" fill="#fbbf24" fontFamily="monospace">01</text>
          </motion.g>
        </svg>
      </div>
    </motion.div>
  );
}