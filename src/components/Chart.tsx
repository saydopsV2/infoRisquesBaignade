"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";
import { useWeather } from "../context/WeatherContext";

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
    
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
        <p className="font-bold">{label}</p>
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
      color: getTemperatureColor(temp)
    }
  });

  // Créer des stops de dégradé pour chaque point de température
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

  return (
    <ChartContainer config={chartConfig} className="max-h-[200px] w-full">
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
            {/* Gradient horizontal pour le contour */}
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
            
            {/* Créer des gradients verticaux individuels pour chaque couleur */}
            {gradientStops.map((stop, index) => (
              <linearGradient 
                key={`fill-${index}`}
                id={`temperatureFillGradient-${index}`} 
                x1="0" 
                y1="0" 
                x2="0" 
                y2="1"
              >
                <stop offset="0%" stopColor={stop.color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={stop.color} stopOpacity={0.1} />
              </linearGradient>
            ))}
            
            {/* Pattern qui utilise les gradients verticaux avec le mapping horizontal */}
            <pattern id="temperaturePattern" x="0" y="0" width="100%" height="100%" patternUnits="userSpaceOnUse">
              {gradientStops.map((stop, index, arr) => {
                const width = index < arr.length - 1 
                  ? parseFloat(arr[index + 1].offset) - parseFloat(stop.offset) 
                  : 100 - parseFloat(stop.offset);
                
                return (
                  <rect 
                    key={index}
                    x={`${parseFloat(stop.offset)}%`} 
                    y="0" 
                    width={`${width}%`} 
                    height="100%" 
                    fill={`url(#temperatureFillGradient-${index})`} 
                  />
                );
              })}
            </pattern>
          </defs>
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
            fill="url(#temperaturePattern)"
            fillOpacity={1}
            strokeWidth={2}
            name="Température"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// Version standalone qui utilise directement le contexte
export function StandaloneChart() {
  const { hours, temperatures, tempUnit } = useWeather();
  
  // Préparer les données pour le graphique en combinant heures et températures
  const chartData = hours.map((hour, index) => {
    const temp = temperatures[index] !== undefined ? temperatures[index] : null;
    return {
      hour: hour instanceof Date ? `${hour.getHours()}:00` : "0:00",
      temperature: temp,
      // Ajouter la couleur pour chaque point de température
      color: getTemperatureColor(temp)
    }
  });

  // Créer des stops de dégradé pour chaque point de température
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

  return (
    <ChartContainer config={chartConfig} className="max-h-[200px] w-full">
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
            {/* Gradient horizontal pour le contour */}
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
            
            {/* Créer des gradients verticaux individuels pour chaque couleur */}
            {gradientStops.map((stop, index) => (
              <linearGradient 
                key={`fill-standalone-${index}`}
                id={`temperatureFillGradientStandalone-${index}`} 
                x1="0" 
                y1="0" 
                x2="0" 
                y2="1"
              >
                <stop offset="0%" stopColor={stop.color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={stop.color} stopOpacity={0.1} />
              </linearGradient>
            ))}
            
            {/* Pattern qui utilise les gradients verticaux avec le mapping horizontal */}
            <pattern id="temperaturePatternStandalone" x="0" y="0" width="100%" height="100%" patternUnits="userSpaceOnUse">
              {gradientStops.map((stop, index, arr) => {
                const width = index < arr.length - 1 
                  ? parseFloat(arr[index + 1].offset) - parseFloat(stop.offset) 
                  : 100 - parseFloat(stop.offset);
                
                return (
                  <rect 
                    key={index}
                    x={`${parseFloat(stop.offset)}%`} 
                    y="0" 
                    width={`${width}%`} 
                    height="100%" 
                    fill={`url(#temperatureFillGradientStandalone-${index})`} 
                  />
                );
              })}
            </pattern>
          </defs>
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
            fill="url(#temperaturePatternStandalone)"
            fillOpacity={1}
            strokeWidth={2}
            name="Température"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}