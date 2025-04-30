import React from 'react';

interface DirectionArrowProps {
  direction: number | null;
  size?: number;
  color?: string;
  showLabel?: boolean;
}

const getDirectionLabel = (direction: number): string => {
  if (direction >= 337.5 || direction < 22.5) return "N";
  if (direction >= 22.5 && direction < 67.5) return "NE";
  if (direction >= 67.5 && direction < 112.5) return "E";
  if (direction >= 112.5 && direction < 157.5) return "SE";
  if (direction >= 157.5 && direction < 202.5) return "S";
  if (direction >= 202.5 && direction < 247.5) return "SW";
  if (direction >= 247.5 && direction < 292.5) return "W";
  if (direction >= 292.5 && direction < 337.5) return "NW";
  return "";
};

const DirectionArrow: React.FC<DirectionArrowProps> = ({ 
  direction, 
  size = 30, 
  color = "black",
  showLabel = true 
}) => {
  if (direction === null) {
    return <span>-</span>;
  }

  // Nous devons ajuster la rotation pour que la flèche pointe VERS la direction correcte
  const rotation = direction - 90; // Rotation avec uniquement l'ajustement pour le SVG
  
  const svgSize = size;
  const label = getDirectionLabel(direction);

  return (
    <div className="flex flex-col items-center">
      <svg 
        width={svgSize} 
        height={svgSize} 
        viewBox="0 0 100 100" 
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Flèche principale */}
        <path 
          d="M85,10 L15,50 L85,90 L65,50 Z" 
          fill={color} 
        />
        
        {/* Ombre pour la profondeur */}
        <path 
          d="M75,25 L25,50 L75,75 L60,50 Z" 
          fill={`rgba(30,30,30,0.3)`} 
        />
      </svg>
      {showLabel && (
        <span className="text-xs font-medium mt-1">{label}</span>
      )}
    </div>
  );
};

export default DirectionArrow;
