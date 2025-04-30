import React from 'react';
import { SectionProps } from '../../interfaces/BilanTypes';

const HazardSection: React.FC<SectionProps> = ({ data11AM, maxValues }) => {
  // Fonction pour obtenir la couleur basée sur le niveau de danger
  const getHazardLevelColor = (level: number | null): string => {
    if (level === null) return "text-gray-500";
    if (level === 0) return "text-green-600"; // Vert foncé - Sécurité optimale
    if (level === 1) return "text-green-400"; // Vert clair - Faible risque
    if (level === 2) return "text-yellow-500"; // Jaune - Risque modéré
    if (level === 3) return "text-orange-500"; // Orange - Risque élevé
    if (level >= 4) return "text-red-600"; // Rouge - Danger important
    return "text-gray-500"; // Couleur par défaut
  };

  return (
    <div id="hazards" className="bg-rose-50 p-3 rounded-md border border-gray-300 flex-grow basis-0 min-w-[250px]">
      <h3 className="text-base sm:text-lg font-semibold text-rose-800">Niveaux de Risque</h3>
      <div className="mt-2">
        <p className="flex justify-between text-sm sm:text-base">
          <span className="font-medium">Fréquentation:</span>
          <span className={getHazardLevelColor(data11AM.attendanceHazardLevel)}>
            {data11AM.attendanceHazardLevel !== null ? data11AM.attendanceHazardLevel : "-"}
          </span>
        </p>
        <p className="flex justify-between mt-1 text-sm sm:text-base">
          <span className="font-medium">Courant de Baïne:</span>
          <span className={getHazardLevelColor(data11AM.ripCurrentHazardLevel)}>
            {data11AM.ripCurrentHazardLevel !== null ? data11AM.ripCurrentHazardLevel : "-"}
          </span>
        </p>
        <p className="flex justify-between mt-1 text-sm sm:text-base">
          <span className="font-medium">Shore Break:</span>
          <span className={getHazardLevelColor(data11AM.shoreBreakHazardLevel)}>
            {data11AM.shoreBreakHazardLevel !== null ? data11AM.shoreBreakHazardLevel : "-"}
          </span>
        </p>
        {maxValues && (
          <>
            <div className="mt-2 pt-2 border-t border-rose-200">
              <p className="text-md text-sky-700 font-medium mb-1">Maximum entre 11h et 20h:</p>
              <p className="flex justify-between mt-1 text-sm sm:text-base text-red-700">
                <span className="font-medium">Fréquentation max:</span>
                <span>
                  {maxValues.maxAttendanceHazardLevel !== null ? maxValues.maxAttendanceHazardLevel : "-"}
                </span>
              </p>
              <p className="flex justify-between mt-1 text-sm sm:text-base text-red-700">
                <span className="font-medium">Courant max:</span>
                <span>
                  {maxValues.maxRipCurrentHazardLevel !== null ? maxValues.maxRipCurrentHazardLevel : "-"}
                </span>
              </p>
              <p className="flex justify-between mt-1 text-sm sm:text-base text-red-700">
                <span className="font-medium">Shore Break max:</span>
                <span>
                  {maxValues.maxShoreBreakHazardLevel !== null ? maxValues.maxShoreBreakHazardLevel : "-"}
                </span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HazardSection;
