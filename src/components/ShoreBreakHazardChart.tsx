"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
    ChartConfig,
    ChartContainer,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { DayNightZones } from "./DayNightZone"; // Importation de votre composant DayNightZones existant

// Interface pour les props
interface ShoreBreakHazardChartProps {
    hours: Date[];
    indices: number[];
    inTable?: boolean;
    showDayNightZones?: boolean; // Prop pour contrôler l'affichage des zones grisées
}

// Configuration du graphique
const chartConfig = {
    shoreBreakIndex: {
        label: "Indice Shore Break",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

// Composant personnalisé pour le tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const shoreBreakIndex = payload[0].value;
        const color = getShoreBreakColor(shoreBreakIndex);
        const hazardText = getHazardText(shoreBreakIndex);
        
        // Récupérer la date complète à partir des données du graphique
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
                    <span>Indice: {shoreBreakIndex !== null ? shoreBreakIndex.toFixed(1) : "-"}</span>
                </p>
                <p style={{ color }}>
                    <span>Niveau: {hazardText}</span>
                </p>
            </div>
        );
    }
    return null;
};

// Fonction pour obtenir la couleur basée sur l'indice shore break
const getShoreBreakColor = (index: number | null): string => {
    if (index === null) return "#94a3b8"; // Couleur par défaut (gris)
    if (index < 2) return "#16a34a"; // Vert foncé - Sécurité optimale
    if (index < 5) return "#4ade80"; // Vert clair - Faible risque
    if (index < 10) return "#fde047"; // Jaune - Risque modéré
    if (index < 15) return "#f97316"; // Orange - Risque élevé
    return "#dc2626"; // Rouge - Danger important
};

// Fonction pour obtenir le texte du niveau de danger
const getHazardText = (index: number | null): string => {
    if (index === null) return "Inconnu";
    if (index < 2) return "Très faible";
    if (index < 5) return "Faible";
    if (index < 10) return "Modéré";
    if (index < 15) return "Élevé";
    return "Très élevé";
};

// Composant du graphique d'indice de sécurité
export function ShoreBreakHazardChart({ 
    hours, 
    indices, 
    inTable = false, 
    showDayNightZones = true // Valeur par défaut à true pour maintenir le comportement actuel
}: ShoreBreakHazardChartProps) {
    // État pour s'assurer que le graphique est complètement rendu avant d'afficher les zones grisées
    const [isChartReady, setIsChartReady] = useState(false);

    // Déclencher le rendu des zones grisées après un court délai pour permettre au graphique de se rendre
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsChartReady(true);
        }, 300); // Légère latence pour s'assurer que le graphique est bien rendu
        return () => clearTimeout(timer);
    }, []);

    // Préparer les données pour le graphique en combinant heures et indices
    const chartData = hours.map((hour, index) => {
        const shoreBreakIndex = indices[index] !== undefined ? indices[index] : null;
        
        return {
            hour: hour instanceof Date ? `${hour.getHours()}:00` : "00:00",
            shoreBreakIndex: shoreBreakIndex,
            color: getShoreBreakColor(shoreBreakIndex),
            // Stocker la date originale pour l'affichage dans le tooltip
            originalDate: hour
        };
    });

    // Créer des stops de dégradé pour chaque point d'indice
    const gradientStops = indices
        .filter(index => index !== null && index !== undefined)
        .map((index, i, filteredIndices) => {
            const offset = `${(i / Math.max(1, filteredIndices.length - 1)) * 100}%`;
            return {
                offset,
                color: getShoreBreakColor(index)
            };
        });

    // Nombre de jours pour le grisage
    // Utiliser 7 jours pour correspondre au nombre de jours récupérés dans useShoreBreakData
    const numberOfDays = 7;

    return (
        <div className="relative">
            <ChartContainer config={chartConfig} className="max-h-[150px] w-full">
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart
                        data={chartData}
                        margin={{
                            top: 10,
                            right: 30,
                            left: inTable ? -45 : -55, // Marge gauche négative si dans tableau
                            bottom: 0,
                        }}
                    >
                        <defs>
                            {/* Gradient horizontal pour le contour */}
                            <linearGradient id="shoreBreakGradient" x1="0" y1="0" x2="1" y2="0">
                                {gradientStops.map((stop, index) => (
                                    <stop
                                        key={index}
                                        offset={stop.offset}
                                        stopColor={stop.color}
                                        stopOpacity={1}
                                    />
                                ))}
                            </linearGradient>

                            {/* Gradients verticaux pour chaque couleur
                            {gradientStops.map((stop, index) => (
                                <linearGradient
                                    key={`fill-${index}`}
                                    id={`shoreBreakFillGradient-${index}`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop offset="0%" stopColor={stop.color} stopOpacity={0.8} />
                                    <stop offset="100%" stopColor={stop.color} stopOpacity={0.1} />
                                </linearGradient>
                            ))} */}
                            
                            <pattern id="shoreBreakPattern" x="0" y="0" width="100%" height="100%" patternUnits="userSpaceOnUse">
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
                                            fill={`url(#shoreBreakFillGradient-${index})`}
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
                            domain={[0, 20]}
                            tickLine={false}
                            axisLine={true}
                            tickMargin={8}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="shoreBreakIndex"
                            stroke="url(#shoreBreakGradient)"
                            fill="url(#shoreBreakPattern)"
                            fillOpacity={1}
                            strokeWidth={6}
                            name="Indice Shore Break"
                            activeDot={(props) => {
                                const { cx, cy, payload } = props;
                                // Obtenir la couleur en fonction de l'indice shore break
                                const color = getShoreBreakColor(payload.shoreBreakIndex);

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
            
            {/* Afficher les zones grisées seulement quand le graphique est prêt et si showDayNightZones est true */}
            {isChartReady && showDayNightZones && (
                <DayNightZones 
                    numberOfDays={numberOfDays}
                    nightStartHour={20}
                    nightEndHour={9}
                />
            )}
        </div>
    );
}