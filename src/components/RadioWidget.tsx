import React, { useState, useRef, useEffect } from 'react';
import Card from './components/Card';
import { Play, Pause, SkipBack, SkipForward, Music2, Volume2 } from 'lucide-react';

// Enhanced Station List
const STATIONS = [
  {
    name: "Power FM",
    url: "https://listen.powerapp.com.tr/powerfm/mpeg/icecast.audio",
    genre: "Global Hits",
    color: "from-red-600/80 to-pink-600/80"
  },
  {
    name: "Süper FM",
    url: "https://17703.live.streamtheworld.com/SUPER_FM_SC",
    genre: "Türkçe Pop",
    color: "from-orange-600/80 to-red-600/80"
  },
  {
    name: "Joy Türk",
    url: "https://17753.live.streamtheworld.com/JOY_TURK_SC",
    genre: "Türkçe Slow",
    color: "from-amber-600/80 to-orange-500/80"
  },
  {
    name: "Metro FM",
    url: "https://17733.live.streamtheworld.com/METRO_FM_SC",
    genre: "Yabancı Hit",
    color: "from-blue-600/80 to-indigo-600/80"
  }
];

const RadioWidget: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const station = STATIONS[currentStationIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(station.url);
    audioRef.current.volume = volume;

    if (isPlaying) {
       audioRef.current.play().catch(e => {
         console.warn("Playback interruped or failed", e);
         setIsPlaying(false);
       });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentStationIndex]); // Depend only on index change, not play state

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const changeStation = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setCurrentStationIndex(prev => (prev + 1) % STATIONS.length);
    } else {
      setCurrentStationIndex(prev => (prev - 1 + STATIONS.length) % STATIONS.length);
    }
  };

  return (
    <Card noPadding className="flex flex-col overflow-hidden">
      {/* Header / Visualizer Area */}
      <div className={`relative h-36 bg-gradient-to-br ${station.color} p-5 flex flex-col justify-end transition-all duration-700`}>
        
        {/* Animated Sound Wave Overlay */}
        <div className="absolute inset-0 opacity-40 flex items-center justify-center gap-1 mix-blend-overlay">
            {isPlaying ? Array.from({length: 24}).map((_, i) => (
                <div 
                    key={i} 
                    className="w-1 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]"
                    style={{ 
                        height: `${Math.random() * 80}%`,
                        animationDuration: `${0.2 + Math.random() * 0.5}s`
                    }}
                />
            )) : (
                <div className="w-full h-[1px] bg-white/30" />
            )}
        </div>

        <div className="relative z-10 flex justify-between items-end">
            <div>
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 bg-black/40 rounded text-[10px] font-bold text-white/90 backdrop-blur-md">FM RADIO</span>
                    {isPlaying && <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white shadow-[0_0_5px_white]"></span>
                    </span>}
                </div>
                <h3 className="text-2xl font-bold text-white drop-shadow-md tracking-tight">{station.name}</h3>
                <p className="text-white/80 text-xs font-medium tracking-wide">{station.genre}</p>
            </div>
            <Music2 className="text-white/20 -mb-2 -mr-2 drop-shadow-lg" size={64} />
        </div>
      </div>

      {/* Controls Area */}
      <div className="p-4 bg-white/5">
        <div className="flex items-center justify-between gap-4">
           <button 
              onClick={() => changeStation('prev')}
              aria-label="Önceki İstasyon"
              className="p-3 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition active:scale-95"
           >
               <SkipBack size={24} fill="currentColor" />
           </button>
           
           <button 
                onClick={togglePlay}
                aria-label={isPlaying ? "Duraklat" : "Oynat"}
                className="h-16 w-16 flex items-center justify-center bg-white text-slate-900 rounded-full shadow-lg shadow-white/10 transition-all hover:scale-105 active:scale-95 hover:shadow-cyan-500/50"
           >
               {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
           </button>
           
           <button 
              onClick={() => changeStation('next')}
              aria-label="Sonraki İstasyon"
              className="p-3 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition active:scale-95"
           >
               <SkipForward size={24} fill="currentColor" />
           </button>
        </div>
        
        <div className="flex items-center gap-3 mt-4 px-2">
            <Volume2 size={16} className="text-slate-500" />
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 w-[80%]" />
            </div>
        </div>
      </div>
    </Card>
  );
};

export default RadioWidget;