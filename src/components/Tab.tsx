import React from "react";

interface TabProps {
    tabAllDataPlot: string;
    tabForecastPlot: string;
    tabBeach: string;
}

const Tab: React.FC<TabProps> = ({tabAllDataPlot, tabForecastPlot, tabBeach}) => {
    return (
        <div className="tabs tabs-lift">
            <input type="radio" name="my_tabs_3" className="tab" aria-label="Données de la saison" />
            <div className="tab-content bg-base-100 border-base-300 p-6">
                <h2 className="text-xl font-bold mb-4">Données de la saison</h2>
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

            <input type="radio" name="my_tabs_3" className="tab" aria-label="Prevision" defaultChecked />
            <div className="tab-content bg-base-100 border-base-300 p-6">
                <h2 className="text-xl font-bold mb-4">Prevision</h2>
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
        </div>
    );
};
export default Tab;