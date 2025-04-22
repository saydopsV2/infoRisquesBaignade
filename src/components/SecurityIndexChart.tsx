"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";

// Interface pour les données du graphique
interface SecurityChartProps {
  hours?: Date[];
  indices?: number[];
}

// Configuration du graphique
const chartConfig = {
  securityIndex: {
    label: "Indice Sécurité",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

// Composant personnalisé pour le tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Déterminer la couleur du tooltip en fonction de l'indice
    const index = payload[0].value;
    const color = getSecurityIndexColor(index);
    
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
        <p className="font-bold">{label}</p>
        <p style={{ color }}>
          Indice Sécurité: {index !== null ? index : "-"}
        </p>
      </div>
    );
  }
  return null;
};

// Fonction pour obtenir la couleur basée sur l'indice de sécurité
const getSecurityIndexColor = (index: number | null): string => {
  if (index === null) return "#94a3b8"; // Couleur par défaut (gris)
  if (index === 0) return "#16a34a"; // Vert foncé - Sécurité optimale
  if (index === 1) return "#4ade80"; // Vert clair - Faible risque
  if (index === 2) return "#fde047"; // Jaune - Risque modéré
  if (index === 3) return "#f97316"; // Orange - Risque élevé
  return "#dc2626"; // Rouge - Danger important
};

// Version autonome du graphique d'indice de sécurité
export function SecurityIndexChart({ hours = [], indices = [] }: SecurityChartProps) {
  // Préparer les données pour le graphique en combinant heures et indices
  const chartData = hours.map((hour, index) => {
    const securityIndex = indices[index] !== undefined ? indices[index] : null;
    return {
      hour: hour instanceof Date ? hour.getHours() + ":00" : "0:00",
      securityIndex: securityIndex,
      // Ajouter la couleur pour chaque point d'indice
      color: getSecurityIndexColor(securityIndex)
    }
  });

  // Créer des stops de dégradé pour chaque point d'indice
  const gradientStops = indices
    .filter(index => index !== null)
    .map((index, i, filteredIndices) => {
      // Calculer le pourcentage de position dans le gradient
      const offset = `${(i / Math.max(1, filteredIndices.length - 1)) * 100}%`;
      return {
        offset,
        color: getSecurityIndexColor(index)
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
            <linearGradient id="securityIndexGradient" x1="0" y1="0" x2="1" y2="0">
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
                key={`security-fill-${index}`}
                id={`securityIndexFillGradient-${index}`} 
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
            <pattern id="securityIndexPattern" x="0" y="0" width="100%" height="100%" patternUnits="userSpaceOnUse">
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
                    fill={`url(#securityIndexFillGradient-${index})`} 
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
            domain={[0, 4]} // Les indices vont de 0 à 4
            tickCount={5}
            tickLine={false}
            axisLine={true}
            tickMargin={8}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="securityIndex"
            stroke="url(#securityIndexGradient)"
            fill="url(#securityIndexPattern)"
            fillOpacity={1}
            strokeWidth={2}
            name="Indice Sécurité"
            activeDot={(props) => {
              const { cx, cy, payload } = props;
              // Obtenir la couleur en fonction de la valeur d'indice
              const color = getSecurityIndexColor(payload.securityIndex);
              
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
  );
}