import React, { useEffect } from 'react';
import { useWeather } from '../context/WeatherContext';
import { useWindForecast } from '../context/WindForecastContext';
import Beach from '../interface/Beach';

interface BilanProps {
  location: Beach;
}

const Bilan: React.FC<BilanProps> = ({ location }) => {
  // Récupération des données météo
  const {
    hours,
    temperatures,
    uvIndices,
    tempUnit,
    isLoading: weatherLoading,
    error: weatherError,
    fetchWeatherData
  } = useWeather();

  // Récupération des données de vent
  const {
    windForecast,
    loading: windLoading,
    error: windError,
    fetchWindForecast
  } = useWindForecast();

  useEffect(() => {
    // Charger les données au montage du composant
    fetchWeatherData(location);
    fetchWindForecast(location);
  }, [location]);

  // Fonction pour extraire les données à 11h00
  const getDataAt11AM = () => {
    if (weatherLoading || windLoading) return null;
    if (weatherError || windError) return null;
    
    // Trouver l'index correspondant à 11h00
    const index11AM = hours.findIndex(hour => hour.getHours() === 11);
    
    if (index11AM === -1) return null;
    
    // Extraire les données
    const temperature = temperatures[index11AM];
    const uvIndex = uvIndices[index11AM];
    
    // Extraire les données de vent pour 11h00
    let windDirection = null;
    let windSpeed = null;
    let windGusts = null;
    
    if (windForecast?.hourly?.time) {
      const currentDate = new Date();
      const currentDay = currentDate.getDate();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const windIndex = windForecast.hourly.time.findIndex(timeStr => {
        const apiDate = new Date(timeStr);
        return (
          apiDate.getHours() === 11 && 
          apiDate.getDate() === currentDay &&
          apiDate.getMonth() === currentMonth &&
          apiDate.getFullYear() === currentYear
        );
      });
      
      if (windIndex !== -1) {
        windDirection = windForecast.hourly.wind_direction_10m[windIndex];
        windSpeed = windForecast.hourly.wind_speed_10m[windIndex];
        windGusts = windForecast.hourly.wind_gusts_10m[windIndex];
      }
    }
    
    return {
      temperature,
      uvIndex,
      windDirection,
      windSpeed,
      windGusts
    };
  };
  
  // Fonction pour obtenir le symbole de direction du vent
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
  
  // Obtenir les données pour 11h00
  const data11AM = getDataAt11AM();
  
  if (weatherLoading || windLoading) {
    return <div className="p-4 text-center">Chargement des données...</div>;
  }
  
  if (weatherError || windError) {
    return (
      <div className="p-4 bg-red-100 text-red-700 mb-4 rounded-lg">
        Erreur: {weatherError || windError}
      </div>
    );
  }
  
  if (!data11AM) {
    return <div className="p-4 text-center">Données pour 11h00 non disponibles</div>;
  }
  
  return (
    <div className="bg-white shadow-md rounded-lg p-5 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center border-b pb-2">
        Bilan météorologique à 11h00
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 p-3 rounded-md">
          <h3 className="text-lg font-semibold text-blue-800">Météo</h3>
          <div className="mt-2">
            <p className="flex justify-between">
              <span className="font-medium">Température:</span>
              <span>{data11AM.temperature !== null ? `${data11AM.temperature}${tempUnit}` : "-"}</span>
            </p>
            <p className="flex justify-between mt-1">
              <span className="font-medium">Indice UV:</span>
              <span>{data11AM.uvIndex !== null ? data11AM.uvIndex.toFixed(1) : "-"}</span>
            </p>
          </div>
        </div>
        
        <div className="bg-cyan-50 p-3 rounded-md">
          <h3 className="text-lg font-semibold text-cyan-800">Vent</h3>
          <div className="mt-2">
            <p className="flex justify-between">
              <span className="font-medium">Direction:</span>
              <span>{getWindDirectionSymbol(data11AM.windDirection)}</span>
            </p>
            <p className="flex justify-between mt-1">
              <span className="font-medium">Vitesse:</span>
              <span>{data11AM.windSpeed !== null ? `${data11AM.windSpeed} nds` : "-"}</span>
            </p>
            <p className="flex justify-between mt-1">
              <span className="font-medium">Rafales:</span>
              <span>{data11AM.windGusts !== null ? `${data11AM.windGusts} nds` : "-"}</span>
            </p>
          </div>
        </div>
      </div>      
      <div className="mt-4 text-center text-sm text-gray-500">
        Données pour {location.nom}
      </div>
    </div>
  );
};

export default Bilan;
