"use client"

import * as React from "react"
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
} from "@/components/ui/chart"

// Interface pour les données du graphique
interface DataPoint {
    date: string;
    [key: string]: string | number;
}

// Interface pour les props du composant
interface BarChartProps {
    title?: string;
    description?: string;
    data?: DataPoint[];
    dataKeys?: string[];
    chartConfig?: ChartConfig;
}

// Types pour les filtres
type TimeRange = "today" | "in3days" | "in5days";
type ViewMode = "day" | "hour";

// Configuration par défaut du graphique
const defaultChartConfig = {
    views: {
        label: "Fréquentation",
    },
    morning: {
        label: "Matin",
        color: "hsl(214, 90%, 52%)", // Bleu pour le matin
    },
    afternoon: {
        label: "Après-midi",
        color: "hsl(214, 80%, 50%)", // Bleu légèrement plus foncé pour l'après-midi
    },
} satisfies ChartConfig;

// Données d'exemple pour le graphique
const chartData = [
    { date: "2025-05-01T00:00:00", morning: 222, afternoon: 150 },
    { date: "2025-05-01T01:00:00", morning: 97, afternoon: 180 },
    { date: "2025-05-01T02:00:00", morning: 167, afternoon: 120 },
    { date: "2025-05-01T03:00:00", morning: 242, afternoon: 260 },
    { date: "2025-05-01T04:00:00", morning: 373, afternoon: 290 },
    { date: "2025-05-01T05:00:00", morning: 301, afternoon: 340 },
    { date: "2025-05-01T06:00:00", morning: 245, afternoon: 180 },
    { date: "2025-05-01T07:00:00", morning: 409, afternoon: 320 },
    { date: "2025-05-01T08:00:00", morning: 59, afternoon: 110 },
    { date: "2025-05-01T09:00:00", morning: 261, afternoon: 190 },
    { date: "2025-05-01T10:00:00", morning: 327, afternoon: 350 },
    { date: "2025-05-01T11:00:00", morning: 292, afternoon: 210 },
    { date: "2025-05-01T12:00:00", morning: 342, afternoon: 380 },
    { date: "2025-05-01T13:00:00", morning: 137, afternoon: 220 },
    { date: "2025-05-01T14:00:00", morning: 120, afternoon: 170 },
    { date: "2025-05-01T15:00:00", morning: 138, afternoon: 190 },
    { date: "2025-05-01T16:00:00", morning: 446, afternoon: 360 },
    { date: "2025-05-01T17:00:00", morning: 364, afternoon: 410 },
    { date: "2025-05-01T18:00:00", morning: 243, afternoon: 180 },
    { date: "2025-05-01T19:00:00", morning: 89, afternoon: 150 },
    { date: "2025-05-01T20:00:00", morning: 137, afternoon: 200 },
    { date: "2025-05-01T21:00:00", morning: 224, afternoon: 170 },
    { date: "2025-05-01T22:00:00", morning: 138, afternoon: 230 },
    { date: "2025-05-01T23:00:00", morning: 387, afternoon: 290 },
    { date: "2025-05-02T00:00:00", morning: 215, afternoon: 250 },
    { date: "2025-05-02T01:00:00", morning: 75, afternoon: 130 },
    { date: "2025-05-02T02:00:00", morning: 383, afternoon: 420 },
    { date: "2025-05-02T03:00:00", morning: 122, afternoon: 180 },
    { date: "2025-05-02T04:00:00", morning: 315, afternoon: 240 },
    { date: "2025-05-02T05:00:00", morning: 454, afternoon: 380 },
    { date: "2025-05-02T06:00:00", morning: 165, afternoon: 220 },
    { date: "2025-05-02T07:00:00", morning: 293, afternoon: 310 },
    { date: "2025-05-02T08:00:00", morning: 247, afternoon: 190 },
    { date: "2025-05-02T09:00:00", morning: 385, afternoon: 420 },
    { date: "2025-05-02T10:00:00", morning: 481, afternoon: 390 },
    { date: "2025-05-02T11:00:00", morning: 498, afternoon: 520 },
    { date: "2025-05-02T12:00:00", morning: 388, afternoon: 300 },
    { date: "2025-05-02T13:00:00", morning: 149, afternoon: 210 },
    { date: "2025-05-02T14:00:00", morning: 227, afternoon: 180 },
    { date: "2025-05-02T15:00:00", morning: 293, afternoon: 330 },
    { date: "2025-05-02T16:00:00", morning: 335, afternoon: 270 },
    { date: "2025-05-02T17:00:00", morning: 197, afternoon: 240 },
    { date: "2025-05-02T18:00:00", morning: 197, afternoon: 160 },
    { date: "2025-05-02T19:00:00", morning: 448, afternoon: 490 },
    { date: "2025-05-02T20:00:00", morning: 473, afternoon: 380 },
    { date: "2025-05-02T21:00:00", morning: 338, afternoon: 400 },
    { date: "2025-05-02T22:00:00", morning: 499, afternoon: 420 },
    { date: "2025-05-02T23:00:00", morning: 315, afternoon: 350 },
    { date: "2025-05-03T00:00:00", morning: 235, afternoon: 180 },
    { date: "2025-05-03T01:00:00", morning: 177, afternoon: 230 },
    { date: "2025-05-03T02:00:00", morning: 82, afternoon: 140 },
    { date: "2025-05-03T03:00:00", morning: 81, afternoon: 120 },
    { date: "2025-05-03T04:00:00", morning: 252, afternoon: 290 },
    { date: "2025-05-03T05:00:00", morning: 294, afternoon: 220 },
    { date: "2025-05-03T06:00:00", morning: 201, afternoon: 250 },
    { date: "2025-05-03T07:00:00", morning: 213, afternoon: 170 },
    { date: "2025-05-03T08:00:00", morning: 420, afternoon: 460 },
    { date: "2025-05-03T09:00:00", morning: 233, afternoon: 190 },
    { date: "2025-05-03T10:00:00", morning: 78, afternoon: 130 },
    { date: "2025-05-03T11:00:00", morning: 340, afternoon: 280 },
    { date: "2025-05-03T12:00:00", morning: 178, afternoon: 230 },
    { date: "2025-05-03T13:00:00", morning: 178, afternoon: 200 },
    { date: "2025-05-03T14:00:00", morning: 470, afternoon: 410 },
    { date: "2025-05-03T15:00:00", morning: 103, afternoon: 160 },
    { date: "2025-05-03T16:00:00", morning: 439, afternoon: 380 },
    { date: "2025-05-03T17:00:00", morning: 88, afternoon: 140 },
    { date: "2025-05-03T18:00:00", morning: 294, afternoon: 250 },
    { date: "2025-05-03T19:00:00", morning: 323, afternoon: 370 },
    { date: "2025-05-03T20:00:00", morning: 385, afternoon: 320 },
    { date: "2025-05-03T21:00:00", morning: 438, afternoon: 480 },
    { date: "2025-05-03T22:00:00", morning: 155, afternoon: 200 },
    { date: "2025-05-03T23:00:00", morning: 92, afternoon: 150 },
    { date: "2025-05-04T00:00:00", morning: 492, afternoon: 420 },
    { date: "2025-05-04T01:00:00", morning: 81, afternoon: 130 },
    { date: "2025-05-04T02:00:00", morning: 426, afternoon: 380 },
    { date: "2025-05-05T03:00:00", morning: 307, afternoon: 350 },
    { date: "2025-05-05T04:00:00", morning: 371, afternoon: 310 },
    { date: "2025-05-05T05:00:00", morning: 475, afternoon: 520 },
    { date: "2025-05-05T06:00:00", morning: 107, afternoon: 170 },
    { date: "2025-05-05T06:00:00", morning: 341, afternoon: 290 },
    { date: "2025-05-05T07:00:00", morning: 408, afternoon: 450 },
    { date: "2025-05-05T08:00:00", morning: 169, afternoon: 210 },
    { date: "2025-05-05T09:00:00", morning: 317, afternoon: 270 },
    { date: "2025-05-05T10:00:00", morning: 480, afternoon: 530 },
    { date: "2025-05-05T11:00:00", morning: 132, afternoon: 180 },
    { date: "2025-05-05T12:00:00", morning: 141, afternoon: 190 },
    { date: "2025-05-05T13:00:00", morning: 434, afternoon: 380 },
    { date: "2025-05-05T14:00:00", morning: 448, afternoon: 490 },
    { date: "2025-05-05T15:00:00", morning: 149, afternoon: 200 },
    { date: "2025-05-05T16:00:00", morning: 103, afternoon: 160 },
    { date: "2025-05-05T17:00:00", morning: 446, afternoon: 400 },
    { date: "2025-05-05T18:00:00", morning: 385, afternoon: 320 },
    { date: "2025-05-05T19:00:00", morning: 438, afternoon: 480 },
    { date: "2025-05-05T20:00:00", morning: 155, afternoon: 200 },
    { date: "2025-05-05T23:00:00", morning: 92, afternoon: 150 },
]

