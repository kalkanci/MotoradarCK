import React from 'react';
import Card from './components/Card';
import { Wind, Umbrella, MapPin, Loader2, Thermometer } from 'lucide-react';

interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  icon: any;
  rainChance: number;
  windSpeed: number;
  windDirectionDeg: number;
  isLoaded: boolean;
}

interface WeatherWidgetProps {
  weatherData: WeatherData;
  apparentWindSpeed: number;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weatherData, apparentWindSpeed }) => {
  const IconComponent = weatherData.icon;

  if (!weatherData.isLoaded) {
    return (
        <Card className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
            <p className="text-slate-400 mt-4 text-xs font-medium tracking-wider">HAVA DURUMU ANALİZ EDİLİYOR...</p>
        </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden group">
      {/* Ambient decorative glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/20 blur-[90px] rounded-full -mr-16 -mt-16 pointer-events-none" />

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-1.5 text-cyan-400/80 mb-1">
            <MapPin size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Bölgesel Rapor</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-lg">{weatherData.city}</h2>
        </div>
        
        <div className="flex flex-col items-end">
           <div 
             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md text-xs font-bold transition-colors shadow-lg
               ${weatherData.rainChance > 30 ? 'bg-amber-500/20 border-amber-500/30 text-amber-200' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-200'}
             `}
            >
              <Umbrella size={12} />
              <span>%{weatherData.rainChance} Yağış</span>
           </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
           <div className="flex items-start">
                <span className="text-7xl font-thin tracking-tighter text-white drop-shadow-2xl">{weatherData.temperature}</span>
                <span className="text-2xl mt-2 text-cyan-400 font-light">°</span>
           </div>
           <div className="h-12 w-px bg-white/10 mx-2" />
           <div className="flex flex-col">
              <IconComponent size={32} className="text-white/90 mb-1 drop-shadow-md" />
              <span className="text-sm text-slate-300 font-medium">{weatherData.condition}</span>
           </div>
        </div>
      </div>

      {/* Advanced Wind Grid */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        {/* Real Wind */}
        <div className="bg-black/20 rounded-2xl p-4 border border-white/5 transition hover:bg-black/30 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3 text-slate-400">
             <Wind size={14} />
             <span className="text-[10px] uppercase font-bold tracking-wider">Rüzgar</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{weatherData.windSpeed}</span>
            <span className="text-xs text-slate-500 font-bold">KM/S</span>
          </div>
          
          <div className="mt-3 flex items-center gap-2">
            <div 
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner"
                aria-label={`Rüzgar yönü: ${weatherData.windDirectionDeg} derece`}
            >
                <div 
                    style={{ transform: `rotate(${weatherData.windDirectionDeg}deg)` }}
                    className="transition-transform duration-700 ease-out"
                >
                    <div className="w-0.5 h-3 bg-cyan-400 rounded-full mx-auto shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full -mt-0.5 mx-auto" />
                </div>
            </div>
            <span className="text-[10px] text-slate-500">Yön</span>
          </div>
        </div>

        {/* Apparent Wind (Important for riders) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-900/30 to-slate-800/20 rounded-2xl p-4 border border-orange-500/10 group-hover:border-orange-500/20 transition-colors backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-2 opacity-20">
              <Wind size={40} className="text-orange-500" />
          </div>
          
          <div className="flex items-center gap-2 mb-3 text-orange-300/80">
             <Thermometer size={14} />
             <span className="text-[10px] uppercase font-bold tracking-wider">Hissedilen</span>
          </div>
          
          <div className="flex items-baseline gap-1 relative z-10">
            <span className="text-2xl font-bold text-orange-50">{apparentWindSpeed}</span>
            <span className="text-xs text-orange-200/40 font-bold">KM/S</span>
          </div>
           <p className="text-[10px] text-orange-200/50 mt-3 leading-tight font-sans">
              Sürüş hızına göre rüzgar direnci
           </p>
        </div>
      </div>
    </Card>
  );
};

export default WeatherWidget;