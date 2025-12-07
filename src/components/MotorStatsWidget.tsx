import React, { useEffect, useState } from 'react';
import Card from './Card';
import { Navigation, Activity, ArrowUp } from 'lucide-react';

interface MotorStatsWidgetProps {
  speed: number;
  heading: number;
  altitude: number;
}

const MotorStatsWidget: React.FC<MotorStatsWidgetProps> = ({ speed, heading, altitude }) => {
  const [maxSpeed, setMaxSpeed] = useState(0);

  // Update max speed logic
  useEffect(() => {
    if (speed > maxSpeed) setMaxSpeed(speed);
  }, [speed, maxSpeed]);

  // Convert heading degrees to cardinal direction
  const getCardinalDirection = (angle: number) => {
    const directions = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'];
    return directions[Math.round(angle / 45) % 8];
  };

  // Calculate a color based on speed for the "redline" effect
  const speedColor = speed > 100 ? 'text-rose-500' : speed > 50 ? 'text-amber-400' : 'text-white';

  return (
    <Card className="relative overflow-hidden border-t-4 border-t-cyan-500 flex flex-col justify-between min-h-[220px]">
      
      {/* Animated Background Pulse based on speed */}
      {speed > 0 && (
         <div 
            className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse"
            style={{ animationDuration: `${Math.max(0.5, 2 - (speed/100))}s` }}
         />
      )}

      <div className="flex justify-between items-start z-10">
        <div className="flex items-center gap-2 text-cyan-400">
          <Activity size={16} className="animate-pulse" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Telemetri</span>
        </div>
        <div className="px-2 py-0.5 rounded bg-rose-500/10 text-[10px] font-bold text-rose-300 border border-rose-500/20 animate-pulse backdrop-blur-md">
          LIVE
        </div>
      </div>

      {/* Main Speed Display */}
      <div className="flex flex-col items-center justify-center my-4 relative z-10">
        <div className="flex items-baseline gap-1">
            <h2 className={`text-9xl font-black tracking-tighter leading-none transition-colors duration-300 ${speedColor} drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]`}>
            {speed}
            </h2>
            <span className="text-xl font-medium text-slate-500 self-end mb-4">km/h</span>
        </div>
        
        {/* Speed Progress Bar */}
        <div className="w-48 h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden backdrop-blur-sm">
            <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-rose-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                style={{ width: `${Math.min((speed / 180) * 100, 100)}%` }}
            />
        </div>
        <p className="text-[10px] text-slate-500 mt-2 font-bold">MAX {maxSpeed} KM/H</p>
      </div>

      {/* Footer Info Grid */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        
        <div className="bg-black/20 p-3 rounded-xl backdrop-blur-md border border-white/5 flex items-center justify-between group hover:bg-black/30 transition-colors">
           <div className="flex flex-col">
               <span className="text-[10px] uppercase text-slate-400 font-bold">Rakım</span>
               <span className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{altitude}m</span>
           </div>
           <ArrowUp size={18} className="text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />
        </div>

        <div className="bg-black/20 p-3 rounded-xl backdrop-blur-md border border-white/5 flex items-center justify-between group hover:bg-black/30 transition-colors">
           <div className="flex flex-col">
               <span className="text-[10px] uppercase text-slate-400 font-bold">Yön</span>
               <span className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{getCardinalDirection(heading)}</span>
           </div>
           
           <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center relative bg-white/5">
                <div 
                    style={{ transform: `rotate(${heading}deg)` }}
                    className="transition-transform duration-500 ease-out"
                >
                    <Navigation size={14} className="text-cyan-400 fill-cyan-400/20" />
                </div>
            </div>
        </div>
      </div>
    </Card>
  );
};

export default MotorStatsWidget;