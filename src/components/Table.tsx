import React from 'react';
import { useState, useEffect } from 'react';

interface TableProps {
  indices: number[];
}

const Table: React.FC<TableProps> = ({ indices }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hours, setHours] = useState<Date[]>([]);

  useEffect(() => {
    // Générer 24 heures à partir de l'heure actuelle
    const now = new Date();
    now.setMinutes(0, 0, 0); // Arrondir à l'heure actuelle
    
    const hoursList = [];
    for (let i = 0; i < 24; i++) {
      const hourDate = new Date(now);
      hourDate.setHours(hourDate.getHours() + i);
      hoursList.push(hourDate);
    }
    
    setHours(hoursList);
  }, []);

  // S'assurer qu'il y a suffisamment d'indices pour toutes les heures
  const safeIndices = indices.length >= 24 
    ? indices 
    : [...indices, ...Array(24 - indices.length).fill(0)];

  return (
    <div className="w-full bg-slate-100 text-black rounded">
      {/* Conteneur avec contrôle du défilement horizontal */}
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse bg-slate-100 text-black">
          <thead>
            <tr className="bg-blue-500">
              <th className="p-2 text-left whitespace-nowrap" colSpan={25}>
                Données pour le {currentDate.toLocaleDateString()}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-nowrap">Heures</td>
              {hours.map((hour, index) => (
                <td key={`hour-${index}`} className="p-2 text-center border-r min-w-[50px]">
                  {hour.getHours()}:00
                </td>
              ))}
            </tr>
            <tr className="bg-blue-100">
              <td className="p-2 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-nowrap">Indices</td>
              {safeIndices.slice(0, 24).map((indice, index) => {
                // Définir la couleur de la cellule en fonction de l'indice
                let bgColorClass = "";
                switch(indice) {
                  case 0:
                    bgColorClass = "bg-green-800 text-white"; // Vert foncé
                    break;
                  case 1:
                    bgColorClass = "bg-green-400"; // Vert clair
                    break;
                  case 2:
                    bgColorClass = "bg-orange-100"; // Orange très clair
                    break;
                  case 3:
                    bgColorClass = "bg-orange-500"; // Orange
                    break;
                  case 4:
                    bgColorClass = "bg-red-600 text-white"; // Rouge
                    break;
                  default:
                    bgColorClass = "bg-gray-100"; // Par défaut
                }
                
                return (
                  <td key={`indice-${index}`} className={`p-2 text-center border-r ${bgColorClass} min-w-[50px]`}>
                    {indice}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Légende des couleurs */}
      <div className="mt-4 p-2 bg-slate-100 text-black">
        <h3 className="font-bold mb-2">Légende des indices:</h3>
        <div className="flex flex-row flex-wrap gap-2 md:gap-4 items-center justify-center">
          <div className="flex items-center">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-800"></div>
            <span className="ml-1 text-xs sm:text-sm">0 - Sécurité optimale</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-400"></div>
            <span className="ml-1 text-xs sm:text-sm">1 - Faible risque</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-100"></div>
            <span className="ml-1 text-xs sm:text-sm">2 - Risque modéré</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-500"></div>
            <span className="ml-1 text-xs sm:text-sm">3 - Risque élevé</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-600"></div>
            <span className="ml-1 text-xs sm:text-sm">4 - Danger important</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default () => {
  // Exemple de données d'indice
  const sampleIndices = [0, 0, 1, 1, 1, 2, 2, 2, 3, 4, 4, 4, 
                         2, 2, 2, 1, 1, 1, 1, 0, 0, 0, 2, 3];
  
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">Tableau des prévisions</h2>
      <Table indices={sampleIndices} />
    </div>
  );
};