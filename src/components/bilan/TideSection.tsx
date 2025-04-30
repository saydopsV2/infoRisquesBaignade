import React from 'react';
import { TideSectionProps } from '../../interfaces/BilanTypes';

const TideSection: React.FC<TideSectionProps> = ({ tideData, tideTypes, tideHours, tideHeights }) => {
  if (!tideData) return null;

  return (
    <div id="tide" className="bg-teal-50 p-3 rounded-md border border-gray-300 flex-grow basis-0 min-w-[250px]">
      <h3 className="text-base sm:text-lg font-semibold text-teal-800">Marées aujourd'hui</h3>

      <div className="mt-2">
        <p className="flex justify-start text-sm sm:text-base">
          <span className="font-bold mx-2">Coefficient:</span>
          <span>{tideData.coefficient}</span>
        </p>

        {/* Tableau des marées */}
        <div className="mt-2 sm:mt-3 overflow-x-auto">
          <table className="min-w-full bg-white rounded-md">
            <thead>
              <tr className="bg-teal-100">
                <th className="py-1 sm:py-2 px-2 sm:px-3 text-center text-md sm:text-sm font-medium text-teal-800">Type</th>
                <th className="py-1 sm:py-2 px-2 sm:px-3 text-center text-md sm:text-sm font-medium text-teal-800">Heure</th>
                <th className="py-1 sm:py-2 px-2 sm:px-3 text-center text-md sm:text-sm font-medium text-teal-800">Hauteur</th>
              </tr>
            </thead>
            <tbody>
              {tideTypes.map((type, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-teal-50' : 'bg-white'}>
                  <td className="py-1 sm:py-2 px-2 sm:px-3 text-md sm:text-sm text-center">{type}</td>
                  <td className="py-1 sm:py-2 px-2 sm:px-3 text-md sm:text-sm text-center">{tideHours[index] || '-'}</td>
                  <td className="py-1 sm:py-2 px-2 sm:px-3 text-md sm:text-sm text-center">{tideHeights[index] || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TideSection;
