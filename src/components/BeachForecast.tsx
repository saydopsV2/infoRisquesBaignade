import React from 'react';
import Tab from './Tab';
import Beach from '../interface/Beach';
import { WeatherProvider } from '../context/WeatherContext';

interface BeachForecastProps {
  beach: Beach;
}

const BeachForecast: React.FC<BeachForecastProps> = ({ beach }) => {
  return (
    <WeatherProvider>
      <div className="flex flex-col min-h-screen bg-red-50">
        <h1 className="text-3xl text-slate-800 font-bold text-center mt-4 px-4">
          Prévisions pour {beach.nom}
        </h1>
        <div className="flex flex-1 items-start justify-center p-2 sm:p-4 w-full">
          <div className="w-full max-w-full lg:max-w-[90%] xl:max-w-[80%]">
            <Tab tabBeach={beach} />
          </div>
        </div>
      </div>
    </WeatherProvider>
  );
};

export default BeachForecast;