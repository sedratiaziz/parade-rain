interface ForecastRequest {
  lat: number;
  lon: number;
  date: string;
}

interface WeatherResponse {
  daily: {
    time: string[];
    precipitation_probability_max: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

interface RiskLevel {
  level: 'low' | 'medium' | 'high';
  color: string;
  emoji: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function calculateRainRisk(precipProbability: number): RiskLevel {
  if (precipProbability >= 60) {
    return { level: 'high', color: 'red', emoji: '🌧️' };
  } else if (precipProbability >= 30) {
    return { level: 'medium', color: 'yellow', emoji: '⛅' };
  } else {
    return { level: 'low', color: 'green', emoji: '☀️' };
  }
}

function calculateHeatRisk(tempMax: number): RiskLevel {
  const tempF = (tempMax * 9/5) + 32;

  if (tempF >= 90) {
    return { level: 'high', color: 'red', emoji: '🥵' };
  } else if (tempF >= 80) {
    return { level: 'medium', color: 'yellow', emoji: '🌡️' };
  } else {
    return { level: 'low', color: 'green', emoji: '😊' };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const lat = url.searchParams.get('lat');
    const lon = url.searchParams.get('lon');
    const date = url.searchParams.get('date');

    if (!lat || !lon || !date) {
      return new Response(
        JSON.stringify({
          error: 'Missing required parameters: lat, lon, and date are required'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return new Response(
        JSON.stringify({ error: 'Invalid coordinates provided' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return new Response(
        JSON.stringify({ error: 'Coordinates out of valid range' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return new Response(
        JSON.stringify({ error: 'Invalid date format' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min&timezone=auto&start_date=${date}&end_date=${date}`;

    const weatherResponse = await fetch(weatherApiUrl);

    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const weatherData: WeatherResponse = await weatherResponse.json();

    if (!weatherData.daily || !weatherData.daily.time || weatherData.daily.time.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No weather data available for the specified date' }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const precipProbability = weatherData.daily.precipitation_probability_max[0] || 0;
    const tempMax = weatherData.daily.temperature_2m_max[0];
    const tempMin = weatherData.daily.temperature_2m_min[0];

    const rainRisk = calculateRainRisk(precipProbability);
    const heatRisk = calculateHeatRisk(tempMax);

    const tempMaxF = Math.round((tempMax * 9/5) + 32);
    const tempMinF = Math.round((tempMin * 9/5) + 32);

    const result = {
      location: {
        latitude,
        longitude,
      },
      date: weatherData.daily.time[0],
      rainRisk: {
        probability: precipProbability,
        level: rainRisk.level,
        color: rainRisk.color,
        emoji: rainRisk.emoji,
      },
      heatRisk: {
        temperatureMax: tempMaxF,
        temperatureMin: tempMinF,
        temperatureMaxC: Math.round(tempMax),
        temperatureMinC: Math.round(tempMin),
        level: heatRisk.level,
        color: heatRisk.color,
        emoji: heatRisk.emoji,
      },
    };

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing forecast request:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to fetch weather forecast',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
