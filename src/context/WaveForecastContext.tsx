import React, { createContext, useContext, useState, ReactNode } from 'react';
import Beach from '../interface/Beach';

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
    wave_period: string;
  };
  hourly: {
    time: string[];
    wave_height: number[];
    wave_direction: number[];
    wave_period: number[];
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
      const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${beach.latitude}&longitude=${beach.longitude}&hourly=wave_height,wave_direction,wave_period&timezone=auto`;
      
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
