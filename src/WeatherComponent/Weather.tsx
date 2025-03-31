// WeatherComponent.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Weather.css';

interface RealTimeWeather {
  date: {
    timeZone: string;
    time: string;
  };
  result: {
    
    wd_desc: string;
    prs: number;
    rh: number;
    ws_desc: string;
    wp: string;
    tem: number;
    wp_code: string;
  };
  location: {
    path: string;
    areaCode: string;
  };
  version: string;
  status: number;
}

interface ForecastWeather {
  date: {
    timeZone: string;
    time: string;
  };
  result: {
    size: number;
    datas: Array<{
      wp_night_code: string;
      ws_night: string;
      sunrise: string;
      week: string;
      rh_min: number;
      ws_day: string;
      wd_night: string;
      prs: number;
      wp_day: string;
      real_tem_max: number;
      fc_time: string;
      wp_night: string;
      pre_pro_day: number;
      wd_day: string;
      rh_max: number;
      tem_min: number;
      sunset: string;
      tem_max: number;
      pre_pro_night: number;
      pre_night: number;
      wp_day_code: string;
      pre_day: number;
      real_tem_min: number;
    }>;
    start: string;
    end: string;
  };
  location: {
    path: string;
    areaCode: string;
  };
  version: string;
  status: number;
}

interface WeatherData {
  realTime: RealTimeWeather['result'];
  forecast: ForecastWeather['result']['datas'];
}

const WeatherComponent = () => {
  const [city, setCity] = useState<string>('上海');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cityCodes: { [key: string]: string } = {
    上海: 'WTX_CH101020400',
    北京: 'WTX_CH101010100',
    广州: 'WTX_CH101280101',
    深圳: 'WTX_CH101280601',
    杭州: 'WTX_CH101210101',
  };

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);
      try {
        const realTimeResponse = await axios.get<RealTimeWeather>(
          `v2/cn/area/basic?location=${cityCodes[city]}&token=fd57f85db8dcfc14f26b4fa963e28104`
        );

        const forecastResponse = await axios.get<ForecastWeather>(
          `v2/cn/city/basic?location=${cityCodes[city]}&token=fd57f85db8dcfc14f26b4fa963e28104`
        );
        const forecastDatas = forecastResponse?.data?.result?.datas || [];
        const realTimeData = realTimeResponse?.data?.result;
        const forecastDatasWeek = forecastDatas.slice(1, 8) || [];


        setWeatherData({
          realTime: {
            ...realTimeData,
            tem_min: forecastDatas[0].tem_min,
            tem_max: forecastDatas[0].tem_max,
          },
          forecast: forecastDatasWeek,
        });
      } catch (err) {
        setError('无法获取天气数据，请稍后再试。');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [city]);

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCity(event.target.value);
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!weatherData) {
    return <div className="error">无法获取天气数据。</div>;
  }

  const realTime = weatherData.realTime;
  const futureForecasts = weatherData.forecast;

  return (
    <div className="weather-container">
      <div className="header">
        <h2>{city}</h2>
        <select onChange={handleCityChange} value={city} className="city-select">
          {Object.keys(cityCodes).map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
      <div className="current-weather">
        <div className="temperature">{realTime.tem}°</div>
        <div className="high-low">
          最高{realTime.tem_min}° 最低{realTime.tem_max}°
        </div>
        <div className="description">{realTime.wp}</div>
      </div>
      
      <div className="forecast">
        <div className="forecast-header">
          未来七天天气预报
        </div>
        <div className="forecast-items">
          {futureForecasts.map((item) => (
            <div key={item.fc_time} className="forecast-item">
              <div className="hour">{item.week}</div>
              <div className="description">{item.wp_day}</div>
              <div className="temp">{item.tem_min}°-{item.tem_max}°</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherComponent;