import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import Beach from '../interface/Beach';
import {  StandaloneChart } from './Chart';
import { useWeather } from '../context/WeatherContext';
import { useWindForecast } from '../context/WindForecastContext';

// Types
interface TableProps {
  indices: number[];
  tableBeach: string;
  location: Beach;
}

interface LegendItem {
  value: number;
  class: string;
  label: string;
}

interface PrevisionData {
  valeur: string;
  [key: string]: any;
}

// Custom hook for loading CSV data
const usePrevisionData = () => {
  const [indices, setIndices] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.BASE_URL}dataModel/prevision.csv`);
        const csvText = await response.text();

        Papa.parse<PrevisionData>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const parsedIndices: number[] = result.data
              .map(row => parseInt(row.valeur, 10))
              .filter(val => !isNaN(val));

            setIndices(parsedIndices);
            setIsLoading(false);
          },
          error: (err: { message: React.SetStateAction<string | null>; }) => {
            setError(err.message);
            setIsLoading(false);
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { indices, isLoading, error };
};

// Components
const LegendItem: React.FC<{ item: LegendItem }> = ({ item }) => (
  <div className="flex items-center" key={item.label}>
    <div className={`w-5 h-5 sm:w-6 sm:h-6 ${item.class} rounded-lg`}></div>
    <span className="ml-1 text-xs sm:text-sm px-2 py-1 bg-slate-50 rounded-md shadow-sm">
      {item.label}
    </span>
  </div>
);

const TableLegend: React.FC = () => {
  const legendItems: LegendItem[] = [
    { value: 0, class: "bg-green-600", label: "0 - Sécurité optimale" },
    { value: 1, class: "bg-green-400", label: "1 - Faible risque" },
    { value: 2, class: "bg-yellow-300", label: "2 - Risque modéré" },
    { value: 3, class: "bg-orange-500", label: "3 - Risque élevé" },
    { value: 4, class: "bg-red-600", label: "4 - Danger important" },
  ];

  return (
    <div className="mt-4 p-2 bg-slate-100 text-black">
      <h3 className="font-bold mb-2">Légende indice Sécurité:</h3>
      <div className="flex flex-row flex-wrap gap-2 md:gap-4 items-center justify-center">
        {legendItems.map((item) => (
          <LegendItem key={item.value} item={item} />
        ))}
      </div>
    </div>
  );
};

const Table: React.FC<TableProps> = ({ indices, location }) => {
  const [currentDate] = useState(new Date());
  
  // Utilisation du contexte pour obtenir les données météo
  const { 
    hours, 
    temperatures, 
    uvIndices, 
    tempUnit, 
    isLoading: weatherLoading, 
    error: weatherError,
    fetchWeatherData 
  } = useWeather();
  
  // Utilisation du contexte pour obtenir les données de vent
  const {
    windForecast,
    loading: windLoading,
    error: windError,
    fetchWindForecast
  } = useWindForecast();

  useEffect(() => {
    // Appel à fetchWeatherData lors du montage du composant
    fetchWeatherData(location);
    // Appel à fetchWindForecast lors du montage du composant
    fetchWindForecast(location);
  }, [location]);

  const getIndexColor = (indice: number): string => {
    switch (indice) {
      case 0: return "bg-green-600";
      case 1: return "bg-green-400";
      case 2: return "bg-yellow-300";
      case 3: return "bg-orange-500";
      case 4: return "bg-red-600 text-white";
      default: return "bg-gray-100";
    }
  };

  const getUvIndexColor = (uvIndex: number): string => {
    if (uvIndex < 3) return "bg-green-400"; // Low
    if (uvIndex < 6) return "bg-yellow-300"; // Moderate
    if (uvIndex < 8) return "bg-orange-400"; // High
    if (uvIndex < 11) return "bg-red-500 text-white"; // Very High
    return "bg-purple-700 text-white"; // Extreme
  };

  const getWindDirectionSymbol = (direction: number | null): string => {
    if (direction === null) return "-";
    
    if (direction >= 337.5 || direction < 22.5) return "↓ N";
    if (direction >= 22.5 && direction < 67.5) return "↙ NE";
    if (direction >= 67.5 && direction < 112.5) return "← E";
    if (direction >= 112.5 && direction < 157.5) return "↖ SE";
    if (direction >= 157.5 && direction < 202.5) return "↑ S";
    if (direction >= 202.5 && direction < 247.5) return "↗ SO";
    if (direction >= 247.5 && direction < 292.5) return "→ O";
    if (direction >= 292.5 && direction < 337.5) return "↘ NO";
    
    return direction.toString();
  };

  const getWindSpeedColor = (speed: number | null): string => {
    if (speed === null) return "";
    if (speed < 4) return "bg-cyan-50"; // Calme
    if (speed < 5) return "bg-cyan-100"; // Calme
    if (speed < 7) return "bg-cyan-200"; // Vent faible
    if (speed < 11) return "bg-lime-200"; // Vent léger
    if (speed < 17) return "bg-lime-500"; // Vent modéré
    if (speed < 20) return "bg-yellow-300"; // Vent assez fort
    if (speed < 22) return "bg-orange-400"; // Vent assez fort
    if (speed < 28) return "bg-rose-500"; // Vent fort
    if (speed < 34) return "bg-purple-500 text-white"; // Vent très fort
    if (speed < 41) return "bg-fuchsia-500 text-white"; // Vent violent
    return "bg-purple-700 text-white"; // Vent très violent
  };

  // Ensure we have exactly 24 values, filling with zeros if needed
  const safeIndices = indices.length >= 24
    ? indices.slice(0, 24)
    : [...indices, ...Array(24 - indices.length).fill(0)];

  // Ensure we have temperature and UV data
  const safeTemperatures = temperatures.length >= 24
    ? temperatures
    : [...temperatures, ...Array(24 - temperatures.length).fill(null)];

  const safeUvIndices = uvIndices.length >= 24
    ? uvIndices
    : [...uvIndices, ...Array(24 - uvIndices.length).fill(null)];

  // Ensure we have wind data
  const safeWindDirections = windForecast?.hourly?.wind_direction_10m?.slice(0, 24) || Array(24).fill(null);
  const safeWindSpeeds = windForecast?.hourly?.wind_speed_10m?.slice(0, 24) || Array(24).fill(null);
  const safeWindGusts = windForecast?.hourly?.wind_gusts_10m?.slice(0, 24) || Array(24).fill(null);

  // Ensure proper alignment with hours
  const alignWindDataWithHours = () => {
    if (!windForecast?.hourly?.time || hours.length === 0) return;
    
    const alignedDirections = Array(24).fill(null);
    const alignedSpeeds = Array(24).fill(null);
    const alignedGusts = Array(24).fill(null);
    
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    hours.forEach((hour, hourIndex) => {
      const hourValue = hour.getHours();
      
      // Convert API timestamps to Date objects and find matching hours for the current day
      const matchingIndex = windForecast.hourly.time.findIndex((timeStr) => {
        const apiDate = new Date(timeStr);
        return (
          apiDate.getHours() === hourValue && 
          apiDate.getDate() === currentDay &&
          apiDate.getMonth() === currentMonth &&
          apiDate.getFullYear() === currentYear
        );
      });
      
      if (matchingIndex !== -1) {
        alignedDirections[hourIndex] = windForecast.hourly.wind_direction_10m[matchingIndex];
        alignedSpeeds[hourIndex] = windForecast.hourly.wind_speed_10m[matchingIndex];
        alignedGusts[hourIndex] = windForecast.hourly.wind_gusts_10m[matchingIndex];
      }
    });
    
    return {
      directions: alignedDirections,
      speeds: alignedSpeeds,
      gusts: alignedGusts
    };
  };
  
  const alignedWindData = alignWindDataWithHours();
  
  // Use aligned data if available, otherwise fall back to just slicing the first 24 values
  const displayWindDirections = alignedWindData?.directions || safeWindDirections;
  const displayWindSpeeds = alignedWindData?.speeds || safeWindSpeeds;
  const displayWindGusts = alignedWindData?.gusts || safeWindGusts;

  return (
    <div className="w-full bg-slate-100 text-black rounded">
      {(weatherLoading || windLoading) ? (
        <div className="p-4 text-center">Chargement des données...</div>
      ) : (weatherError || windError) ? (
        <div className="p-4 bg-red-100 text-red-700 mb-4 rounded-lg">
          Erreur: {weatherError || windError}
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <TableLegend />
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
                <td className="p-2 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-nowrap">Indice Sécurité</td>
                {safeIndices.map((indice, index) => (
                  <td
                    key={`indice-${index}`}
                    className={`p-2 text-center border-r ${getIndexColor(indice)} min-w-[50px]`}
                  >
                    {indice}
                  </td>
                ))}
              </tr>
              <tr className="bg-white">
                <td className="p-2 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-nowrap">Température</td>
                {safeTemperatures.map((temp, index) => (
                  <td key={`temp-${index}`} className="p-2 text-center border-r min-w-[50px]">
                    {temp !== null ? `${temp}${tempUnit}` : "-"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-nowrap">Graphique</td>
                <td colSpan={24} className="p-0 border-r">
                  <StandaloneChart/>
                </td>
              </tr>
              <tr className="bg-blue-50">
                <td className="p-2 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-nowrap">Indice UV</td>
                {safeUvIndices.map((uv, index) => (
                  <td
                    key={`uv-${index}`}
                    className={`p-2 text-center border-r ${uv !== null ? getUvIndexColor(uv) : ""} min-w-[50px]`}
                  >
                    {uv !== null ? uv.toFixed(1) : "-"}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="p-2 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-nowrap">Direction du vent</td>
                {displayWindDirections.map((direction, index) => (
                  <td key={`windDir-${index}`} className="p-2 text-center border-r min-w-[50px]">
                    {getWindDirectionSymbol(direction)}
                  </td>
                ))}
              </tr>
              <tr className="bg-white">
                <td className="p-2 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-nowrap">Vitesse du vent</td>
                {displayWindSpeeds.map((speed, index) => (
                  <td 
                    key={`windSpeed-${index}`} 
                    className={`p-2 text-center border-r min-w-[50px] ${getWindSpeedColor(speed)}`}
                  >
                    {speed !== null ? `${speed} nds` : "-"}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="p-2 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-nowrap">Rafales de vent</td>
                {displayWindGusts.map((gust, index) => (
                  <td 
                    key={`windGust-${index}`} 
                    className={`p-2 text-center border-r min-w-[50px] ${getWindSpeedColor(gust)}`}
                  >
                    {gust !== null ? `${gust} nds` : "-"}
                  </td>
                ))}
              </tr>
              
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Main component export
const PrevisionTable: React.FC<{ location: Beach }> = ({ location }) => {
  const { indices, isLoading, error } = usePrevisionData();
  const defaultIndices = new Array(24).fill(0);

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">Tableau des prévisions</h2>

      {isLoading ? (
        <div className="p-4 bg-slate-100 text-center">Chargement des données...</div>
      ) : error ? (
        <div>
          <div className="p-4 bg-red-100 text-red-700 mb-4 rounded-lg">
            Erreur: {error}. Affichage des données par défaut.
          </div>
          <Table indices={defaultIndices} tableBeach={location.nom.toLowerCase().replace(' ', '-')} location={location} />
        </div>
      ) : (
        <Table indices={indices} tableBeach={location.nom.toLowerCase().replace(' ', '-')} location={location} />
      )}
    </div>
  );
};

export default PrevisionTable;