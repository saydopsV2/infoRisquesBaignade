import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

interface TiltedCardProps {
  imageSrc: string;
  altText?: string;
  captionText?: string;
  url?: string;
}

const TiltedCard: React.FC<TiltedCardProps> = ({
  imageSrc,
  altText = "Image",
  captionText = "Card Title",
  url = "/"
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const tiltX = (y / rect.height) * 15;
    const tiltY = -(x / rect.width) * 15;
    
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  return (
    <Link to={url} className="block">
      <div 
        ref={cardRef}
        className="card bg-base-100 shadow-xl overflow-hidden transition-all duration-300 ease-out transform-gpu"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovering ? 1.05 : 1})`,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <figure className="relative w-full h-64">
          <img
            src={imageSrc}
            alt={altText}
            className="w-full h-full object-cover"
          />
        </figure>
        <div className="card-body text-slate-700 bg-sky-200">
          <h2 className="card-title">{captionText}</h2>
          <p>Cliquez pour voir les prévisions</p>
        </div>
      </div>
    </Link>
  );
};

export default TiltedCard;