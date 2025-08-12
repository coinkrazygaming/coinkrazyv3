import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = "md",
  showText = true,
  className = "",
  textClassName = "",
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const logoUrl =
    "https://cdn.builder.io/api/v1/image/assets%2F8e9254c13cd54c44b33a8ac478647ca8%2F31c866cb50b34b088143f60f0b70c67b?format=webp&width=800";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden shadow-lg`}
      >
        <img
          src={logoUrl}
          alt="CoinKrazy Mascot Logo"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="w-full h-full bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center">
                  <span class="text-black font-bold text-lg">😎</span>
                </div>
              `;
            }
          }}
        />
      </div>
      {showText && (
        <span
          className={`${textSizeClasses[size]} font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent ${textClassName}`}
        >
          CoinKrazy
        </span>
      )}
    </div>
  );
};

export default Logo;
