import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import Beach from '../interface/Beach';

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

interface WeatherData {
  hourly: {
    time: string[];
    temperature_2m: number[];
    uv_index: number[];
  };
  hourly_units: {
    temperature_2m: string;
    uv_index: string;
  };
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
    <span className="ml-1 text-xs sm:text-sm">{item.label}</span>
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
      <h3 className="font-bold mb-2">Légende des indices:</h3>
      <div className="flex flex-row flex-wrap gap-2 md:gap-4 items-center justify-center">
        {legendItems.map((item) => (
          <LegendItem key={item.value} item={item} />
        ))}
      </div>
    </div>
  );
};

const Table: React.FC<TableProps> = ({ indices, tableBeach, location }) => {
  const [currentDate] = useState(new Date());
  const [hours, setHours] = useState<Date[]>([]);
  const [temperatures, setTemperatures] = useState<number[]>([]);
  const [uvIndices, setUvIndices] = useState<number[]>([]);
  const [tempUnit, setTempUnit] = useState<string>('°C');
  
  useEffect(() => {
    // Fetch weather data from Open-Meteo API using location coordinates
    const fetchWeatherData = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hourly=temperature_2m,uv_index&timezone=auto&forecast_days=3`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json() as WeatherData;
        console.log('Weather API Response:', data);
        
        // Get current hour
        const now = new Date();
        now.setMinutes(0, 0, 0);
        
        // Parse the API time strings to Date objects to align with current time
        const apiTimes = data.hourly.time.map(timeStr => new Date(timeStr));
        
        // Generate 24 hours from current time
        const hoursList: Date[] = [];
        const tempsList: number[] = [];
        const uvList: number[] = [];
        
        for (let i = 0; i < 24; i++) {
          const targetHour = new Date(now);
          targetHour.setHours(targetHour.getHours() + i);
          hoursList.push(targetHour);
          
          // Find the closest matching time in the API data
          const closestTimeIndex = apiTimes.findIndex(apiTime => {
            return apiTime.getHours() === targetHour.getHours() && 
                   apiTime.getDate() === targetHour.getDate() && 
                   apiTime.getMonth() === targetHour.getMonth();
          });
          
          // Add corresponding temperature and UV data
          if (closestTimeIndex !== -1) {
            tempsList.push(data.hourly.temperature_2m[closestTimeIndex]);
            uvList.push(data.hourly.uv_index[closestTimeIndex]);
          } else {
            // Fallback if no matching time is found
            tempsList.push(0);
            uvList.push(0);
          }
        }
        
        setHours(hoursList);
        setTemperatures(tempsList);
        setUvIndices(uvList);
        setTempUnit(data.hourly_units.temperature_2m);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        
        // Fallback if API fails - generate hours without weather data
        const now = new Date();
        now.setMinutes(0, 0, 0);
        const hoursList = Array.from({ length: 24 }, (_, i) => {
          const hourDate = new Date(now);
          hourDate.setHours(hourDate.getHours() + i);
          return hourDate;
        });
        setHours(hoursList);
      }
    };
    
    fetchWeatherData();
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

  return (
    <div className="w-full bg-slate-100 text-black rounded">
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse bg-slate-100 text-black">
          <thead>
            <tr className="bg-blue-500">
              <th className="p-2 text-left whitespace-nowrap" colSpan={25}>
                Données pour le {currentDate.toLocaleDateString()}
              </th>
            </tr>
          </thead>
          {/* Table content sections:
           - Hour line
           - Indices line
           - Temperature line
           - UV index line
           - Graph line
          */}
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
              <td className="p-2 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-nowrap">Indices courant <br /> d'arrachement</td>
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
            <tr>
              <td className="p-2 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-nowrap">Graphique</td>
              <td colSpan={24} className="p-0 border-r">
                <img 
                  src={`${import.meta.env.BASE_URL}img/outputCrowdTest.png`}
                  alt="Graphique de prévision"
                  className="w-full h-50"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <TableLegend />
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
