import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Coins } from "lucide-react";

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  textClassName?: string;
  animated?: boolean;
  showCoins?: boolean;
}

const AnimatedLogo = ({
  size = "md",
  showText = true,
  className = "",
  textClassName = "",
  animated = true,
  showCoins = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const logoUrl =
    "https://cdn.builder.io/api/v1/image/assets%2F8e9254c13cd54c44b33a8ac478647ca8%2F31c866cb50b34b088143f60f0b70c67b?format=webp&width=800";

  const logoVariants = {
    initial: { 
      scale: 1, 
      rotate: 0,
      filter: "brightness(1) drop-shadow(0 4px 8px rgba(0,0,0,0.1))"
    },
    hover: { 
      scale: 1.1, 
      rotate: 5,
      filter: "brightness(1.2) drop-shadow(0 8px 16px rgba(255,215,0,0.3))"
    },
    bounce: {
      scale: [1, 1.05, 1],
      rotate: [0, 2, -2, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 3,
      }
    }
  };

  const textVariants = {
    initial: { 
      backgroundPosition: "0% 50%",
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
    },
    hover: { 
      backgroundPosition: "100% 50%",
      filter: "drop-shadow(0 4px 8px rgba(255,215,0,0.3))"
    },
    glow: {
      textShadow: [
        "0 0 5px rgba(255,215,0,0.5)",
        "0 0 20px rgba(255,215,0,0.8)",
        "0 0 5px rgba(255,215,0,0.5)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };

  const sparkleVariants = {
    initial: { opacity: 0, scale: 0, rotate: 0 },
    animate: {
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      rotate: 360,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
      }
    }
  };

  const coinVariants = {
    initial: { y: 0, rotate: 0, opacity: 0.7 },
    float: {
      y: [-10, 0, -5, 0],
      rotate: [0, 180, 360],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className={`flex items-center gap-3 cursor-pointer select-none ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover="hover"
      initial="initial"
    >
      {/* Floating coins around logo */}
      {showCoins && animated && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${20 + i * 30}%`,
                top: `${10 + i * 20}%`,
              }}
              variants={coinVariants}
              initial="initial"
              animate="float"
              transition={{
                delay: i * 0.5,
              }}
            >
              <Coins className="w-4 h-4 text-yellow-500" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Main logo container */}
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} rounded-full overflow-hidden shadow-lg relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 p-1`}
          variants={logoVariants}
          animate={animated && !isHovered ? "bounce" : "initial"}
        >
          {/* Sparkle effects */}
          {animated && (
            <>
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${20 + i * 20}%`,
                    top: `${15 + i * 25}%`,
                  }}
                  variants={sparkleVariants}
                  animate="animate"
                  transition={{
                    delay: i * 0.3,
                  }}
                >
                  <Sparkles className="w-3 h-3 text-white" />
                </motion.div>
              ))}
            </>
          )}

          {/* Logo image */}
          <div className="w-full h-full rounded-full overflow-hidden bg-white">
            <img
              src={logoUrl}
              alt="CoinKrazy Mascot Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <span class="text-black font-bold text-lg">😎</span>
                    </div>
                  `;
                }
              }}
            />
          </div>

          {/* Glow effect on hover */}
          {animated && isHovered && (
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-30 blur-md"
              initial={{ scale: 1 }}
              animate={{ scale: 1.2 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.div>
      </div>

      {/* Animated text */}
      {showText && (
        <motion.span
          className={`
            ${textSizeClasses[size]} 
            font-bold 
            bg-gradient-to-r 
            from-yellow-400 
            via-yellow-500 
            to-yellow-600 
            bg-clip-text 
            text-transparent
            bg-[length:200%_100%]
            ${textClassName}
          `}
          variants={textVariants}
          animate={animated ? "glow" : "initial"}
          transition={{
            backgroundPosition: {
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse" as const
            }
          }}
        >
          CoinKrazy
        </motion.span>
      )}

      {/* Hover effects */}
      {animated && isHovered && (
        <motion.div
          className="absolute -inset-2 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-lg blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
};

export default AnimatedLogo;
