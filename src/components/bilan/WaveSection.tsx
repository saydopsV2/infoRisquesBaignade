import React from 'react';
import { WaveSectionProps } from '../../interfaces/BilanTypes';
import DirectionArrow from '../DirectionArrow';

const WaveSection: React.FC<WaveSectionProps> = ({ data11AM, maxValues, waterTemperature }) => {
  return (
    <div id="waves" className="bg-sky-50 p-3 rounded-md border border-gray-300 flex-grow basis-0 min-w-[250px]">
      <h3 className="text-base sm:text-lg font-semibold text-sky-800">Vagues</h3>
      <div className="mt-2">
        <p className="flex justify-between mt-1 text-sm sm:text-base">
          <span className="font-medium">Température eau:</span>
          <span>{waterTemperature !== null ? `${waterTemperature}°C` : "-"}</span>
        </p>
        <p className="flex justify-between items-center text-sm sm:text-base">
          <span className="font-medium">Direction:</span>
          <DirectionArrow
            direction={data11AM.waveDirection}
            size={24}
            color="#4f46e5"
            showLabel={true}
          />
        </p>
        <p className="flex justify-between mt-1 text-sm sm:text-base">
          <span className="font-medium">Hauteur:</span>
          <span>{data11AM.waveHeight !== null ? `${data11AM.waveHeight.toFixed(1)} m` : "-"}</span>
        </p>
        <p className="flex justify-between mt-1 text-sm sm:text-base">
          <span className="font-medium">Période:</span>
          <span>{data11AM.wavePeriod !== null ? `${data11AM.wavePeriod.toFixed(1)} s` : "-"}</span>
        </p>
        {maxValues && (
          <>
            <div className="mt-2 pt-2 border-t border-sky-200">
              <p className="text-md text-sky-700 font-medium mb-1">Maximum entre 11h et 20h:</p>
              <p className="flex justify-between items-center mt-1 text-sm sm:text-base text-red-700">
                <span className="font-medium">Direction:</span>
                <DirectionArrow
                  direction={maxValues.directionAtMaxWave}
                  size={24}
                  color="#dc2626"
                  showLabel={true}
                />
              </p>
              <p className="flex justify-between mt-1 text-sm sm:text-base text-red-700">
                <span className="font-medium">Hauteur max {maxValues.maxWaveHeightHour !== null ? `(${maxValues.maxWaveHeightHour}h00)` : ""}:</span>
                <span>{maxValues.maxWaveHeight !== null ? `${maxValues.maxWaveHeight.toFixed(1)} m` : "-"}</span>
              </p>
              <p className="flex justify-between mt-1 text-sm sm:text-base text-red-700">
                <span className="font-medium">Période:</span>
                <span>{maxValues.periodAtMaxWave !== null ? `${maxValues.periodAtMaxWave.toFixed(1)} s` : "-"}</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WaveSection;