import React from 'react';
import { SectionProps } from '../../interfaces/BilanTypes';

interface WeatherSectionProps extends SectionProps {
  tempUnit: string;
}

const WeatherSection: React.FC<WeatherSectionProps> = ({ data11AM, maxValues, tempUnit }) => {
  return (
    <div id="weather" className="bg-sky-50 p-3 rounded-md border border-gray-300 flex-grow basis-0 min-w-[250px]">
      <h3 className="text-base sm:text-lg font-semibold text-sky-800">Météo</h3>
      <div className="mt-2">
        <p className="flex justify-between text-sm sm:text-base">
          <span className="font-medium">Température:</span>
          <span>{data11AM.temperature !== null ? `${data11AM.temperature}${tempUnit}` : "-"}</span>
        </p>
        <p className="flex justify-between mt-1 text-sm sm:text-base">
          <span className="font-medium">Indice UV:</span>
          <span>{data11AM.uvIndex !== null ? data11AM.uvIndex.toFixed(1) : "-"}</span>
        </p>
        {maxValues && (
          <>
            <div className="mt-2 pt-2 border-t border-sky-200">
              <p className="text-md text-sky-700 font-medium mb-1">Maximum entre 11h et 20h:</p>
              <p className="flex justify-between mt-1 text-sm sm:text-base text-red-700">
                <span className="font-medium">Temp. max:</span>
                <span>{maxValues.maxTemperature !== null ? `${maxValues.maxTemperature}${tempUnit}` : "-"}</span>
              </p>
              <p className="flex justify-between mt-1 text-sm sm:text-base text-red-700">
                <span className="font-medium">UV max:</span>
                <span>{maxValues.maxUvIndex !== null ? maxValues.maxUvIndex.toFixed(1) : "-"}</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WeatherSection;
