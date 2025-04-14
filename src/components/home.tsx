import React from "react";

const Home: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-slate-800 ">
        <h1 className="text-3xl text-slate-100 font-bold text-center mt-8">
          Bienvenue sur InfoBaïnes !
        </h1>
        <div className="flex flex-1 items-satrt justify-center p-15">
          <p className='text-2xl text-center text-slate-100 mx-auto max-w-4xl px-4'>InfoBaïne est une application qui utilise une modélisation semi-empirique de la 
            prévision de l'aléa de la houle, des courants d'arrachement et de la houle des vagues de bords
            <br />
            Vous y retrouverez differentes plages de la côte landaise.  
          </p>
        </div>
      </div>
    );
};
export default Home;