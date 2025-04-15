import React from "react";
import Table from "./Table";

interface TabProps {
    tabAllDataPlot: string;
    tabForecastPlot: string;
    tabBeach: string;
}

const Tab: React.FC<TabProps> = ({tabAllDataPlot, tabForecastPlot, tabBeach}) => {
    return (
        <div className="tabs tabs-lift w-full max-w-full">
            <input type="radio" name="my_tabs_3" className="tab" aria-label="Prévision sous forme de tableau" defaultChecked/>
            <div className="tab-content bg-slate-300 border-base-300 p-4 sm:p-6 text-slate-950 w-full max-w-full overflow-x-hidden">
                <h2 className="text-xl font-bold mb-4 text-slate-950">Prévision journalière</h2>
                <div className="beach-data w-full overflow-hidden">
                    {/* For daily forecast */}
                    {(tabBeach === "lette-blanche" || tabBeach === "biscarosse") && (
                        <>
                            <div className="mt-4 w-full">
                                <Table  />
                            </div>
                        </>
                    )}
                </div>
            </div>
            
            <input type="radio" name="my_tabs_3" className="tab" aria-label="Prévisions" />
            <div className="tab-content bg-slate-300 border-base-300 p-4 sm:p-6 text-slate-950 w-full max-w-full overflow-x-hidden">
                <h2 className="text-xl font-bold mb-4 text-slate-950">Previsions</h2>
                <div className="beach-data w-full overflow-hidden">
                    {/* For forecast */}
                    {(tabBeach === "lette-blanche" || tabBeach === "biscarosse") && (
                        <>
                            <div className="mt-4 flex justify-center">
                                <img src={tabForecastPlot} alt="Prévisions Biscarrosse" className="w-full md:w-3/4 lg:w-2/3 max-w-250" />
                            </div>
                        </>
                    )}
                </div>
            </div>

            <input type="radio" name="my_tabs_3" className="tab" aria-label="Données de la saison"  />
            <div className="tab-content bg-slate-300 border-base-300 p-4 sm:p-6 text-slate-950 w-full max-w-full overflow-x-hidden">
                <h2 className="text-xl font-bold mb-4 text-slate-950">Données de la saison</h2>
                <div className="beach-data w-full overflow-hidden">
                    {/* For old forecast season */}
                    {(tabBeach === "lette-blanche" || tabBeach === "biscarosse") && (
                        <>
                            <div className="mt-4 flex justify-center">
                                <img src={tabAllDataPlot} alt="Prévisions saison" className="w-full md:w-3/4 lg:w-2/3 max-w-250" />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
export default Tab;