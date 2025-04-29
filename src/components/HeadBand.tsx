const HeadBand = () => {
  return (
    <div className="bg-yellow-50 shadow-md py-4 px-6 rounded-lg my-4 mx-auto max-w-7xl">
      <div className="text-center mb-2 text-lg text-slate-600 font-bold">
        Projet soutenu par :
      </div>
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
        <a 
          href="https://www.projet-swym.fr/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="transition-transform hover:scale-105 focus:scale-105"
        >
          <img 
            src={`${import.meta.env.BASE_URL}img/logoSWYM.png`} 
            alt="SWYM Logo" 
            className="h-16 md:h-20 object-contain"
          />
        </a>
        <a 
          href="https://www.cnrs.fr/fr" 
          target="_blank" 
          rel="noopener noreferrer"
          className="transition-transform hover:scale-105 focus:scale-105"
        >
          <img 
            src={`${import.meta.env.BASE_URL}img/logoCNRS.png`} 
            alt="CNRS Logo" 
            className="h-12 md:h-16 object-contain"
          />
        </a>
        <a 
          href="https://www.u-bordeaux.fr/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="transition-transform hover:scale-105 focus:scale-105"
        >
          <img 
            src={`${import.meta.env.BASE_URL}img/logoUB.png`} 
            alt="UB Logo" 
            className="h-12 md:h-16 object-contain"
          />
        </a>
        <a 
          href="https://www.inrae.fr/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="transition-transform hover:scale-105 focus:scale-105"
        >
          <img 
            src={`${import.meta.env.BASE_URL}img/logoInrae.png`} 
            alt="INRAE Logo" 
            className="h-12 md:h-16 object-contain"
          />
        </a>
        <a 
          href="https://www.smgbl.fr/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="transition-transform hover:scale-105 focus:scale-105"
        >
          <img 
            src={`${import.meta.env.BASE_URL}img/logoSMGBL.png`} 
            alt="SMGBL Logo" 
            className="h-12 md:h-16 object-contain"
          />
        </a>
        <a 
          href="https://www.nouvelle-aquitaine.fr/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="transition-transform hover:scale-105 focus:scale-105"
        >
          <img 
            src={`${import.meta.env.BASE_URL}img/logoRegion.png`} 
            alt="Region Logo" 
            className="h-12 md:h-16 object-contain"
          />
        </a>
      </div>
      <div className="text-center mt-6 text-lg text-slate-600 font-bold">
        Projet Réalisé par :
      </div>
      <div className="flex flex-wrap items-center justify-center ">
        <a 
          href="https://www.epoc.u-bordeaux.fr/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="transition-transform hover:scale-105 focus:scale-105"
        >
          <img 
            src={`${import.meta.env.BASE_URL}img/logoEpoc.png`} 
            alt="Logo Epoc" 
            className="h-30 md:h-40 object-contain"
          />
        </a>
      </div>
    </div>
  );
};

export default HeadBand;
