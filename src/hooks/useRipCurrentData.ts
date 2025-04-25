import { useState, useEffect, SetStateAction } from 'react';
import Papa from 'papaparse';

// Type pour les données de courant d'arrachement
interface RipCurrentData {
    Datetime: string;
    Rip_Current_Velocity: string | number;
    Hazard_Level: string | number;
}

interface RipCurrentResult {
    velocities: number[];
    hazardLevels: number[];
    dates: Date[];
    isLoading: boolean;
    error: string | null;
}

/**
 * Fonction utilitaire pour regrouper les données par heure
 * Calcule la moyenne des vitesses de courant et des niveaux de danger
 * pour chaque heure complète
 */
const groupDataByHour = (
    dates: Date[],
    velocities: number[],
    hazardLevels: number[]
): { hourlyDates: Date[], hourlyVelocities: number[], hourlyHazardLevels: number[] } => {
    // Map pour stocker les données par heure
    const hourMap = new Map<string, {
        date: Date,
        velocitiesSum: number,
        hazardLevelsSum: number,
        count: number
    }>();

    // Parcourir toutes les données
    for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        // Créer une clé basée sur l'année, le mois, le jour et l'heure (ignorer minutes/secondes)
        const hourKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;

        // Si cette heure existe déjà dans notre map, mettre à jour les valeurs
        if (hourMap.has(hourKey)) {
            const hourData = hourMap.get(hourKey)!;
            hourData.velocitiesSum += velocities[i];
            hourData.hazardLevelsSum += hazardLevels[i];
            hourData.count += 1;
        } else {
            // Sinon, créer une nouvelle entrée avec une date "propre" sans minutes ni secondes
            const cleanDate = new Date(date);
            cleanDate.setMinutes(0, 0, 0); // Réinitialiser les minutes et secondes à 0

            hourMap.set(hourKey, {
                date: cleanDate,
                velocitiesSum: velocities[i],
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
    const hourlyVelocities = hourlyEntries.map(entry => {
        // Calculer la moyenne avec une précision de 2 décimales
        return Math.round((entry[1].velocitiesSum / entry[1].count) * 100) / 100;
    });
    const hourlyHazardLevels = hourlyEntries.map(entry =>
        Math.round(entry[1].hazardLevelsSum / entry[1].count)
    );

    return { hourlyDates, hourlyVelocities, hourlyHazardLevels };
};

/**
 * Hook personnalisé pour charger les données de courant d'arrachement depuis un CSV
 * et les regrouper par heure
 */
export const useRipCurrentData = (): RipCurrentResult => {
    const [velocities, setVelocities] = useState<number[]>([]);
    const [hazardLevels, setHazardLevels] = useState<number[]>([]);
    const [dates, setDates] = useState<Date[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Utiliser le chemin vers le fichier CSV
                const response = await fetch(`${import.meta.env.BASE_URL}dataModel/rip_current_data.csv`);
                const csvText = await response.text();

                Papa.parse<RipCurrentData>(csvText, {
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
                        const parsedVelocities: number[] = [];
                        const parsedHazardLevels: number[] = [];

                        // Classer les données par date
                        result.data.forEach(row => {
                            if (row.Datetime && row.Rip_Current_Velocity !== undefined) {
                                const date = new Date(row.Datetime as string);
                                if (!isNaN(date.getTime())) {
                                    parsedDates.push(date);

                                    // Convertir la vitesse du courant en nombre
                                    const velocity = typeof row.Rip_Current_Velocity === 'number'
                                        ? row.Rip_Current_Velocity
                                        : parseFloat(row.Rip_Current_Velocity as string);
                                    parsedVelocities.push(!isNaN(velocity) ? velocity : 0);

                                    // Convertir le niveau de danger en nombre
                                    const hazardLevel = typeof row.Hazard_Level === 'number'
                                        ? row.Hazard_Level
                                        : parseInt(row.Hazard_Level as string, 10);
                                    parsedHazardLevels.push(!isNaN(hazardLevel) ? hazardLevel : 0);
                                }
                            }
                        });

                        // Trier les données par date (au cas où elles ne seraient pas déjà triées)
                        const sortedVelocities = [...parsedVelocities];
                        const sortedHazardLevels = [...parsedHazardLevels];
                        const sortedDates = [...parsedDates];

                        // Trier les tableaux ensemble basés sur les dates
                        const data = sortedVelocities.map((_, i) => ({
                            date: sortedDates[i],
                            velocity: sortedVelocities[i],
                            hazard: sortedHazardLevels[i]
                        }));
                        data.sort((a, b) => a.date.getTime() - b.date.getTime());

                        // Reconstituer les tableaux triés
                        const orderedDates = data.map(item => item.date);
                        const orderedVelocities = data.map(item => item.velocity);
                        const orderedHazardLevels = data.map(item => item.hazard);

                        // Filtrer les données pour n'avoir que les 24 prochaines heures
                        const now = new Date();
                        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

                        // Filtrer les prévisions pour les 24 prochaines heures
                        const filteredDates: Date[] = [];
                        const filteredVelocities: number[] = [];
                        const filteredHazardLevels: number[] = [];

                        // Trouver l'index correspondant à l'heure actuelle ou juste après
                        let startIndex = orderedDates.findIndex(date => date >= today);
                        if (startIndex === -1) startIndex = 0;

                        // Prendre jusqu'à 24 heures à partir de cet index
                        for (let i = startIndex; i < orderedDates.length; i++) {
                            // Vérifier que la date est dans les 24 prochaines heures
                            if (orderedDates[i].getTime() - today.getTime() <= 24 * 60 * 60 * 1000) {
                                filteredDates.push(orderedDates[i]);
                                filteredVelocities.push(orderedVelocities[i]);
                                filteredHazardLevels.push(orderedHazardLevels[i]);
                            } else {
                                break; // Sortir de la boucle une fois qu'on dépasse 24 heures
                            }
                        }

                        // Appliquer le regroupement pour obtenir des moyennes horaires
                        const { hourlyDates, hourlyVelocities, hourlyHazardLevels } = groupDataByHour(
                            filteredDates,
                            filteredVelocities,
                            filteredHazardLevels
                        );

                        // S'assurer que nous avons bien des données regroupées par heure
                        if (hourlyDates.length === 0 && filteredDates.length > 0) {
                            // Si le regroupement échoue mais que nous avons des données filtrées, utiliser celles-ci
                            console.warn("Le regroupement horaire n'a produit aucun résultat, utilisation des données brutes filtrées");
                            setDates(filteredDates);
                            setVelocities(filteredVelocities);
                            setHazardLevels(filteredHazardLevels);
                        } else {
                            // Utiliser les données horaires
                            setDates(hourlyDates);
                            setVelocities(hourlyVelocities);
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

    return { velocities, hazardLevels, dates, isLoading, error };
};