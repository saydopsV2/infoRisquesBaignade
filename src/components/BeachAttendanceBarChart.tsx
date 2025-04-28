"use client"

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  hazardLevel: {
    label: "Niveau de risque",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

// Type pour les vues temporelles
type TimeView = "today" | "plus3days" | "plus5days";

// Composant pour afficher la légende des niveaux de risque
const RiskLevelLegend = () => {
  const riskLevels = [
    { level: 0, label: "Risque très faible", color: "#e5e7eb" },
    { level: 1, label: "Risque faible", color: "#51a336" },
    { level: 2, label: "Risque modéré", color: "#ebe102" },
    { level: 3, label: "Risque élevé", color: "#f97316" },
    { level: 4, label: "Risque très élevé", color: "#b91c1c" },
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center my-2">
      {riskLevels.map((risk) => (
        <div key={risk.level} className="flex items-center gap-1">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: risk.color }}
          ></div>
          <span className="text-md">{risk.label}</span>
        </div>
      ))}
    </div>
  );
};

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

// Fonction pour formater la date pour l'axe des abscisses
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
    const hazardLevel = payload[0]?.payload?.hazardLevel;

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
    const hazardDescription = hazardLevel !== undefined ? [
      "Très faible",
      "Faible",
      "Modéré",
      "Élevé",
      "Très élevé"
    ][hazardLevel] : "Non disponible";

    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-bold">{capitalizedDate}</p>
        <p className="text-sm text-gray-600">{formattedTime}</p>
        <div className="mt-2">
          <p>Fréquentation: <strong>{attendancePercent?.toFixed(1)}%</strong></p>
          {hazardLevel !== undefined && (
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

export function BeachAttendanceBarChart() {
  // État pour la vue temporelle actuelle
  const [activeView, setActiveView] = useState<TimeView>("today");

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
      <Card className="w-full h-[500px]">
        <CardContent className="flex justify-center items-center h-full">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
            <span className="text-gray-600 font-medium">Chargement des données...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si une erreur s'est produite, afficher un message d'erreur
  if (error) {
    return (
      <Card className="w-full h-[500px]">
        <CardContent className="flex justify-center items-center h-full">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 max-w-md">
            <h3 className="text-red-700 font-medium text-lg mb-2">Erreur de chargement</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
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
        limitDate.setDate(today.getDate() + 4); // +4 jours
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
    const attendancePercent = attendanceValues[index] !== undefined ? attendanceValues[index] : null;
    const hazardLevel = hazardLevels[index] !== undefined ? hazardLevels[index] : null;

    // Formater la date pour l'axe X
    const xAxisDate = date instanceof Date ? formatXAxisDate(date) : "";

    return {
      xAxisDate,
      beachAttendance: attendancePercent,
      hazardLevel: hazardLevel,
      // Stocker la date originale pour l'affichage dans le tooltip
      originalDate: date,
      // Associer une couleur au niveau de risque pour les barres
      barColor: getHazardLevelColor(hazardLevel)
    };
  });

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col items-start justify-between pb-2">
        <div>
          <CardTitle>Fréquentation des plages</CardTitle>
          <CardDescription>Affluence et niveau de risque</CardDescription>
        </div>
        <Select
          value={activeView}
          onValueChange={(value) => setActiveView(value as TimeView)}
        >
          <SelectTrigger className="w-[180px] bg-slate-50">
            <SelectValue placeholder="Sélectionner une période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Aujourd'hui</SelectItem>
            <SelectItem value="plus3days">+3 jours</SelectItem>
            <SelectItem value="plus5days">+4 jours</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {/* Ajout de la légende des niveaux de risque */}
        <RiskLevelLegend />

        <ChartContainer config={chartConfig} className="h-[250px] w-full bg-white rounded-lg">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 30,
                right: 30,
                left: 20,
                bottom: 50,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="xAxisDate"
                tickLine={false}
                axisLine={true}
                tickMargin={10}
                height={60}
                interval={0}
                angle={-45}
                textAnchor="end"
                tick={{ fontSize: 11 }}
                label={{ value: 'Date/Heure', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                tickLine={false}
                axisLine={true}
                tickMargin={10}
                label={{ value: 'Fréquentation (%)', angle: -90, position: 'insideLeft', dx: -5 }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000 }} />
              <Bar
                dataKey="beachAttendance"
                name="Prévision d'affluence"
                barSize={60}
                radius={[4, 4, 0, 0]}
              >
                {
                  chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.barColor || chartConfig.beachAttendance.color}
                    />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}