import React, { useEffect, useState } from 'react';
import Beach from '../interface/Beach';
import { TemperatureChart } from './TemperatureChart';
import { ShoreBreakHazardChart } from './ShoreBreakHazardChart';
import { RipCurrentHazardChart } from './RipCurrentHazardChart';
import { useWeather } from '../context/WeatherContext';
import { useWindForecast } from '../context/WindForecastContext';
import { useWaveForecast } from '../context/WaveForecastContext';
import DirectionArrow from './DirectionArrow';
import { useShoreBreakData } from '../hooks/useShoreBreakData';
import { useRipCurrentData } from '../hooks/useRipCurrentData';
import { useBeachAttendanceData } from '../hooks/useBeachAttendanceData';
import { ChartAllDataWeek } from './BeachAttendanceWeekChart';

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

// Constante pour le nombre de jours à afficher
const DAYS_TO_DISPLAY = 7;
const HOURS_PER_DAY = 24;
const TOTAL_HOURS = DAYS_TO_DISPLAY * HOURS_PER_DAY;

// Constante pour le nombre de jours à afficher dans le graphique
const CHART_DAYS_TO_DISPLAY = 4;
const CHART_TOTAL_HOURS = CHART_DAYS_TO_DISPLAY * HOURS_PER_DAY;

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

// Fonction utilitaire pour formater la date
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
};

