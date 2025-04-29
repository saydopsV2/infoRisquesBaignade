"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";
import { useWeather } from "../context/WeatherContext";
import { DayNightZones } from "./DayNightZone"; 

// Interface pour les données du graphique explicites
interface ChartProps {
  hours?: Date[];
  temperatures?: number[];
  tempUnit?: string;
}

// Configuration du graphique
const chartConfig = {
  temperature: {
    label: "Température",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

// Composant personnalisé pour le tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Déterminer la couleur du tooltip en fonction de la température
    const temperature = payload[0].value;
    const color = getTemperatureColor(temperature);

    // Récupérer l'heure complète à partir des données du graphique
    const item = payload[0].payload;
    const dateObj = item.originalDate instanceof Date ? item.originalDate : new Date();

    // Formater la date pour afficher le jour et l'heure
    const formattedDate = dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Première lettre en majuscule
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
        <p className="font-bold">{capitalizedDate}</p>
        <p className="text-sm text-gray-600">{label}</p>
        <p style={{ color }}>
          Température: {temperature !== null ? `${temperature}°C` : "-"}
        </p>
      </div>
    );
  }
  return null;
};

// Fonction pour obtenir la couleur basée sur la température
const getTemperatureColor = (temp: number | null): string => {
  if (temp === null) return "#93c5fd"; // Couleur par défaut (bleu clair)
  if (temp < 10) return "#3b82f6"; // Bleu pour les températures froides
  if (temp < 15) return "#60a5fa"; // Bleu clair
  if (temp < 20) return "#10b981"; // Vert
  if (temp < 25) return "#f59e0b"; // Orange
  if (temp < 30) return "#f97316"; // Orange foncé
  return "#ef4444"; // Rouge pour les températures chaudes
};

// Version qui utilise les props explicites
export function Chart({ hours = [], temperatures = [], tempUnit = "°C" }: ChartProps) {
  // Préparer les données pour le graphique en combinant heures et températures
  const chartData = hours.map((hour, index) => {
    const temp = temperatures[index] !== undefined ? temperatures[index] : null;
    return {
      hour: hour instanceof Date ? `${hour.getHours()}:00` : "0:00",
      temperature: temp,
      // Ajouter la couleur pour chaque point de température
      color: getTemperatureColor(temp),
      // Stocker la date originale pour l'affichage dans le tooltip
      originalDate: hour
    }
  });

  // Créer des stops de dégradé pour chaque point de température (pour la ligne)
  const gradientStops = temperatures
    .filter(temp => temp !== null)
    .map((temp, index, filteredTemps) => {
      // Calculer le pourcentage de position dans le gradient
      const offset = `${(index / Math.max(1, filteredTemps.length - 1)) * 100}%`;
      return {
        offset,
        color: getTemperatureColor(temp)
      };
    });

  // Identifier les positions des changements de jour pour les lignes verticales
  const dayBreaks = chartData.reduce((breaks, item, index) => {
    if (index > 0) {
      const prevDate = chartData[index - 1].originalDate;
      const currentDate = item.originalDate;

      if (prevDate instanceof Date && currentDate instanceof Date) {
        if (prevDate.getDate() !== currentDate.getDate()) {
          breaks.push({
            index,
            hour: item.hour,
            date: new Date(currentDate)
          });
        }
      }
    }
    return breaks;
  }, [] as { index: number, hour: string, date: Date }[]);

  // Déterminer le nombre de jours en fonction des données
  const calculateNumberOfDays = (): number => {
    if (hours.length === 0) return 7; // Par défaut 7 jours

    const firstDate = hours[0];
    const lastDate = hours[hours.length - 1];

    if (!(firstDate instanceof Date) || !(lastDate instanceof Date)) return 7;

    // Calculer la différence en millisecondes, puis convertir en jours et arrondir au supérieur
    const diffTime = Math.abs(lastDate.getTime() - firstDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(diffDays, 1); // Au moins 1 jour
  };

  // Nombre de jours à afficher
  const numberOfDays = calculateNumberOfDays();

  return (
    <div className="relative">
      {/* Conteneur du graphique */}
      <ChartContainer config={chartConfig} className="max-h-[150px] w-full">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 30,
              left: 10,
              bottom: 0,
            }}
          >
            <defs>
              {/* Gradient horizontal pour le contour de la ligne */}
              <linearGradient id="temperatureGradient" x1="0" y1="0" x2="1" y2="0">
                {gradientStops.map((stop, index) => (
                  <stop
                    key={index}
                    offset={stop.offset}
                    stopColor={stop.color}
                    stopOpacity={1}
                  />
                ))}
              </linearGradient>
            </defs>

            {/* Lignes verticales pour séparer les jours */}
            {dayBreaks.map((dayBreak, index) => (
              <ReferenceLine
                key={index}
                x={dayBreak.hour}
                stroke="#94a3b8"
                strokeDasharray="3 3"
                label={{
                  value: dayBreak.date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
                  position: 'top',
                  fill: '#64748b',
                  fontSize: 10
                }}
              />
            ))}

            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={true}
              tickMargin={8}
            />
            <YAxis
              unit={tempUnit}
              tickLine={false}
              axisLine={true}
              tickMargin={8}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="url(#temperatureGradient)"
              fill="transparent" // Aire sous la courbe transparente
              strokeWidth={2}
              name="Température"
              activeDot={(props) => {
                const { cx, cy, payload } = props;
                // Obtenir la couleur en fonction de la température
                const color = getTemperatureColor(payload.temperature);

                return (
                  <g>
                    {/* Cercle extérieur blanc */}
                    <circle cx={cx} cy={cy} r={7} fill="white" />
                    {/* Cercle intérieur coloré */}
                    <circle cx={cx} cy={cy} r={5} fill={color} />
                  </g>
                );
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Zones grisées entre 20h et 9h */}
      <DayNightZones
        numberOfDays={numberOfDays}
        nightStartHour={20}
        nightEndHour={9}
      />
    </div>
  );
}

