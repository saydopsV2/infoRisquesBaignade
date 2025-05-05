import React, { useEffect, useState } from 'react';
import { useWeather } from '../context/WeatherContext';
import { useWindForecast } from '../context/WindForecastContext';
import { useWaveForecast } from '../context/WaveForecastContext';
import { useBeachAttendanceData } from '../hooks/useBeachAttendanceData';
import { useRipCurrentData } from '../hooks/useRipCurrentData';
import { useShoreBreakData } from '../hooks/useShoreBreakData';
import { BilanProps, TideDetailData } from '../interfaces/BilanTypes';
import { extractTideTypes, formatTideHeights, formatTideHours } from './bilan/BilanUtils';

// Import des composants
import HazardSection from './bilan/HazardSection';
import WeatherSection from './bilan/WeatherSection';
import WindSection from './bilan/WindSection';
import WaveSection from './bilan/WaveSection';
import TideSection from './bilan/TideSection';

const Bilan: React.FC<BilanProps> = ({ location }) => {
  // State pour les données de marées
  const [tideData, setTideData] = useState<TideDetailData | null>(null);
  const [isTideLoading, setIsTideLoading] = useState<boolean>(false);
  const [tideError, setTideError] = useState<string | null>(null);
  const [waterTemperature, setWaterTemperature] = useState<string | null>(null);

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
        wavePeriod = waveForecast.hourly.wave_period[waveIndex];
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

  // Fonction pour obtenir les valeurs maximales et minimales durant l'après-midi (11h-20h)
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

    // Calculer les maximums et minimums pour la météo (seulement entre 11h et 20h)
    const afternoonTemperatures = afternoonIndices.map(index => temperatures[index]);
    const afternoonUvIndices = afternoonIndices.map(index => uvIndices[index]);

    // Filtrer les valeurs nulles avant de chercher min et max
    const validTemperatures = afternoonTemperatures.filter(t => t !== null) as number[];
    const validUvIndices = afternoonUvIndices.filter(uv => uv !== null) as number[];

    const maxTemperature = validTemperatures.length > 0 ? Math.max(...validTemperatures) : null;
    const minTemperature = validTemperatures.length > 0 ? Math.min(...validTemperatures) : null;
    const maxUvIndex = validUvIndices.length > 0 ? Math.max(...validUvIndices) : null;
    const minUvIndex = validUvIndices.length > 0 ? Math.min(...validUvIndices) : null;

    // Trouver l'heure du maximum pour la température
    const tempMaxIndex = maxTemperature !== null ? afternoonTemperatures.indexOf(maxTemperature) : -1;
    const tempMaxHour = tempMaxIndex !== -1 ? hours[afternoonIndices[tempMaxIndex]].getHours() : null;

    // Trouver l'heure du minimum pour la température
    const tempMinIndex = minTemperature !== null ? afternoonTemperatures.indexOf(minTemperature) : -1;
    const tempMinHour = tempMinIndex !== -1 ? hours[afternoonIndices[tempMinIndex]].getHours() : null;

    // Trouver l'heure du maximum pour l'indice UV
    const uvMaxIndex = maxUvIndex !== null ? afternoonUvIndices.indexOf(maxUvIndex) : -1;
    const uvMaxHour = uvMaxIndex !== -1 ? hours[afternoonIndices[uvMaxIndex]].getHours() : null;

    // Trouver l'heure du minimum pour l'indice UV
    const uvMinIndex = minUvIndex !== null ? afternoonUvIndices.indexOf(minUvIndex) : -1;
    const uvMinHour = uvMinIndex !== -1 ? hours[afternoonIndices[uvMinIndex]].getHours() : null;

    // Calculer les maximums et minimums pour le vent (seulement entre 11h et 20h)
    let maxWindSpeed = null;
    let minWindSpeed = null;
    let maxWindGusts = null;
    let minWindGusts = null;
    let directionAtMaxSpeed = null;
    let directionAtMinSpeed = null;
    let maxWindSpeedHour = null;
    let minWindSpeedHour = null;
    let maxWindGustsHour = null;
    let minWindGustsHour = null;

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

        // S'assurer qu'il n'y a pas de valeurs nulles
        const validWindSpeeds = afternoonWindSpeeds.filter(speed => speed !== null && speed !== undefined) as number[];
        const validWindGusts = afternoonWindGusts.filter(gust => gust !== null && gust !== undefined) as number[];

        // Trouver les maximums et minimums
        maxWindSpeed = validWindSpeeds.length > 0 ? Math.max(...validWindSpeeds) : null;
        minWindSpeed = validWindSpeeds.length > 0 ? Math.min(...validWindSpeeds) : null;
        maxWindGusts = validWindGusts.length > 0 ? Math.max(...validWindGusts) : null;
        minWindGusts = validWindGusts.length > 0 ? Math.min(...validWindGusts) : null;

        // Trouver la direction et l'heure au moment de la vitesse maximale
        const maxSpeedIndex = maxWindSpeed !== null ? afternoonWindSpeeds.indexOf(maxWindSpeed) : -1;
        if (maxSpeedIndex !== -1) {
          const maxWindIndex = afternoonWindIndices[maxSpeedIndex];
          directionAtMaxSpeed = windForecast.hourly.wind_direction_10m[maxWindIndex];
          // Récupérer l'heure du maximum
          const maxWindTime = new Date(windForecast.hourly.time[maxWindIndex]);
          maxWindSpeedHour = maxWindTime.getHours();
        }

        // Trouver la direction et l'heure au moment de la vitesse minimale
        const minSpeedIndex = minWindSpeed !== null ? afternoonWindSpeeds.indexOf(minWindSpeed) : -1;
        if (minSpeedIndex !== -1) {
          const minWindIndex = afternoonWindIndices[minSpeedIndex];
          directionAtMinSpeed = windForecast.hourly.wind_direction_10m[minWindIndex];
          // Récupérer l'heure du minimum
          const minWindTime = new Date(windForecast.hourly.time[minWindIndex]);
          minWindSpeedHour = minWindTime.getHours();
        }

        // Trouver l'heure des rafales maximales
        const maxGustsIndex = maxWindGusts !== null ? afternoonWindGusts.indexOf(maxWindGusts) : -1;
        if (maxGustsIndex !== -1) {
          const maxGustsWindIndex = afternoonWindIndices[maxGustsIndex];
          const maxGustsTime = new Date(windForecast.hourly.time[maxGustsWindIndex]);
          maxWindGustsHour = maxGustsTime.getHours();
        }

        // Trouver l'heure des rafales minimales
        const minGustsIndex = minWindGusts !== null ? afternoonWindGusts.indexOf(minWindGusts) : -1;
        if (minGustsIndex !== -1) {
          const minGustsWindIndex = afternoonWindIndices[minGustsIndex];
          const minGustsTime = new Date(windForecast.hourly.time[minGustsWindIndex]);
          minWindGustsHour = minGustsTime.getHours();
        }
      }
    }

    // Calculer les maximums et minimums pour les vagues pendant l'après-midi (11h-20h)
    let maxWaveHeight = null;
    let minWaveHeight = null;
    let directionAtMaxWave = null;
    let directionAtMinWave = null;
    let periodAtMaxWave = null;
    let periodAtMinWave = null;
    let maxWaveHeightHour = null;
    let minWaveHeightHour = null;

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

        // S'assurer qu'il n'y a pas de valeurs nulles
        const validWaveHeights = afternoonWaveHeights.filter(height => height !== null && height !== undefined) as number[];

        // Trouver le maximum et le minimum
        maxWaveHeight = validWaveHeights.length > 0 ? Math.max(...validWaveHeights) : null;
        minWaveHeight = validWaveHeights.length > 0 ? Math.min(...validWaveHeights) : null;

        // Trouver la direction et la période au moment de la hauteur maximale
        const maxHeightIndex = maxWaveHeight !== null ? afternoonWaveHeights.indexOf(maxWaveHeight) : -1;
        if (maxHeightIndex !== -1) {
          const maxWaveIndex = afternoonWaveIndices[maxHeightIndex];
          directionAtMaxWave = waveForecast.hourly.wave_direction[maxWaveIndex];
          periodAtMaxWave = waveForecast.hourly.wave_period[maxWaveIndex];
          // Récupérer l'heure du maximum
          const maxWaveTime = new Date(waveForecast.hourly.time[maxWaveIndex]);
          maxWaveHeightHour = maxWaveTime.getHours();
        }

        // Trouver la direction et la période au moment de la hauteur minimale
        const minHeightIndex = minWaveHeight !== null ? afternoonWaveHeights.indexOf(minWaveHeight) : -1;
        if (minHeightIndex !== -1) {
          const minWaveIndex = afternoonWaveIndices[minHeightIndex];
          directionAtMinWave = waveForecast.hourly.wave_direction[minWaveIndex];
          periodAtMinWave = waveForecast.hourly.wave_period[minWaveIndex];
          // Récupérer l'heure du minimum
          const minWaveTime = new Date(waveForecast.hourly.time[minWaveIndex]);
          minWaveHeightHour = minWaveTime.getHours();
        }
      }
    }

    // Calculer les maximums pour les niveaux de danger entre 11h et 20h
    // Utiliser la date actuelle déjà déclarée plutôt qu'en créer une nouvelle
    const midnightDate = new Date(currentDate);
    midnightDate.setHours(0, 0, 0, 0);

    // Index pour 11h00 et 20h00
    const startIndex = 11;
    const endIndex = 20;

    // Extraire les valeurs de niveau de danger pour l'intervalle 11h-20h
    const afternoonAttendanceHazardLevels = attendanceHazardLevels.slice(startIndex, endIndex + 1);
    const afternoonRipCurrentHazardLevels = ripCurrentHazardLevels.slice(startIndex, endIndex + 1);
    const afternoonShoreBreakHazardLevels = shoreBreakHazardLevels.slice(startIndex, endIndex + 1);

    // Filtrer les valeurs nulles ou undefined
    const validAttendanceHazardLevels = afternoonAttendanceHazardLevels.filter(level => level !== null && level !== undefined) as number[];
    const validRipCurrentHazardLevels = afternoonRipCurrentHazardLevels.filter(level => level !== null && level !== undefined) as number[];
    const validShoreBreakHazardLevels = afternoonShoreBreakHazardLevels.filter(level => level !== null && level !== undefined) as number[];

    // Calculer les maximums et minimums
    const maxAttendanceHazardLevel = validAttendanceHazardLevels.length > 0 ? Math.max(...validAttendanceHazardLevels) : null;
    const minAttendanceHazardLevel = validAttendanceHazardLevels.length > 0 ? Math.min(...validAttendanceHazardLevels) : null;
    const maxRipCurrentHazardLevel = validRipCurrentHazardLevels.length > 0 ? Math.max(...validRipCurrentHazardLevels) : null;
    const minRipCurrentHazardLevel = validRipCurrentHazardLevels.length > 0 ? Math.min(...validRipCurrentHazardLevels) : null;
    const maxShoreBreakHazardLevel = validShoreBreakHazardLevels.length > 0 ? Math.max(...validShoreBreakHazardLevels) : null;
    const minShoreBreakHazardLevel = validShoreBreakHazardLevels.length > 0 ? Math.min(...validShoreBreakHazardLevels) : null;

    // Trouver les heures correspondant aux maximums et minimums
    const maxAttendanceHazardHour = maxAttendanceHazardLevel !== null && afternoonAttendanceHazardLevels.indexOf(maxAttendanceHazardLevel) !== -1 ?
      startIndex + afternoonAttendanceHazardLevels.indexOf(maxAttendanceHazardLevel) : null;
    const minAttendanceHazardHour = minAttendanceHazardLevel !== null && afternoonAttendanceHazardLevels.indexOf(minAttendanceHazardLevel) !== -1 ?
      startIndex + afternoonAttendanceHazardLevels.indexOf(minAttendanceHazardLevel) : null;
    const maxRipCurrentHazardHour = maxRipCurrentHazardLevel !== null && afternoonRipCurrentHazardLevels.indexOf(maxRipCurrentHazardLevel) !== -1 ?
      startIndex + afternoonRipCurrentHazardLevels.indexOf(maxRipCurrentHazardLevel) : null;
    const minRipCurrentHazardHour = minRipCurrentHazardLevel !== null && afternoonRipCurrentHazardLevels.indexOf(minRipCurrentHazardLevel) !== -1 ?
      startIndex + afternoonRipCurrentHazardLevels.indexOf(minRipCurrentHazardLevel) : null;
    const maxShoreBreakHazardHour = maxShoreBreakHazardLevel !== null && afternoonShoreBreakHazardLevels.indexOf(maxShoreBreakHazardLevel) !== -1 ?
      startIndex + afternoonShoreBreakHazardLevels.indexOf(maxShoreBreakHazardLevel) : null;
    const minShoreBreakHazardHour = minShoreBreakHazardLevel !== null && afternoonShoreBreakHazardLevels.indexOf(minShoreBreakHazardLevel) !== -1 ?
      startIndex + afternoonShoreBreakHazardLevels.indexOf(minShoreBreakHazardLevel) : null;

    return {
      // Maximums
      maxTemperature,
      maxUvIndex,
      maxWindSpeed,
      maxWindGusts,
      directionAtMaxSpeed,
      maxWaveHeight,
      directionAtMaxWave,
      periodAtMaxWave,
      maxAttendanceHazardLevel,
      maxRipCurrentHazardLevel,
      maxShoreBreakHazardLevel,

      // Minimums
      minTemperature,
      minUvIndex,
      minWindSpeed,
      minWindGusts,
      directionAtMinSpeed,
      minWaveHeight,
      directionAtMinWave,
      periodAtMinWave,
      minAttendanceHazardLevel,
      minRipCurrentHazardLevel,
      minShoreBreakHazardLevel,

      // Heures des maximums
      tempMaxHour,
      uvMaxHour,
      maxWindSpeedHour,
      maxWindGustsHour,
      maxWaveHeightHour,
      maxAttendanceHazardHour,
      maxRipCurrentHazardHour,
      maxShoreBreakHazardHour,

      // Heures des minimums
      tempMinHour,
      uvMinHour,
      minWindSpeedHour,
      minWindGustsHour,
      minWaveHeightHour,
      minAttendanceHazardHour,
      minRipCurrentHazardHour,
      minShoreBreakHazardHour
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

        // Adapter le code pour la nouvelle structure JSON
        const data = await response.json();

        // Récupérer la température de l'eau (1er élément du tableau)
        if (Array.isArray(data) && data.length > 0 && data[0]?.temperature_eau) {
          setWaterTemperature(data[0].temperature_eau);
        } else {
          setWaterTemperature(null);
        }

        // Récupérer les détails du jour actuel (2ème élément du tableau)
        if (Array.isArray(data) && data.length > 1 && data[1]?.details_jour_actuel && data[1].details_jour_actuel.length > 0) {
          setTideData(data[1].details_jour_actuel[0]);
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

  // Obtenir les données pour 11h00
  const data11AM = getDataAt11AM();

  // Obtenir les valeurs maximales et minimales de l'après-midi
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

  return (
    <div className="bg-white shadow-md rounded-lg p-4 sm:p-5 w-full max-w-6xl mx-auto">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center border-b pb-2">
        Bilan météorologique à 11h00
      </h2>

      <div className="flex flex-wrap justify-between gap-4">
        {/* Composants de section */}
        <HazardSection data11AM={data11AM} maxValues={maxValues} />
        <WeatherSection data11AM={data11AM} maxValues={maxValues} tempUnit={tempUnit} />
        <WindSection data11AM={data11AM} maxValues={maxValues} />
        <WaveSection data11AM={data11AM} maxValues={maxValues} waterTemperature={waterTemperature} />
        <TideSection tideData={tideData} tideTypes={tideTypes} tideHours={tideHours} tideHeights={tideHeights} />
      </div>

      <div className="mt-3 sm:mt-4 text-center text-md sm:text-sm text-gray-500">
        Données pour {location.nom}
      </div>
    </div>
  );
};

export default Bilan;