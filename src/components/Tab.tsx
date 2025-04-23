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
    // Style pour espacer les onglets horizontalement
    const tabStyle = {
        marginRight: '10px'  // Ajoute une marge à droite de chaque onglet
    };
    
    // États pour stocker les heures et les indices de sécurité
    const [securityIndices, setSecurityIndices] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    // Utiliser le contexte weather pour obtenir les heures
    const { hours } = useWeather();
    
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
    
    return (
        <div className="tabs tabs-lift w-full max-w-full">
            <input type="radio" name="my_tabs_3" className="tab text-slate-50" style={tabStyle} aria-label="Prévision sous forme de tableau" defaultChecked/>
            <div className="tab-content bg-slate-200 border-base-300 p-4 sm:p-6 text-slate-950 w-full max-w-full overflow-x-hidden">
                <h2 className="text-xl font-bold mb-4 text-slate-950">Prévision journalière</h2>
                <div className="beach-data w-full overflow-hidden">
                    {/* Pour n'importe quelle plage */}
                    <div className="mt-4 w-full">
                        <Table location={tabBeach} />
                    </div>
                </div>
            </div>
            
            <input type="radio" name="my_tabs_3" className="tab text-slate-50" style={tabStyle} aria-label="Previsions sous forme de graphe" />
            <div className="tab-content bg-slate-300 border-base-300 p-4 sm:p-6 text-slate-950 w-full max-w-full overflow-x-hidden">
                <h2 className="text-xl font-bold mb-4 text-slate-950">Previsions sous forme de graphe</h2>
                <div className="beach-data w-full overflow-hidden">
                    <div className="mt-4 flex flex-col space-y-8">
                        <div className="w-full">
                            <h3 className="text-lg font-semibold mb-2">Prévisions de Fréquentation</h3>
                            <BarChart 
                                title="Fréquentation des plages" 
                                description="Nombre de visiteurs par période"
                                dataKeys={["morning", "afternoon"]}
                            />
                        </div>
                        <div className="w-full">
                            <h3 className="text-lg font-semibold mb-2">Indice de Sécurité</h3>
                            {loading ? (
                                <div className="h-[200px] flex items-center justify-center bg-slate-100 rounded">
                                    <p>Chargement des données...</p>
                                </div>
                            ) : (
                                <SecurityIndexChart hours={hours} indices={securityIndices} />
                            )}
                        </div>
                        <div className="w-full">
                            <h3 className="text-lg font-semibold mb-2">Températures</h3>
                            <StandaloneChart />
                        </div>
                    </div>
                </div>
            </div>

            <input type="radio" name="my_tabs_3" className="tab text-slate-50" style={tabStyle} aria-label="Fréquentation des plages"  />
            <div className="tab-content bg-slate-300 border-base-300 p-4 sm:p-6 text-slate-950 w-full max-w-full overflow-x-hidden">
                <h2 className="text-xl font-bold mb-4 text-slate-950">Fréquentation des plages</h2>
                <div className="beach-data w-full overflow-hidden">
                    <div className="mt-4 flex justify-center">
                        <ChartAllData/>
                    </div>
                </div>
            </div>

            <input type="radio" name="my_tabs_3" className="tab text-slate-50" style={tabStyle} aria-label="Tableau Ouverture de poste"  />
            <div className="tab-content bg-slate-300 border-base-300 p-4 sm:p-6 text-slate-950 w-full max-w-full overflow-x-hidden">
                <h2 className="text-xl font-bold mb-4 text-slate-950">Tableau Ouverture de poste</h2>
                <div className="beach-data w-full overflow-hidden">
                    <div className="mt-4 flex justify-center">
                        <Bilan location={tabBeach}/>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Tab;