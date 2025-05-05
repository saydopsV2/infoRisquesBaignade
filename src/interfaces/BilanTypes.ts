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
    // Maximums
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
    
    // Minimums
    minTemperature: number | null;
    minUvIndex: number | null;
    minWindSpeed: number | null;
    minWindGusts: number | null;
    directionAtMinSpeed: number | null;
    minWaveHeight: number | null;
    directionAtMinWave: number | null;
    periodAtMinWave: number | null;
    minAttendanceHazardLevel: number | null;
    minRipCurrentHazardLevel: number | null;
    minShoreBreakHazardLevel: number | null;
    
    // Heures des maximums
    tempMaxHour: number | null;
    uvMaxHour: number | null;
    maxWindSpeedHour: number | null;
    maxWindGustsHour: number | null;
    maxWaveHeightHour: number | null;
    maxAttendanceHazardHour: number | null;
    maxRipCurrentHazardHour: number | null;
    maxShoreBreakHazardHour: number | null;
    
    // Heures des minimums
    tempMinHour: number | null;
    uvMinHour: number | null;
    minWindSpeedHour: number | null;
    minWindGustsHour: number | null;
    minWaveHeightHour: number | null;
    minAttendanceHazardHour: number | null;
    minRipCurrentHazardHour: number | null;
    minShoreBreakHazardHour: number | null;
  } | null;
}

export interface WaveSectionProps extends Omit<SectionProps, 'maxValues'> {
  maxValues: {
    // Maximum
    maxWaveHeight: number | null;
    directionAtMaxWave: number | null;
    periodAtMaxWave: number | null;
    maxWaveHeightHour: number | null;
    
    // Minimum
    minWaveHeight: number | null;
    directionAtMinWave: number | null;
    periodAtMinWave: number | null;
    minWaveHeightHour: number | null;
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