// Interface pour les composants Select
interface SelectItemProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

interface SelectProps {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}

// Composants Select simplifiés
const Select = ({ value, onValueChange, children, className = "" }: SelectProps): React.JSX.Element => {
    return (
        <div className={`relative ${className}`}>
            <select
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
                {React.Children.map(children, child => {
                    if (React.isValidElement<SelectItemProps>(child)) {
                        return <option value={child.props.value}>{child.props.children}</option>
                    }
                    return null
                })}
            </select>
        </div>
    )
}

const SelectItem = ({ value, children, className = "" }: SelectItemProps): React.JSX.Element => (
    <option value={value} className={className}>{children}</option>
)

// Type pour les props du tooltip personnalisé
interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        dataKey: string;
        color: string;
    }>;
    label?: string;
    viewMode?: ViewMode;
}

// Composant personnalisé pour le tooltip avec format amélioré
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, viewMode }) => {
    if (active && payload && payload.length) {
        // Obtenir les données du point survolé
        const data = payload[0];
        const value = data.value;
        const dataKey = data.dataKey;
        const color = data.color || "hsl(var(--chart-1))";

        // Formatter la date
        const date = new Date(label || "");
        let formattedDate;
        let timeInfo;

        if (viewMode === "hour") {
            formattedDate = date.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            timeInfo = `${date.getHours()}:00`;
        } else {
            formattedDate = date.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            timeInfo = "Maximum journalier";
        }

        // Capitaliser la première lettre du jour
        const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

        // Traduire les clés de données en français
        const keyLabel = dataKey === 'morning' ? 'Matin' :
            dataKey === 'afternoon' ? 'Après-midi' :
                dataKey;

        return (
            <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
                <p className="font-bold mb-1">{capitalizedDate}</p>
                <p className="text-gray-600 text-sm mb-2">{timeInfo} </p>
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></div>
                    <p>
                        <span className="font-medium">{keyLabel}: </span>
                        <span className="font-semibold">{value.toLocaleString()}</span>
                        <span className="text-gray-500 ml-1">visiteurs</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

// Composant Bar Chart réutilisable avec options avancées
export function BarChartComponent({
    title = "Fréquentation des plages",
    data = chartData,
    dataKeys = ["morning", "afternoon"],
    chartConfig = defaultChartConfig
}: BarChartProps) {
    // États pour la gestion des données et modes d'affichage
    const [activeChart, setActiveChart] = React.useState<string>(dataKeys[0]);
    const [timeRange, setTimeRange] = React.useState<TimeRange>("today");
    const [viewMode, setViewMode] = React.useState<ViewMode>("hour");

    // Gestionnaire pour le changement de plage temporelle
    const handleTimeRangeChange = (value: string) => {
        const newTimeRange = value as TimeRange;

        // Si on sélectionne "today" (Aujourd'hui), forcer le mode de vue à "hour"
        if (newTimeRange === "today") {
            setViewMode("hour");
        }

        setTimeRange(newTimeRange);
    };

    // Gestionnaire pour le changement de mode de vue
    const handleViewModeChange = (value: string) => {
        setViewMode(value as ViewMode);
    };

    // Effet pour s'assurer que la vue "aujourd'hui" est toujours en mode horaire
    React.useEffect(() => {
        if (timeRange === "today" && viewMode !== "hour") {
            setViewMode("hour");
        }
    }, [timeRange, viewMode]);

    // Traitement des données en fonction du mode de vue et de la plage de temps
    const processedData = React.useMemo(() => {
        // Pour les besoins de la démonstration, nous utilisons une date fixe
        if (viewMode === "hour") {
            // En mode horaire
            if (timeRange === "today") {
                // Pour "aujourd'hui", montrer seulement les données de ce jour
                const targetDate = new Date("2025-05-05");
                const targetDateStr = targetDate.toISOString().split('T')[0]; // "2025-05-05"

                return data.filter(item => {
                    return item.date.startsWith(targetDateStr);
                });
            } else if (timeRange === "in3days") {
                // Pour "3 prochains jours", montrer les données horaires des 3 jours
                const relevantDays = ["2025-05-03", "2025-05-04", "2025-05-05"];

                return data.filter(item => {
                    const itemDateStr = item.date.split('T')[0];
                    return relevantDays.includes(itemDateStr);
                });
            } else { // "in5days"
                // Pour "5 prochains jours", montrer les données horaires des 5 jours
                const relevantDays = ["2025-05-01", "2025-05-02", "2025-05-03", "2025-05-04", "2025-05-05"];

                return data.filter(item => {
                    const itemDateStr = item.date.split('T')[0];
                    return relevantDays.includes(itemDateStr);
                });
            }
        } else {
            // Mode jour - Utiliser les MAXIMUMS journaliers
            let startDate: Date;

            if (timeRange === "today") {
                startDate = new Date("2025-05-05");
            } else if (timeRange === "in3days") {
                startDate = new Date("2025-05-03");
            } else { // "in5days"
                startDate = new Date("2025-05-01");
            }

            // Uniquement montrer les jours complets dans nos données
            const daysToShow = ["2025-05-01", "2025-05-02", "2025-05-03", "2025-05-04", "2025-05-05"];

            const startDateStr = startDate.toISOString().split('T')[0];
            const startIndex = daysToShow.indexOf(startDateStr);

            if (startIndex >= 0) {
                const relevantDays = daysToShow.slice(startIndex);

                // Créer un tableau agrégé par jour
                const dailyData = relevantDays.map(day => {
                    // Filtrer les entrées pour ce jour
                    const dayEntries = data.filter(item => item.date.startsWith(day));

                    // Calculer les MAXIMUMS pour ce jour
                    const morningMax = Math.max(...dayEntries.map(entry => (typeof entry.morning === 'number' ? entry.morning : 0)));
                    const afternoonMax = Math.max(...dayEntries.map(entry => (typeof entry.afternoon === 'number' ? entry.afternoon : 0)));

                    return {
                        date: `${day}T12:00:00`, // Midi pour représenter le jour
                        morning: morningMax,
                        afternoon: afternoonMax
                    };
                });

                return dailyData;
            }

            return [];
        }
    }, [data, timeRange, viewMode]);

    // Calculer les totaux pour chaque clé de données
    const total = React.useMemo(() => {
        const result: Record<string, number> = {};
        dataKeys.forEach(key => {
            result[key] = processedData.reduce((acc, curr) => {
                const value = (curr as DataPoint)[key];
                return acc + (typeof value === 'number' ? value : 0);
            }, 0);
        });
        return result;
    }, [processedData, dataKeys]);

    // Fonction pour formater les étiquettes de l'axe X
    const formatXAxisTick = (value: string): string => {
        const date = new Date(value);

        if (viewMode === "hour") {
            return `${date.getHours()}:00`;
        } else {
            return date.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit"
            });
        }
    };

    // Fonction pour formater les étiquettes de l'axe Y
    const formatYAxisTick = (value: number): string => {
        // Pour les petites valeurs, afficher le nombre entier
        if (value < 1000) {
            return value.toString();
        }
        // Pour les grandes valeurs, afficher en milliers (k)
        return `${(value / 1000).toFixed(1)}k`;
    };

    // Déterminer si le sélecteur de vue doit être affiché
    const showViewModeSelector = timeRange !== "today";

    return (
        <Card>
            <CardHeader className="flex flex-col space-y-2 border-b p-5 sm:flex-row sm:items-center sm:space-y-0">
                <div className="flex flex-1 flex-col justify-center gap-1">
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>
                        {viewMode === "hour"
                            ? "Visualisation de la fréquentation horaire"
                            : "Visualisation de la fréquentation journalière (valeurs maximales)"}
                    </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    {showViewModeSelector && (
                        <Select value={viewMode} onValueChange={handleViewModeChange} className="w-40">
                            <SelectItem value="hour">Vue horaire</SelectItem>
                            <SelectItem value="day">Vue journalière</SelectItem>
                        </Select>
                    )}
                    <Select value={timeRange} onValueChange={handleTimeRangeChange} className="w-40">
                        <SelectItem value="in5days">5 prochains jours</SelectItem>
                        <SelectItem value="in3days">3 prochains jours</SelectItem>
                        <SelectItem value="today">Aujourd'hui</SelectItem>
                    </Select>
                </div>
            </CardHeader>

            <div className="flex border-b">
                {dataKeys.map((key) => (
                    <button
                        key={key}
                        data-active={activeChart === key}
                        className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-r px-6 py-4 text-center data-[active=true]:bg-slate-200"
                        onClick={() => setActiveChart(key)}
                    >
                        <span className="text-xs text-muted-foreground">
                            {key === "morning" ? "Matin" : "Après-midi"}
                        </span>
                        <span className="text-lg font-bold leading-none sm:text-2xl">
                            {total[key]?.toLocaleString() || 0}
                        </span>
                    </button>
                ))}
            </div>

            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 pb-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[300px] w-full"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                            accessibilityLayer
                            data={processedData}
                            margin={{
                                left: 40,
                                right: 12,
                                top: 10,
                                bottom: 20
                            }}
                        >
                            <CartesianGrid 
                                vertical={true} 
                                horizontal={true} 
                                strokeDasharray="3 3" 
                                opacity={0.4} 
                            />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={true}
                                tickMargin={8}
                                minTickGap={viewMode === "hour" ? 25 : 10}
                                tickFormatter={formatXAxisTick}
                                interval={viewMode === "hour" ? 2 : 0}
                            />
                            <YAxis 
                                tickFormatter={formatYAxisTick} 
                                tickLine={false}
                                axisLine={true}
                                tickMargin={8}
                                label={{ 
                                    value: 'Visiteurs', 
                                    angle: -90, 
                                    position: 'insideLeft',
                                    offset: -20,
                                    style: {
                                        textAnchor: 'middle',
                                        fill: 'var(--foreground)',
                                        fontSize: 12
                                    }
                                }}
                            />
                            <Tooltip
                                content={<CustomTooltip viewMode={viewMode} />}
                                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                            />
                            <Bar
                                dataKey={activeChart}
                                fill={activeChart === "morning"
                                    ? "hsl(214, 82.10%, 60.60%)" // Bleu pour le matin
                                    : "hsl(207, 100.00%, 39.00%)" // Bleu légèrement plus foncé pour l'après-midi
                                }
                                radius={[4, 4, 0, 0]}
                                animationDuration={500}
                                animationEasing="ease-out"
                            />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <div className="mt-4 text-sm text-center text-gray-500">
                    <p>Les données affichées représentent la fréquentation des plages durant la saison estivale 2025.</p>
                    <p className="mt-1">Source: Relevés de fréquentation - Surveillance des plages 2025</p>
                </div>
            </CardContent>
        </Card>
    )
}

// On exporte BarChart comme étant le composant BarChartComponent
export const BarChart = BarChartComponent;

// Exemple d'utilisation autonome du composant (équivalent au StandaloneChart dans Chart.tsx)
export function Component() {
    return (
        <BarChartComponent
            title="Fréquentation des plages"
            description="Nombre de visiteurs par période"
            data={chartData}
            dataKeys={["morning", "afternoon"]}
        />
    )
}