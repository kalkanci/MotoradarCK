import React, { useState, useEffect } from 'react';
import WeatherWidget from './components/WeatherWidget';
import MotorStatsWidget from './components/MotorStatsWidget';
import RadioWidget from './components/RadioWidget';
import AlertBanner, { AlertType } from './components/AlertBanner';
import { Battery, Navigation, Power, PlayCircle } from 'lucide-react';
import { Cloud, CloudRain, Sun, CloudLightning, CloudSnow, Wind } from 'lucide-react';

// --- TYPES ---
interface GpsData {
  latitude: number;
  longitude: number;
  speed: number; // km/h
  heading: number | null;
  altitude: number | null;
  accuracy: number;
}

interface WeatherState {
  city: string;
  temperature: number;
  condition: string;
  icon: any;
  rainChance: number;
  windSpeed: number;
  windDirectionDeg: number;
  isLoaded: boolean;
}

const DashboardLayout: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isStarted, setIsStarted] = useState(false);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  
  // Live Data States
  const [gpsData, setGpsData] = useState<GpsData>({
    latitude: 0,
    longitude: 0,
    speed: 0,
    heading: 0,
    altitude: 0,
    accuracy: 0,
  });

  const [weather, setWeather] = useState<WeatherState>({
    city: "Bekleniyor...",
    temperature: 0,
    condition: "--",
    icon: Cloud,
    rainChance: 0,
    windSpeed: 0,
    windDirectionDeg: 0,
    isLoaded: false,
  });

  // Timer for clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- WEATHER ANALYZER (Rider Safety) ---
  useEffect(() => {
    if (!weather.isLoaded) return;

    const newAlerts: AlertType[] = [];

    // 1. Rain Analysis
    if (weather.rainChance > 40) {
      newAlerts.push({
        id: 'rain-risk',
        type: 'warning',
        title: 'Kaygan Zemin Riski',
        message: `Yağmur ihtimali %${weather.rainChance}. Virajlarda yatış açısını azaltın.`
      });
    }

    // 2. Wind Analysis
    if (weather.windSpeed > 25) {
      newAlerts.push({
        id: 'wind-risk',
        type: 'danger',
        title: 'Şiddetli Rüzgar',
        message: 'Açık alanlarda ani rüzgar darbelerine (crosswind) dikkat edin.'
      });
    }

    // 3. Temperature Analysis (Ice or Heat)
    if (weather.temperature < 4) {
      newAlerts.push({
        id: 'ice-risk',
        type: 'danger',
        title: 'Gizli Buzlanma',
        message: 'Sıcaklık çok düşük. Köprü ve viyadüklerde buzlanma olabilir.'
      });
    } else if (weather.temperature > 32) {
      newAlerts.push({
        id: 'heat-risk',
        type: 'info',
        title: 'Yüksek Sıcaklık',
        message: 'Dikkat dağınıklığını önlemek için sık su molası verin.'
      });
    }

    setAlerts(newAlerts);
  }, [weather]);


  // --- WEATHER UTILS ---
  const getWeatherIcon = (code: number) => {
    if (code === 0) return Sun;
    if (code >= 1 && code <= 3) return Cloud;
    if (code >= 45 && code <= 48) return Wind;
    if (code >= 51 && code <= 67) return CloudRain;
    if (code >= 71 && code <= 77) return CloudSnow;
    if (code >= 95) return CloudLightning;
    return Cloud;
  };

  const getWeatherDescription = (code: number) => {
    const codes: {[key: number]: string} = {
      0: "Açık", 1: "Az Bulutlu", 2: "Parçalı Bulutlu", 3: "Kapalı",
      45: "Sisli", 51: "Çiseleme", 61: "Yağmurlu", 71: "Kar Yağışlı",
      95: "Fırtına"
    };
    return codes[code] || "Bulutlu";
  };

  // --- DATA FETCHING ---
  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=precipitation_probability`
      );
      const data = await response.json();
      
      if (data.current_weather) {
        setWeather({
          city: "Konum", 
          temperature: Math.round(data.current_weather.temperature),
          condition: getWeatherDescription(data.current_weather.weathercode),
          icon: getWeatherIcon(data.current_weather.weathercode),
          rainChance: data.hourly?.precipitation_probability?.[new Date().getHours()] || 0,
          windSpeed: Math.round(data.current_weather.windspeed),
          windDirectionDeg: data.current_weather.winddirection,
          isLoaded: true,
        });
      }
    } catch (error) {
      console.error("Weather fetch failed", error);
    }
  };

  const startSensors = async (demoMode = false) => {
    setIsStarted(true);

    if (demoMode) {
      // Demo Mock Data
      setWeather({
        city: "Demo Modu",
        temperature: 18,
        condition: "Yağmurlu",
        icon: CloudRain,
        rainChance: 65,
        windSpeed: 28,
        windDirectionDeg: 140,
        isLoaded: true
      });
      setGpsData({ 
        latitude: 0, longitude: 0, 
        speed: 45, heading: 45, 
        altitude: 120, accuracy: 10 
      });
      // Simulate speed changes
      setInterval(() => {
        setGpsData(prev => ({
          ...prev,
          speed: Math.max(0, prev.speed + (Math.random() > 0.5 ? 2 : -2)),
          heading: (prev.heading || 0 + 1) % 360
        }));
      }, 1000);
      return;
    }

    // Real Sensors
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        await (DeviceMotionEvent as any).requestPermission();
      } catch (e) { console.error(e); }
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, speed, heading, altitude, accuracy } = position.coords;
          setGpsData({
            latitude,
            longitude,
            speed: speed ? Math.round(speed * 3.6) : 0,
            heading: heading || 0,
            altitude: altitude ? Math.round(altitude) : 0,
            accuracy: Math.round(accuracy)
          });
          if (!weather.isLoaded) fetchWeather(latitude, longitude);
        },
        (err) => console.error("GPS Error: ", err),
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 27000 }
      );
    }
  };

  // --- CALCULATIONS ---
  const calculateApparentWind = (windSpeed: number, windDeg: number, riderSpeed: number, riderHeading: number) => {
    if (!windSpeed) return 0;
    const toRad = (deg: number) => deg * (Math.PI / 180);
    const windRad = toRad(windDeg + 180); 
    const wx = windSpeed * Math.sin(windRad);
    const wy = windSpeed * Math.cos(windRad);
    const riderRad = toRad(riderHeading || 0);
    const rx = riderSpeed * Math.sin(riderRad);
    const ry = riderSpeed * Math.cos(riderRad);
    const relX = wx - rx;
    const relY = wy - ry;
    return Math.sqrt(relX * relX + relY * relY);
  };

  const apparentWindSpeed = Math.round(
    calculateApparentWind(weather.windSpeed, weather.windDirectionDeg, gpsData.speed, gpsData.heading || 0)
  );

  // --- RENDER ---
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-black to-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558981806-ec527fa84c3d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />
        
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-32 h-32 bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center mb-10 shadow-2xl shadow-cyan-500/20 animate-pulse">
              <Navigation size={56} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
            </div>
            <h1 className="text-5xl font-black mb-4 tracking-tighter drop-shadow-2xl">MOTO HUD <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">v2.0</span></h1>
            <p className="text-slate-400 mb-12 max-w-sm text-lg leading-relaxed font-light">
            Gelişmiş sürüş asistanı, hava durumu analizi ve multimedya kontrolü.
            </p>
            
            <div className="flex flex-col gap-4 w-full max-w-xs">
                <button 
                onClick={() => startSensors(false)}
                className="group relative overflow-hidden bg-white text-slate-900 font-bold py-4 px-8 rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Power size={20} className="group-hover:text-cyan-600 transition-colors" />
                SİSTEMİ BAŞLAT
                </button>

                <button 
                onClick={() => startSensors(true)}
                className="bg-white/5 backdrop-blur-md border border-white/10 text-white font-medium py-4 px-8 rounded-2xl transition-all hover:bg-white/10 active:scale-95 flex items-center justify-center gap-3"
                >
                <PlayCircle size={20} className="text-cyan-400" />
                DEMO MODU
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black text-white font-mono overflow-y-auto selection:bg-cyan-500/30">
      
      {/* Glass Status Bar */}
      <header className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center bg-slate-950/20 backdrop-blur-xl border-b border-white/5 shadow-sm">
        <span className="text-xl font-bold tracking-tight text-white/90 drop-shadow-md">
            {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div className="flex items-center space-x-5 text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${gpsData.accuracy < 20 ? "bg-emerald-400 shadow-[0_0_10px_theme(colors.emerald.400)]" : "bg-amber-400 animate-pulse"}`} />
            <span className="text-slate-300">GPS</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Battery size={20} />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-6 flex flex-col gap-6 pb-32">
        
        {/* ALERT AREA - Slide in if alerts exist */}
        {alerts.length > 0 && (
            <div className="flex flex-col gap-3 animate-[slideIn_0.5s_ease-out]">
                {alerts.map(alert => (
                    <AlertBanner key={alert.id} alert={alert} />
                ))}
            </div>
        )}

        {/* 1. Live Motor Stats (Hero) */}
        <MotorStatsWidget 
          speed={gpsData.speed} 
          heading={gpsData.heading || 0}
          altitude={gpsData.altitude || 0}
        />
        
        {/* 2. Live Weather */}
        <WeatherWidget 
          weatherData={weather} 
          apparentWindSpeed={apparentWindSpeed} 
        />

        {/* 3. Live Radio */}
        <RadioWidget />
      </main>
    </div>
  );
}

export default DashboardLayout;