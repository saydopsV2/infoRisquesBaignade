import React, { useEffect, useState } from 'react';
import Beach from '../interface/Beach';
import { StandaloneChart } from './Chart';
import { SecurityIndexChart } from './SecurityIndexChart';
import { RipCurrentHazardChart } from './RipCurrentHazardChart';
import { useWeather } from '../context/WeatherContext';
import { useWindForecast } from '../context/WindForecastContext';
import { useWaveForecast } from '../context/WaveForecastContext';
import DirectionArrow from './DirectionArrow';
import { useShoreBreakData } from '../hooks/useShoreBreakData';
import { useRipCurrentData } from '../hooks/useRipCurrentData';

// Types
interface TableProps {
  tableBeach: string;
  location: Beach;
}

interface LegendItem {
  value: number;
  class: string;
  label: string;
}

// Components
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
    <div className="mt-4 p-2 bg-slate-100 text-black">
      <h3 className="font-bold mb-2">Légende indice Sécurité:</h3>
      <div className="flex flex-row flex-wrap gap-2 md:gap-4 items-center justify-center">
        {legendItems.map((item) => (
          <LegendItem key={item.value} item={item} />
        ))}
      </div>
    </div>
  );
};

const Table: React.FC<TableProps> = ({ location }) => {
  const [currentDate] = useState(new Date());

  // Utilisation du hook pour obtenir les données shore break
  const {
    indices,
    dates,
    hazardLevels: shoreBreakHazardLevels,
    isLoading: shoreBreakLoading,
    error: shoreBreakError
  } = useShoreBreakData();

  // Utilisation du hook pour obtenir les données de courant d'arrachement
  const {
    velocities,
    hazardLevels: ripCurrentHazardLevels,
    isLoading: ripCurrentLoading,
    error: ripCurrentError
  } = useRipCurrentData();

  // Utilisation du contexte pour obtenir les données météo
  const {
    hours,
    temperatures,
    uvIndices,
    tempUnit,
    isLoading: weatherLoading,
    error: weatherError,
    fetchWeatherData
  } = useWeather();

  // Utilisation du contexte pour obtenir les données de vent
  const {
    windForecast,
    loading: windLoading,
    error: windError,
    fetchWindForecast
  } = useWindForecast();

  // Utilisation du contexte pour obtenir les données de vagues
  const {
    waveForecast,
    loading: waveLoading,
    error: waveError,
    fetchWaveForecast
  } = useWaveForecast();

  useEffect(() => {
    // Appel à fetchWeatherData lors du montage du composant
    fetchWeatherData(location);
    // Appel à fetchWindForecast lors du montage du composant
    fetchWindForecast(location);
    // Appel à fetchWaveForecast lors du montage du composant
    fetchWaveForecast(location);
  }, [location]);

  // Fonction pour obtenir la couleur basée sur le niveau de danger
  const getHazardLevelColor = (level: number): string => {
    if (level === 0) return "bg-green-600"; // Vert foncé - Sécurité optimale
    if (level === 1) return "bg-green-400"; // Vert clair - Faible risque
    if (level === 2) return "bg-yellow-300"; // Jaune - Risque modéré
    if (level === 3) return "bg-orange-500"; // Orange - Risque élevé
    if (level >= 4) return "bg-red-600 text-white"; // Rouge - Danger important
    return "bg-gray-200"; // Couleur par défaut
  };

  const getUvIndexColor = (uvIndex: number): string => {
    if (uvIndex < 3) return "bg-green-400"; // Low
    if (uvIndex < 6) return "bg-yellow-300"; // Moderate
    if (uvIndex < 8) return "bg-orange-400"; // High
    if (uvIndex < 11) return "bg-red-500 text-white"; // Very High
    return "bg-purple-700 text-white"; // Extreme
  };

  const getWindSpeedColor = (speed: number | null): string => {
    if (speed === null) return "";
    if (speed < 4) return "bg-cyan-50"; // Calme
    if (speed < 5) return "bg-cyan-100"; // Calme
    if (speed < 7) return "bg-cyan-200"; // Vent faible
    if (speed < 11) return "bg-lime-200"; // Vent léger
    if (speed < 17) return "bg-lime-500"; // Vent modéré
    if (speed < 20) return "bg-yellow-300"; // Vent assez fort
    if (speed < 22) return "bg-orange-400"; // Vent assez fort
    if (speed < 28) return "bg-rose-500"; // Vent fort
    if (speed < 34) return "bg-purple-500 text-white"; // Vent très fort
    if (speed < 41) return "bg-fuchsia-500 text-white"; // Vent violent
    return "bg-purple-700 text-white"; // Vent très violent
  };

  // Normaliser les heures d'affichage à exactement 24 heures
  const displayHours = dates.length > 0
    ? (dates.length > 24 ? dates.slice(0, 24) : dates)
    : (hours.length > 24 ? hours.slice(0, 24) : hours);

  // Ensure we have exactly 24 values, filling with zeros if needed
  const safeIndices = indices.length >= 24
    ? indices.slice(0, 24)
    : [...indices, ...Array(24 - indices.length).fill(0)];

  // Ensure we have exactly 24 values for shore break hazard levels
  const safeShoreBreakHazardLevels = shoreBreakHazardLevels.length >= 24
    ? shoreBreakHazardLevels.slice(0, 24)
    : [...shoreBreakHazardLevels, ...Array(24 - shoreBreakHazardLevels.length).fill(0)];

  // Ensure we have exactly 24 values for rip current velocities and hazard levels
  const safeVelocities = velocities.length >= 24
    ? velocities.slice(0, 24)
    : [...velocities, ...Array(24 - velocities.length).fill(0)];

  const safeRipCurrentHazardLevels = ripCurrentHazardLevels.length >= 24
    ? ripCurrentHazardLevels.slice(0, 24)
    : [...ripCurrentHazardLevels, ...Array(24 - ripCurrentHazardLevels.length).fill(0)];

  // Ensure we have temperature and UV data
  const safeTemperatures = temperatures.length >= 24
    ? temperatures.slice(0, 24)
    : [...temperatures, ...Array(24 - temperatures.length).fill(null)];

  const safeUvIndices = uvIndices.length >= 24
    ? uvIndices.slice(0, 24)
    : [...uvIndices, ...Array(24 - uvIndices.length).fill(null)];

  // Better approach for aligning data with hours
  const alignDataWithHours = (dataArray: any[] | undefined, timeArray: string[] | undefined) => {
    if (!dataArray || !timeArray || displayHours.length === 0) return Array(24).fill(null);

    const alignedData = Array(24).fill(null);
    const today = new Date();
    const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    displayHours.forEach((hour, hourIndex) => {
      if (hourIndex >= 24) return; // Ignorer les heures supplémentaires

      const hourValue = hour.getHours();

      const matchingIndex = timeArray.findIndex((timeStr) => {
        return timeStr.startsWith(formattedToday) &&
          new Date(timeStr).getHours() === hourValue;
      });

      if (matchingIndex !== -1 && matchingIndex < dataArray.length) {
        alignedData[hourIndex] = dataArray[matchingIndex];
      }
    });

    return alignedData;
  };

  // Align wind data with displayed hours
  const displayWindDirections = alignDataWithHours(
    windForecast?.hourly?.wind_direction_10m,
    windForecast?.hourly?.time
  );

  const displayWindSpeeds = alignDataWithHours(
    windForecast?.hourly?.wind_speed_10m,
    windForecast?.hourly?.time
  );

  const displayWindGusts = alignDataWithHours(
    windForecast?.hourly?.wind_gusts_10m,
    windForecast?.hourly?.time
  );

  // Align wave data with displayed hours
  const displayWaveHeights = alignDataWithHours(
    waveForecast?.hourly?.wave_height,
    waveForecast?.hourly?.time
  );

  const displayWaveDirections = alignDataWithHours(
    waveForecast?.hourly?.wave_direction,
    waveForecast?.hourly?.time
  );

  // Use type assertion to tell TypeScript that swell_wave_peak_period exists
  const displayWavePeriods = alignDataWithHours(
    waveForecast?.hourly?.swell_wave_peak_period,
    waveForecast?.hourly?.time
  );

  return (
    <div className="w-full bg-slate-100 text-black rounded">
      {(weatherLoading || windLoading || waveLoading || shoreBreakLoading || ripCurrentLoading) ? (
        <div className="p-4 text-center">Chargement des données...</div>
      ) : (weatherError || windError || waveError || shoreBreakError || ripCurrentError) ? (
        <div className="p-4 bg-red-100 text-red-700 mb-4 rounded-lg">
          Erreur: {weatherError || windError || waveError || shoreBreakError || ripCurrentError}
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <TableLegend />
          <table className="w-full border-collapse bg-slate-100 text-black">
            <thead>
              <tr className="bg-blue-500">
                <th className="p-1 text-left whitespace-nowrap" colSpan={25}>
                  Données pour le {currentDate.toLocaleDateString()}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-1 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-normal md:whitespace-nowrap text-sm">Heures</td>
                {displayHours.map((hour, index) => (
                  <td key={`hour-${index}`} className="p-1 text-center border-r min-w-[40px] text-xs">
                    {hour.getHours()}:00
                  </td>
                ))}
              </tr>

              {/* Shore Break Hazard Level */}
              <tr className="bg-blue-100">
                <td className="p-1 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-normal md:whitespace-nowrap text-sm">Danger Shore Break</td>
                {safeShoreBreakHazardLevels.map((level, index) => (
                  index < displayHours.length && (
                    <td
                      key={`shore-hazard-${index}`}
                      className={`p-1 text-center border-r ${getHazardLevelColor(level)} min-w-[40px] text-xs`}
                    >
                      {level}
                    </td>
                  )
                ))}
              </tr>
              <tr>
                <td className="p-1 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-normal md:whitespace-nowrap text-sm">Graphique Shore Break</td>
                <td colSpan={24} className="p-0 border-r h-24">
                  <SecurityIndexChart hours={displayHours} indices={safeIndices.slice(0, displayHours.length)} />
                </td>
              </tr>
              <tr className="h-2">
                <td className="border-r bg-gray-200 sticky left-0 z-10"></td>
                {displayHours.map((_, index) => (
                  <td key={`spacer-sb-rip-${index}`} className="border-r bg-gray-300"></td>
                ))}
              </tr>

              {/* Rip Current Hazard Level */}
              <tr className="bg-blue-50">
                <td className="p-1 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-normal md:whitespace-nowrap text-sm">Danger Courant</td>
                {safeRipCurrentHazardLevels.map((level, index) => (
                  index < displayHours.length && (
                    <td
                      key={`rip-hazard-${index}`}
                      className={`p-1 text-center border-r ${getHazardLevelColor(level)} min-w-[40px] text-xs`}
                    >
                      {level}
                    </td>
                  )
                ))}
              </tr>
              <tr>
                <td className="p-1 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-normal md:whitespace-nowrap text-sm">Graphique Courant</td>
                <td colSpan={24} className="p-0 border-r h-24">
                  <RipCurrentHazardChart 
                    hours={displayHours} 
                    velocities={safeVelocities.slice(0, displayHours.length)}
                    hazardLevels={safeRipCurrentHazardLevels.slice(0, displayHours.length)}
                  />
                </td>
              </tr>
              <tr className="h-2">
                <td className="border-r bg-gray-200 sticky left-0 z-10"></td>
                {displayHours.map((_, index) => (
                  <td key={`spacer-current-temp-${index}`} className="border-r bg-gray-300"></td>
                ))}
              </tr>

              {/* Température - Ligne de référence */}
              <tr className="bg-white">
                <td className="p-1 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-normal md:whitespace-nowrap text-sm">Température</td>
                {safeTemperatures.map((temp, index) => (
                  index < displayHours.length && (
                    <td key={`temp-${index}`} className="p-1 text-center border-r min-w-[40px] text-xs">
                      {temp !== null ? `${temp}${tempUnit}` : "-"}
                    </td>
                  )
                ))}
              </tr>
              <tr>
                <td className="p-1 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-normal md:whitespace-nowrap text-sm">Graphique Temp.</td>
                <td colSpan={24} className="p-0 border-r h-24">
                  <StandaloneChart />
                </td>
              </tr>
              <tr className="bg-blue-50">
                <td className="p-1 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-normal md:whitespace-nowrap text-sm">Indice UV</td>
                {safeUvIndices.map((uv, index) => (
                  index < displayHours.length && (
                    <td
                      key={`uv-${index}`}
                      className={`p-1 text-center border-r ${uv !== null ? getUvIndexColor(uv) : ""} min-w-[40px] text-xs`}
                    >
                      {uv !== null ? uv.toFixed(1) : "-"}
                    </td>
                  )
                ))}
              </tr>
              <tr className="h-2">
                <td className="border-r bg-gray-200 sticky left-0 z-10"></td>
                {displayHours.map((_, index) => (
                  <td key={`spacer-uv-wind-${index}`} className="border-r bg-gray-300"></td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="p-1 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-normal md:whitespace-nowrap text-sm">Direction du vent</td>
                {displayWindDirections.map((direction, index) => (
                  index < displayHours.length && (
                    <td key={`windDir-${index}`} className="p-1 text-center border-r min-w-[40px] text-xs">
                      {direction !== null ? (
                        <DirectionArrow
                          direction={direction}
                          size={35}
                          color="#2563eb" // Blue color for wind
                          showLabel={false}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                  )
                ))}
              </tr>
              <tr className="bg-white">
                <td className="p-1 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-normal md:whitespace-nowrap text-sm">Vitesse du vent</td>
                {displayWindSpeeds.map((speed, index) => (
                  index < displayHours.length && (
                    <td
                      key={`windSpeed-${index}`}
                      className={`p-1 text-center border-r min-w-[40px] text-xs ${getWindSpeedColor(speed)}`}
                    >
                      {speed !== null ? `${speed}` : "-"}
                    </td>
                  )
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="p-1 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-normal md:whitespace-nowrap text-sm">Rafales de vent</td>
                {displayWindGusts.map((gust, index) => (
                  index < displayHours.length && (
                    <td
                      key={`windGust-${index}`}
                      className={`p-1 text-center border-r min-w-[40px] text-xs ${getWindSpeedColor(gust)}`}
                    >
                      {gust !== null ? `${gust}` : "-"}
                    </td>
                  )
                ))}
              </tr>
              <tr className="h-2">
                <td className="border-r bg-gray-200 sticky left-0 z-10"></td>
                {displayHours.map((_, index) => (
                  <td key={`spacer-${index}`} className="border-r bg-gray-300"></td>
                ))}
              </tr>
              <tr className="bg-white">
                <td className="p-1 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-normal md:whitespace-nowrap text-sm">Hauteur des vagues</td>
                {displayWaveHeights.map((height, index) => (
                  index < displayHours.length && (
                    <td
                      key={`waveHeight-${index}`}
                      className="p-1 text-center border-r min-w-[40px] text-xs"
                    >
                      {height !== null ? `${height.toFixed(1)}` : "-"}
                    </td>
                  )
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="p-1 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-normal md:whitespace-nowrap text-sm">Direction des vagues</td>
                {displayWaveDirections.map((direction, index) => (
                  index < displayHours.length && (
                    <td key={`waveDir-${index}`} className="p-1 text-center border-r min-w-[40px] text-xs">
                      {direction !== null ? (
                        <DirectionArrow
                          direction={direction}
                          size={35}
                          color="#6366f1" // Indigo color for waves
                          showLabel={false}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                  )
                ))}
              </tr>
              <tr className="bg-white">
                <td className="p-1 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-normal md:whitespace-nowrap text-sm">Période des vagues</td>
                {displayWavePeriods.map((period, index) => (
                  index < displayHours.length && (
                    <td
                      key={`wavePeriod-${index}`}
                      className="p-1 text-center border-r min-w-[40px] text-xs"
                    >
                      {period !== null ? `${period.toFixed(1)}` : "-"}
                    </td>
                  )
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Main component export
const PrevisionTable: React.FC<{ location: Beach }> = ({ location }) => {
  const { isLoading: shoreBreakLoading, error: shoreBreakError } = useShoreBreakData();
  const { isLoading: ripCurrentLoading, error: ripCurrentError } = useRipCurrentData();

  const isLoading = shoreBreakLoading || ripCurrentLoading;
  const error = shoreBreakError || ripCurrentError;

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
          <Table tableBeach={location.nom.toLowerCase().replace(' ', '-')} location={location} />
        </div>
      ) : (
        <Table tableBeach={location.nom.toLowerCase().replace(' ', '-')} location={location} />
      )}
    </div>
  );
};

export default PrevisionTable;