// Version standalone qui utilise directement le contexte
export function TemperatureChart() {
  const { hours, temperatures, tempUnit } = useWeather();

  // Préparer les données pour le graphique en combinant heures et températures
  const chartData = hours.map((hour, index) => {
    const temp = temperatures[index] !== undefined ? temperatures[index] : null;
    return {
      hour: hour instanceof Date ? `${hour.getHours()}:00` : "0:00",
      temperature: temp,
      // Ajouter la couleur pour chaque point de température
      color: getTemperatureColor(temp),
      // Stocker la date originale pour l'affichage dans le tooltip
      originalDate: hour
    }
  });

  // Créer des stops de dégradé pour chaque point de température (pour la ligne)
  const gradientStops = temperatures
    .filter(temp => temp !== null)
    .map((temp, index, filteredTemps) => {
      // Calculer le pourcentage de position dans le gradient
      const offset = `${(index / Math.max(1, filteredTemps.length - 1)) * 100}%`;
      return {
        offset,
        color: getTemperatureColor(temp)
      };
    });

  // Identifier les positions des changements de jour pour les lignes verticales
  const dayBreaks = chartData.reduce((breaks, item, index) => {
    if (index > 0) {
      const prevDate = chartData[index - 1].originalDate;
      const currentDate = item.originalDate;

      if (prevDate instanceof Date && currentDate instanceof Date) {
        if (prevDate.getDate() !== currentDate.getDate()) {
          breaks.push({
            index,
            hour: item.hour,
            date: new Date(currentDate)
          });
        }
      }
    }
    return breaks;
  }, [] as { index: number, hour: string, date: Date }[]);

  // Calculer le nombre de jours à afficher
  const numberOfDays = 7; // On utilise une valeur fixe de 7 jours qui correspond à ce que récupère le contexte

  return (
    <div className="relative">
      <ChartContainer config={chartConfig} className="max-h-[150px] w-full bg-white">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 30,
              left: 10,
              bottom: 0,
            }}
          >
            <defs>
              {/* Gradient horizontal pour le contour de la ligne */}
              <linearGradient id="temperatureGradientStandalone" x1="0" y1="0" x2="1" y2="0">
                {gradientStops.map((stop, index) => (
                  <stop
                    key={index}
                    offset={stop.offset}
                    stopColor={stop.color}
                    stopOpacity={1}
                  />
                ))}
              </linearGradient>
            </defs>

            {/* Lignes verticales pour séparer les jours */}
            {dayBreaks.map((dayBreak, index) => (
              <ReferenceLine
                key={index}
                x={dayBreak.hour}
                stroke="#94a3b8"
                strokeDasharray="3 3"
                label={{
                  value: dayBreak.date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
                  position: 'top',
                  fill: '#64748b',
                  fontSize: 10
                }}
              />
            ))}

            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={true}
              tickMargin={8}
            />
            <YAxis
              unit={tempUnit}
              tickLine={false}
              axisLine={true}
              tickMargin={8}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="url(#temperatureGradientStandalone)"
              fill="transparent" // Rendre l'aire sous la courbe transparente
              strokeWidth={2}
              name="Température"
              activeDot={(props) => {
                const { cx, cy, payload } = props;
                // Obtenir la couleur en fonction de la température
                const color = getTemperatureColor(payload.temperature);

                return (
                  <g>
                    {/* Cercle extérieur blanc */}
                    <circle cx={cx} cy={cy} r={7} fill="white" />
                    {/* Cercle intérieur coloré */}
                    <circle cx={cx} cy={cy} r={5} fill={color} />
                  </g>
                );
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Zones grisées entre 20h et 9h */}
      <DayNightZones
        numberOfDays={numberOfDays}
        nightStartHour={20}
        nightEndHour={9}
      />
    </div>
  );
}