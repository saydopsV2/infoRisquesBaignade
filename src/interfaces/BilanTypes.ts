import Beach from './Beach';

// Interface pour les données affichées à 11h
export interface Data11AM {
  temperature: number | null;
  uvIndex: number | null;
  windDirection: number | null;
  windSpeed: number | null;
  windGusts: number | null;
  waveHeight: number | null;
  waveDirection: number | null;
  wavePeriod: number | null;
  attendanceHazardLevel: number | null;
  ripCurrentHazardLevel: number | null;
  shoreBreakHazardLevel: number | null;
}

// Interface pour les valeurs maximales de l'après-midi
export interface MaxValues {
  maxTemperature: number | null;
  maxUvIndex: number | null;
  maxWindSpeed: number | null;
  maxWindGusts: number | null;
  directionAtMaxSpeed: number | null;
  maxWaveHeight: number | null;
  directionAtMaxWave: number | null;
  periodAtMaxWave: number | null;
  maxAttendanceHazardLevel: number | null;
  maxRipCurrentHazardLevel: number | null;
  maxShoreBreakHazardLevel: number | null;
}

// Interface pour les données de marées détaillées
export interface TideDetailData {
  type: string;
  coefficient: string;
  heure: string;
  duree: string;
  heure_maree: string;
  hauteur: string;
  marnage: string;
  un_douzieme: string;
  un_quart: string;
  demi: string;
}

// Interface commune pour les props des sections
export interface SectionProps {
  data11AM: Data11AM;
  maxValues: MaxValues | null;
}

// Props spécifiques pour le composant de marées
export interface TideSectionProps {
  tideData: TideDetailData | null;
  tideTypes: string[];
  tideHours: string[];
  tideHeights: string[];
}

// Props spécifiques pour le composant vagues
export interface WaveSectionProps extends SectionProps {
  waterTemperature: string | null;
}

// Props pour le composant principal Bilan
export interface BilanProps {
  location: Beach;
}
