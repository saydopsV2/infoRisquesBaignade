import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';

// Types
interface TableProps {
  indices: number[];
  tableBeach: string;
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
    <span className="ml-1 text-xs sm:text-sm">{item.label}</span>
  </div>
);

const TableLegend: React.FC = () => {
  const legendItems: LegendItem[] = [
    { value: 0, class: "bg-green-600", label: "0 - Sécurité optimale" },
    { value: 1, class: "bg-green-400", label: "1 - Faible risque" },
    { value: 2, class: "bg-orange-300", label: "2 - Risque modéré" },
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

const Table: React.FC<TableProps> = ({ indices, tableBeach }) => {
  const [currentDate] = useState(new Date());
  const [hours, setHours] = useState<Date[]>([]);

  useEffect(() => {
    const now = new Date();
    now.setMinutes(0, 0, 0);

    const hoursList = Array.from({ length: 24 }, (_, i) => {
      const hourDate = new Date(now);
      hourDate.setHours(hourDate.getHours() + i);
      return hourDate;
    });

    setHours(hoursList);
  }, []);

  const getIndexColor = (indice: number): string => {
    switch (indice) {
      case 0: return "bg-green-600";
      case 1: return "bg-green-400";
      case 2: return "bg-orange-300";
      case 3: return "bg-orange-500";
      case 4: return "bg-red-600 text-white";
      default: return "bg-gray-100";
    }
  };

  // Ensure we have exactly 24 values, filling with zeros if needed
  const safeIndices = indices.length >= 24
    ? indices.slice(0, 24)
    : [...indices, ...Array(24 - indices.length).fill(0)];

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
              {safeIndices.map((indice, index) => (
                <td 
                  key={`indice-${index}`} 
                  className={`p-2 text-center border-r ${getIndexColor(indice)} min-w-[50px]`}
                >
                  {indice}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <TableLegend />
    </div>
  );
};

// Main component export
const PrevisionTable: React.FC = () => {
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
          <Table indices={defaultIndices} tableBeach="lette-blanche" />
        </div>
      ) : (
        <Table indices={indices} tableBeach="lette-blanche" />
      )}
    </div>
  );
};

export default PrevisionTable;
