"use client"

import { useState } from "react";
import { Line, Scatter, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
    ChartConfig,
    ChartContainer,
} from "@/components/ui/chart";
import { useBeachAttendanceData } from "@/hooks/useBeachAttendanceData";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Configuration du graphique
const chartConfig = {
    beachAttendance: {
        label: "Fréquentation des plages",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

// Interface pour les propriétés du shape personnalisé
interface ShapeProps {
    cx?: number;
    cy?: number;
    payload?: any;
    [key: string]: any;
}

// Type pour les vues temporelles
type TimeView = "today" | "plus3days" | "plus5days" | "plus7days";

// Constantes pour filtrer les heures
const START_HOUR = 11;
const END_HOUR = 20;

// Fonction pour obtenir la couleur basée sur le niveau de risque
const getHazardLevelColor = (level: number | null): string => {
    if (level === null) return "#94a3b8"; // Gris par défaut

    switch (level) {
        case 0: return "#e5e7eb"; // Gris clair - Niveau 0
        case 1: return "#51a336"; // Vert - Niveau 1
        case 2: return "#ebe102"; // Jaune - Niveau 2
        case 3: return "#f97316"; // Orange - Niveau 3
        case 4: return "#b91c1c"; // Rouge foncé - Niveau 4
        default: return "#94a3b8"; // Gris par défaut
    }
};

// Fonction pour vérifier si une heure est dans la plage autorisée
const isTimeInRange = (date: Date | null | undefined): boolean => {
    if (!date || !(date instanceof Date)) return false;
    const hour = date.getHours();
    return hour >= START_HOUR && hour <= END_HOUR;
};

// Fonction pour formater la date pour l'axe des abscisses
// Format "MM-DD HH" comme dans l'image de référence
const formatXAxisDate = (date: Date): string => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    return `${month}-${day} ${hour}`;
};

// Composant personnalisé pour le tooltip
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        // Récupérer les données du point
        const attendancePercent = payload[0]?.value;
        const hazardLevel = payload.length > 1 && payload[0]?.payload?.hazardLevel !== undefined
            ? payload[0].payload.hazardLevel
            : null;

        // Récupérer la date complète
        const item = payload[0].payload;
        const dateObj = item?.originalDate instanceof Date ? item.originalDate : new Date();

        // Formater la date pour afficher le jour et l'heure
        const formattedDate = dateObj.toLocaleDateString('fr-FR', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });

        // Formater l'heure
        const formattedTime = dateObj.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Première lettre en majuscule
        const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

        // Description du niveau de risque
        const hazardDescription = hazardLevel !== null ? [
            "Très faible",
            "Faible",
            "Modéré",
            "Élevé",
            "Très élevé"
        ][hazardLevel] : "Non disponible";

        return (
            <div className="bg-slate-100 p-3 border border-gray-200 shadow-md rounded-md">
                <p className="font-bold">{capitalizedDate}</p>
                <p className="text-sm text-gray-600">{formattedTime}</p>
                <div className="mt-2">
                    <p>Fréquentation: <strong>{attendancePercent?.toFixed(1)}%</strong></p>
                    {hazardLevel !== null && (
                        <p className="mt-1">
                            Niveau de risque: <span style={{ color: getHazardLevelColor(hazardLevel) }}>
                                <strong>{hazardDescription} (Niveau {hazardLevel})</strong>
                            </span>
                        </p>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

// Fonction pour créer des formes personnalisées pour les niveaux de risque
const createLevelShape = (level: number) => {
    return (props: ShapeProps) => {
        const { cx = 0, cy = 0, payload } = props;

        // Ne pas afficher de point si la valeur est null ou 0
        if (payload?.beachAttendance === null) {
            return <circle cx={0} cy={0} r={0} opacity={0} />;
        }

        // Vérifier si l'heure est comprise entre 11h et 20h
        const isInTimeRange = isTimeInRange(payload?.originalDate);

        // Si le niveau de risque correspond ET l'heure est dans la plage demandée, afficher le point
        if (payload?.hazardLevel === level && isInTimeRange) {
            return (
                <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill={getHazardLevelColor(level)}
                    stroke="#fff"
                    strokeWidth={1}
                />
            );
        }

        // Si le niveau ne correspond pas ou si l'heure n'est pas dans la plage, retourner un élément vide
        return <circle cx={0} cy={0} r={0} opacity={0} />;
    };
};

export function ChartAllData() {
    // État pour la vue temporelle actuelle
    const [activeView, setActiveView] = useState<TimeView>("plus7days");

    // Utiliser le hook pour récupérer les données
    const {
        attendanceValues: originalAttendanceValues,
        hazardLevels,
        dates,
        isLoading,
        error
    } = useBeachAttendanceData();

    // Si les données sont en cours de chargement, afficher un indicateur
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96 w-full bg-white/50 rounded-lg shadow-sm">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
                    <span className="text-gray-600 font-medium">Chargement des données...</span>
                </div>
            </div>
        );
    }

    // Si une erreur s'est produite, afficher un message d'erreur
    if (error) {
        return (
            <div className="flex justify-center items-center h-96 w-full bg-white/50 rounded-lg shadow-sm">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 max-w-md">
                    <h3 className="text-red-700 font-medium text-lg mb-2">Erreur de chargement</h3>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    // Fonction pour filtrer les données selon la vue temporelle sélectionnée
    const filterDataByTimeView = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Dates limites pour chaque vue
        const limitDate = new Date(today);
        switch (activeView) {
            case "today":
                limitDate.setDate(today.getDate() + 1); // aujourd'hui seulement
                break;
            case "plus3days":
                limitDate.setDate(today.getDate() + 3); // +3 jours
                break;
            case "plus5days":
                limitDate.setDate(today.getDate() + 5); // +5 jours
                break;
            case "plus7days":
                limitDate.setDate(today.getDate() + 7); // +7 jours
                break;
        }

        // Filtrer les données selon la limite de date
        return dates.map((date, index) => {
            // Ne garder que les données jusqu'à la date limite
            if (date <= limitDate) {
                return {
                    index,
                    date
                };
            }
            return null;
        }).filter(item => item !== null) as { index: number; date: Date }[];
    };

    // Filtrer les données selon la vue temporelle active
    const filteredDateIndices = filterDataByTimeView();

    // Convertir les valeurs de fréquentation de visiteurs (0-500) en pourcentage (0-100)
    const attendanceValues = originalAttendanceValues.map(value =>
        value !== null ? (value / 500) * 100 : null
    );

    // Préparer les données filtrées pour le graphique
    const chartData = filteredDateIndices.map(({ index }) => {
        const date = dates[index];
        const isVisible = isTimeInRange(date);
        
        // Pour la ligne, on affiche toujours la valeur (continue), mais pour les points, on filtre par heure
        const rawAttendancePercent = attendanceValues[index];
        // Ne rendre null que si la valeur est null ou 0, mais pas pour filtrer l'heure
        const lineAttendancePercent = (
            rawAttendancePercent !== undefined && 
            rawAttendancePercent !== 0 && 
            rawAttendancePercent !== null
        ) ? rawAttendancePercent : null;
        
        // Pour les points, on applique également le filtre horaire
        const pointAttendancePercent = (
            rawAttendancePercent !== undefined && 
            rawAttendancePercent !== 0 && 
            rawAttendancePercent !== null && 
            isVisible
        ) ? rawAttendancePercent : null;
        
        const hazardLevel = hazardLevels[index] !== undefined ? hazardLevels[index] : null;

        // Formater la date pour l'axe X
        const xAxisDate = date instanceof Date ? formatXAxisDate(date) : "";

        return {
            xAxisDate,
            beachAttendance: lineAttendancePercent, // Ligne continue
            visibleBeachAttendance: pointAttendancePercent, // Points uniquement entre 11h-20h
            hazardLevel: hazardLevel,
            // Stocker la date originale pour l'affichage dans le tooltip
            originalDate: date,
            // Pour les séries scatter, on n'affiche pas de point quand attendancePercent est null
            scatterPoint: pointAttendancePercent // Filtré par heure
        };
    });

    return (
        <div className="flex flex-col gap-4 w-full h-full" style={{ minHeight: '600px' }}>
            <div className="flex flex-col mb-4 px-2">
                <h2 className="text-xl font-semibold mb-2">Fréquentation des plages (points visibles 11h-20h)</h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">Période :</span>
                    <Select
                        value={activeView}
                        onValueChange={(value) => setActiveView(value as TimeView)}
                    >
                        <SelectTrigger className="w-[180px] bg-slate-50">
                            <SelectValue placeholder="Sélectionner une période" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="plus7days">+7 jours</SelectItem>
                            <SelectItem value="plus5days">+5 jours</SelectItem>
                            <SelectItem value="plus3days">+3 jours</SelectItem>
                            <SelectItem value="today">Aujourd'hui</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <ChartContainer config={chartConfig} className="h-[450px] md:h-[600px] w-full bg-white p-1 rounded-lg">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 0,
                            bottom: 50,
                        }}
                        style={{ backgroundColor: 'white' }}
                        className="text-base"
                    >
                        <defs>
                            {/* Gradient horizontal pour le contour de la ligne */}
                            <linearGradient id="attendanceGradient" x1="0" y1="0" x2="1" y2="0">
                                {chartData.map((item, index) => {
                                    // Calculer la position relative dans le gradient
                                    const offset = `${(index / Math.max(1, chartData.length - 1)) * 100}%`;
                                    return (
                                        <stop
                                            key={index}
                                            offset={offset}
                                            stopColor={getHazardLevelColor(item.hazardLevel)}
                                            stopOpacity={1}
                                        />
                                    );
                                })}
                            </linearGradient>

                            {/* Gradients verticaux pour l'aire sous la courbe */}
                            {chartData.map((item, index) => (
                                <linearGradient
                                    key={`fill-${index}`}
                                    id={`attendanceFillGradient-${index}`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop offset="0%" stopColor={getHazardLevelColor(item.hazardLevel)} stopOpacity={0.8} />
                                    <stop offset="100%" stopColor={getHazardLevelColor(item.hazardLevel)} stopOpacity={0.1} />
                                </linearGradient>
                            ))}

                            {/* Pattern qui combine les gradients verticaux */}
                            <pattern id="attendancePattern" x="0" y="0" width="100%" height="100%" patternUnits="userSpaceOnUse">
                                {chartData.map((_, index, arr) => {
                                    // Calculer la largeur de chaque segment
                                    const width = index < arr.length - 1
                                        ? (1 / (arr.length - 1)) * 100
                                        : (1 / arr.length) * 100;

                                    return (
                                        <rect
                                            key={index}
                                            x={`${(index / (arr.length - 1)) * 100}%`}
                                            y="0"
                                            width={`${width}%`}
                                            height="100%"
                                            fill={`url(#attendanceFillGradient-${index})`}
                                        />
                                    );
                                })}
                            </pattern>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="xAxisDate"
                            tickLine={false}
                            axisLine={true}
                            tickMargin={8}
                            tickCount={6}
                            label={{ value: 'Date/Heure', position: 'insideBottom', offset: -5 }}
                            tick={{ fontSize: 11 }}
                            height={60}
                            angle={-45}
                            textAnchor="end"
                        />
                        <YAxis
                            domain={[0, 100]} // Domaine en pourcentage (0-100%)
                            tickCount={6}
                            tickLine={false}
                            axisLine={true}
                            tickMargin={8}
                            label={{ value: 'Fréquentation (%)', angle: -90, position: 'insidemMidlle', dx: -15 }}
                            fontSize={12}
                        />
                        <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000 }} />

                        {/* Ligne continue de fréquentation avec gradient de couleur */}
                        <Line
                            type="monotone"
                            dataKey="beachAttendance"
                            stroke="url(#attendanceGradient)"
                            fill="url(#attendancePattern)"
                            strokeWidth={4}
                            dot={false} // Pas de points sur la ligne continue
                            connectNulls={false} // Ne pas connecter les points où la valeur est null
                            activeDot={false} // Désactiver les points actifs sur la ligne continue
                            name="Prévision d'affluence"
                        />
                        
                        {/* Ligne invisible avec points uniquement entre 11h et 20h */}
                        <Line
                            type="monotone"
                            dataKey="visibleBeachAttendance"
                            stroke="none" // Ligne invisible
                            fill="none"
                            strokeWidth={0}
                            dot={(props: any) => {
                                const { cx, cy, payload } = props;
                                // Ne pas afficher si la valeur est null
                                if (payload.visibleBeachAttendance === null) {
                                    return <circle cx={0} cy={0} r={0} opacity={0} />;
                                }
                                
                                // Obtenir la couleur en fonction du niveau de risque
                                const color = getHazardLevelColor(payload.hazardLevel);
                                // Afficher un point de taille standard
                                return (
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={5}
                                        fill={color}
                                        stroke="#fff"
                                        strokeWidth={1}
                                    />
                                );
                            }}
                            activeDot={(props: any) => {
                                const { cx, cy, payload } = props;
                                // Au lieu de retourner null, retournons un élément vide invisible
                                if (payload.visibleBeachAttendance === null) {
                                    return <circle cx={0} cy={0} r={0} opacity={0} />;
                                }
                                
                                // Obtenir la couleur en fonction du niveau de risque
                                const color = getHazardLevelColor(payload.hazardLevel);
                                return (
                                    <g>
                                        {/* Cercle extérieur blanc */}
                                        <circle cx={cx} cy={cy} r={10} fill="white" />
                                        {/* Cercle intérieur coloré */}
                                        <circle cx={cx} cy={cy} r={8} fill={color} />
                                    </g>
                                );
                            }}
                            name="Points (11h-20h)"
                        />

                        {/* Points colorés par niveau de risque - uniquement utilisés pour la légende */}
                        {[0, 1, 2, 3, 4].map(level => {
                            const levelNames = [
                                "Risque très faible",
                                "Risque faible",
                                "Risque modéré",
                                "Risque élevé",
                                "Risque très élevé"
                            ];
                            return (
                                <Scatter
                                    key={`level-${level}`}
                                    name={levelNames[level]}
                                    dataKey="scatterPoint"
                                    fill={getHazardLevelColor(level)}
                                    shape={createLevelShape(level)}
                                    legendType="circle"
                                    hide={true} // Masquer les séries scatter pour éviter les doublons
                                />
                            );
                        })}
                    </ComposedChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    );
}