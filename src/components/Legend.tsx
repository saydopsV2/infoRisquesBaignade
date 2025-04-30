import React from 'react';

// Types
interface LegendItem {
  value: number;
  class: string;
  label: string;
}

const LegendItem: React.FC<{ item: LegendItem }> = ({ item }) => (
  <div className="flex items-center">
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
    <div className="mt-4 p-2 bg-slate-100 rounded-md text-black">
      <h3 className="font-bold mb-2">Légende indice Sécurité:</h3>
      <div className="flex flex-row flex-wrap gap-2 md:gap-4 items-center justify-center">
        {legendItems.map((item) => (
          <LegendItem key={item.value} item={item} />
        ))}
      </div>
    </div>
  );
};

export default TableLegend;
