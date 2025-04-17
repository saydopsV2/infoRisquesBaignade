import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

interface TiltedCardProps {
  imageSrc: string;
  title?: string;
  description?: string;
  url?: string;
  tiltAmount?: number;
}

const TiltedCard: React.FC<TiltedCardProps> = ({
  imageSrc,
  title,
  description,
  url = '/',
  tiltAmount = 15
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Handle mouse movement over card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Calculate mouse position relative to card center
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Calculate tilt based on mouse position
    const tiltX = (y / rect.height) * tiltAmount;
    const tiltY = -(x / rect.width) * tiltAmount;
    
    setTilt({ x: tiltX, y: tiltY });
  };

  // Reset tilt when mouse leaves
  const handleMouseLeave = () => {
    setIsHovering(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  // Clean up any event listeners if needed
  useEffect(() => {
    return () => {
      // Cleanup if necessary
    };
  }, []);

  return (
    <Link to={url} className="block w-full max-w-md mx-auto my-8 perspective-1000 cursor-pointer">
      <div 
        ref={cardRef}
        className="relative w-full h-80 rounded-xl shadow-lg transition-all duration-300 ease-out transform-gpu"
        style={{ 
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovering ? 1.05 : 1})`,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <img
            src={imageSrc}
            alt={title || "Card image"}
            className="w-full h-full object-cover"
            style={{ 
              transform: "translateZ(0)",
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-30" />
        </div>
        
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white"
             style={{ transform: "translateZ(20px)" }}>
          {title && (
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
          )}
          {description && (
            <p className="text-sm opacity-90">{description}</p>
          )}
        </div>
        
        <div className="absolute inset-0 rounded-xl border border-white border-opacity-20"
             style={{ transform: "translateZ(10px)" }} />
      </div>
    </Link>
  );
};

export default TiltedCard;
