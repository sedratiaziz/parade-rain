import { useState } from 'react';
import { Umbrella } from 'lucide-react';
import LocationInput from './components/LocationInput';
import DatePicker from './components/DatePicker';
import ResultsCard from './components/ResultsCard';
import LoadingSpinner from './components/LoadingSpinner';
import { ForecastResult } from './types';
import { getForecast } from './services/forecastService';

function App() {
  const [location, setLocation] = useState<{ lat: number; lon: number; name?: string } | null>(null);
  const [date, setDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ForecastResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleLocationSelect = (lat: number, lon: number, cityName?: string) => {
    setLocation({ lat, lon, name: cityName });
    setResult(null);
    setError('');
  };

  const handleDateSelect = (selectedDate: string) => {
    setDate(selectedDate);
    setResult(null);
    setError('');
  };

  const handleGetForecast = async () => {
    if (!location || !date) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const forecast = await getForecast(location.lat, location.lon, date);
      setResult(forecast);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forecast. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const canGetForecast = location && date && !isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Umbrella className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              Will It Rain On My Parade?
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Check weather risks for your upcoming events. Get rain probability and heat risk forecasts
            to plan your perfect day.
          </p>
        </header>

        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
            <LocationInput onLocationSelect={handleLocationSelect} />
            <DatePicker onDateSelect={handleDateSelect} disabled={!location} />
          </div>

          {location && date && (
            <button
              onClick={handleGetForecast}
              disabled={!canGetForecast}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              Check Weather Risk
            </button>
          )}
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          {isLoading ? (
            <LoadingSpinner />
          ) : result ? (
            <ResultsCard result={result} cityName={location?.name} />
          ) : null}
        </div>
      </div>

      <footer className="text-center py-8 text-gray-600 text-sm">
        <p>Weather data powered by Open-Meteo and NASA POWER</p>
      </footer>
    </div>
  );
}

export default App;
