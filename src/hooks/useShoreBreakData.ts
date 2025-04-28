import { useState, useEffect, SetStateAction } from 'react';
import Papa from 'papaparse';

// Type pour les données de shore break
interface ShoreBreakData {
  Datetime: string;
  ShoreBreak_Index: string;
  Hazard_Level: string;
}

interface ShoreBreakResult {
  indices: number[];
  hazardLevels: number[];
  dates: Date[];
  isLoading: boolean;
  error: string | null;
}

// Constante pour le nombre de jours à récupérer
const DAYS_TO_DISPLAY = 7;

/**
 * Fonction utilitaire pour regrouper les données par heure
 * Calcule la moyenne des indices de shore break et des niveaux de danger
 * pour chaque heure complète
 */
const groupDataByHour = (
  dates: Date[],
  indices: number[],
  hazardLevels: number[]
): { hourlyDates: Date[], hourlyIndices: number[], hourlyHazardLevels: number[] } => {
  // Map pour stocker les données par heure
  const hourMap = new Map<string, {
    date: Date,
    indicesSum: number,
    hazardLevelsSum: number,
    count: number
  }>();

  // Parcourir toutes les données
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    // Créer une clé basée sur l'année, le mois, le jour et l'heure (ignorer minutes/secondes)
    // On utilise getUTCHours pour s'assurer que le regroupement est cohérent
    const hourKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;

    // Si cette heure existe déjà dans notre map, mettre à jour les valeurs
    if (hourMap.has(hourKey)) {
      const hourData = hourMap.get(hourKey)!;
      hourData.indicesSum += indices[i];
      hourData.hazardLevelsSum += hazardLevels[i];
      hourData.count += 1;
    } else {
      // Sinon, créer une nouvelle entrée avec une date "propre" sans minutes ni secondes
      const cleanDate = new Date(date);
      cleanDate.setMinutes(0, 0, 0); // Réinitialiser les minutes et secondes à 0

      hourMap.set(hourKey, {
        date: cleanDate,
        indicesSum: indices[i],
        hazardLevelsSum: hazardLevels[i],
        count: 1
      });
    }
  }

  // Convertir la map en arrays triés par date
  const hourlyEntries = Array.from(hourMap.entries())
    .sort((a, b) => a[1].date.getTime() - b[1].date.getTime());

  // Extraire les moyennes
  const hourlyDates = hourlyEntries.map(entry => entry[1].date);
  const hourlyIndices = hourlyEntries.map(entry => {
    // Calculer la moyenne avec une précision de 2 décimales
    return Math.round((entry[1].indicesSum / entry[1].count) * 100) / 100;
  });
  const hourlyHazardLevels = hourlyEntries.map(entry =>
    Math.round(entry[1].hazardLevelsSum / entry[1].count)
  );

  return { hourlyDates, hourlyIndices, hourlyHazardLevels };
};

/**
 * Hook personnalisé pour charger les données de shore break depuis un CSV
 * et les regrouper par heure
 */
export const useShoreBreakData = (): ShoreBreakResult => {
  const [indices, setIndices] = useState<number[]>([]);
  const [hazardLevels, setHazardLevels] = useState<number[]>([]);
  const [dates, setDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Utiliser le chemin vers le fichier CSV
        const response = await fetch(`${import.meta.env.BASE_URL}dataModel/shore_break_data.csv`);
        const csvText = await response.text();

        Papa.parse<ShoreBreakData>(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true, // Conversion automatique des types
          complete: (result) => {
            if (result.errors && result.errors.length > 0) {
              setError(`Erreur lors de l'analyse du CSV: ${result.errors[0].message}`);
              setIsLoading(false);
              return;
            }

            // Traiter les données
            const parsedDates: Date[] = [];
            const parsedIndices: number[] = [];
            const parsedHazardLevels: number[] = [];

            // Classer les données par date
            result.data.forEach(row => {
              if (row.Datetime && row.ShoreBreak_Index !== undefined) {
                const date = new Date(row.Datetime as string);
                if (!isNaN(date.getTime())) {
                  parsedDates.push(date);

                  // Convertir l'indice de shore break en nombre
                  const index = typeof row.ShoreBreak_Index === 'number'
                    ? row.ShoreBreak_Index
                    : parseFloat(row.ShoreBreak_Index as string);
                  parsedIndices.push(!isNaN(index) ? index : 0);

                  // Convertir le niveau de danger en nombre
                  const hazardLevel = typeof row.Hazard_Level === 'number'
                    ? row.Hazard_Level
                    : parseInt(row.Hazard_Level as string, 10);
                  parsedHazardLevels.push(!isNaN(hazardLevel) ? hazardLevel : 0);
                }
              }
            });

            // Trier les données par date (au cas où elles ne seraient pas déjà triées)
            const sortedIndices = [...parsedIndices];
            const sortedHazardLevels = [...parsedHazardLevels];
            const sortedDates = [...parsedDates];

            // Trier les tableaux ensemble basés sur les dates
            const indices = sortedIndices.map((_, i) => ({
              date: sortedDates[i],
              index: sortedIndices[i],
              hazard: sortedHazardLevels[i]
            }));
            indices.sort((a, b) => a.date.getTime() - b.date.getTime());

            // Reconstituer les tableaux triés
            const orderedDates = indices.map(item => item.date);
            const orderedIndices = indices.map(item => item.index);
            const orderedHazardLevels = indices.map(item => item.hazard);

            // Filtrer les données pour les 7 prochains jours
            const now = new Date();
            // Modifier pour commencer à 00h00 de la date courante au lieu de l'heure actuelle
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

            // Filtrer les prévisions pour les 7 jours
            const filteredDates: Date[] = [];
            const filteredIndices: number[] = [];
            const filteredHazardLevels: number[] = [];

            // Trouver l'index correspondant à minuit de la date actuelle ou juste après
            let startIndex = orderedDates.findIndex(date => date >= today);
            if (startIndex === -1) startIndex = 0;

            // Prendre jusqu'à 7 jours (168 heures) à partir de cet index
            for (let i = startIndex; i < orderedDates.length; i++) {
              // Vérifier que la date est dans les 7 prochains jours
              if (orderedDates[i].getTime() - today.getTime() <= DAYS_TO_DISPLAY * 24 * 60 * 60 * 1000) {
                filteredDates.push(orderedDates[i]);
                filteredIndices.push(orderedIndices[i]);
                filteredHazardLevels.push(orderedHazardLevels[i]);
              } else {
                break; // Sortir de la boucle une fois qu'on dépasse 7 jours
              }
            }

            // Appliquer le regroupement pour obtenir des moyennes horaires
            const { hourlyDates, hourlyIndices, hourlyHazardLevels } = groupDataByHour(
              filteredDates,
              filteredIndices,
              filteredHazardLevels
            );

            // S'assurer que nous avons bien des données regroupées par heure
            if (hourlyDates.length === 0 && filteredDates.length > 0) {
              // Si le regroupement échoue mais que nous avons des données filtrées, utiliser celles-ci
              console.warn("Le regroupement horaire n'a produit aucun résultat, utilisation des données brutes filtrées");
              setDates(filteredDates);
              setIndices(filteredIndices);
              setHazardLevels(filteredHazardLevels);
            } else {
              // Utiliser les données horaires
              setDates(hourlyDates);
              setIndices(hourlyIndices);
              setHazardLevels(hourlyHazardLevels);
            }

            setIsLoading(false);
          },
          error: (err: { message: SetStateAction<string | null>; }) => {
            setError(err.message);
            setIsLoading(false);
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { indices, hazardLevels, dates, isLoading, error };
};