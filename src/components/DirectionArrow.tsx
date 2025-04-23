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
  if (direction >= 202.5 && direction < 247.5) return "SO";
  if (direction >= 247.5 && direction < 292.5) return "O";
  if (direction >= 292.5 && direction < 337.5) return "NO";
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

  // En météorologie, la direction indique d'où vient le vent/les vagues
  // Nous devons donc pointer la flèche dans la direction opposée (+ 180°)
  // et ajuster par rapport à la rotation SVG (-90°)
  const rotation = direction + 180 - 90;
  
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
        <line 
          x1="10" 
          y1="50" 
          x2="80" 
          y2="50" 
          stroke={color} 
          strokeWidth="8" 
        />
        <polygon 
          points="80,40 80,60 95,50" 
          fill={color} 
        />
      </svg>
      {showLabel && (
        <span className="text-xs font-medium mt-1">{label}</span>
      )}
    </div>
  );
};

export default DirectionArrow;
