import Beach from './Beach';

export interface BilanProps {
  location: Beach;
}

export interface SectionProps {
  data11AM: {
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
  };
  maxValues: {
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
    // Ajouter les heures des maximums
    tempMaxHour: number | null;
    uvMaxHour: number | null;
    maxWindSpeedHour: number | null;
    maxWindGustsHour: number | null;
    maxWaveHeightHour: number | null;
    maxAttendanceHazardHour: number | null;
    maxRipCurrentHazardHour: number | null;
    maxShoreBreakHazardHour: number | null;
  } | null;
}

export interface WaveSectionProps extends Omit<SectionProps, 'maxValues'> {
  maxValues: {
    maxWaveHeight: number | null;
    directionAtMaxWave: number | null;
    periodAtMaxWave: number | null;
    maxWaveHeightHour: number | null;
  } | null;
  waterTemperature: string | null;
}

export interface TideSectionProps {
  tideData: TideDetailData | null;
  tideTypes: string[];
  tideHours: string[];
  tideHeights: string[];
}

export interface TideDetailData {
  coefficient: string;
  type: string;
  heure: string;
  hauteur: string;
}