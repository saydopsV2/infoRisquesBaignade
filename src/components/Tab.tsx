import React, { useEffect, useState } from "react";
import Table from "./Table";
import Beach from "../interface/Beach";
import { StandaloneChart } from "./Chart";
import { ChartAllData } from "./ChartAllData";
import Bilan from "./Bilan";
import { SecurityIndexChart } from "./SecurityIndexChart";
import { useWeather } from "../context/WeatherContext";
import Papa from 'papaparse';
import { BarChart } from "./BarChart";  // Cette importation est maintenant correcte
import Toggle from "./Toggle";

interface TabProps {
    tabAllDataPlot: string;
    tabForecastPlot: string;
    tabBeach: Beach;
}

// Interface pour les données CSV
interface PrevisionData {
    valeur: string;
    [key: string]: any;
}

const Tab: React.FC<TabProps> = ({ tabBeach }) => {
    // Style pour espacer les onglets horizontalement et ajouter du padding
    const tabStyleDesktop: React.CSSProperties = {
        marginRight: '10px',  // Ajoute une marge à droite de chaque onglet
        padding: '0.5rem 1rem' // Ajoute du padding (8px vertical, 16px horizontal)
    };

    // Style spécifique pour mobile, ajouté dynamiquement
    const getResponsiveStyle = (): React.CSSProperties => {
        // Style de base pour tous les écrans
        const style: React.CSSProperties = { ...tabStyleDesktop };

        // Vérifie si l'écran est petit (mobile)
        if (typeof window !== 'undefined' && window.innerWidth < 640) { // 640px est la limite "sm" dans Tailwind
            style.marginBottom = '8px'; // Plus d'espace pour mobile
        }

        return style;
    };

    // État pour les styles responsifs
    const [responsiveStyle, setResponsiveStyle] = useState<React.CSSProperties>(getResponsiveStyle());

    // Mettre à jour les styles lors du redimensionnement
    useEffect(() => {
        // Vérification pour éviter les problèmes de SSR (Server-Side Rendering)
        if (typeof window === 'undefined') return;

        const handleResize = (): void => {
            setResponsiveStyle(getResponsiveStyle());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // États pour stocker les heures et les indices de sécurité
    const [securityIndices, setSecurityIndices] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Utiliser le contexte weather pour obtenir les heures
    const { hours } = useWeather();

    // États pour gérer les onglets actifs
    const [activeTab, setActiveTab] = useState<string>("tableau");

    // État pour gérer le type de graphique dans l'onglet Fréquentation
    const [chartType, setChartType] = useState<'line' | 'bar'>('line');

    // État pour gérer le type de graphique dans l'onglet Prévisions
    const [previsionChartType, setPrevisionChartType] = useState<'line' | 'bar'>('bar');

    // Fonction pour basculer entre les types de graphiques (fréquentation)
    const toggleChartType = () => {
        setChartType(prevType => prevType === 'line' ? 'bar' : 'line');
    };

    // Fonction pour basculer entre les types de graphiques (prévisions)
    const togglePrevisionChartType = () => {
        setPrevisionChartType(prevType => prevType === 'line' ? 'bar' : 'line');
    };

    // Définition des classes pour les onglets basées sur l'état actif
    const getTabClass = (tabName: string) => {
        // Classes de base sans marge verticale
        const baseClasses = "tab !bg-yellow-300 !text-slate-950 rounded-t-lg";
        return activeTab === tabName
            ? `${baseClasses} border-2 border-red-300`
            : `${baseClasses} border-b-2 border-b-red-800 border-t-0 border-l-0 border-r-0`;
    };

    // Gestionnaire d'événements pour le changement d'onglet
    const handleTabChange = (tabName: string) => {
        setActiveTab(tabName);
    };

    // Charger les indices de sécurité à partir du CSV
    useEffect(() => {
        const fetchSecurityIndices = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${import.meta.env.BASE_URL}dataModel/prevision.csv`);
                const csvText = await response.text();

                Papa.parse<PrevisionData>(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (result) => {
                        const parsedIndices: number[] = result.data
                            .map(row => parseInt(row.valeur, 10))
                            .filter(val => !isNaN(val));

                        // Assurer que nous avons 24 valeurs
                        const safeIndices = parsedIndices.length >= 24
                            ? parsedIndices.slice(0, 24)
                            : [...parsedIndices, ...Array(24 - parsedIndices.length).fill(0)];

                        setSecurityIndices(safeIndices);
                        setLoading(false);
                    },
                    error: () => {
                        // En cas d'erreur, utiliser des valeurs par défaut
                        setSecurityIndices(new Array(24).fill(0));
                        setLoading(false);
                    },
                });
            } catch (err) {
                setSecurityIndices(new Array(24).fill(0));
                setLoading(false);
            }
        };

        fetchSecurityIndices();
    }, []);

    // Initialiser l'onglet actif par défaut
    useEffect(() => {
        setActiveTab("tableau");
    }, []);

    return (
        <div className="tabs tabs-lift w-full max-w-full flex flex-wrap">
            <input
                type="radio"
                name="my_tabs_3"
                className={getTabClass("tableau")}
                style={responsiveStyle}
                aria-label="Prévision sous forme de tableau"
                defaultChecked
                onChange={() => handleTabChange("tableau")}
            />
            <div className="tab-content bg-red-200 border-red-300 p-4 sm:p-6 text-slate-950 w-full max-w-full overflow-x-hidden">
                <h2 className="text-xl font-bold mb-4 text-slate-950">Prévisions journalières</h2>
                <div className="beach-data w-full overflow-hidden">
                    {/* Pour n'importe quelle plage */}
                    <div className="mt-4 w-full">
                        <Table location={tabBeach} />
                    </div>
                </div>
            </div>

            <input
                type="radio"
                name="my_tabs_3"
                className={getTabClass("graphe")}
                style={responsiveStyle}
                aria-label="Previsions sous forme de graphe"
                onChange={() => handleTabChange("graphe")}
            />
            <div className="tab-content bg-red-200 border-red-300 p-4 sm:p-6 text-slate-950 w-full max-w-full overflow-x-hidden">
                <div className="flex items-center flex-wrap gap-2 mb-4">
                    <h2 className="text-xl font-bold text-slate-950">Previsions sous forme de graphe</h2>
                </div>
                <div className="beach-data w-full overflow-hidden">
                    <div className="mt-4 flex flex-col space-y-8">
                        <div className="w-full">
                            <h3 className="text-lg font-semibold mb-2">Prévisions de Fréquentation</h3>
                            <Toggle
                                leftLabel="Histogrammes"
                                rightLabel="Courbes"
                                isChecked={previsionChartType === 'line'}
                                onChange={togglePrevisionChartType}
                                className="m-2 ml-2 w-53"
                            />
                            {previsionChartType === 'bar' ? (
                                <BarChart
                                    title="Fréquentation des plages"
                                    description="Nombre de visiteurs par période"
                                    dataKeys={["morning", "afternoon"]}
                                />
                            ) : (
                                <ChartAllData />
                            )}
                        </div>
                        <div className="w-full bg-white rounded shadow-md p-4">
                            <h3 className="text-lg font-semibold mb-2">Indice de Sécurité</h3>
                            {loading ? (
                                <div className="h-[200px] flex items-center justify-center bg-slate-100 rounded">
                                    <p>Chargement des données...</p>
                                </div>
                            ) : (
                                <SecurityIndexChart hours={hours} indices={securityIndices} />
                            )}
                        </div>
                        <div className="w-full bg-white rounded shadow-md p-4">
                            <h3 className="text-lg font-semibold mb-2">Températures</h3>
                            <StandaloneChart />
                        </div>
                    </div>
                </div>
            </div>

            <input
                type="radio"
                name="my_tabs_3"
                className={getTabClass("frequentation")}
                style={responsiveStyle}
                aria-label="Fréquentation des plages"
                onChange={() => handleTabChange("frequentation")}
            />
            <div className="tab-content bg-red-200 border-red-300 p-4 sm:p-6 text-slate-950 w-full max-w-full overflow-x-hidden">
                <div className="flex items-center  flex-wrap gap-2 mb-4">
                    <h2 className="text-xl font-bold text-slate-950">Fréquentation des plages</h2>
                    <Toggle
                        leftLabel="Courbes"
                        rightLabel="Histogrammes"
                        isChecked={chartType === 'bar'}
                        onChange={toggleChartType}
                        className="ml-2"
                    />
                </div>
                <div className="beach-data w-full overflow-hidden">
                    <div className="mt-4 flex justify-center w-full">
                        {chartType === 'line' ? (
                            <ChartAllData />
                        ) : (
                            <div className="w-full">
                                <BarChart
                                    title="Fréquentation des plages"
                                    description="Nombre de visiteurs par période"
                                    dataKeys={["morning", "afternoon"]}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <input
                type="radio"
                name="my_tabs_3"
                className={getTabClass("ouverture")}
                style={responsiveStyle}
                aria-label="Tableau Ouverture de poste"
                onChange={() => handleTabChange("ouverture")}
            />
            <div className="tab-content bg-red-200 border-red-300 p-4 sm:p-6 text-slate-950 w-full max-w-full overflow-x-hidden">
                <h2 className="text-xl font-bold mb-4 text-slate-950">Tableau Ouverture de poste</h2>
                <div className="beach-data w-full overflow-hidden">
                    <div className="mt-4 flex justify-center">
                        <Bilan location={tabBeach} />
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Tab;