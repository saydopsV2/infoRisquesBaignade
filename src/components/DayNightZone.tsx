import { useEffect, useRef, useState } from "react";

// Interface pour les propriétés du composant
interface DayNightZonesProps {
    numberOfDays: number;
    nightStartHour?: number; // Heure de début de la zone grisée (par défaut 20h)
    nightEndHour?: number;   // Heure de fin de la zone grisée (par défaut 9h)
}

// Composant pour les zones grisées entre 20h et 9h pour tous les jours
export const DayNightZones = ({
    numberOfDays,
    nightStartHour = 20, // Par défaut 20h (8pm)
    nightEndHour = 9     // Par défaut 9h (9am)
}: DayNightZonesProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    const dayWidth = containerWidth / numberOfDays;

    return (
        <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
            {Array.from({ length: numberOfDays }).map((_, dayIndex) => {
                const dayStart = dayIndex * dayWidth;
                const hourWidth = dayWidth / 24;

                return (
                    <div key={dayIndex}>
                        {/* Zone grisée de 0h à nightEndHour (matin) */}
                        <div
                            className="absolute top-0 h-full bg-gray-300 opacity-50"
                            style={{
                                left: `${dayStart}px`,
                                width: `${hourWidth * nightEndHour}px`
                            }}
                        />

                        {/* Zone grisée de nightStartHour à 24h (soir) */}
                        <div
                            className="absolute top-0 h-full bg-gray-300 opacity-50"
                            style={{
                                left: `${dayStart + hourWidth * nightStartHour}px`,
                                width: `${hourWidth * (24 - nightStartHour)}px`
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
};