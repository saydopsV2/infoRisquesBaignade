import React, { useEffect, useState } from 'react';
import { useWeather } from '../context/WeatherContext';
import { useWindForecast } from '../context/WindForecastContext';
import { useWaveForecast } from '../context/WaveForecastContext';
import { useBeachAttendanceData } from '../hooks/useBeachAttendanceData';
import { useRipCurrentData } from '../hooks/useRipCurrentData';
import { useShoreBreakData } from '../hooks/useShoreBreakData';
import Beach from '../interface/Beach';
import DirectionArrow from './DirectionArrow';

interface BilanProps {
  location: Beach;
}

// Interface pour les données de marées détaillées dans resultats.json
interface TideDetailData {
  type: string;
  coefficient: string;
  heure: string;
  duree: string;
  heure_maree: string;
  hauteur: string;
  marnage: string;
  un_douzieme: string;
  un_quart: string;
  demi: string;
}

// Interface pour les données de marées dans resultats.json
interface TideData {
  details_jour_actuel: TideDetailData[];
  previsions_semaine: any[]; // On peut détailler cette interface si besoin
}

const Bilan: React.FC<BilanProps> = ({ location }) => {
  // State pour les données de marées
  const [tideData, setTideData] = useState<TideDetailData | null>(null);
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

  // Récupération des données de vagues
  const {
    waveForecast,
    loading: waveLoading,
    error: waveError,
    fetchWaveForecast
  } = useWaveForecast();

  // Récupération des données de niveau de danger
  const {
    hazardLevels: attendanceHazardLevels,
    isLoading: attendanceLoading,
    error: attendanceError
  } = useBeachAttendanceData();

  const {
    hazardLevels: ripCurrentHazardLevels,
    isLoading: ripCurrentLoading,
    error: ripCurrentError
  } = useRipCurrentData();

  const {
    hazardLevels: shoreBreakHazardLevels,
    isLoading: shoreBreakLoading,
    error: shoreBreakError
  } = useShoreBreakData();

  useEffect(() => {
    // Charger les données au montage du composant
    fetchWeatherData(location);
    fetchWindForecast(location);
    fetchWaveForecast(location);
  }, [location]);

  // Fonction pour extraire les données à 11h00
  const getDataAt11AM = () => {
    if (weatherLoading || windLoading || waveLoading || attendanceLoading || ripCurrentLoading || shoreBreakLoading) return null;
    if (weatherError || windError || waveError || attendanceError || ripCurrentError || shoreBreakError) return null;

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

    // Extraire les données de vagues pour 11h00
    let waveHeight = null;
    let waveDirection = null;
    let wavePeriod = null;

    if (waveForecast?.hourly?.time) {
      const currentDate = new Date();
      const currentDay = currentDate.getDate();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const waveIndex = waveForecast.hourly.time.findIndex(timeStr => {
        const apiDate = new Date(timeStr);
        return (
          apiDate.getHours() === 11 &&
          apiDate.getDate() === currentDay &&
          apiDate.getMonth() === currentMonth &&
          apiDate.getFullYear() === currentYear
        );
      });

      if (waveIndex !== -1) {
        waveHeight = waveForecast.hourly.wave_height[waveIndex];
        waveDirection = waveForecast.hourly.wave_direction[waveIndex];
        wavePeriod = waveForecast.hourly.swell_wave_peak_period[waveIndex];
      }
    }

    // Extraire les données de niveaux de danger pour 11h00
    const currentDate = new Date();
    const currentHour11AM = new Date(currentDate);
    currentHour11AM.setHours(11, 0, 0, 0);
    
    // Calculer l'index pour 11h00 dans le tableau des heures
    const hoursSinceMidnight = Math.floor((currentHour11AM.getTime() - new Date(currentDate.setHours(0, 0, 0, 0)).getTime()) / (1000 * 60 * 60));
    
    const attendanceHazardLevel = hoursSinceMidnight < attendanceHazardLevels.length ? attendanceHazardLevels[hoursSinceMidnight] : null;
    const ripCurrentHazardLevel = hoursSinceMidnight < ripCurrentHazardLevels.length ? ripCurrentHazardLevels[hoursSinceMidnight] : null;
    const shoreBreakHazardLevel = hoursSinceMidnight < shoreBreakHazardLevels.length ? shoreBreakHazardLevels[hoursSinceMidnight] : null;

    return {
      temperature,
      uvIndex,
      windDirection,
      windSpeed,
      windGusts,
      waveHeight,
      waveDirection,
      wavePeriod,
      attendanceHazardLevel,
      ripCurrentHazardLevel,
      shoreBreakHazardLevel
    };
  };

  // Fonction pour obtenir les valeurs maximales durant l'après-midi (11h-20h)
  const getAfternoonMaxValues = () => {
    if (weatherLoading || windLoading || waveLoading || attendanceLoading || ripCurrentLoading || shoreBreakLoading) return null;
    if (weatherError || windError || waveError || attendanceError || ripCurrentError || shoreBreakError) return null;

    // Obtenir la date actuelle
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Filtrer les données pour la journée en cours entre 11h et 20h
    const afternoonIndices = hours.reduce((indices: number[], hour, index) => {
      if (
        hour.getDate() === currentDay &&
        hour.getMonth() === currentMonth &&
        hour.getFullYear() === currentYear &&
        hour.getHours() >= 11 && 
        hour.getHours() <= 20
      ) {
        indices.push(index);
      }
      return indices;
    }, []);

    if (afternoonIndices.length === 0) return null;

    // Calculer les maximums pour la météo (seulement entre 11h et 20h)
    const afternoonTemperatures = afternoonIndices.map(index => temperatures[index]);
    const afternoonUvIndices = afternoonIndices.map(index => uvIndices[index]);

    const maxTemperature = Math.max(...afternoonTemperatures.filter(t => t !== null) as number[]);
    const maxUvIndex = Math.max(...afternoonUvIndices.filter(uv => uv !== null) as number[]);

    // Calculer les maximums pour le vent (seulement entre 11h et 20h)
    let maxWindSpeed = null;
    let maxWindGusts = null;
    let directionAtMaxSpeed = null;

    if (windForecast?.hourly?.time) {
      // Filtrer les indices de temps pour aujourd'hui entre 11h et 20h
      const afternoonWindIndices = windForecast.hourly.time.reduce((indices: number[], timeStr, index) => {
        const apiDate = new Date(timeStr);
        if (
          apiDate.getDate() === currentDay &&
          apiDate.getMonth() === currentMonth &&
          apiDate.getFullYear() === currentYear &&
          apiDate.getHours() >= 11 && 
          apiDate.getHours() <= 20
        ) {
          indices.push(index);
        }
        return indices;
      }, []);

      if (afternoonWindIndices.length > 0) {
        // Extraire les vitesses du vent et rafales pour l'après-midi
        const afternoonWindSpeeds = afternoonWindIndices.map(index => windForecast.hourly.wind_speed_10m[index]);
        const afternoonWindGusts = afternoonWindIndices.map(index => windForecast.hourly.wind_gusts_10m[index]);

        // Trouver les maximums
        maxWindSpeed = Math.max(...afternoonWindSpeeds);
        maxWindGusts = Math.max(...afternoonWindGusts);

        // Trouver la direction au moment de la vitesse maximale
        const maxSpeedIndex = afternoonWindIndices[afternoonWindSpeeds.indexOf(maxWindSpeed)];
        directionAtMaxSpeed = windForecast.hourly.wind_direction_10m[maxSpeedIndex];
      }
    }

    // Calculer les maximums pour les vagues pendant l'après-midi (11h-20h)
    let maxWaveHeight = null;
    let directionAtMaxWave = null;
    let periodAtMaxWave = null;

    if (waveForecast?.hourly?.time) {
      // Filtrer les indices de temps pour aujourd'hui entre 11h et 20h
      const afternoonWaveIndices = waveForecast.hourly.time.reduce((indices: number[], timeStr, index) => {
        const apiDate = new Date(timeStr);
        if (
          apiDate.getDate() === currentDay &&
          apiDate.getMonth() === currentMonth &&
          apiDate.getFullYear() === currentYear &&
          apiDate.getHours() >= 11 && 
          apiDate.getHours() <= 20
        ) {
          indices.push(index);
        }
        return indices;
      }, []);

      if (afternoonWaveIndices.length > 0) {
        // Extraire les hauteurs de vagues pour l'après-midi
        const afternoonWaveHeights = afternoonWaveIndices.map(index => waveForecast.hourly.wave_height[index]);

        // Trouver le maximum
        maxWaveHeight = Math.max(...afternoonWaveHeights);

        // Trouver la direction et la période au moment de la hauteur maximale
        const maxHeightIndex = afternoonWaveIndices[afternoonWaveHeights.indexOf(maxWaveHeight)];
        directionAtMaxWave = waveForecast.hourly.wave_direction[maxHeightIndex];
        periodAtMaxWave = waveForecast.hourly.swell_wave_peak_period[maxHeightIndex];
      }
    }

    // Calculer les maximums pour les niveaux de danger entre 11h et 20h
    // Utiliser la date actuelle déjà déclarée plutôt qu'en créer une nouvelle
    // const currentDate = new Date(); - Supprimé cette ligne qui cause l'erreur
    // Réinitialiser l'heure à minuit sans redéclarer la variable
    const midnightDate = new Date(currentDate);
    midnightDate.setHours(0, 0, 0, 0);
    
    // Index pour 11h00 et 20h00
    const startIndex = 11;
    const endIndex = 20;
    
    // Extraire les valeurs de niveau de danger pour l'intervalle 11h-20h
    const afternoonAttendanceHazardLevels = attendanceHazardLevels.slice(startIndex, endIndex + 1);
    const afternoonRipCurrentHazardLevels = ripCurrentHazardLevels.slice(startIndex, endIndex + 1);
    const afternoonShoreBreakHazardLevels = shoreBreakHazardLevels.slice(startIndex, endIndex + 1);
    
    // Calculer les maximums
    const maxAttendanceHazardLevel = Math.max(...afternoonAttendanceHazardLevels.filter(level => level !== null && level !== undefined));
    const maxRipCurrentHazardLevel = Math.max(...afternoonRipCurrentHazardLevels.filter(level => level !== null && level !== undefined));
    const maxShoreBreakHazardLevel = Math.max(...afternoonShoreBreakHazardLevels.filter(level => level !== null && level !== undefined));

    return {
      maxTemperature: isNaN(maxTemperature) ? null : maxTemperature,
      maxUvIndex: isNaN(maxUvIndex) ? null : maxUvIndex,
      maxWindSpeed,
      maxWindGusts,
      directionAtMaxSpeed,
      maxWaveHeight,
      directionAtMaxWave,
      periodAtMaxWave,
      maxAttendanceHazardLevel: isNaN(maxAttendanceHazardLevel) ? null : maxAttendanceHazardLevel,
      maxRipCurrentHazardLevel: isNaN(maxRipCurrentHazardLevel) ? null : maxRipCurrentHazardLevel,
      maxShoreBreakHazardLevel: isNaN(maxShoreBreakHazardLevel) ? null : maxShoreBreakHazardLevel
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

        const data: TideData[] = await response.json();

        // Récupérer les détails du jour actuel
        if (Array.isArray(data) && data.length > 0 && data[0].details_jour_actuel && data[0].details_jour_actuel.length > 0) {
          setTideData(data[0].details_jour_actuel[0]);
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

  // Fonction pour extraire les types de marées (BM/PM)
  const extractTideTypes = (typeString: string): string[] => {
    const types: string[] = [];
    for (let i = 0; i < typeString.length; i += 2) {
      if (i + 2 <= typeString.length) {
        const type = typeString.substring(i, i + 2);
        types.push(type);
      }
    }
    return types;
  };

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

  // Obtenir les données pour 11h00
  const data11AM = getDataAt11AM();

  // Obtenir les valeurs maximales de l'après-midi
  const maxValues = getAfternoonMaxValues();

  if (weatherLoading || windLoading || waveLoading || isTideLoading || attendanceLoading || ripCurrentLoading || shoreBreakLoading) {
    return <div className="p-4 text-center">Chargement des données...</div>;
  }

  if (weatherError || windError || waveError || tideError || attendanceError || ripCurrentError || shoreBreakError) {
    return (
      <div className="p-4 bg-red-100 text-red-700 mb-4 rounded-lg">
        Erreur: {weatherError || windError || waveError || tideError || attendanceError || ripCurrentError || shoreBreakError}
      </div>
    );
  }

  if (!data11AM) {
    return <div className="p-4 text-center">Données pour 11h00 non disponibles</div>;
  }

  // Formater les données de marées pour l'affichage
  const tideTypes = tideData?.type ? extractTideTypes(tideData.type) : [];
  const tideHours = tideData?.heure ? formatTideHours(tideData.heure) : [];
  const tideHeights = tideData?.hauteur ? formatTideHeights(tideData.hauteur) : [];

  // Fonction pour obtenir la couleur basée sur le niveau de danger
  const getHazardLevelColor = (level: number | null): string => {
    if (level === null) return "text-gray-500";
    if (level === 0) return "text-green-600"; // Vert foncé - Sécurité optimale
    if (level === 1) return "text-green-400"; // Vert clair - Faible risque
    if (level === 2) return "text-yellow-500"; // Jaune - Risque modéré
    if (level === 3) return "text-orange-500"; // Orange - Risque élevé
    if (level >= 4) return "text-red-600"; // Rouge - Danger important
    return "text-gray-500"; // Couleur par défaut
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 sm:p-5 w-full max-w-6xl mx-auto">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center border-b pb-2">
        Bilan météorologique à 11h00
      </h2>

      <div className="flex flex-wrap justify-between gap-4">
        {/* Div pour les niveaux de risque */}
        <div id="hazards" className="bg-rose-50 p-3 rounded-md border border-gray-300 flex-grow basis-0 min-w-[250px]">
          <h3 className="text-base sm:text-lg font-semibold text-rose-800">Niveaux de Risque</h3>
          <div className="mt-2">
            <p className="flex justify-between text-sm sm:text-base">
              <span className="font-medium">Fréquentation:</span>
              <span className={getHazardLevelColor(data11AM.attendanceHazardLevel)}>
                {data11AM.attendanceHazardLevel !== null ? data11AM.attendanceHazardLevel : "-"}
              </span>
            </p>
            <p className="flex justify-between mt-1 text-sm sm:text-base">
              <span className="font-medium">Courant de Baïne:</span>
              <span className={getHazardLevelColor(data11AM.ripCurrentHazardLevel)}>
                {data11AM.ripCurrentHazardLevel !== null ? data11AM.ripCurrentHazardLevel : "-"}
              </span>
            </p>
            <p className="flex justify-between mt-1 text-sm sm:text-base">
              <span className="font-medium">Shore Break:</span>
              <span className={getHazardLevelColor(data11AM.shoreBreakHazardLevel)}>
                {data11AM.shoreBreakHazardLevel !== null ? data11AM.shoreBreakHazardLevel : "-"}
              </span>
            </p>
            {maxValues && (
              <>
                <div className="mt-2 pt-2 border-t border-rose-200">
                  <p className="text-md text-sky-700 font-medium mb-1">Maximum entre 11h et 20h:</p>
                  <p className="flex justify-between mt-1 text-sm sm:text-base text-red-700">
                    <span className="font-medium">Fréquentation max:</span>
                    <span>
                      {maxValues.maxAttendanceHazardLevel !== null ? maxValues.maxAttendanceHazardLevel : "-"}
                    </span>
                  </p>
                  <p className="flex justify-between mt-1 text-sm sm:text-base text-red-700">
                    <span className="font-medium">Courant max:</span>
                    <span>
                      {maxValues.maxRipCurrentHazardLevel !== null ? maxValues.maxRipCurrentHazardLevel : "-"}
                    </span>
                  </p>
                  <p className="flex justify-between mt-1 text-sm sm:text-base text-red-700">
                    <span className="font-medium">Shore Break max:</span>
                    <span>
                      {maxValues.maxShoreBreakHazardLevel !== null ? maxValues.maxShoreBreakHazardLevel : "-"}
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Div pour la météo */}
        <div id="weather" className="bg-sky-50 p-3 rounded-md border border-gray-300 flex-grow basis-0 min-w-[250px]">
          <h3 className="text-base sm:text-lg font-semibold text-sky-800">Météo</h3>
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
                <div className="mt-2 pt-2 border-t border-sky-200">
                  <p className="text-md text-sky-700 font-medium mb-1">Maximum entre 11h et 20h:</p>
                  <p className="flex justify-between mt-1 text-sm sm:text-base text-red-700">
                    <span className="font-medium">Temp. max:</span>
                    <span>{maxValues.maxTemperature !== null ? `${maxValues.maxTemperature}${tempUnit}` : "-"}</span>
                  </p>
                  <p className="flex justify-between mt-1 text-sm sm:text-base text-red-700">
                    <span className="font-medium">UV max:</span>
                    <span>{maxValues.maxUvIndex !== null ? maxValues.maxUvIndex.toFixed(1) : "-"}</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Div pour le vent */}
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
                <div className="mt-2 pt-2 border-t border-cyan-200">
                  <p className="text-md text-sky-800 font-medium mb-1">Maximum entre 11h et 20h:</p>
                  <p className="flex justify-between items-center mt-1 text-sm sm:text-base text-red-700">
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
                </div>
              </>
            )}
          </div>
        </div>

        {/* Div pour les vagues */}
        <div id="waves" className="bg-sky-50 p-3 rounded-md border border-gray-300 flex-grow basis-0 min-w-[250px]">
          <h3 className="text-base sm:text-lg font-semibold text-sky-800">Vagues</h3>
          <div className="mt-2">
            <p className="flex justify-between items-center text-sm sm:text-base">
              <span className="font-medium">Direction:</span>
              <DirectionArrow
                direction={data11AM.waveDirection}
                size={24}
                color="#4f46e5"
                showLabel={true}
              />
            </p>
            <p className="flex justify-between mt-1 text-sm sm:text-base">
              <span className="font-medium">Hauteur:</span>
              <span>{data11AM.waveHeight !== null ? `${data11AM.waveHeight.toFixed(1)} m` : "-"}</span>
            </p>
            <p className="flex justify-between mt-1 text-sm sm:text-base">
              <span className="font-medium">Période:</span>
              <span>{data11AM.wavePeriod !== null ? `${data11AM.wavePeriod.toFixed(1)} s` : "-"}</span>
            </p>
            {maxValues && (
              <>
                <div className="mt-2 pt-2 border-t border-sky-200">
                  <p className="text-md text-sky-700 font-medium mb-1">Maximum entre 11h et 20h:</p>
                  <p className="flex justify-between items-center mt-1 text-sm sm:text-base text-red-700">
                    <span className="font-medium">Direction:</span>
                    <DirectionArrow
                      direction={maxValues.directionAtMaxWave}
                      size={24}
                      color="#dc2626"
                      showLabel={true}
                    />
                  </p>
                  <p className="flex justify-between mt-1 text-sm sm:text-base text-red-700">
                    <span className="font-medium">Hauteur max:</span>
                    <span>{maxValues.maxWaveHeight !== null ? `${maxValues.maxWaveHeight.toFixed(1)} m` : "-"}</span>
                  </p>
                  <p className="flex justify-between mt-1 text-sm sm:text-base text-red-700">
                    <span className="font-medium">Période:</span>
                    <span>{maxValues.periodAtMaxWave !== null ? `${maxValues.periodAtMaxWave.toFixed(1)} s` : "-"}</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Affichage des données de marées */}
        {tideData && (
          <div id="tide" className="bg-teal-50 p-3 rounded-md border border-gray-300 flex-grow basis-0 min-w-[250px]">
            <h3 className="text-base sm:text-lg font-semibold text-teal-800">Marées aujourd'hui</h3>

            <div className="mt-2">
              <p className="flex justify-start text-sm sm:text-base">
                <span className="font-bold mx-2">Coefficient:</span>
                <span>{tideData.coefficient}</span>
              </p>

              {/* Tableau des marées */}
              <div className="mt-2 sm:mt-3 overflow-x-auto">
                <table className="min-w-full bg-white rounded-md">
                  <thead>
                    <tr className="bg-teal-100">
                      <th className="py-1 sm:py-2 px-2 sm:px-3 text-left text-md sm:text-sm font-medium text-teal-800">Type</th>
                      <th className="py-1 sm:py-2 px-2 sm:px-3 text-left text-md sm:text-sm font-medium text-teal-800">Heure</th>
                      <th className="py-1 sm:py-2 px-2 sm:px-3 text-left text-md sm:text-sm font-medium text-teal-800">Hauteur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tideTypes.map((type, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-teal-50' : 'bg-white'}>
                        <td className="py-1 sm:py-2 px-2 sm:px-3 text-md sm:text-sm">{type}</td>
                        <td className="py-1 sm:py-2 px-2 sm:px-3 text-md sm:text-sm">{tideHours[index] || '-'}</td>
                        <td className="py-1 sm:py-2 px-2 sm:px-3 text-md sm:text-sm">{tideHeights[index] || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              
            </div>
          </div>
        )}

        
      </div>

      <div className="mt-3 sm:mt-4 text-center text-md sm:text-sm text-gray-500">
        Données pour {location.nom}
      </div>
    </div>
  );
};

export default Bilan;