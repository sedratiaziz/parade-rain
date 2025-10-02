import { ForecastResult } from '../types';
import { supabase } from '../lib/supabase';

export async function getForecast(
  lat: number,
  lon: number,
  date: string
): Promise<ForecastResult> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/forecast`;

  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    date: date,
  });

  const headers = {
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${apiUrl}?${params}`, { headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch forecast' }));
    throw new Error(error.error || 'Failed to fetch forecast');
  }

  const result: ForecastResult = await response.json();

  await saveForecastQuery(result);

  return result;
}

async function saveForecastQuery(result: ForecastResult): Promise<void> {
  try {
    await supabase.from('forecast_queries').insert({
      latitude: result.location.latitude,
      longitude: result.location.longitude,
      query_date: result.date,
      rain_probability: result.rainRisk.probability || 0,
      rain_risk_level: result.rainRisk.level,
      temp_max_f: result.heatRisk.temperatureMax || 0,
      temp_min_f: result.heatRisk.temperatureMin || 0,
      heat_risk_level: result.heatRisk.level,
    });
  } catch (error) {
    console.error('Failed to save forecast query:', error);
  }
}
