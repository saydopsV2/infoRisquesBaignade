import React from "react";
import TiltedCard from "./TiltedCard";
import HeadBand from "./HeadBand";

const Home: React.FC = () => {
  return (
    <>
      <HeadBand />
      <div className="flex flex-col min-h-screen bg-slate-800">
        <h1 className="text-2xl sm:text-3xl text-slate-100 font-bold text-center mt-4 sm:mt-8 px-4 mb-4">
          Bienvenue sur Info Risques Baignade !
        </h1>
        <div className="flex items-start justify-center p-2 mt-0">
          <p className='text-lg sm:text-2xl text-center text-slate-100 mx-auto max-w-4xl px-4'>
            Info Risques Baignade est une application qui utilise une modélisation semi-empirique de la
            prévision de l'aléa de la houle, des courants d'arrachement et de la houle des vagues de bord
            <br className="hidden sm:block" />
            <span className="block mt-2 mb-4">Vous y retrouverez differentes plages de la côte landaise.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 max-w-4xl mx-auto w-full mb-10">
          <TiltedCard
            imageSrc={`${import.meta.env.BASE_URL}img/La-Lette-Blanche.jpg`}
            altText="La Lette Blanche"
            captionText="La Lette Blanche"
            url="/lette-blanche"
          />
          <TiltedCard
            imageSrc={`${import.meta.env.BASE_URL}img/Biscarrosse.jpg`}
            altText="Biscarrosse"
            captionText="Biscarrosse"
            url="/biscarrosse"
          />
        </div>
      </div>
    </>
  );
};
export default Home;