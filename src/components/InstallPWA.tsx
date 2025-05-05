import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Événement déclenché lorsque le navigateur est prêt à installer l'application
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Empêcher le navigateur d'afficher son propre message
      e.preventDefault();
      // Stocker l'événement pour l'utiliser plus tard
      setInstallPrompt(e);
    };

    // Vérifier si l'application est déjà installée
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    // Ajouter les écouteurs d'événements
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Nettoyage des écouteurs d'événements
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Afficher le message d'installation natif
    await installPrompt.prompt();
    
    // Attendre la réponse de l'utilisateur
    const choiceResult = await installPrompt.userChoice;
    
    // L'utilisateur a accepté l'installation
    if (choiceResult.outcome === 'accepted') {
      console.log('L\'utilisateur a accepté l\'installation');
    } else {
      console.log('L\'utilisateur a refusé l\'installation');
    }
    
    // Réinitialiser l'événement d'installation
    setInstallPrompt(null);
  };

  // Ne rien afficher si l'application est déjà installée ou si le navigateur n'est pas compatible
  if (isInstalled || !installPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </div>
        <p className="text-gray-700 dark:text-gray-200 font-medium">
          Installez notre application pour une expérience optimale
        </p>
      </div>
      <div className="flex gap-3">
        <button 
          onClick={() => setInstallPrompt(null)} 
          className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          Plus tard
        </button>
        <button 
          onClick={handleInstallClick} 
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm transition-colors"
        >
          Installer
        </button>
      </div>
    </div>
  );
};

export default InstallPWA;