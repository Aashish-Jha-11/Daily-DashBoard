
import React, { useEffect, useState } from 'react';
import { getWeatherData, getWeatherForecast, getWeatherIconUrl } from '@/utils/weatherApi';
import { Cloud, Droplets, Thermometer, Wind, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface WeatherProps {
  defaultCity: string;
}

export const Weather: React.FC<WeatherProps> = ({ defaultCity }) => {
  const [city, setCity] = useState(defaultCity);
  const [inputCity, setInputCity] = useState(defaultCity);
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeatherData();
  }, [city]);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      const weatherData = await getWeatherData(city);
      const forecastData = await getWeatherForecast(city);
      
      setWeather(weatherData);
      setForecast(forecastData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputCity(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCity.trim()) {
      setCity(inputCity.trim());
    }
  };

  if (loading) {
    return (
      <div className="dashboard-card animate-pulse min-h-[12rem] flex items-center justify-center">
        <div className="text-center">
          <Cloud className="animate-bounce mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="dashboard-card">
        <div className="text-center">
          <p className="text-red-500">Failed to load weather data</p>
          <Button onClick={fetchWeatherData} className="mt-2">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <h3 className="card-title">
        <Cloud className="h-5 w-5 text-morning-blue" />
        Weather
      </h3>
      
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <Input
          placeholder="Change city..."
          value={inputCity}
          onChange={handleCityChange}
          className="flex-1"
        />
        <Button type="submit" size="sm">
          <Search className="h-4 w-4 mr-1" />
          Update
        </Button>
      </form>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="text-center md:text-left">
            <h4 className="text-xl font-medium">{weather.city}</h4>
            <div className="flex items-center justify-center md:justify-start mt-1">
              <img 
                src={getWeatherIconUrl(weather.icon)} 
                alt={weather.description}
                className="w-16 h-16" 
              />
              <span className="text-3xl font-semibold">{Math.round(weather.temperature)}°C</span>
            </div>
            <p className="text-muted-foreground capitalize">{weather.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="flex items-center gap-1 text-sm">
              <Thermometer className="h-4 w-4 text-morning-orange" />
              <span>High: {Math.round(weather.high)}°C</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Thermometer className="h-4 w-4 text-morning-blue" />
              <span>Low: {Math.round(weather.low)}°C</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Droplets className="h-4 w-4 text-morning-teal" />
              <span>Humidity: {weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Wind className="h-4 w-4 text-morning-purple" />
              <span>Wind: {weather.wind_speed} km/h</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <h4 className="text-sm font-medium mb-2 md:text-center">5-Day Forecast</h4>
          <div className="flex flex-row md:flex-col justify-between">
            {forecast.map((day, index) => (
              <div key={index} className="flex flex-col md:flex-row items-center justify-between md:justify-center gap-1 md:gap-2 p-1">
                <span className="text-sm font-medium">{day.day}</span>
                <img 
                  src={getWeatherIconUrl(day.icon)} 
                  alt="Weather icon" 
                  className="w-8 h-8" 
                />
                <span className="text-sm">{Math.round(day.temperature)}°C</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
