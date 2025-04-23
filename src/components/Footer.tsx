import React from "react";

const Footer: React.FC = () => { 
    return (
        <footer className="flex flex-col md:flex-row text-base-content text-slate-800 font-bold">
            <div className="w-full md:w-1/2 p-10 bg-red-500">
                <div className="flex justify-center items-center h-full">
                    <p></p>
                </div>
            </div>
            <div className="w-full md:w-1/2 p-10 bg-yellow-300">
                <div className="flex justify-center items-center h-full">
                    <p>Copyright © 2025 - Bruno CASTELLE / Clément BENONY</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;