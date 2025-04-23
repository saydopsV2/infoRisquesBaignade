import React, { useEffect, useState } from 'react';
import { useWeather } from '../context/WeatherContext';
import { useWindForecast } from '../context/WindForecastContext';
import Beach from '../interface/Beach';
import DirectionArrow from './DirectionArrow';

interface BilanProps {
  location: Beach;
}

// Interface pour les données de marées dans resultats.json
interface TideData {
  marée: string;
  coefficient: string;
  heures: string;
  durée: string;
  heure_marée: string;
  hauteur: string;
  marnage: string;
  un_douzieme: string;
  un_quart: string;
  demi: string;
}

const Bilan: React.FC<BilanProps> = ({ location }) => {
  // State pour les données de marées
  const [tideData, setTideData] = useState<TideData | null>(null);
  const [isTideLoading, setIsTideLoading] = useState<boolean>(false);
  const [tideError, setTideError] = useState<string | null>(null);

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

  // Fonction pour extraire les valeurs maximales de la journée
  const getDailyMaxValues = () => {
    if (weatherLoading || windLoading) return null;
    if (weatherError || windError) return null;
    
    // Obtenir la date actuelle
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Filtrer les données pour la journée en cours
    const todayIndices = hours.reduce((indices: number[], hour, index) => {
      if (
        hour.getDate() === currentDay &&
        hour.getMonth() === currentMonth &&
        hour.getFullYear() === currentYear
      ) {
        indices.push(index);
      }
      return indices;
    }, []);
    
    if (todayIndices.length === 0) return null;
    
    // Calculer les maximums pour la météo
    const todayTemperatures = todayIndices.map(index => temperatures[index]);
    const todayUvIndices = todayIndices.map(index => uvIndices[index]);
    
    const maxTemperature = Math.max(...todayTemperatures.filter(t => t !== null) as number[]);
    const maxUvIndex = Math.max(...todayUvIndices.filter(uv => uv !== null) as number[]);
    
    // Calculer les maximums pour le vent
    let maxWindSpeed = null;
    let maxWindGusts = null;
    let directionAtMaxSpeed = null;
    
    if (windForecast?.hourly?.time) {
      // Filtrer les indices de temps pour aujourd'hui
      const todayWindIndices = windForecast.hourly.time.reduce((indices: number[], timeStr, index) => {
        const apiDate = new Date(timeStr);
        if (
          apiDate.getDate() === currentDay &&
          apiDate.getMonth() === currentMonth &&
          apiDate.getFullYear() === currentYear
        ) {
          indices.push(index);
        }
        return indices;
      }, []);
      
      if (todayWindIndices.length > 0) {
        // Extraire les vitesses du vent et rafales pour aujourd'hui
        const todayWindSpeeds = todayWindIndices.map(index => windForecast.hourly.wind_speed_10m[index]);
        const todayWindGusts = todayWindIndices.map(index => windForecast.hourly.wind_gusts_10m[index]);
        
        // Trouver les maximums
        maxWindSpeed = Math.max(...todayWindSpeeds);
        maxWindGusts = Math.max(...todayWindGusts);
        
        // Trouver la direction au moment de la vitesse maximale
        const maxSpeedIndex = todayWindIndices[todayWindSpeeds.indexOf(maxWindSpeed)];
        directionAtMaxSpeed = windForecast.hourly.wind_direction_10m[maxSpeedIndex];
      }
    }
    
    return {
      maxTemperature: isNaN(maxTemperature) ? null : maxTemperature,
      maxUvIndex: isNaN(maxUvIndex) ? null : maxUvIndex,
      maxWindSpeed,
      maxWindGusts,
      directionAtMaxSpeed
    };
  };
  
  // Charger les données de marées
  useEffect(() => {
    const fetchTideData = async () => {
      try {
        setIsTideLoading(true);
        const response = await fetch(`${import.meta.env.BASE_URL}dataModel/result_scraper_tide.json`);
        
        if (!response.ok) {
          throw new Error(`Erreur de chargement: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Prendre la première entrée du tableau (les données de marées semblent être générales)
        if (Array.isArray(data) && data.length > 0) {
          setTideData(data[0]);
        } else {
          setTideData(null);
        }
        
        setIsTideLoading(false);
      } catch (error) {
        setTideError(error instanceof Error ? error.message : 'Erreur inconnue');
        setIsTideLoading(false);
      }
    };
    
    fetchTideData();
  }, []);

  // Fonction pour formater les heures de marées
  const formatTideHours = (hoursString: string): string[] => {
    const result: string[] = [];
    for (let i = 0; i < hoursString.length; i += 5) {
      if (i + 5 <= hoursString.length) {
        result.push(hoursString.substring(i, i + 5));
      }
    }
    return result;
  };

  // Fonction pour formater les hauteurs de marées
  const formatTideHeights = (heightsString: string): string[] => {
    const result: string[] = [];
    for (let i = 0; i < heightsString.length; i += 5) {
      if (i + 5 <= heightsString.length) {
        result.push(heightsString.substring(i, i + 5));
      }
    }
    return result;
  };
  
  // Fonction pour formater le marnage avec des espaces
  const formatMarnage = (marnageString: string): string => {
    // Ajouter des espaces entre les valeurs
    return marnageString.replace(/(\d,\d+m)(?=\d)/g, '$1 ');
  };
  
  // Fonction pour formater la durée avec des espaces
  const formatDuree = (dureeString: string): string => {
    // Découper la chaîne tous les 5 caractères (format "06h07")
    const result: string[] = [];
    for (let i = 0; i < dureeString.length; i += 5) {
      if (i + 5 <= dureeString.length) {
        result.push(dureeString.substring(i, i + 5));
      }
    }
    // Joindre avec des espaces
    return result.join(' ');
  };
  
  // Obtenir les données pour 11h00
  const data11AM = getDataAt11AM();
  
  // Obtenir les valeurs maximales de la journée
  const maxValues = getDailyMaxValues();
  
  if (weatherLoading || windLoading || isTideLoading) {
    return <div className="p-4 text-center">Chargement des données...</div>;
  }
  
  if (weatherError || windError || tideError) {
    return (
      <div className="p-4 bg-red-100 text-red-700 mb-4 rounded-lg">
        Erreur: {weatherError || windError || tideError}
      </div>
    );
  }
  
  if (!data11AM) {
    return <div className="p-4 text-center">Données pour 11h00 non disponibles</div>;
  }

  // Formater les données de marées pour l'affichage
  const tideTypes = tideData?.marée ? ['BM', 'PM', 'BM', 'PM'] : [];
  const tideHours = tideData?.heures ? formatTideHours(tideData.heures) : [];
  const tideHeights = tideData?.hauteur ? formatTideHeights(tideData.hauteur) : [];
  const formattedMarnage = tideData?.marnage ? formatMarnage(tideData.marnage) : '';
  const formattedDuree = tideData?.durée ? formatDuree(tideData.durée) : '';
  
  return (
    <div className="bg-white shadow-md rounded-lg p-4 sm:p-5 w-full max-w-6xl mx-auto">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center border-b pb-2">
        Bilan météorologique à 11h00
      </h2>
      
      <div className="flex flex-wrap justify-between gap-4">
        <div id="weather" className="bg-blue-50 p-3 rounded-md border border-gray-300 flex-grow basis-0 min-w-[250px]">
          <h3 className="text-base sm:text-lg font-semibold text-blue-800">Météo</h3>
          <div className="mt-2">
            <p className="flex justify-between text-sm sm:text-base">
              <span className="font-medium">Température:</span>
              <span>{data11AM.temperature !== null ? `${data11AM.temperature}${tempUnit}` : "-"}</span>
            </p>
            <p className="flex justify-between mt-1 text-sm sm:text-base">
              <span className="font-medium">Indice UV:</span>
              <span>{data11AM.uvIndex !== null ? data11AM.uvIndex.toFixed(1) : "-"}</span>
            </p>
            {maxValues && (
              <>
                <p className="flex justify-between mt-2 text-sm sm:text-base text-red-700">
                  <span className="font-medium">Temp. max:</span>
                  <span>{maxValues.maxTemperature !== null ? `${maxValues.maxTemperature}${tempUnit}` : "-"}</span>
                </p>
                <p className="flex justify-between mt-1 text-sm sm:text-base text-red-700">
                  <span className="font-medium">UV max:</span>
                  <span>{maxValues.maxUvIndex !== null ? maxValues.maxUvIndex.toFixed(1) : "-"}</span>
                </p>
              </>
            )}
          </div>
        </div>
        
        <div id="wind" className="bg-cyan-50 p-3 rounded-md border border-gray-300 flex-grow basis-0 min-w-[250px]">
          <h3 className="text-base sm:text-lg font-semibold text-cyan-800">Vent</h3>
          <div className="mt-2">
            <p className="flex justify-between items-center text-sm sm:text-base">
              <span className="font-medium">Direction:</span>
              <DirectionArrow 
                direction={data11AM.windDirection} 
                size={24} 
                color="#2563eb" 
                showLabel={true}
              />
            </p>
            <p className="flex justify-between mt-1 text-sm sm:text-base">
              <span className="font-medium">Vitesse:</span>
              <span>{data11AM.windSpeed !== null ? `${data11AM.windSpeed} nds` : "-"}</span>
            </p>
            <p className="flex justify-between mt-1 text-sm sm:text-base">
              <span className="font-medium">Rafales:</span>
              <span>{data11AM.windGusts !== null ? `${data11AM.windGusts} nds` : "-"}</span>
            </p>
            {maxValues && (
              <>
                <p className="flex justify-between items-center mt-2 text-sm sm:text-base text-red-700">
                  <span className="font-medium">Direction:</span>
                  <DirectionArrow 
                    direction={maxValues.directionAtMaxSpeed} 
                    size={24} 
                    color="#dc2626" 
                    showLabel={true}
                  />
                </p>
                <p className="flex justify-between mt-1 text-sm sm:text-base text-red-700">
                  <span className="font-medium">Vitesse max:</span>
                  <span>{maxValues.maxWindSpeed !== null ? `${maxValues.maxWindSpeed} nds` : "-"}</span>
                </p>
                <p className="flex justify-between mt-1 text-sm sm:text-base text-red-700">
                  <span className="font-medium">Rafales max:</span>
                  <span>{maxValues.maxWindGusts !== null ? `${maxValues.maxWindGusts} nds` : "-"}</span>
                </p>
              </>
            )}
          </div>
        </div>
        
        {/* Affichage des données de marées */}
        {tideData && (
          <div id="tide" className="bg-sky-50 p-3 rounded-md border border-gray-300 flex-grow basis-0 min-w-[250px]">
            <h3 className="text-base sm:text-lg font-semibold text-sky-800">Marées aujourd'hui</h3>
            
            <div className="mt-2">
              <p className="flex justify-between text-sm sm:text-base">
                <span className="font-medium">Coefficient:</span>
                <span>{tideData.coefficient}</span>
              </p>
              
              {/* Tableau des marées */}
              <div className="mt-2 sm:mt-3 overflow-x-auto">
                <table className="min-w-full bg-white rounded-md">
                  <thead>
                    <tr className="bg-sky-100">
                      <th className="py-1 sm:py-2 px-2 sm:px-3 text-left text-xs sm:text-sm font-medium text-sky-800">Type</th>
                      <th className="py-1 sm:py-2 px-2 sm:px-3 text-left text-xs sm:text-sm font-medium text-sky-800">Heure</th>
                      <th className="py-1 sm:py-2 px-2 sm:px-3 text-left text-xs sm:text-sm font-medium text-sky-800">Hauteur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tideTypes.map((type, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-sky-50' : 'bg-white'}>
                        <td className="py-1 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm">{type}</td>
                        <td className="py-1 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm">{tideHours[index] || '-'}</td>
                        <td className="py-1 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm">{tideHeights[index] || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-2 sm:mt-3">
                <p className="flex justify-between mt-1 text-xs sm:text-sm">
                  <span className="font-medium">Marnage:</span>
                  <span>{formattedMarnage}</span>
                </p>
                <p className="flex justify-between mt-1 text-xs sm:text-sm">
                  <span className="font-medium">Durée:</span>
                  <span>{formattedDuree}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-500">
        Données pour {location.nom}
      </div>
    </div>
  );
};

export default Bilan;