import React, { useEffect, useState } from "react";
import Table from "./Table";
import Beach from "../interface/Beach";
import { ChartAllData } from "./BeachAttendanceLineChart";
import Bilan from "./Bilan";
import { ShoreBreakHazardChart } from "./ShoreBreakHazardChart";
import { useWeather } from "../context/WeatherContext";
import { useShoreBreakData } from "../hooks/useShoreBreakData";
import { useBeachAttendanceData } from "../hooks/useBeachAttendanceData"; // Import du nouveau hook
import { RipCurrentHazardChart } from "./RipCurrentHazardChart"; // Import du composant RipCurrentHazardChart
import { useRipCurrentData } from "../hooks/useRipCurrentData"; // Import du hook pour les données de courant d'arrachement

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

    // Utiliser le contexte weather pour obtenir les heures
    const { hours } = useWeather();

    // États pour gérer les onglets actifs
    const [activeTab, setActiveTab] = useState<string>("tableau");


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

    // Initialiser l'onglet actif par défaut
    useEffect(() => {
        setActiveTab("tableau");
    }, []);

    // Pour la visualisation, utiliser soit les dates du shore break soit les heures du contexte météo
    const displayHours = shoreBreakDates.length > 0 ? shoreBreakDates : hours;


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
                        <div className="w-full bg-white rounded shadow-md p-4">
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
                                    hours={displayHours}
                                    velocities={ripCurrentVelocities}
                                    hazardLevels={ripCurrentHazardLevels}
                                    inTable={false}
                                />
                            )}
                        </div>
                        <div className="w-full bg-white rounded shadow-md p-4">
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
                                    hours={displayHours}
                                    indices={shoreBreakIndices}
                                    inTable={false} />
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