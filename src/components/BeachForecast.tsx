import React from 'react';
import Tab from './Tab';
import Beach from '../interface/Beach';

interface BeachForecastProps {
  beach: Beach;
  forecastPlot: string;
  allDataPlot: string;
}

const BeachForecast: React.FC<BeachForecastProps> = ({ beach, forecastPlot, allDataPlot }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-800">
      <h1 className="text-3xl text-slate-100 font-bold text-center mt-4 px-4">
        Prévisions pour {beach.nom}
      </h1>
      <div className="flex flex-1 items-start justify-center p-2 sm:p-4 w-full">
        <div className="w-full max-w-full lg:max-w-[90%] xl:max-w-[80%]">
          <Tab tabAllDataPlot={allDataPlot} tabForecastPlot={forecastPlot} tabBeach={beach} />
        </div>
      </div>
    </div>
  );
};

export default BeachForecast;
