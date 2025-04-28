"use client"

import { Line, Scatter, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {
    ChartConfig,
    ChartContainer,
} from "@/components/ui/chart";
import { useBeachAttendanceData } from "@/hooks/useBeachAttendanceData";

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

// Fonction pour obtenir la couleur basée sur le niveau de risque
const getHazardLevelColor = (level: number | null): string => {
    if (level === null) return "#94a3b8"; // Gris par défaut
    
    switch(level) {
        case 0: return "#e5e7eb"; // Gris clair - Niveau 0
        case 1: return "#51a336"; // Vert - Niveau 1
        case 2: return "#ebe102"; // Jaune - Niveau 2
        case 3: return "#f97316"; // Orange - Niveau 3
        case 4: return "#b91c1c"; // Rouge foncé - Niveau 4
        default: return "#94a3b8"; // Gris par défaut
    }
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
const CustomTooltip = ({ active, payload, label }: any) => {
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
        
        // Si le niveau de risque correspond, afficher le point
        if (payload?.hazardLevel === level) {
            return (
                <circle 
                    cx={cx} 
                    cy={cy} 
                    r={5} 
                    fill={getHazardLevelColor(level)}
                    stroke="#fff"
                    strokeWidth={1}
                />
            );
        }
        
        // Si le niveau ne correspond pas, retourner un élément vide au lieu de null
        return <circle cx={0} cy={0} r={0} opacity={0} />;
    };
};

export function ChartAllData() {
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
        return <div className="flex justify-center items-center h-48">Chargement des données...</div>;
    }

    // Si une erreur s'est produite, afficher un message d'erreur
    if (error) {
        return <div className="text-red-500">Erreur: {error}</div>;
    }

    // Convertir les valeurs de fréquentation de visiteurs (0-500) en pourcentage (0-100)
    const attendanceValues = originalAttendanceValues.map(value => 
        value !== null ? (value / 500) * 100 : null
    );

    // Préparer les données pour le graphique
    const chartData = dates.map((date, index) => {
        const attendancePercent = attendanceValues[index] !== undefined ? attendanceValues[index] : null;
        const hazardLevel = hazardLevels[index] !== undefined ? hazardLevels[index] : null;
        
        // Formater la date pour l'axe X en utilisant la fonction formatXAxisDate
        const xAxisDate = date instanceof Date ? formatXAxisDate(date) : "";
        
        return {
            xAxisDate,
            beachAttendance: attendancePercent,
            hazardLevel: hazardLevel,
            // Stocker la date originale pour l'affichage dans le tooltip
            originalDate: date,
            // Pour les séries scatter, on affiche un point à chaque niveau de danger
            scatterPoint: attendancePercent  // Même valeur que beachAttendance pour le positionnement
        }
    });

    return (
        <ChartContainer config={chartConfig} className="max-h-[400px] w-full bg-white p-4 rounded-lg">
            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart
                    data={chartData}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 10,
                        bottom: 20,
                    }}
                    style={{ backgroundColor: 'white' }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="xAxisDate"
                        tickLine={false}
                        axisLine={true}
                        tickMargin={8}
                        label={{ value: 'Time', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis
                        domain={[0, 100]} // Domaine en pourcentage (0-100%)
                        tickCount={6}
                        tickLine={false}
                        axisLine={true}
                        tickMargin={8}
                        label={{ value: 'Beach attendance (%)', angle: -90, position: 'insideLeft', dx: -10 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend align="right" verticalAlign="top" />
                    
                    {/* Ligne continue de fréquentation */}
                    <Line
                        type="monotone"
                        dataKey="beachAttendance"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        name="Predicted Crowd (continuous)"
                    />
                    
                    {/* Points colorés par niveau de risque */}
                    {[0, 1, 2, 3, 4].map(level => (
                        <Scatter
                            key={`level-${level}`}
                            name={`Level ${level}`}
                            dataKey="scatterPoint"
                            fill={getHazardLevelColor(level)}
                            shape={createLevelShape(level)}
                        />
                    ))}
                </ComposedChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}