"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"

// Définition des interfaces pour le typage
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface ChartDataItem {
  date: string;
  matin: number;
  apresmidi: number;
}

// Importer des composants UI personnalisés (versions simplifiées)
const Card = ({ children, className = "" }: CardProps): React.JSX.Element => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>
)

const CardHeader = ({ children, className = "" }: CardProps): React.JSX.Element => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
)

const CardTitle = ({ children, className = "" }: CardProps): React.JSX.Element => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
)

const CardDescription = ({ children, className = "" }: CardProps): React.JSX.Element => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
)

const CardContent = ({ children, className = "" }: CardProps): React.JSX.Element => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
)

const Select = ({ value, onValueChange, children }: SelectProps): React.JSX.Element => {
  return (
    <div className="relative w-[160px]">
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
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

const chartData: ChartDataItem[] = [
  { date: "2025-05-01T00:00:00", matin: 222, apresmidi: 150 },
  { date: "2025-05-01T01:00:00", matin: 97, apresmidi: 180 },
  { date: "2025-05-01T02:00:00", matin: 167, apresmidi: 120 },
  { date: "2025-05-01T03:00:00", matin: 242, apresmidi: 260 },
  { date: "2025-05-01T04:00:00", matin: 373, apresmidi: 290 },
  { date: "2025-05-01T05:00:00", matin: 301, apresmidi: 340 },
  { date: "2025-05-01T06:00:00", matin: 245, apresmidi: 180 },
  { date: "2025-05-01T07:00:00", matin: 409, apresmidi: 320 },
  { date: "2025-05-01T08:00:00", matin: 59, apresmidi: 110 },
  { date: "2025-05-01T09:00:00", matin: 261, apresmidi: 190 },
  { date: "2025-05-01T10:00:00", matin: 327, apresmidi: 350 },
  { date: "2025-05-01T11:00:00", matin: 292, apresmidi: 210 },
  { date: "2025-05-01T12:00:00", matin: 342, apresmidi: 380 },
  { date: "2025-05-01T13:00:00", matin: 137, apresmidi: 220 },
  { date: "2025-05-01T14:00:00", matin: 120, apresmidi: 170 },
  { date: "2025-05-01T15:00:00", matin: 138, apresmidi: 190 },
  { date: "2025-05-01T16:00:00", matin: 446, apresmidi: 360 },
  { date: "2025-05-01T17:00:00", matin: 364, apresmidi: 410 },
  { date: "2025-05-01T18:00:00", matin: 243, apresmidi: 180 },
  { date: "2025-05-01T19:00:00", matin: 89, apresmidi: 150 },
  { date: "2025-05-01T20:00:00", matin: 137, apresmidi: 200 },
  { date: "2025-05-01T21:00:00", matin: 224, apresmidi: 170 },
  { date: "2025-05-01T22:00:00", matin: 138, apresmidi: 230 },
  { date: "2025-05-01T23:00:00", matin: 387, apresmidi: 290 },
  { date: "2025-05-02T00:00:00", matin: 215, apresmidi: 250 },
  { date: "2025-05-02T01:00:00", matin: 75, apresmidi: 130 },
  { date: "2025-05-02T02:00:00", matin: 383, apresmidi: 420 },
  { date: "2025-05-02T03:00:00", matin: 122, apresmidi: 180 },
  { date: "2025-05-02T04:00:00", matin: 315, apresmidi: 240 },
  { date: "2025-05-02T05:00:00", matin: 454, apresmidi: 380 },
  { date: "2025-05-02T06:00:00", matin: 165, apresmidi: 220 },
  { date: "2025-05-02T07:00:00", matin: 293, apresmidi: 310 },
  { date: "2025-05-02T08:00:00", matin: 247, apresmidi: 190 },
  { date: "2025-05-02T09:00:00", matin: 385, apresmidi: 420 },
  { date: "2025-05-02T10:00:00", matin: 481, apresmidi: 390 },
  { date: "2025-05-02T11:00:00", matin: 498, apresmidi: 520 },
  { date: "2025-05-02T12:00:00", matin: 388, apresmidi: 300 },
  { date: "2025-05-02T13:00:00", matin: 149, apresmidi: 210 },
  { date: "2025-05-02T14:00:00", matin: 227, apresmidi: 180 },
  { date: "2025-05-02T15:00:00", matin: 293, apresmidi: 330 },
  { date: "2025-05-02T16:00:00", matin: 335, apresmidi: 270 },
  { date: "2025-05-02T17:00:00", matin: 197, apresmidi: 240 },
  { date: "2025-05-02T18:00:00", matin: 197, apresmidi: 160 },
  { date: "2025-05-02T19:00:00", matin: 448, apresmidi: 490 },
  { date: "2025-05-02T20:00:00", matin: 473, apresmidi: 380 },
  { date: "2025-05-02T21:00:00", matin: 338, apresmidi: 400 },
  { date: "2025-05-02T22:00:00", matin: 499, apresmidi: 420 },
  { date: "2025-05-02T23:00:00", matin: 315, apresmidi: 350 },
  { date: "2025-05-03T00:00:00", matin: 235, apresmidi: 180 },
  { date: "2025-05-03T01:00:00", matin: 177, apresmidi: 230 },
  { date: "2025-05-03T02:00:00", matin: 82, apresmidi: 140 },
  { date: "2025-05-03T03:00:00", matin: 81, apresmidi: 120 },
  { date: "2025-05-03T04:00:00", matin: 252, apresmidi: 290 },
  { date: "2025-05-03T05:00:00", matin: 294, apresmidi: 220 },
  { date: "2025-05-03T06:00:00", matin: 201, apresmidi: 250 },
  { date: "2025-05-03T07:00:00", matin: 213, apresmidi: 170 },
  { date: "2025-05-03T08:00:00", matin: 420, apresmidi: 460 },
  { date: "2025-05-03T09:00:00", matin: 233, apresmidi: 190 },
  { date: "2025-05-03T10:00:00", matin: 78, apresmidi: 130 },
  { date: "2025-05-03T11:00:00", matin: 340, apresmidi: 280 },
  { date: "2025-05-03T12:00:00", matin: 178, apresmidi: 230 },
  { date: "2025-05-03T13:00:00", matin: 178, apresmidi: 200 },
  { date: "2025-05-03T14:00:00", matin: 470, apresmidi: 410 },
  { date: "2025-05-03T15:00:00", matin: 103, apresmidi: 160 },
  { date: "2025-05-03T16:00:00", matin: 439, apresmidi: 380 },
  { date: "2025-05-03T17:00:00", matin: 88, apresmidi: 140 },
  { date: "2025-05-03T18:00:00", matin: 294, apresmidi: 250 },
  { date: "2025-05-03T19:00:00", matin: 323, apresmidi: 370 },
  { date: "2025-05-03T20:00:00", matin: 385, apresmidi: 320 },
  { date: "2025-05-03T21:00:00", matin: 438, apresmidi: 480 },
  { date: "2025-05-03T22:00:00", matin: 155, apresmidi: 200 },
  { date: "2025-05-03T23:00:00", matin: 92, apresmidi: 150 },
  { date: "2025-05-04T00:00:00", matin: 492, apresmidi: 420 },
  { date: "2025-05-04T01:00:00", matin: 81, apresmidi: 130 },
  { date: "2025-05-04T02:00:00", matin: 426, apresmidi: 380 },
  { date: "2025-05-05T03:00:00", matin: 307, apresmidi: 350 },
  { date: "2025-05-05T04:00:00", matin: 371, apresmidi: 310 },
  { date: "2025-05-05T05:00:00", matin: 475, apresmidi: 520 },
  { date: "2025-05-05T06:00:00", matin: 107, apresmidi: 170 },
  { date: "2025-05-05T06:00:00", matin: 341, apresmidi: 290 },
  { date: "2025-05-05T07:00:00", matin: 408, apresmidi: 450 },
  { date: "2025-05-05T08:00:00", matin: 169, apresmidi: 210 },
  { date: "2025-05-05T09:00:00", matin: 317, apresmidi: 270 },
  { date: "2025-05-05T10:00:00", matin: 480, apresmidi: 530 },
  { date: "2025-05-05T11:00:00", matin: 132, apresmidi: 180 },
  { date: "2025-05-05T12:00:00", matin: 141, apresmidi: 190 },
  { date: "2025-05-05T13:00:00", matin: 434, apresmidi: 380 },
  { date: "2025-05-05T14:00:00", matin: 448, apresmidi: 490 },
  { date: "2025-05-05T15:00:00", matin: 149, apresmidi: 200 },
  { date: "2025-05-05T16:00:00", matin: 103, apresmidi: 160 },
  { date: "2025-05-05T17:00:00", matin: 446, apresmidi: 400 },
  { date: "2025-05-05T18:00:00", matin: 385, apresmidi: 320 },
  { date: "2025-05-05T19:00:00", matin: 438, apresmidi: 480 },
  { date: "2025-05-05T20:00:00", matin: 155, apresmidi: 200 },
  { date: "2025-05-05T23:00:00", matin: 92, apresmidi: 150 },
]

// Configuration des couleurs pour le graphique
const chartColors = {
  matin: {
    stroke: "#2563eb", // blue-600
    fill: "#93c5fd", // blue-300
  },
  apresmidi: {
    stroke: "#7c3aed", // violet-600 
    fill: "#c4b5fd", // violet-300
  },
}

type TimeRange = "today" | "in3days" | "in5days";
type ViewMode = "day" | "hour";

export function ChartAllData(): React.JSX.Element {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("today");
  const [viewMode, setViewMode] = React.useState<ViewMode>("hour");
  const [, setPreviousTimeRange] = React.useState<TimeRange>("today");

  // Gestionnaire pour le changement de plage temporelle
  const handleTimeRangeChange = (value: string) => {
    const newTimeRange = value as TimeRange;

    // Sauvegarder l'ancienne valeur avant de la modifier
    setPreviousTimeRange(timeRange);

    // Si on sélectionne "today" (Aujourd'hui), forcer le mode de vue à "hour"
    if (newTimeRange === "today") {
      setViewMode("hour");
    }

    // Mettre à jour la plage temporelle
    setTimeRange(newTimeRange);
  };

  // Gestionnaire pour le changement de mode de vue
  const handleViewModeChange = (value: string) => {
    setViewMode(value as ViewMode);
  };

  // Préparation des données 
  const processedData = React.useMemo<ChartDataItem[]>(() => {
    // Pour les besoins de la démonstration, nous utilisons une date fixe
    // plutôt que new Date() car nos données sont sur une période spécifique

    // En fonction du mode de vue et de la plage temporelle
    if (viewMode === "hour") {
      // En mode horaire
      if (timeRange === "today") {
        // Pour "aujourd'hui", montrer seulement les données de ce jour
        const targetDate = new Date("2025-05-05");
        const targetDateStr = targetDate.toISOString().split('T')[0]; // "2025-05-05"

        return chartData.filter(item => {
          return item.date.startsWith(targetDateStr);
        });
      } else if (timeRange === "in3days") {
        // Pour "3 prochains jours", montrer les données horaires des 3 jours
        const relevantDays = ["2025-05-03", "2025-05-04", "2025-05-05"];

        return chartData.filter(item => {
          const itemDateStr = item.date.split('T')[0];
          return relevantDays.includes(itemDateStr);
        });
      } else { // "in5days"
        // Pour "5 prochains jours", montrer les données horaires des 5 jours
        const relevantDays = ["2025-05-01", "2025-05-02", "2025-05-03", "2025-05-04", "2025-05-05"];

        return chartData.filter(item => {
          const itemDateStr = item.date.split('T')[0];
          return relevantDays.includes(itemDateStr);
        });
      }
    } else {
      // Mode jour - Utiliser les MAXIMUMS journaliers au lieu des moyennes
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
          const dayEntries = chartData.filter(item => item.date.startsWith(day));

          // Calculer les MAXIMUMS pour ce jour (au lieu des moyennes)
          const matinMax = Math.max(...dayEntries.map(entry => entry.matin));
          const apresmidiMax = Math.max(...dayEntries.map(entry => entry.apresmidi));

          return {
            date: `${day}T12:00:00`, // Midi pour représenter le jour
            matin: matinMax,
            apresmidi: apresmidiMax
          };
        });

        return dailyData;
      }

      return [];
    }
  }, [timeRange, viewMode]);

  // Effet pour s'assurer que la vue "aujourd'hui" est toujours en mode horaire
  React.useEffect(() => {
    if (timeRange === "today" && viewMode !== "hour") {
      setViewMode("hour");
    }
  }, [timeRange, viewMode]);

  // Fonction pour formater les étiquettes de date/heure
  const formatAxisLabel = (dateStr: string): string => {
    const date = new Date(dateStr);

    if (viewMode === "hour") {
      // Format horaire HH:MM
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    } else {
      // Format date JJ/MM
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit"
      });
    }
  };

  // Déterminer si le sélecteur de vue doit être affiché
  // Pour l'option "today", nous ne proposons que la vue horaire
  const showViewModeSelector = timeRange !== "today";

  // Déterminer si les étiquettes de l'axe X doivent être inclinées
  // On incline seulement en mode "5 prochains jours" pour faciliter la lecture
  const shouldRotateLabels = timeRange === "in5days";

  return (
    <div className="w-full mx-auto">
      <Card>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Fréquentation des plages</CardTitle>
            <CardDescription>
              {viewMode === "hour"
                ? "Visualisation de la fréquentation horaire"
                : "Visualisation de la fréquentation journalière (valeurs maximales)"}
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {showViewModeSelector && (
              <Select value={viewMode} onValueChange={handleViewModeChange}>
                <SelectItem value="hour">Vue horaire</SelectItem>
                <SelectItem value="day">Vue journalière</SelectItem>
              </Select>
            )}
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectItem value="in5days">5 prochains jours</SelectItem>
              <SelectItem value="in3days">3 prochains jours</SelectItem>
              <SelectItem value="today">Aujourd'hui</SelectItem>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="aspect-auto h-[400px] w-full">
            {processedData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={processedData}
                  margin={{ top: 10, right: 30, left: 0, bottom: shouldRotateLabels ? 40 : 0 }}
                >
                  <defs>
                    <linearGradient id="colorMatin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.matin.fill} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={chartColors.matin.fill} stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorApresmidi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.apresmidi.fill} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={chartColors.apresmidi.fill} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={shouldRotateLabels ? 20 : 8}
                    minTickGap={viewMode === "hour" ? 50 : 20}
                    tickFormatter={formatAxisLabel}
                    interval={viewMode === "hour" ? 2 : 0}
                    angle={shouldRotateLabels ? -45 : 0}
                    textAnchor={shouldRotateLabels ? "end" : "middle"}
                    height={shouldRotateLabels ? 60 : 30}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} visiteurs`,
                      name === "matin" ? "Matin" : "Après-midi"
                    ]}
                    labelFormatter={(value: string) => {
                      const date = new Date(value);
                      if (viewMode === "hour") {
                        // Format horaire détaillé
                        return `${date.toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long"
                        })} à ${date.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}`;
                      } else {
                        // Format jour uniquement
                        return date.toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        });
                      }
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value: string) => (value === "matin" ? "Fréquentation matin" : "Fréquentation après-midi")}
                  />
                  <Area
                    type="monotone"
                    dataKey="matin"
                    name="matin"
                    stroke={chartColors.matin.stroke}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMatin)"
                  />
                  <Area
                    type="monotone"
                    dataKey="apresmidi"
                    name="apresmidi"
                    stroke={chartColors.apresmidi.stroke}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorApresmidi)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <p className="text-gray-400">Aucune donnée disponible pour la période sélectionnée</p>
              </div>
            )}
          </div>

          <div className="mt-6 text-sm text-center text-gray-500">
            <p>Les données affichées représentent la fréquentation des plages durant la saison estivale 2025.</p>
            <p className="mt-1">Source: Relevés de fréquentation - Surveillance des plages 2025</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}