import React, { createContext, useContext, useState, ReactNode } from 'react';
import Beach from '../interface/Beach';

// Constante pour le nombre de jours à afficher
const DAYS_TO_DISPLAY = 7;

interface WaveForecastData {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly_units: {
    time: string;
    wave_height: string;
    wave_direction: string;
    swell_wave_peak_period: string;
  };
  hourly: {
    time: string[];
    wave_height: number[];
    wave_direction: number[];
    swell_wave_peak_period: number[];
  };
}

interface WaveForecastContextProps {
  waveForecast: WaveForecastData | null;
  loading: boolean;
  error: string | null;
  fetchWaveForecast: (beach: Beach) => Promise<void>;
}

const WaveForecastContext = createContext<WaveForecastContextProps | undefined>(undefined);

export const useWaveForecast = () => {
  const context = useContext(WaveForecastContext);
  if (!context) {
    throw new Error('useWaveForecast must be used within a WaveForecastProvider');
  }
  return context;
};

interface WaveForecastProviderProps {
  children: ReactNode;
}

export const WaveForecastProvider: React.FC<WaveForecastProviderProps> = ({ children }) => {
  const [waveForecast, setWaveForecast] = useState<WaveForecastData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWaveForecast = async (beach: Beach) => {
    setLoading(true);
    setError(null);

    try {
      // Ajouter le paramètre forecast_days pour avoir 7 jours de prévisions
      const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${beach.latitude}&longitude=${beach.longitude}&hourly=wave_height,wave_direction,swell_wave_peak_period&timezone=auto&forecast_days=${DAYS_TO_DISPLAY}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error fetching wave forecast: ${response.statusText}`);
      }

      const data = await response.json();
      setWaveForecast(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching wave forecast:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    waveForecast,
    loading,
    error,
    fetchWaveForecast
  };

  return (
    <WaveForecastContext.Provider value={value}>
      {children}
    </WaveForecastContext.Provider>
  );
};