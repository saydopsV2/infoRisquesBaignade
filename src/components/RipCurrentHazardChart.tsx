"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
    ChartConfig,
    ChartContainer,
} from "@/components/ui/chart";

// Interface pour les données du graphique
interface RipCurrentChartProps {
    hours?: Date[];
    velocities?: number[];
}

// Configuration du graphique
const chartConfig = {
    ripCurrentVelocity: {
        label: "Courant d'arrachement",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig;

// Composant personnalisé pour le tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // Déterminer la couleur du tooltip en fonction de la vitesse du courant
        const velocity = payload[0].value;
        const color = getRipCurrentColor(velocity);

        return (
            <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
                <p className="font-bold">{label}</p>
                <p style={{ color }}>
                    Vitesse: {velocity !== null ? `${velocity.toFixed(1)} m/s` : "-"}
                </p>
            </div>
        );
    }
    return null;
};

// Fonction pour obtenir la couleur basée sur la vitesse du courant d'arrachement
const getRipCurrentColor = (velocity: number | null): string => {
    if (velocity === null) return "#94a3b8"; // Couleur par défaut (gris)

    // Échelle de couleurs basée sur la vitesse
    if (velocity < 0.5) return "#16a34a"; // Vert foncé - Sécurité optimale
    if (velocity < 1.0) return "#4ade80"; // Vert clair - Faible risque
    if (velocity < 1.5) return "#fde047"; // Jaune - Risque modéré
    if (velocity < 2.0) return "#f97316"; // Orange - Risque élevé
    return "#dc2626"; // Rouge - Danger important
};

// Fonction pour obtenir la classe CSS basée sur la vitesse du courant d'arrachement
export const getRipCurrentColorClass = (velocity: number | null): string => {
    if (velocity === null) return "bg-gray-200";

    if (velocity < 0.5) return "bg-green-600"; // Vert foncé - Sécurité optimale
    if (velocity < 1.0) return "bg-green-400"; // Vert clair - Faible risque
    if (velocity < 1.5) return "bg-yellow-300"; // Jaune - Risque modéré
    if (velocity < 2.0) return "bg-orange-500"; // Orange - Risque élevé
    return "bg-red-600 text-white"; // Rouge - Danger important
};

// Version autonome du graphique de courant d'arrachement
export function RipCurrentHazardChart({ hours = [], velocities = [] }: RipCurrentChartProps) {
    // Préparer les données pour le graphique en combinant heures et vitesses
    const chartData = hours.map((hour, index) => {
        const velocity = velocities[index] !== undefined ? velocities[index] : null;
        return {
            hour: hour instanceof Date ? hour.getHours() + ":00" : "0:00",
            ripCurrentVelocity: velocity,
            // Ajouter la couleur pour chaque point
            color: getRipCurrentColor(velocity)
        }
    });

    // Créer des stops de dégradé pour chaque point de vitesse
    const gradientStops = velocities
        .filter(velocity => velocity !== null)
        .map((velocity, i, filteredVelocities) => {
            // Calculer le pourcentage de position dans le gradient
            const offset = `${(i / Math.max(1, filteredVelocities.length - 1)) * 100}%`;
            return {
                offset,
                color: getRipCurrentColor(velocity)
            };
        });

    return (
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
                        {/* Gradient horizontal pour le contour */}
                        <linearGradient id="ripCurrentGradient" x1="0" y1="0" x2="1" y2="0">
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
                                key={`ripCurrent-fill-${index}`}
                                id={`ripCurrentFillGradient-${index}`}
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
                        <pattern id="ripCurrentPattern" x="0" y="0" width="100%" height="100%" patternUnits="userSpaceOnUse">
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
                                        fill={`url(#ripCurrentFillGradient-${index})`}
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
                        domain={[0, 2.5]} // Domaine de valeurs estimé pour les vitesses
                        tickCount={6}
                        tickLine={false}
                        axisLine={true}
                        tickMargin={8}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="ripCurrentVelocity"
                        stroke="url(#ripCurrentGradient)"
                        fill="url(#ripCurrentPattern)"
                        fillOpacity={1}
                        strokeWidth={2}
                        name="Courant d'arrachement"
                        activeDot={(props) => {
                            const { cx, cy, payload } = props;
                            // Obtenir la couleur en fonction de la valeur de vitesse
                            const color = getRipCurrentColor(payload.ripCurrentVelocity);

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