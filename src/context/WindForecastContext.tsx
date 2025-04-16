import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Beach from '../interface/Beach';

interface WindForecastData {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly_units: {
    time: string;
    wind_direction_10m: string;
    wind_speed_10m: string;
    wind_gusts_10m: string;
  };
  hourly: {
    time: string[];
    wind_direction_10m: number[];
    wind_speed_10m: number[];
    wind_gusts_10m: number[];
  };
}

interface WindForecastContextProps {
  windForecast: WindForecastData | null;
  loading: boolean;
  error: string | null;
  fetchWindForecast: (beach: Beach) => Promise<void>;
}

const WindForecastContext = createContext<WindForecastContextProps | undefined>(undefined);

export const useWindForecast = () => {
  const context = useContext(WindForecastContext);
  if (!context) {
    throw new Error('useWindForecast must be used within a WindForecastProvider');
  }
  return context;
};

interface WindForecastProviderProps {
  children: ReactNode;
}

export const WindForecastProvider: React.FC<WindForecastProviderProps> = ({ children }) => {
  const [windForecast, setWindForecast] = useState<WindForecastData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWindForecast = async (beach: Beach) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${beach.latitude}&longitude=${beach.longitude}&hourly=wind_direction_10m,wind_speed_10m,wind_gusts_10m&timezone=auto&wind_speed_unit=kn`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error fetching wind forecast: ${response.statusText}`);
      }
      
      const data = await response.json();
      setWindForecast(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching wind forecast:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    windForecast,
    loading,
    error,
    fetchWindForecast
  };

  return (
    <WindForecastContext.Provider value={value}>
      {children}
    </WindForecastContext.Provider>
  );
};
