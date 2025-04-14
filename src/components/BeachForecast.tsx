import React from 'react';
import Tab from './Tab';

interface BeachForecastProps {
  beach: string;
  forecastPlot: string;
  allDataPlot: string;
}

const BeachForecast: React.FC<BeachForecastProps> = ({ beach, forecastPlot, allDataPlot}) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-800">
      <h1 className="text-3xl text-slate-100 font-bold text-center mt-4">
        Prévisions pour {beach === 'lette-blanche' ? 'La lette Blanche' : 'Biscarosse'}
      </h1>
      <div className="flex flex-1 items-start justify-center pt-0 px-4 pb-4 flex-col">
        
        <Tab tabAllDataPlot={allDataPlot} tabForecastPlot={forecastPlot} tabBeach={beach} />
        {/* <img 
          src={forecastPlot} 
          alt={`Vue de la plage ${beach === 'lette-blanche' ? 'La lette Blanche' : 'Biscarosse'}`} 
          className="mx-auto w-250 h-auto rounded-lg shadow-lg" 
        /> */}
      </div>
    </div>
  );
};

export default BeachForecast;
