import React from "react";
import HeadBand from "./HeadBand";
import DaisyCarouselEnhanced from "./DaisyCarouselEnhanced";

const Home: React.FC = () => {
  // Données des plages à afficher dans le carousel
  const beachItems = [
    {
      imageSrc: `${import.meta.env.BASE_URL}img/La-Lette-Blanche.jpg`,
      altText: "La Lette Blanche",
      captionText: "La Lette Blanche",
      url: "/lette-blanche"
    },
    {
      imageSrc: `${import.meta.env.BASE_URL}img/Biscarrosse.jpg`,
      altText: "Biscarrosse",
      captionText: "Biscarrosse",
      url: "/biscarrosse"
    }
  ];

  return (
    <>
      <HeadBand />
      <div className="flex flex-col min-h-screen bg-red-50">
        <h1 className="text-2xl sm:text-3xl text-slate-800 font-bold text-center mt-4 sm:mt-8 px-4 mb-4">
          Bienvenue sur Info Risques Baignade !
        </h1>
        <div className="flex items-start justify-center p-2 mt-0">
          <p className='text-lg sm:text-2xl text-justify text-slate-700 mx-auto max-w-4xl px-4'>
            <span className="font-bold">Info Risques Baignade</span> est un projet scientifique dont l’objet est l’étude des risques de baignade à l’océan,
            dans les Landes. Ce projet est conçu en étroite collaboration avec les sauveteurs et les acteurs en charge de la surveillance des plages. 
            Il a pour vocation de fournir des outils pour la compréhension et la prévention des accidents de baignade sur le littoral.
            <br className="hidden sm:block" />
            <span className="block mt-3 mb-4 text-center">Vous y retrouverez differentes plages de la côte landaise.</span>
          </p>
        </div>

        {/* Carousel de plages utilisant DaisyUI - Bien centré */}
        <div className="w-full flex justify-center mt-4 mb-10">
          <DaisyCarouselEnhanced
            items={beachItems}
            autoPlay={false}
            autoPlayInterval={5000}
          />
        </div>
      </div>
    </>
  );
};

export default Home;