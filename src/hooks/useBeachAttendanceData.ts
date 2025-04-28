import { useState, useEffect, SetStateAction } from 'react';
import Papa from 'papaparse';

// Type pour les données de fréquentation des plages
interface BeachAttendanceData {
    Datetime: string;
    Predicted_Attendance_Percent: string | number;
    Hazard_Level: string | number;
}

interface BeachAttendanceResult {
    attendanceValues: number[];
    hazardLevels: number[];
    dates: Date[];
    morningAttendance: number[];
    afternoonAttendance: number[];
    isLoading: boolean;
    error: string | null;
}

// Constante pour le nombre de jours à récupérer
const DAYS_TO_DISPLAY = 7;

/**
 * Fonction utilitaire pour convertir les pourcentages en nombre de visiteurs estimés
 * Échelle arbitraire: 100% = 500 visiteurs
 */
const percentToVisitors = (percent: number): number => {
    return Math.round((percent / 100) * 500);
};

/**
 * Fonction utilitaire pour regrouper les données par heure
 */
const groupDataByHour = (
    dates: Date[],
    attendanceValues: number[],
    hazardLevels: number[]
): { hourlyDates: Date[], hourlyAttendance: number[], hourlyHazardLevels: number[] } => {
    // Map pour stocker les données par heure
    const hourMap = new Map<string, {
        date: Date,
        attendanceSum: number,
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
            hourData.attendanceSum += attendanceValues[i];
            hourData.hazardLevelsSum += hazardLevels[i];
            hourData.count += 1;
        } else {
            // Sinon, créer une nouvelle entrée avec une date "propre" sans minutes ni secondes
            const cleanDate = new Date(date);
            cleanDate.setMinutes(0, 0, 0); // Réinitialiser les minutes et secondes à 0

            hourMap.set(hourKey, {
                date: cleanDate,
                attendanceSum: attendanceValues[i],
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
    const hourlyAttendance = hourlyEntries.map(entry => {
        // Calculer la moyenne avec une précision de 2 décimales
        return Math.round((entry[1].attendanceSum / entry[1].count) * 100) / 100;
    });
    const hourlyHazardLevels = hourlyEntries.map(entry =>
        Math.round(entry[1].hazardLevelsSum / entry[1].count)
    );

    return { hourlyDates, hourlyAttendance, hourlyHazardLevels };
};

/**
 * Fonction utilitaire pour regrouper les données par période (matin/après-midi)
 */
const groupDataByPeriod = (
    dates: Date[],
    attendanceValues: number[]
): { morningAttendance: number[], afternoonAttendance: number[] } => {
    const morningData: number[] = [];
    const afternoonData: number[] = [];
    
    // Temporaire pour calculer les moyennes
    const morningSum: { [key: string]: { sum: number, count: number } } = {};
    const afternoonSum: { [key: string]: { sum: number, count: number } } = {};
    
    // Parcourir toutes les données
    for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const attendance = attendanceValues[i];
        
        // Créer une clé pour le jour (ignorer l'heure)
        const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        
        // Déterminer si c'est le matin ou l'après-midi
        const isMorning = date.getHours() < 12;
        
        if (isMorning) {
            if (!morningSum[dayKey]) {
                morningSum[dayKey] = { sum: 0, count: 0 };
            }
            morningSum[dayKey].sum += attendance;
            morningSum[dayKey].count += 1;
        } else {
            if (!afternoonSum[dayKey]) {
                afternoonSum[dayKey] = { sum: 0, count: 0 };
            }
            afternoonSum[dayKey].sum += attendance;
            afternoonSum[dayKey].count += 1;
        }
    }
    
    // Calculer les moyennes pour chaque jour
    const days = [...new Set([...Object.keys(morningSum), ...Object.keys(afternoonSum)])].sort();
    
    days.forEach(day => {
        // Matin
        if (morningSum[day]) {
            morningData.push(Math.round(morningSum[day].sum / morningSum[day].count));
        } else {
            morningData.push(0);
        }
        
        // Après-midi
        if (afternoonSum[day]) {
            afternoonData.push(Math.round(afternoonSum[day].sum / afternoonSum[day].count));
        } else {
            afternoonData.push(0);
        }
    });
    
    return { morningAttendance: morningData, afternoonAttendance: afternoonData };
};

/**
 * Hook personnalisé pour charger les données de fréquentation des plages depuis un CSV
 */
export const useBeachAttendanceData = (
    groupByDay: boolean = false
): BeachAttendanceResult => {
    const [attendanceValues, setAttendanceValues] = useState<number[]>([]);
    const [hazardLevels, setHazardLevels] = useState<number[]>([]);
    const [dates, setDates] = useState<Date[]>([]);
    const [morningAttendance, setMorningAttendance] = useState<number[]>([]);
    const [afternoonAttendance, setAfternoonAttendance] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Utiliser le chemin vers le fichier CSV
                const response = await fetch(`${import.meta.env.BASE_URL}dataModel/beach_attendance_data.csv`);
                const csvText = await response.text();

                Papa.parse<BeachAttendanceData>(csvText, {
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
                        const parsedAttendance: number[] = [];
                        const parsedHazardLevels: number[] = [];

                        // Extraire les données
                        result.data.forEach(row => {
                            if (row.Datetime && row.Predicted_Attendance_Percent !== undefined) {
                                const date = new Date(row.Datetime as string);
                                if (!isNaN(date.getTime())) {
                                    parsedDates.push(date);

                                    // Convertir le pourcentage d'affluence en nombre de visiteurs
                                    const attendancePercent = typeof row.Predicted_Attendance_Percent === 'number'
                                        ? row.Predicted_Attendance_Percent
                                        : parseFloat(row.Predicted_Attendance_Percent as string);

                                    const visitors = percentToVisitors(!isNaN(attendancePercent) ? attendancePercent : 0);
                                    parsedAttendance.push(visitors);

                                    // Extraire le niveau de danger
                                    const hazardLevel = typeof row.Hazard_Level === 'number'
                                        ? row.Hazard_Level
                                        : parseInt(row.Hazard_Level as string, 10);
                                    parsedHazardLevels.push(!isNaN(hazardLevel) ? hazardLevel : 0);
                                }
                            }
                        });

                        // Trier les données par date
                        const data = parsedDates.map((date, i) => ({
                            date: date,
                            attendance: parsedAttendance[i],
                            hazard: parsedHazardLevels[i]
                        }));
                        data.sort((a, b) => a.date.getTime() - b.date.getTime());

                        // Reconstituer les tableaux triés
                        const orderedDates = data.map(item => item.date);
                        const orderedAttendance = data.map(item => item.attendance);
                        const orderedHazardLevels = data.map(item => item.hazard);

                        // Filtrer les données pour les prochains jours
                        const now = new Date();
                        // Modifier pour prendre à partir de 00h00 de la date courante au lieu de l'heure actuelle
                        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

                        // Filtrer les prévisions pour les jours configurés
                        const filteredDates: Date[] = [];
                        const filteredAttendance: number[] = [];
                        const filteredHazardLevels: number[] = [];

                        // Trouver l'index correspondant à minuit de la date actuelle ou juste après
                        let startIndex = orderedDates.findIndex(date => date >= today);
                        if (startIndex === -1) startIndex = 0;

                        // Prendre jusqu'à 7 jours à partir de cet index
                        for (let i = startIndex; i < orderedDates.length; i++) {
                            // Vérifier que la date est dans la période configurée
                            if (orderedDates[i].getTime() - today.getTime() <= DAYS_TO_DISPLAY * 24 * 60 * 60 * 1000) {
                                filteredDates.push(orderedDates[i]);
                                filteredAttendance.push(orderedAttendance[i]);
                                filteredHazardLevels.push(orderedHazardLevels[i]);
                            } else {
                                break; // Sortir de la boucle une fois qu'on dépasse 7 jours
                            }
                        }

                        // Appliquer le regroupement par heure
                        const { hourlyDates, hourlyAttendance, hourlyHazardLevels } = groupDataByHour(
                            filteredDates,
                            filteredAttendance,
                            filteredHazardLevels
                        );

                        // Calculer les valeurs pour matin/après-midi
                        const { morningAttendance: morningValues, afternoonAttendance: afternoonValues } = 
                            groupDataByPeriod(hourlyDates, hourlyAttendance);

                        setDates(hourlyDates);
                        setAttendanceValues(hourlyAttendance);
                        setHazardLevels(hourlyHazardLevels);
                        setMorningAttendance(morningValues);
                        setAfternoonAttendance(afternoonValues);
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
    }, [groupByDay]);

    return { 
        attendanceValues, 
        hazardLevels, 
        dates, 
        morningAttendance, 
        afternoonAttendance, 
        isLoading, 
        error 
    };
};