"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";

// Interface pour les données du graphique
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
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
        <p className="font-bold">{label}</p>
        <p className="text-blue-600">
          Température: {payload[0].value !== null ? `${payload[0].value}°C` : "-"}
        </p>
      </div>
    );
  }
  return null;
};

export function Chart({ hours = [], temperatures = [], tempUnit = "°C" }: ChartProps) {
  // Préparer les données pour le graphique en combinant heures et températures
  const chartData = hours.map((hour, index) => ({
    hour: hour instanceof Date ? hour.getHours() + ":00" : "0:00",
    temperature: temperatures[index] !== undefined ? temperatures[index] : null
  }));

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
            stroke="#2563eb"
            fill="#93c5fd"
            fillOpacity={0.6}
            strokeWidth={2}
            name="Température"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}