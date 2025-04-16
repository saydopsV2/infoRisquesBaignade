import React from "react";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-800">
      <h1 className="text-2xl sm:text-3xl text-slate-100 font-bold text-center mt-4 sm:mt-8 px-4">
        Bienvenue sur InfoBaïnes !
      </h1>
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <p className='text-lg sm:text-2xl text-center text-slate-100 mx-auto max-w-4xl px-4'>
          InfoBaïne est une application qui utilise une modélisation semi-empirique de la
          prévision de l'aléa de la houle, des courants d'arrachement et de la houle des vagues de bords
          <br className="hidden sm:block" />
          <span className="block mt-2">Vous y retrouverez differentes plages de la côte landaise.</span>
        </p>
      </div>
    </div>
  );
};
export default Home;