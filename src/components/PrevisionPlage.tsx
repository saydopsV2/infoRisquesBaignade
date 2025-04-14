import React from 'react';

interface PrevisionPlageProps {
  plage: string;
}

const PrevisionPlage: React.FC<PrevisionPlageProps> = ({ plage }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-800">
      <h1 className="text-3xl text-slate-100 font-bold text-center mt-8">
        Prévisions pour {plage === 'lette-blanche' ? 'La lette Blanche' : 'Biscarosse'}
      </h1>
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-xl text-center text-slate-100 mx-auto max-w-4xl">
          Informations sur les baïnes et conditions de plage pour {plage === 'lette-blanche' ? 'La lette Blanche' : 'Biscarosse'}.
        </p>
      </div>
    </div>
  );
};

export default PrevisionPlage;