const Table: React.FC<TableProps> = ({ location }) => {
  const [currentDate] = useState(new Date());
  const [displayDays, setDisplayDays] = useState<Date[]>([]);

  // Utilisation du hook pour obtenir les données shore break
  const {
    indices,
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

  // Utilisation du hook pour obtenir les données de fréquentation des plages
  const {
    hazardLevels: attendanceHazardLevels,
    isLoading: attendanceLoading,
    error: attendanceError
  } = useBeachAttendanceData();

  useEffect(() => {
    // Générer les dates des 7 prochains jours
    const days: Date[] = [];
    const today = new Date();
    // Réinitialiser l'heure à minuit pour la date courante
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < DAYS_TO_DISPLAY; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }

    setDisplayDays(days);

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

  // Générer les heures pour chaque jour
  const generateHoursForDays = () => {
    const allHours: Date[] = [];
    const today = new Date();
    // Réinitialiser l'heure à minuit pour la date courante
    today.setHours(0, 0, 0, 0);

    displayDays.forEach(day => {
      for (let hour = 0; hour < HOURS_PER_DAY; hour++) {
        const dateWithHour = new Date(day);
        dateWithHour.setHours(hour);
        allHours.push(dateWithHour);
      }
    });

    return allHours;
  };

  // Obtenir toutes les heures pour les 7 jours
  const allDisplayHours = generateHoursForDays();

  // Ensure we have data for all days
  const extendDataArray = (dataArray: number[], defaultValue: number | null = 0): (number | null)[] => {
    if (dataArray.length >= TOTAL_HOURS) {
      return dataArray.slice(0, TOTAL_HOURS);
    }
    return [...dataArray, ...Array(TOTAL_HOURS - dataArray.length).fill(defaultValue)];
  };

  // Étendre les arrays de données
  const safeIndices = extendDataArray(indices);
  const safeShoreBreakHazardLevels = extendDataArray(shoreBreakHazardLevels);
  const safeVelocities = extendDataArray(velocities);
  const safeRipCurrentHazardLevels = extendDataArray(ripCurrentHazardLevels);
  const safeAttendanceHazardLevels = extendDataArray(attendanceHazardLevels);
  const safeTemperatures = extendDataArray(temperatures, null);
  const safeUvIndices = extendDataArray(uvIndices, null);

  // Better approach for aligning data with hours
  const alignDataWithHours = (dataArray: any[] | undefined, timeArray: string[] | undefined) => {
    if (!dataArray || !timeArray || allDisplayHours.length === 0) return Array(TOTAL_HOURS).fill(null);

    const alignedData = Array(TOTAL_HOURS).fill(null);

    allDisplayHours.forEach((hour, hourIndex) => {
      if (hourIndex >= TOTAL_HOURS) return; // Ignorer les heures supplémentaires

      const year = hour.getFullYear();
      const month = String(hour.getMonth() + 1).padStart(2, '0');
      const day = String(hour.getDate()).padStart(2, '0');
      const hourValue = hour.getHours();
      const datePrefix = `${year}-${month}-${day}`;

      const matchingIndex = timeArray.findIndex((timeStr) => {
        return timeStr.startsWith(datePrefix) &&
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

  const displayWavePeriods = alignDataWithHours(
    waveForecast?.hourly?.swell_wave_peak_period,
    waveForecast?.hourly?.time
  );

  // Classe pour les cellules de titre (réduite)
  const titleCellClass = "py-0.5 px-1 font-bold border-r bg-gray-200 sticky left-0 z-10 whitespace-normal text-xs w-30 max-w-30";

  return (
    <div className="w-full bg-slate-100 text-black rounded">
      {(weatherLoading || windLoading || waveLoading || shoreBreakLoading || ripCurrentLoading || attendanceLoading) ? (
        <div className="p-4 text-center">Chargement des données...</div>
      ) : (weatherError || windError || waveError || shoreBreakError || ripCurrentError || attendanceError) ? (
        <div className="p-4 bg-red-100 text-red-700 mb-4 rounded-lg">
          Erreur: {weatherError || windError || waveError || shoreBreakError || ripCurrentError || attendanceError}
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <TableLegend />
          <div className="w-full text-center py-2 bg-blue-100">
            <p className="font-medium">Faites défiler horizontalement pour voir les 7 prochains jours</p>
          </div>
          <table className="w-full border-collapse bg-slate-100 text-black">
            <thead>
              <tr className="bg-blue-500">
                <th className="p-1 text-left whitespace-nowrap sticky left-0 z-20 bg-blue-500 w-20 max-w-20" colSpan={1}>
                  {currentDate.toLocaleDateString()}
                </th>
                {/* Colonnes pour les jours */}
                {displayDays.map((day, dayIndex) => (
                  <th key={`day-${dayIndex}`} className="p-1 text-center bg-blue-500 text-white font-bold" colSpan={24}>
                    {formatDate(day)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className={titleCellClass}>Heures</td>
                {allDisplayHours.map((hour, index) => (
                  <td key={`hour-${index}`} className="p-1 text-center border-r min-w-[40px] text-xs">
                    {hour.getHours()}:00
                  </td>
                ))}
              </tr>

              {/* Shore Break Hazard Level */}
              <tr className="bg-blue-100">
                <td className={titleCellClass}>Danger Shore Break</td>
                {safeShoreBreakHazardLevels.map((level, index) => (
                  index < allDisplayHours.length && (
                    <td
                      key={`shore-hazard-${index}`}
                      className={`p-1 text-center border-r ${level !== null ? getHazardLevelColor(level) : "bg-gray-200"} min-w-[40px] text-xs`}
                    >
                      {level}
                    </td>
                  )
                ))}
              </tr>
              <tr>
                <td className={titleCellClass}>Graph. Shore Break</td>
                <td colSpan={TOTAL_HOURS} className="p-0 border-r h-24">
                  <ShoreBreakHazardChart hours={allDisplayHours} indices={safeIndices.slice(0, allDisplayHours.length).map(index => index === null ? 0 : index)} />
                </td>
              </tr>
              <tr className="h-2">
                <td className="border-r bg-gray-200 sticky left-0 z-10"></td>
                {allDisplayHours.map((_, index) => (
                  <td key={`spacer-sb-rip-${index}`} className="border-r bg-gray-300"></td>
                ))}
              </tr>

              {/* Rip Current Hazard Level */}
              <tr className="bg-blue-50">
                <td className={titleCellClass}>Danger Courant</td>
                {safeRipCurrentHazardLevels.map((level, index) => (
                  index < allDisplayHours.length && (
                    <td
                      key={`rip-hazard-${index}`}
                      className={`p-1 text-center border-r ${level !== null ? getHazardLevelColor(level) : "bg-gray-200"} min-w-[40px] text-xs`}
                    >
                      {level}
                    </td>
                  )
                ))}
              </tr>
              <tr>
                <td className={titleCellClass}>Graph. Courant</td>
                <td colSpan={TOTAL_HOURS} className="p-0 border-r h-24">
                  <RipCurrentHazardChart
                    hours={allDisplayHours}
                    velocities={safeVelocities.slice(0, allDisplayHours.length).map(v => v === null ? 0 : v)}
                    hazardLevels={safeRipCurrentHazardLevels.slice(0, allDisplayHours.length).map(h => h === null ? 0 : h)}
                  />
                </td>
              </tr>
              <tr className="h-2">
                <td className="border-r bg-gray-200 sticky left-0 z-10"></td>
                {allDisplayHours.map((_, index) => (
                  <td key={`spacer-sb-rip-${index}`} className="border-r bg-gray-300"></td>
                ))}
              </tr>

              <tr className="bg-blue-50">
                <td className={titleCellClass}>Indice Fréquentation</td>
                {safeAttendanceHazardLevels.map((level, index) => (
                  index < allDisplayHours.length && (
                    <td
                      key={`attendance-hazard-${index}`}
                      className={`p-1 text-center border-r ${level !== null ? getHazardLevelColor(level) : "bg-gray-200"} min-w-[40px] text-xs`}
                    >
                      {level}
                    </td>
                  )
                ))}
              </tr>

              {/* Ajout du graphique de fréquentation des plages sur 4 jours */}
              <tr>
                <td className={titleCellClass}>Graph. Fréquentation</td>
                <td colSpan={CHART_TOTAL_HOURS} className="p-0 border-r h-64">
                  {attendanceLoading ? (
                    <div className="h-full flex items-center justify-center bg-slate-100">
                      <p>Chargement des données de fréquentation...</p>
                    </div>
                  ) : attendanceError ? (
                    <div className="h-full flex items-center justify-center bg-red-100 text-red-700">
                      <p>Erreur: {attendanceError}</p>
                    </div>
                  ) : (
                    <ChartAllDataWeek />
                  )}
                </td>
                {/* Ajouter des cellules vides pour les 3 jours restants */}
                <td colSpan={TOTAL_HOURS - CHART_TOTAL_HOURS} className="p-0 border-r bg-gray-100"></td>
              </tr>

              <tr className="h-2">
                <td className="border-r bg-gray-200 sticky left-0 z-10"></td>
                {allDisplayHours.map((_, index) => (
                  <td key={`spacer-current-temp-${index}`} className="border-r bg-gray-300"></td>
                ))}
              </tr>

              {/* Température - Ligne de référence */}
              <tr className="bg-white">
                <td className={titleCellClass}>Température</td>
                {safeTemperatures.map((temp, index) => (
                  index < allDisplayHours.length && (
                    <td key={`temp-${index}`} className="p-1 text-center border-r min-w-[40px] text-xs">
                      {temp !== null ? `${temp}${tempUnit}` : "-"}
                    </td>
                  )
                ))}
              </tr>
              <tr>
                <td className={titleCellClass}>Graph. Temp.</td>
                <td colSpan={TOTAL_HOURS} className="p-0 border-r h-24">
                  <TemperatureChart />
                </td>
              </tr>
              <tr className="bg-blue-50">
                <td className={titleCellClass}>Indice UV</td>
                {safeUvIndices.map((uv, index) => (
                  index < allDisplayHours.length && (
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
                {allDisplayHours.map((_, index) => (
                  <td key={`spacer-uv-wind-${index}`} className="border-r bg-gray-300"></td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className={titleCellClass}>Direction vent</td>
                {displayWindDirections.map((direction, index) => (
                  index < allDisplayHours.length && (
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
                <td className={titleCellClass}>Vitesse vent</td>
                {displayWindSpeeds.map((speed, index) => (
                  index < allDisplayHours.length && (
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
                <td className={titleCellClass}>Rafales vent</td>
                {displayWindGusts.map((gust, index) => (
                  index < allDisplayHours.length && (
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
                {allDisplayHours.map((_, index) => (
                  <td key={`spacer-${index}`} className="border-r bg-gray-300"></td>
                ))}
              </tr>
              <tr className="bg-white">
                <td className={titleCellClass}>Hauteur vagues</td>
                {displayWaveHeights.map((height, index) => (
                  index < allDisplayHours.length && (
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
                <td className={titleCellClass}>Direction vagues</td>
                {displayWaveDirections.map((direction, index) => (
                  index < allDisplayHours.length && (
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
                <td className={titleCellClass}>Période vagues</td>
                {displayWavePeriods.map((period, index) => (
                  index < allDisplayHours.length && (
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
      <h2 className="text-xl font-bold mb-4">Tableau des prévisions sur 7 jours</h2>

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