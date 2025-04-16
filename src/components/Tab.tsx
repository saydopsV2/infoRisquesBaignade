import React from "react";
import Table from "./Table";
import Beach from "../interface/Beach";
import { StandaloneChart } from "./Chart";
import { ChartAllData } from "./ChartAllData";

interface TabProps {
    tabAllDataPlot: string;
    tabForecastPlot: string;
    tabBeach: Beach;
}

const Tab: React.FC<TabProps> = ({tabAllDataPlot, tabForecastPlot, tabBeach}) => {
    return (
        <div className="tabs tabs-lift w-full max-w-full">
            <input type="radio" name="my_tabs_3" className="tab text-slate-50" aria-label="Prévision sous forme de tableau" defaultChecked/>
            <div className="tab-content bg-slate-200 border-base-300 p-4 sm:p-6 text-slate-950 w-full max-w-full overflow-x-hidden">
                <h2 className="text-xl font-bold mb-4 text-slate-950">Prévision journalière</h2>
                <div className="beach-data w-full overflow-hidden">
                    {/* Pour n'importe quelle plage */}
                    <div className="mt-4 w-full">
                        <Table location={tabBeach} />
                    </div>
                </div>
            </div>
            
            <input type="radio" name="my_tabs_3" className="tab text-slate-50" aria-label="Previsions sous forme de graphe" />
            <div className="tab-content bg-slate-300 border-base-300 p-4 sm:p-6 text-slate-950 w-full max-w-full overflow-x-hidden">
                <h2 className="text-xl font-bold mb-4 text-slate-950">Previsions sous forme de graphe</h2>
                <div className="beach-data w-full overflow-hidden">
                    <div className="mt-4 flex justify-center">
                        <StandaloneChart/>
                    </div>
                </div>
            </div>

            <input type="radio" name="my_tabs_3" className="tab text-slate-50" aria-label="Données de la saison"  />
            <div className="tab-content bg-slate-300 border-base-300 p-4 sm:p-6 text-slate-950 w-full max-w-full overflow-x-hidden">
                <h2 className="text-xl font-bold mb-4 text-slate-950">Données de la saison</h2>
                <div className="beach-data w-full overflow-hidden">
                    <div className="mt-4 flex justify-center">
                        <ChartAllData/>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Tab;