import React from "react";
import Table from "./Table";

interface TabProps {
    tabAllDataPlot: string;
    tabForecastPlot: string;
    tabBeach: string;
}

const Tab: React.FC<TabProps> = ({tabAllDataPlot, tabForecastPlot, tabBeach}) => {
    return (
        <div className="tabs tabs-lift">
            <input type="radio" name="my_tabs_3" className="tab" aria-label="Prévisions" />
            <div className="tab-content bg-slate-300 border-base-300 p-6 text-slate-950">
                <h2 className="text-xl font-bold mb-4 text-slate-950">Previsions</h2>
                <div className="beach-data">
                    {/* For forecast */}
                    {(tabBeach === "lette-blanche" || tabBeach === "biscarosse") && (
                        <>
                            <div className="mt-4">
                                <img src={tabForecastPlot} alt="Prévisions Biscarrosse" className="w-250" />
                            </div>
                        </>
                    )}
                </div>
            </div>

            <input type="radio" name="my_tabs_3" className="tab" aria-label="Données de la saison" defaultChecked />
            <div className="tab-content bg-slate-300 border-base-300 p-6 text-slate-950">
                <h2 className="text-xl font-bold mb-4 text-slate-950">Données de la saison</h2>
                <div className="beach-data">
                    {/* For old forecast season */}
                    {(tabBeach === "lette-blanche" || tabBeach === "biscarosse") && (
                        <>
                            <div className="mt-4">
                                <img src={tabAllDataPlot} alt="Prévisions saison" className="w-250" />
                            </div>
                        </>
                    )}
                </div>
            </div>

            <input type="radio" name="my_tabs_3" className="tab" aria-label="Prévision sous forme de tableau" defaultChecked />
            <div className="tab-content bg-slate-300 border-base-300 p-6 text-slate-950">
                <h2 className="text-xl font-bold mb-4 text-slate-950">Prévision journalière</h2>
                <div className="beach-data">
                    {/* For daily forecast */}
                    {(tabBeach === "lette-blanche" || tabBeach === "biscarosse") && (
                        <>
                            <div className="mt-4">
                                <Table />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
export default Tab;