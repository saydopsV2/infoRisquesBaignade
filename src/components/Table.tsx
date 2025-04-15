import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';

interface TableProps {
  indices: number[];
  tableBeach: string;
}

const Table: React.FC<TableProps> = ({ indices, tableBeach }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hours, setHours] = useState<Date[]>([]);

  useEffect(() => {
    const now = new Date();
    now.setMinutes(0, 0, 0);

    const hoursList = [];
    for (let i = 0; i < 24; i++) {
      const hourDate = new Date(now);
      hourDate.setHours(hourDate.getHours() + i);
      hoursList.push(hourDate);
    }

    setHours(hoursList);
  }, []);

  const safeIndices = indices.length >= 24
    ? indices
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
              {safeIndices.slice(0, 24).map((indice, index) => {
                let bgColorClass = "";
                switch (indice) {
                  case 0:
                    bgColorClass = "bg-green-600";
                    break;
                  case 1:
                    bgColorClass = "bg-green-400";
                    break;
                  case 2:
                    bgColorClass = "bg-orange-300";
                    break;
                  case 3:
                    bgColorClass = "bg-orange-500";
                    break;
                  case 4:
                    bgColorClass = "bg-red-600 text-white";
                    break;
                  default:
                    bgColorClass = "bg-gray-100";
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

      <div className="mt-4 p-2 bg-slate-100 text-black">
        <h3 className="font-bold mb-2">Légende des indices:</h3>
        <div className="flex flex-row flex-wrap gap-2 md:gap-4 items-center justify-center">
          {[
            { class: "bg-green-600", label: "0 - Sécurité optimale" },
            { class: "bg-green-400", label: "1 - Faible risque" },
            { class: "bg-orange-300", label: "2 - Risque modéré" },
            { class: "bg-orange-500", label: "3 - Risque élevé" },
            { class: "bg-red-600", label: "4 - Danger important" },
          ].map(({ class: colorClass, label }) => (
            <div className="flex items-center" key={label}>
              <div className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClass} rounded-lg`}></div>
              <span className="ml-1 text-xs sm:text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default () => {
  const [csvIndices, setCsvIndices] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${import.meta.env.BASE_URL}dataModel/prevision.csv`)
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            console.log("Résultat complet du parsing :", result);
            const indices: number[] = [];
            result.data.forEach((row: any) => {
              const val = parseInt(row.valeur, 10);
              if (!isNaN(val)) {
                indices.push(val);
              }
            });
            console.log("Colonnes CSV :", result.meta.fields);
            setCsvIndices(indices);
            setIsLoading(false);
          },
          error: (err: { message: React.SetStateAction<string | null>; }) => {
            console.error("Erreur de parsing:", err);
            setError(err.message);
            setIsLoading(false);
          },
        });
      })
      .catch((err) => {
        console.error("Erreur de chargement CSV:", err);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

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
        <Table indices={csvIndices} tableBeach="lette-blanche" />
      )}
    </div>
  );
};
