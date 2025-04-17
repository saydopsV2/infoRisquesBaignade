"use client"

import  { useEffect, useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
import { useWeather } from "../context/WeatherContext"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

// Fonction utilitaire pour déterminer le texte descriptif en fonction de l'indice UV
const getUvDescription = (uvIndex: number): string => {
    if (uvIndex < 3) return "Faible"
    if (uvIndex < 6) return "Modéré"
    if (uvIndex < 8) return "Élevé"
    if (uvIndex < 11) return "Très élevé"
    return "Extrême"
}

const chartConfig = {
    uvIndex: {
        label: "Indice UV",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

export function UvIndice() {
    const { uvIndices, isLoading } = useWeather()
    const [currentUvIndex, setCurrentUvIndex] = useState<number>(0)

    useEffect(() => {
        // Récupérer l'indice UV de l'heure courante (premier élément du tableau)
        console.log("UV Indices:", uvIndices);
        if (uvIndices && uvIndices.length > 0) {
            setCurrentUvIndex(uvIndices[0])
        }
    }, [uvIndices])

    // Description textuelle de l'indice UV
    const uvDescription = getUvDescription(currentUvIndex)

    // Déterminer si la tendance est à la hausse ou à la baisse
    const isTrendingUp = uvIndices && uvIndices.length > 1 && uvIndices[0] < uvIndices[1]

    // Données pour le graphique avec l'indice UV actuel
    const chartData = [
        {
            name: "Indice UV",
            uvIndex: currentUvIndex * 10 // Multiplié par 10 pour une meilleure visualisation
        }
    ]

    // État de chargement
    if (isLoading) {
        return (
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                    <CardTitle>Indice UV</CardTitle>
                    <CardDescription>Chargement...</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 items-center justify-center">
                    <p>Chargement des données...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Indice UV</CardTitle>
                <CardDescription>{uvDescription}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square w-full max-w-[250px]"
                >
                    <RadialBarChart
                        data={chartData}
                        startAngle={180}
                        endAngle={0}
                        innerRadius={80}
                        outerRadius={130}
                        barSize={20}
                    >
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <PolarRadiusAxis
                            type="number"
                            domain={[0, 120]} // Scale for UV index (0-12 * 10)
                            tick={false}
                            tickLine={false}
                            axisLine={false}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) - 16}
                                                    className="fill-foreground text-2xl font-bold"
                                                >
                                                    {currentUvIndex.toFixed(1)}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 4}
                                                    className="fill-muted-foreground"
                                                >
                                                    Indice UV
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </PolarRadiusAxis>
                        <defs>
                            <linearGradient id="uvColorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#10b981" /> {/* Vert - Faible */}
                                <stop offset="25%" stopColor="#facc15" /> {/* Jaune - Modéré */}
                                <stop offset="50%" stopColor="#f97316" /> {/* Orange - Élevé */}
                                <stop offset="75%" stopColor="#ef4444" /> {/* Rouge - Très élevé */}
                                <stop offset="100%" stopColor="#8b5cf6" /> {/* Violet - Extrême */}
                            </linearGradient>
                        </defs>
                        <RadialBar
                            dataKey="uvIndex"
                            fill="url(#uvColorGradient)"
                            background={{ fill: "#e5e7eb" }}
                            cornerRadius={5}
                            className="stroke-transparent stroke-2"
                        />
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    {isTrendingUp ? (
                        <>
                            Tendance à la hausse <TrendingUp className="h-4 w-4" />
                        </>
                    ) : (
                        <>
                            Tendance à la baisse <TrendingDown className="h-4 w-4" />
                        </>
                    )}
                </div>
                <div className="leading-none text-muted-foreground">
                    L'indice UV actuel est classé comme {uvDescription.toLowerCase()}
                </div>
            </CardFooter>
        </Card>
    )
}