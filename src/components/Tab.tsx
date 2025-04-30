import React, { useEffect, useState, useRef } from "react";
import Table from "./Table";
import Beach from "../interfaces/Beach";
import { ChartAllData } from "./charts/BeachAttendanceLineChart";
import Bilan from "./Bilan";
import { ShoreBreakHazardChart } from "./charts/ShoreBreakHazardChart";
import { useShoreBreakData } from "../hooks/useShoreBreakData";
import { useBeachAttendanceData } from "../hooks/useBeachAttendanceData";
import { RipCurrentHazardChart } from "./charts/RipCurrentHazardChart";
import { useRipCurrentData } from "../hooks/useRipCurrentData";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"; // Assurez-vous d'importer les composants Select
import TableLegend from "./Legend";

interface TabProps {
    tabBeach: Beach;
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

    // États pour gérer les onglets actifs
    const [activeTab, setActiveTab] = useState<string>("tableau");

    // État pour forcer le rendu des graphiques après changement d'onglet
    const [_, setGraphTabActive] = useState<boolean>(false);

    // État pour gérer la sélection de la période
    const [activeView, setActiveView] = useState<string>("plus7days");

    // Références pour les conteneurs de graphiques
    const ripCurrentChartRef = useRef<HTMLDivElement>(null);
    const shoreBreakChartRef = useRef<HTMLDivElement>(null);

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

    // Utiliser le hook useShoreBreakData pour obtenir les indices shore break
    const {
        indices: shoreBreakIndices,
        dates: shoreBreakDates,
        isLoading: shoreBreakLoading,
        error: shoreBreakError
    } = useShoreBreakData();

    // Utiliser le hook useRipCurrentData pour obtenir les données de courant d'arrachement
    const {
        velocities: ripCurrentVelocities,
        hazardLevels: ripCurrentHazardLevels,
        isLoading: ripCurrentLoading,
        error: ripCurrentError
    } = useRipCurrentData();

    // Utiliser notre nouveau hook pour obtenir les données de fréquentation
    const {
        isLoading: attendanceLoading,
        error: attendanceError
    } = useBeachAttendanceData();


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

        // Si l'onglet graphe est activé, marquer l'état et forcer un rerendu des graphiques
        if (tabName === "graphe") {
            setGraphTabActive(true);
            // Délai pour assurer que l'onglet est visible avant de redimensionner
            setTimeout(() => {
                if (ripCurrentChartRef.current) {
                    // Déclencher un événement de redimensionnement pour forcer la mise à jour des dimensions
                    window.dispatchEvent(new Event('resize'));
                }
            }, 50);
        } else {
            setGraphTabActive(false);
        }
    };

    // Initialiser l'onglet actif par défaut
    useEffect(() => {
        setActiveTab("tableau");
    }, []);

    // Fonction pour filtrer les données selon la vue temporelle sélectionnée
    const filterDataByTimeView = (dates: Date[], data: any[]) => {
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
                    date,
                    value: data[index]
                };
            }
            return null;
        }).filter(item => item !== null) as { date: Date; value: any }[];
    };

    // Filtrer les données selon la vue temporelle active
    const filteredShoreBreakData = filterDataByTimeView(shoreBreakDates, shoreBreakIndices);
    const filteredRipCurrentData = filterDataByTimeView(shoreBreakDates, ripCurrentVelocities);
    const filteredRipCurrentHazardLevels = filterDataByTimeView(shoreBreakDates, ripCurrentHazardLevels);

    

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
                <div className="flex flex-col items-start flex-wrap gap-2 mb-4">
                    <h2 className="text-xl font-bold text-slate-950">Previsions sous forme de graphe</h2>
                    <TableLegend/>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">Période :</span>
                        <Select
                            value={activeView}
                            onValueChange={(value) => setActiveView(value)}
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
                <div className="beach-data w-full overflow-hidden">
                    <div className="mt-4 flex flex-col space-y-8">
                        <div
                            ref={ripCurrentChartRef}
                            className="w-full bg-white rounded shadow-md p-4"
                        >
                            <h3 className="text-lg font-semibold mb-2">Risque Courant de Baïne</h3>
                            {ripCurrentLoading ? (
                                <div className="h-[200px] flex items-center justify-center bg-slate-100 rounded">
                                    <p>Chargement des données de courant...</p>
                                </div>
                            ) : ripCurrentError ? (
                                <div className="h-[200px] flex items-center justify-center bg-red-100 text-red-700 rounded">
                                    <p>Erreur: {ripCurrentError}</p>
                                </div>
                            ) : (
                                <RipCurrentHazardChart
                                    hours={filteredRipCurrentData.map(item => item.date)}
                                    velocities={filteredRipCurrentData.map(item => item.value)}
                                    hazardLevels={filteredRipCurrentHazardLevels.map(item => item.value)}
                                    showDayNightZones={false}
                                />
                            )}
                        </div>
                        <div
                            ref={shoreBreakChartRef}
                            className="w-full bg-white rounded shadow-md p-4"
                        >
                            <h3 className="text-lg font-semibold mb-2">Indice Risques Shore Break</h3>
                            {shoreBreakLoading ? (
                                <div className="h-[200px] flex items-center justify-center bg-slate-100 rounded">
                                    <p>Chargement des données...</p>
                                </div>
                            ) : shoreBreakError ? (
                                <div className="h-[200px] flex items-center justify-center bg-red-100 text-red-700 rounded">
                                    <p>Erreur: {shoreBreakError}</p>
                                </div>
                            ) : (
                                <ShoreBreakHazardChart
                                    hours={filteredShoreBreakData.map(item => item.date)}
                                    indices={filteredShoreBreakData.map(item => item.value)}
                                    showDayNightZones={false}
                                />
                            )}
                        </div>

                        <div className="w-full">
                            <h3 className="text-lg font-semibold mb-2">Prévisions de Fréquentation</h3>
                            {attendanceLoading ? (
                                <div className="h-[300px] flex items-center justify-center bg-slate-100 rounded">
                                    <p>Chargement des données de fréquentation...</p>
                                </div>
                            ) : attendanceError ? (
                                <div className="h-[300px] flex items-center justify-center bg-red-100 text-red-700 rounded">
                                    <p>Erreur: {attendanceError}</p>
                                </div>
                            ) : (
                                <ChartAllData />
                            )}
                        </div>
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
