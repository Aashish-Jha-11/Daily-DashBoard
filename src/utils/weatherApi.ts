/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_WEATHER_API_KEY: string;
    readonly VITE_WEATHER_API_URL: string;
    readonly VITE_WEATHER_FORECAST_API_URL: string;
    [key: string]: any;
  }
}

interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  icon: string;
  high: number;
  low: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
}

interface WeatherForecast {
  day: string;
  temperature: number;
  icon: string;
}


const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '';
const API_URL = import.meta.env.VITE_WEATHER_API_URL || '';
const FORECAST_API_URL = import.meta.env.VITE_WEATHER_FORECAST_API_URL || '';

export async function getWeatherData(city: string): Promise<WeatherData | null> {
  try {
    const response = await fetch(`${API_URL}${city}&appid=${API_KEY}`);
    const data = await response.json();
    
    if (data.cod !== 200) {
      throw new Error(data.message || 'Failed to fetch weather data');
    }
    
    const weatherData: WeatherData = {
      city: data.name,
      temperature: data.main.temp,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      high: data.main.temp_max,
      low: data.main.temp_min,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
    };
    
    console.log("Weather data fetched for:", city);
    return weatherData;
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return null;
  }
}

export async function getWeatherForecast(city: string): Promise<WeatherForecast[]> {
  try {
    const response = await fetch(`${FORECAST_API_URL}${city}&appid=${API_KEY}`);
    const data = await response.json();
    
    if (data.cod !== "200") {
      throw new Error(data.message || 'Failed to fetch forecast data');
    }
    
    // Get one forecast per day (every 24 hours / 8 data points)
    const dailyForecasts = data.list.filter((_: any, index: number) => index % 8 === 0).slice(0, 5);
    
    const forecast: WeatherForecast[] = dailyForecasts.map((item: any) => {
      const date = new Date(item.dt * 1000);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      return {
        day: dayName,
        temperature: item.main.temp,
        icon: item.weather[0].icon
      };
    });
    
    return forecast;
  } catch (error) {
    console.error("Failed to fetch weather forecast:", error);
    return [];
  }
}

export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}
