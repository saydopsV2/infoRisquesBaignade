import React from 'react';
import { SectionProps } from '../../interfaces/BilanTypes';
import DirectionArrow from '../DirectionArrow';

const WindSection: React.FC<SectionProps> = ({ data11AM, maxValues }) => {
  return (
    <div id="wind" className="bg-cyan-50 p-3 rounded-md border border-gray-300 flex-grow basis-0 min-w-[250px]">
      <h3 className="text-base sm:text-lg font-semibold text-cyan-800">Vent</h3>
      <div className="mt-2">
        <p className="flex justify-between items-center text-sm sm:text-base">
          <span className="font-medium">Direction:</span>
          <DirectionArrow
            direction={data11AM.windDirection}
            size={24}
            color="#2563eb"
            showLabel={true}
          />
        </p>
        <p className="flex justify-between mt-1 text-sm sm:text-base">
          <span className="font-medium">Vitesse:</span>
          <span>{data11AM.windSpeed !== null ? `${data11AM.windSpeed} nds` : "-"}</span>
        </p>
        <p className="flex justify-between mt-1 text-sm sm:text-base">
          <span className="font-medium">Rafales:</span>
          <span>{data11AM.windGusts !== null ? `${data11AM.windGusts} nds` : "-"}</span>
        </p>
        {maxValues && (
          <>
            <div className="mt-2 pt-2 border-t border-cyan-200">
              <p className="text-md text-sky-800 font-medium mb-1">Entre 11h et 20h:</p>
              
              {/* Vent max */}
              <p className="flex justify-between items-center mt-1 text-sm sm:text-base text-red-700">
                <span className="font-medium">Direction:</span>
                <DirectionArrow
                  direction={maxValues.directionAtMaxSpeed}
                  size={24}
                  color="#dc2626"
                  showLabel={true}
                />
              </p>
              <p className="flex justify-between mt-1 text-sm sm:text-base text-red-700">
                <span className="font-medium">Vitesse max {maxValues.maxWindSpeedHour !== null ? `(${maxValues.maxWindSpeedHour}h00)` : ""}:</span>
                <span>{maxValues.maxWindSpeed !== null ? `${maxValues.maxWindSpeed} nds` : "-"}</span>
              </p>
              <p className="flex justify-between mt-1 text-sm sm:text-base text-red-700">
                <span className="font-medium">Rafales max {maxValues.maxWindGustsHour !== null ? `(${maxValues.maxWindGustsHour}h00)` : ""}:</span>
                <span>{maxValues.maxWindGusts !== null ? `${maxValues.maxWindGusts} nds` : "-"}</span>
              </p>
              {/* Vent min */}
              <p className="flex justify-between items-center mt-1 text-sm sm:text-base text-green-700">
                <span className="font-medium">Direction:</span>
                <DirectionArrow
                  direction={maxValues.directionAtMinSpeed}
                  size={24}
                  color="#16a34a"
                  showLabel={true}
                />
              </p>
              
              {/* Vitesse max et min */}
              
              <p className="flex justify-between mt-1 text-sm sm:text-base text-green-700">
                <span className="font-medium">Vitesse min {maxValues.minWindSpeedHour !== null ? `(${maxValues.minWindSpeedHour}h00)` : ""}:</span>
                <span>{maxValues.minWindSpeed !== null ? `${maxValues.minWindSpeed} nds` : "-"}</span>
              </p>
              
              {/* Rafales max et min */}
              
              <p className="flex justify-between mt-1 text-sm sm:text-base text-green-700">
                <span className="font-medium">Rafales min {maxValues.minWindGustsHour !== null ? `(${maxValues.minWindGustsHour}h00)` : ""}:</span>
                <span>{maxValues.minWindGusts !== null ? `${maxValues.minWindGusts} nds` : "-"}</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WindSection;