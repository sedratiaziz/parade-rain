/*
  # Weather Risk Dashboard Database Schema

  ## Overview
  This migration creates tables for storing weather forecast queries and responses
  to enable query history tracking and API response caching.

  ## New Tables

  ### `forecast_queries`
  Stores user forecast queries with results for history and analytics
  - `id` (uuid, primary key) - Unique identifier for each query
  - `latitude` (decimal) - Location latitude
  - `longitude` (decimal) - Location longitude
  - `query_date` (date) - The date being queried for weather forecast
  - `rain_probability` (integer) - Precipitation probability percentage (0-100)
  - `rain_risk_level` (text) - Risk level: 'low', 'medium', or 'high'
  - `temp_max_f` (integer) - Maximum temperature in Fahrenheit
  - `temp_min_f` (integer) - Minimum temperature in Fahrenheit
  - `heat_risk_level` (text) - Heat risk level: 'low', 'medium', or 'high'
  - `created_at` (timestamptz) - Timestamp when query was made
  - Indexes on location coordinates and query_date for fast lookups

  ### `forecast_cache`
  Caches weather API responses to reduce external API calls
  - `id` (uuid, primary key) - Unique identifier
  - `latitude` (decimal) - Location latitude
  - `longitude` (decimal) - Location longitude
  - `forecast_date` (date) - The date of the forecast
  - `api_response` (jsonb) - Complete API response data
  - `created_at` (timestamptz) - When cached
  - `expires_at` (timestamptz) - Cache expiration time
  - Unique constraint on (latitude, longitude, forecast_date)
  - Index on expires_at for cache cleanup

  ## Security
  - RLS enabled on both tables
  - Public read access for all authenticated and anonymous users
  - Public insert access to allow saving queries without authentication
  - This is appropriate since weather data is public information

  ## Notes
  - Cache expires after 6 hours to balance freshness with API usage
  - Coordinates rounded to 2 decimal places (~1km precision) for cache efficiency
  - Query history enables future features like user dashboards and analytics
*/

CREATE TABLE IF NOT EXISTS forecast_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude decimal(9,6) NOT NULL,
  longitude decimal(9,6) NOT NULL,
  query_date date NOT NULL,
  rain_probability integer NOT NULL,
  rain_risk_level text NOT NULL,
  temp_max_f integer NOT NULL,
  temp_min_f integer NOT NULL,
  heat_risk_level text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_forecast_queries_location
  ON forecast_queries(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_forecast_queries_date
  ON forecast_queries(query_date);

CREATE INDEX IF NOT EXISTS idx_forecast_queries_created
  ON forecast_queries(created_at DESC);

CREATE TABLE IF NOT EXISTS forecast_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude decimal(9,6) NOT NULL,
  longitude decimal(9,6) NOT NULL,
  forecast_date date NOT NULL,
  api_response jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '6 hours'),
  UNIQUE(latitude, longitude, forecast_date)
);

CREATE INDEX IF NOT EXISTS idx_forecast_cache_location_date
  ON forecast_cache(latitude, longitude, forecast_date);

CREATE INDEX IF NOT EXISTS idx_forecast_cache_expires
  ON forecast_cache(expires_at);

ALTER TABLE forecast_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view forecast queries"
  ON forecast_queries
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert forecast queries"
  ON forecast_queries
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view forecast cache"
  ON forecast_cache
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert forecast cache"
  ON forecast_cache
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update forecast cache"
  ON forecast_cache
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
